#!/usr/bin/env python3
"""
evaluate_audit.py — Self-evaluation engine and AI self-reflection generator for ui-redesign audit ledgers.

Grounding:
Based on the Reflexion (Shinn et al., 2023) and Self-Refine (Madaan et al., 2023) frameworks,
this engine combines deterministic rule-checking with a grounded Actor-Critic metacognitive
self-reflection prompt to verify that redesign audit ledgers (.ui-audit/<surface>/):
1. Maintain 100% ledger file integrity and Gate G1 rule-by-rule coverage (zero omitted catalog IDs).
2. Fully track and map every finding across 03-findings.md, 04-coverage.md, and PLAN.md.
3. Include comprehensive, production-grade wireframes across phone, tablet, desktop, and dialogs.
4. Decompose implementation into fine-grained, verifiable microtasks (qhsedocks-sdd parity).
5. Generate an evidence-grounded AI Self-Reflection Prompt for rigorous multi-dimensional critique.

Usage:
    python evaluate_audit.py <audit_dir> [--catalog <path_to_rule_catalog>] [--prompt-only] [--json]
"""

import sys
import re
import json
import argparse
from pathlib import Path
from typing import Dict, List, Set, Any, Optional

def parse_rule_catalog(catalog_path: Path) -> List[str]:
    """Extract all canonical rule IDs from rule-catalog.md."""
    if not catalog_path.is_file():
        return []
    content = catalog_path.read_text(encoding="utf-8")
    pattern = re.compile(r"^[ \t]*-[ \t]+([A-Z0-9]{2,5}-\d{2})\b", re.MULTILINE)
    return pattern.findall(content)

def check_file_exists(audit_dir: Path, filename: str) -> tuple[bool, str]:
    target = audit_dir / filename
    if not target.is_file():
        return False, f"Missing required ledger file: {filename}"
    if target.stat().st_size == 0:
        return False, f"File is empty: {filename}"
    return True, f"Found {filename} ({target.stat().st_size} bytes)"

def extract_audit_context(audit_dir: Path) -> Dict[str, Any]:
    """Extract dynamic facts from the audit ledger files."""
    surface_name = audit_dir.name
    plan_path = audit_dir / "PLAN.md"
    if plan_path.is_file():
        p_text = plan_path.read_text(encoding="utf-8")
        title_match = re.search(r"^#[ \t]+(?:Redesign plan:?[ \t]+)?([^\n\r]+)", p_text, re.MULTILINE)
        if title_match:
            surface_name = title_match.group(1).strip()

    ctx = {
        "surface": surface_name,
        "mode": "FULL",
        "request": "",
        "inventory_count": 0,
        "inventory_files": [],
        "findings_by_sev": {"P0": 0, "P1": 0, "P2": 0, "P3": 0},
        "findings_by_cat": {},
        "microtasks": [],
    }
    
    scope_path = audit_dir / "00-scope.md"
    if scope_path.is_file():
        text = scope_path.read_text(encoding="utf-8")
        req_match = re.search(r'Request.*?:[ \t]*"([^"]+)"', text, re.IGNORECASE)
        if req_match:
            ctx["request"] = req_match.group(1)
        mode_match = re.search(r'Mode.*?:[ \t]*(FULL|FOCUSED)', text, re.IGNORECASE)
        if mode_match:
            ctx["mode"] = mode_match.group(1).upper()
    # 02-inventory.md
    inv_path = audit_dir / "02-inventory.md"
    if inv_path.is_file():
        inv_text = inv_path.read_text(encoding="utf-8")
        inv_matches = re.findall(r"[`']?([a-zA-Z0-9_\-./]+\.[a-zA-Z0-9]+)[`']?", inv_text)
        source_files = list(dict.fromkeys([f for f in inv_matches if any(f.endswith(ext) for ext in ('.tsx', '.ts', '.jsx', '.js', '.css')) and not f.startswith(('http', '0', '1', '2'))]))
        ctx["inventory_count"] = len(source_files)
        ctx["inventory_files"] = source_files[:10]

    # 03-findings.md
    find_path = audit_dir / "03-findings.md"
    if find_path.is_file():
        f_text = find_path.read_text(encoding="utf-8")
        f_rows = re.findall(
            r"^\|[ \t]*(F-\d{3,4})[ \t]*\|[ \t]*([A-Z0-9-]+)[ \t]*\|[^|]+\|[^|]+\|[^|]+\|[ \t]*(P[0-3])[ \t]*\|[ \t]*(open|fixed|deferred|rejected)[ \t]*\|",
            f_text, re.MULTILINE
        )
        for fid, frule, fsev, fstat in f_rows:
            ctx["findings_by_sev"][fsev] = ctx["findings_by_sev"].get(fsev, 0) + 1
            cat = frule.split("-")[0]
            ctx["findings_by_cat"][cat] = ctx["findings_by_cat"].get(cat, 0) + 1

    # PLAN.md
    plan_path = audit_dir / "PLAN.md"
    if plan_path.is_file():
        p_text = plan_path.read_text(encoding="utf-8")
        mt_matches = re.findall(r"^[ \t]*-[ \t]+\[[ x]\][ \t]+(P\d+\.T\d+)[ \t]+([^\n\r]+)", p_text, re.MULTILINE)
        ctx["microtasks"] = [{"id": mid, "title": mtitle} for mid, mtitle in mt_matches]

    return ctx

def evaluate_audit(audit_dir: Path, catalog_path: Path) -> Dict[str, Any]:
    context = extract_audit_context(audit_dir)
    results = {
        "context": context,
        "files": {},
        "g1_coverage": {},
        "findings": {},
        "wireframes": {},
        "microtasks": {},
        "passed": True,
        "errors": [],
        "warnings": [],
    }

    # 1. Ledger files existence
    required_files = [
        "00-scope.md",
        "01-design.md",
        "02-inventory.md",
        "03-findings.md",
        "04-coverage.md",
        "PLAN.md",
    ]
    for rf in required_files:
        ok, msg = check_file_exists(audit_dir, rf)
        results["files"][rf] = ok
        if not ok:
            results["passed"] = False
            results["errors"].append(msg)

    # 2. Gate G1: Rule coverage validation
    catalog_rules = parse_rule_catalog(catalog_path)
    cov_file = audit_dir / "04-coverage.md"
    if cov_file.is_file() and catalog_rules:
        cov_content = cov_file.read_text(encoding="utf-8")
        found_rules = set(re.findall(r"\b([A-Z0-9]{2,5}-\d{2})\b", cov_content))
        missing_rules = [r for r in catalog_rules if r not in found_rules]
        
        results["g1_coverage"]["total_catalog"] = len(catalog_rules)
        results["g1_coverage"]["covered_count"] = len(catalog_rules) - len(missing_rules)
        results["g1_coverage"]["missing"] = missing_rules
        
        if missing_rules:
            results["passed"] = False
            results["errors"].append(f"Gate G1 VIOLATION: {len(missing_rules)} catalog rule(s) omitted in 04-coverage.md: {', '.join(missing_rules[:10])}")
    else:
        results["g1_coverage"]["error"] = "Coverage file or rule catalog unreadable"

    # 3. Findings consistency
    findings_file = audit_dir / "03-findings.md"
    finding_ids = set()
    if findings_file.is_file():
        f_content = findings_file.read_text(encoding="utf-8")
        f_rows = re.findall(
            r"^\|[ \t]*(F-\d{3,4})[ \t]*\|[ \t]*([A-Z0-9-]+)[ \t]*\|[^|]+\|[^|]+\|[^|]+\|[ \t]*(P[0-3])[ \t]*\|[ \t]*(open|fixed|deferred|rejected)[ \t]*\|",
            f_content, re.MULTILINE
        )
        for fid, frule, fsev, fstat in f_rows:
            finding_ids.add(fid)
        results["findings"]["total_findings"] = len(f_rows)
        results["findings"]["finding_ids"] = list(sorted(finding_ids))

    # 4. Wireframes in PLAN.md
    plan_file = audit_dir / "PLAN.md"
    if plan_file.is_file():
        plan_content = plan_file.read_text(encoding="utf-8")
        
        has_phone_wf = bool(re.search(r"(phone|mobile|375px)[\s\S]*?```[\s\S]*?```", plan_content, re.IGNORECASE))
        has_tablet_wf = bool(re.search(r"(tablet|768px|md:)[\s\S]*?```[\s\S]*?```", plan_content, re.IGNORECASE))
        has_desktop_wf = bool(re.search(r"(desktop|1024px|1280px|wide)[\s\S]*?```[\s\S]*?```", plan_content, re.IGNORECASE))
        has_dialog_wf = bool(re.search(r"(dialog|modal|sheet|palette)[\s\S]*?```[\s\S]*?```", plan_content, re.IGNORECASE))
        
        results["wireframes"]["phone"] = has_phone_wf
        results["wireframes"]["tablet"] = has_tablet_wf
        results["wireframes"]["desktop"] = has_desktop_wf
        results["wireframes"]["dialog"] = has_dialog_wf
        
        if not (has_phone_wf and has_desktop_wf):
            results["warnings"].append("PLAN.md wireframes incomplete: missing explicit phone or desktop ASCII wireframe")
        if not has_tablet_wf:
            results["warnings"].append("PLAN.md wireframes missing explicit tablet (768px) layout wireframe")

        # 5. Microtasks in PLAN.md
        microtasks = re.findall(r"^[ \t]*-[ \t]+\[[ x]\][ \t]+(P\d+\.T\d+|T\d+|Slice\s+\d+\.\d+)", plan_content, re.MULTILINE)
        has_action_blocks = "Action:" in plan_content or "Green:" in plan_content
        has_verify_blocks = "Verify:" in plan_content
        has_commit_blocks = "Commit:" in plan_content
        
        results["microtasks"]["count"] = len(microtasks)
        results["microtasks"]["has_actions"] = has_action_blocks
        results["microtasks"]["has_verify"] = has_verify_blocks
        results["microtasks"]["has_commit"] = has_commit_blocks
        
        if len(microtasks) == 0:
            results["passed"] = False
            results["errors"].append("PLAN.md lacks fine-grained microtasks (e.g. - [ ] P1.T1 Title)")
        if not (has_action_blocks and has_verify_blocks and has_commit_blocks):
            results["warnings"].append("Microtasks lack full metadata blocks (Action, Verify, Commit)")

        # Finding coverage in PLAN.md
        unaddressed_findings = [fid for fid in finding_ids if fid not in plan_content]
        if unaddressed_findings:
            results["passed"] = False
            results["errors"].append(f"Findings in 03-findings.md missing from PLAN.md: {', '.join(unaddressed_findings)}")

    return results

def build_self_reflection_prompt(results: Dict[str, Any]) -> str:
    """
    Constructs an evidence-grounded Actor-Critic Self-Reflection Prompt based on
    Reflexion (Shinn et al. 2023) and Self-Refine (Madaan et al. 2023) architectures.
    """
    ctx = results.get("context", {})
    finfo = results.get("findings", {})
    cov = results.get("g1_coverage", {})
    wf = results.get("wireframes", {})
    mt = results.get("microtasks", {})
    
    total_rules = cov.get("total_catalog", 0)
    covered_rules = cov.get("covered_count", 0)
    findings_list = finfo.get("finding_ids", [])
    sev_summary = ", ".join([f"{k}: {v}" for k, v in ctx.get("findings_by_sev", {}).items() if v > 0]) or "None"
    cat_summary = ", ".join([f"{k}: {v}" for k, v in ctx.get("findings_by_cat", {}).items()]) or "None"

    return f"""# ACTOR-CRITIC AI SELF-REFLECTION & EVALUATION DIRECTIVE
# Framework: Reflexion (Shinn et al.) & Self-Refine (Madaan et al.) applied to UI/UX Audits
# Role: Adversarial Lead Design Systems Engineer & Accessibility Auditor (Evaluator Persona)

You are an exacting, evidence-first Lead Design Systems Engineer and Accessibility Architect.
An autonomous agent (the Actor) conducted a FULL UI redesign audit and generated a structured redesign plan.
Your task is to conduct an uncompromising METACOGNITIVE SELF-CRITIQUE of the audit and plan before approval.

## AUDIT GROUNDING TELEMETRY (VERIFIED FACTS)
- Target Surface: {ctx.get('surface', 'UI Surface')}
- Audit Mode: {ctx.get('mode', 'FULL')}
- Gate G1 Catalog Coverage: {covered_rules}/{total_rules} rule IDs accounted for
- Findings Discovered: {finfo.get('total_findings', 0)} total ({sev_summary})
- Category Breakdown: {cat_summary}
- Finding IDs: {', '.join(findings_list)}
- Wireframes Present: Phone={wf.get('phone')}, Tablet={wf.get('tablet')}, Desktop={wf.get('desktop')}, Dialogs={wf.get('dialog')}
- Microtasks Decomposed: {mt.get('count', 0)} fine-grained tasks with Action, Verify, and Commit metadata

---

## 5-AXIS ORTHOGONAL CRITIQUE PROTOCOL

Evaluate the audit ledger and PLAN.md across these five non-negotiable axes.
For each axis, you must either cite concrete code/line evidence proving soundness, or identify a concrete vulnerability.

### AXIS 1: FACTUAL GROUNDING & PROOF INTEGRITY (No Hallucinated Problems)
1. Did every reported finding (F-001..F-xxx) quote exact, verifiable code in 03-findings.md?
2. Did the falsify pass genuinely check whether any suspected bug was already solved by a parent wrapper, shared primitive, or server contract?
3. Are there any false positives where an intentional design decision was wrongly branded a violation?

### AXIS 2: NEGATIVE SPACE & UNNOTICED REGRESSIONS (What Did the Audit Miss?)
1. When fixing dialog viewport bounds (e.g. max-h-[90dvh]), will internal select menus, date pickers, or popovers clip at the overflow edge?
2. When adding global drop containment (UPL-01), does the effect clean up listeners properly on unmount so other views are unaffected?
3. Does the plan touch or break any existing desktop power-user ergonomics (keyboard shortcuts, multi-pane reading flow)?
4. Did the audit check mobile virtual keyboard interaction: will focused form inputs be occluded when the soft keyboard expands (FRM-20)?

### AXIS 3: COGNITIVE LOAD & HUMAN DESIGN LAWS (Norman, Sweller, Gestalt)
1. Does the proposed layout visually chunk information into <= 4 clear functional zones, or does it leave information scattered?
2. Is there exactly ONE unambiguous primary CTA button visible in the resting viewport (HIE-01, HIE-02)?
3. Does the plan preserve tactile physical feedback (active:scale-[0.98]) and concentric corner geometry (SOUL-01, SOUL-02)?
4. Does the error architecture ensure user inputs are preserved during network failure or session expiry (ERR-08)?

### AXIS 4: WIREFRAME RIGOR & RESPONSIVE TRUTH (No Hand-Waving)
1. Phone (~375px): Are touch targets guaranteed >= 44x44px? Are bottom controls protected with env(safe-area-inset-bottom)?
2. Tablet (~768px): Does the secondary toolbar collapse cleanly into an overflow menu without horizontal clipping or button wrapping?
3. Desktop (>=1280px): Does the canvas maintain an optimal reading width (<= 75ch / max-w-4xl) with breathing room?
4. Dialogs: Are modal bodies scrollable with pinned, sticky headers and footers?

### AXIS 5: MICROTASK ATOMICITY & FALSIFIABILITY (qhsedocks-sdd Parity)
1. Is each microtask (P1.T1..Pn.Tm) strictly isolated to <= 2 related source files?
2. Does every microtask specify the exact finding ID (F-xxx) it resolves?
3. Are the `Verify:` commands executable and falsifiable (typecheck, lint, test, or visual inspection)?
4. Are commit messages imperative and conventionally scoped (e.g. fix(dms): ...)?

---

## CRITIQUE OUTPUT FORMAT

Your self-reflection review must conclude in this exact structure:

```markdown
### 1. GROUNDED EVIDENCE ASSESSMENT
[List key findings confirmed with quoted code vs. any findings needing refinement]

### 2. BLIND SPOT & REGRESSION ANALYSIS
[Identify any secondary side-effects or unaddressed edge cases in the plan]

### 3. WIREFRAME & HUMAN EXPERIENCE VERDICT
[Confirm phone, tablet, and desktop layout ergonomics and cognitive chunking]

### 4. MICROTASKS READINESS
[Confirm microtasks are atomic, verified, and mapped 1:1 to findings]

### 5. FINAL EVALUATOR VERDICT
Choose exactly one:
- [APPROVED] Plan is mathematically rigorous, fully grounded, and ready for immediate implementation.
- [REVISE_BEFORE_APPROVAL] Plan requires specific minor adjustments (list bulleted directives).
- [REJECTED] Fundamental structural or factual flaw (state blocking reason).
```"""

def render_report(results: Dict[str, Any], audit_dir: Path, prompt_only: bool = False, as_json: bool = False):
    prompt_text = build_self_reflection_prompt(results)
    
    if prompt_only:
        print(prompt_text)
        return

    if as_json:
        results["reflection_prompt"] = prompt_text
        print(json.dumps(results, indent=2))
        return

    print("=" * 75)
    print(" UI REDESIGN AUDIT & PLAN EVALUATION ENGINE (v1.4.0)")
    print(f" Target Directory: {audit_dir.resolve()}")
    print("=" * 75)
    
    # 1. Files
    print("\n[1] LEDGER FILES INTEGRITY:")
    for fn, ok in results["files"].items():
        status = "✔ PASS" if ok else "✘ MISSING"
        print(f"  {status:<10} {fn}")
        
    # 2. Gate G1 Coverage
    print("\n[2] GATE G1 RULE CATALOG COVERAGE:")
    cov = results["g1_coverage"]
    if "total_catalog" in cov:
        total = cov["total_catalog"]
        covered = cov["covered_count"]
        pct = (covered / total * 100) if total else 0
        status = "✔ PASS" if len(cov["missing"]) == 0 else "✘ FAIL"
        print(f"  {status:<10} {covered}/{total} rules audited ({pct:.1f}%)")
        if cov["missing"]:
            print(f"             Missing: {', '.join(cov['missing'])}")
    else:
        print("  ✘ FAIL   Could not evaluate rule coverage")

    # 3. Findings
    print("\n[3] FINDINGS TRACKING:")
    finfo = results["findings"]
    ctx = results.get("context", {})
    sev_str = ", ".join([f"{k}: {v}" for k, v in ctx.get("findings_by_sev", {}).items() if v > 0]) or "None"
    print(f"  Total Findings: {finfo.get('total_findings', 0)} ({sev_str})")
    if finfo.get("finding_ids"):
        print(f"  IDs: {', '.join(finfo['finding_ids'][:15])}{'...' if len(finfo['finding_ids']) > 15 else ''}")

    # 4. Wireframes
    print("\n[4] WIREFRAMES COMPLETENESS (PLAN.md):")
    wf = results["wireframes"]
    for device, ok in wf.items():
        status = "✔ PASS" if ok else "⚠ WARN"
        print(f"  {status:<10} {device.capitalize()} Wireframe")

    # 5. Microtasks
    print("\n[5] MICROTASKS DECOMPOSITION (PLAN.md):")
    mt = results["microtasks"]
    print(f"  Total Microtasks:  {mt.get('count', 0)}")
    print(f"  Action/Green Step: {'✔ Yes' if mt.get('has_actions') else '✘ Missing'}")
    print(f"  Verify Commands:   {'✔ Yes' if mt.get('has_verify') else '✘ Missing'}")
    print(f"  Atomic Commits:    {'✔ Yes' if mt.get('has_commit') else '✘ Missing'}")

    # Summary
    print("\n" + "=" * 75)
    if results["errors"]:
        print(f"OVERALL STATUS: ✘ FAILED ({len(results['errors'])} errors, {len(results['warnings'])} warnings)")
        for err in results["errors"]:
            print(f"  • ERROR: {err}")
    else:
        status_msg = "✔ PASSED" if not results["warnings"] else "✔ PASSED WITH WARNINGS"
        print(f"OVERALL STATUS: {status_msg} ({len(results['warnings'])} warnings)")
    
    for warn in results["warnings"]:
        print(f"  • WARNING: {warn}")

    print("=" * 75)
    print("\n" + prompt_text)
    print("\n" + "=" * 75)

def main():
    parser = argparse.ArgumentParser(description="Evaluate ui-redesign audit ledger and generate AI self-reflection prompt")
    parser.add_argument("audit_dir", type=Path, help="Path to .ui-audit/<surface> directory")
    parser.add_argument("--catalog", type=Path, default=None, help="Path to rule-catalog.md")
    parser.add_argument("--prompt-only", action="store_true", help="Output only the AI self-reflection prompt")
    parser.add_argument("--json", action="store_true", help="Output structured evaluation results as JSON")
    args = parser.parse_args()

    audit_dir = args.audit_dir
    if not audit_dir.is_dir():
        print(f"Error: Audit directory not found: {audit_dir}", file=sys.stderr)
        sys.exit(1)

    catalog_path = args.catalog
    if not catalog_path:
        script_dir = Path(__file__).resolve().parent
        candidate = script_dir.parent / "references" / "rule-catalog.md"
        if candidate.is_file():
            catalog_path = candidate
        else:
            print("Error: Could not locate rule-catalog.md. Specify with --catalog", file=sys.stderr)
            sys.exit(1)

    results = evaluate_audit(audit_dir, catalog_path)
    render_report(results, audit_dir, prompt_only=args.prompt_only, as_json=args.json)
    sys.exit(0 if results["passed"] else 1)

if __name__ == "__main__":
    main()
