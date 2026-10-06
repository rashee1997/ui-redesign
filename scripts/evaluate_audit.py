#!/usr/bin/env python3
"""
evaluate_audit.py — Self-evaluation and validation script for ui-redesign audit ledgers.

Validates that an audit directory (.ui-audit/<surface>/):
1. Contains all required ledger files (00-scope through 04-coverage and PLAN.md).
2. Achieves Gate G1 compliance: 100% rule catalog coverage with no skipped rule IDs.
3. Maintains findings consistency: every finding in 03-findings.md maps to 04-coverage.md and PLAN.md.
4. Contains full, detailed wireframes in PLAN.md (phone, tablet, desktop, dialogs).
5. Decomposes implementation into fine-grained microtasks (Files, Action, Verify, Commit).
6. Emits a structured Self-Reflection Prompt for rigorous review.

Usage:
    python evaluate_audit.py <audit_dir> [--catalog <path_to_rule_catalog>]
"""

import sys
import re
import argparse
from pathlib import Path

def parse_rule_catalog(catalog_path: Path) -> list[str]:
    """Extract all active rule IDs from rule-catalog.md."""
    if not catalog_path.is_file():
        return []
    content = catalog_path.read_text(encoding="utf-8")
    # Matches lines like: "- LAY-01 Elements that..." or "- TAB-03 ..."
    pattern = re.compile(r"^[ \t]*-[ \t]+([A-Z0-9]{2,5}-\d{2})\b", re.MULTILINE)
    return pattern.findall(content)

def check_file_exists(audit_dir: Path, filename: str) -> tuple[bool, str]:
    target = audit_dir / filename
    if not target.is_file():
        return False, f"Missing required ledger file: {filename}"
    if target.stat().st_size == 0:
        return False, f"File is empty: {filename}"
    return True, f"Found {filename} ({target.stat().st_size} bytes)"

def evaluate_audit(audit_dir: Path, catalog_path: Path) -> dict:
    results = {
        "files": {},
        "g1_coverage": {},
        "findings": {},
        "wireframes": {},
        "microtasks": {},
        "passed": True,
        "errors": [],
        "warnings": [],
    }

    # 1. Check ledger files
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
        # Match table rows starting with | F-xxx |
        f_rows = re.findall(r"^\|[ \t]*(F-\d{3,4})[ \t]*\|[ \t]*([A-Z0-9-]+)[ \t]*\|[^|]+\|[^|]+\|[^|]+\|[ \t]*(P[0-3])[ \t]*\|[ \t]*(open|fixed|deferred|rejected)[ \t]*\|", f_content, re.MULTILINE)
        for fid, frule, fsev, fstat in f_rows:
            finding_ids.add(fid)
        results["findings"]["total_findings"] = len(f_rows)
        results["findings"]["finding_ids"] = list(sorted(finding_ids))

    # 4. Wireframes in PLAN.md
    plan_file = audit_dir / "PLAN.md"
    if plan_file.is_file():
        plan_content = plan_file.read_text(encoding="utf-8")
        
        # Check wireframes
        has_phone_wf = bool(re.search(r"(phone|mobile|375px)[\s\S]*?```[\s\S]*?```", plan_content, re.IGNORECASE))
        has_tablet_wf = bool(re.search(r"(tablet|768px|md:)[\s\S]*?```[\s\S]*?```", plan_content, re.IGNORECASE))
        has_desktop_wf = bool(re.search(r"(desktop|1024px|1280px|wide)[\s\S]*?```[\s\S]*?```", plan_content, re.IGNORECASE))
        has_dialog_wf = bool(re.search(r"(dialog|modal|sheet|palette)[\s\S]*?```[\s\S]*?```", plan_content, re.IGNORECASE))
        
        results["wireframes"]["phone"] = has_phone_wf
        results["wireframes"]["tablet"] = has_tablet_wf
        results["wireframes"]["desktop"] = has_desktop_wf
        results["wireframes"]["dialog"] = has_dialog_wf
        
        if not (has_phone_wf and has_desktop_wf):
            results["warnings"].append("PLAN.md wireframes incomplete: missing explicit phone or desktop ASCII wireframes")
        if not has_tablet_wf:
            results["warnings"].append("PLAN.md wireframes missing explicit tablet (768px) layout wireframe")

        # 5. Microtasks in PLAN.md
        # Microtask standard: P<n>.T<m> or T<n> with Files, Action, Verify, Commit
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

        # Check finding coverage in PLAN.md
        unaddressed_findings = []
        for fid in finding_ids:
            if fid not in plan_content:
                unaddressed_findings.append(fid)
        if unaddressed_findings:
            results["passed"] = False
            results["errors"].append(f"Findings in 03-findings.md missing from PLAN.md: {', '.join(unaddressed_findings)}")

    return results

def render_report(results: dict, audit_dir: Path):
    print("=" * 70)
    print(" UI REDESIGN AUDIT & PLAN EVALUATION REPORT")
    print(f" Target Directory: {audit_dir.resolve()}")
    print("=" * 70)
    
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
    print(f"  Total Findings: {finfo.get('total_findings', 0)}")
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
    print("\n" + "=" * 70)
    if results["errors"]:
        print(f"OVERALL STATUS: ✘ FAILED ({len(results['errors'])} errors, {len(results['warnings'])} warnings)")
        for err in results["errors"]:
            print(f"  • ERROR: {err}")
    else:
        status_msg = "✔ PASSED" if not results["warnings"] else "✔ PASSED WITH WARNINGS"
        print(f"OVERALL STATUS: {status_msg} ({len(results['warnings'])} warnings)")
    
    for warn in results["warnings"]:
        print(f"  • WARNING: {warn}")

    # Structured Self-Reflection Prompt
    print("\n" + "=" * 70)
    print(" STRUCTURED SELF-REFLECTION PROMPT FOR AUDITED PLAN")
    print("=" * 70)
    print("""
Copy and review this self-reflection rubric against your audited redesign plan:

----------------------------------------------------------------------
### SELF-REFLECTION RUBRIC: DMS REDESIGN PLAN VERIFICATION
----------------------------------------------------------------------
1. COGNITIVE LOAD & GESTALT PROXIMITY (HUM-01, HUM-04):
   - Does the redesigned view visually chunk information into <= 4 clear functional zones (Identity, Canvas/Content, Lifecycle/Action Dock, Deep Inspector)?
   - Are labels closer to their values than to adjacent containers?
   - Is there exactly one primary CTA button in the active viewport?

2. WIREFRAME RIGOR ACROSS BREAKPOINTS (RSP-01..15, DLG-01..14):
   - Desktop (>=1024px): Does the side-by-side dock layout leave adequate canvas breathing room?
   - Tablet (~768px): Does the secondary toolbar collapse gracefully into overflow menus without button overlap?
   - Phone (~375px): Are secondary tools tucked into bottom sheets, with 44x44px touch targets and safe-area padding?
   - Command Palette & Dialogs: Do modals have explicit max-h-[90dvh], internal scroll, and phone drawer variants?

3. ZERO-UNHANDLED-STATE RESILIENCE (LDG, STA, ERR, UPL):
   - Are all 5 states defined for every asynchronous region (Loading Skeleton, Empty, Error, Success, Pending)?
   - Does the file upload dropzone contain window-level drop events (UPL-01) and reset input values (UPL-02)?
   - Do error alerts preserve user input and offer retry recovery paths?

4. MICROTASKS ATOMICITY & FALSIFIABILITY (qhsedocks-sdd parity):
   - Is each microtask scoped to <= 2 related files with a single responsibility?
   - Does each microtask cite the specific finding IDs (F-xxx) it resolves?
   - Are the verification commands explicit and executable (typecheck, lint, test, or visual check)?
   - Are commit messages structured with imperative conventional prefixes?
----------------------------------------------------------------------
""")
    print("=" * 70)

def main():
    parser = argparse.ArgumentParser(description="Evaluate ui-redesign audit ledger and plan")
    parser.add_argument("audit_dir", type=Path, help="Path to .ui-audit/<surface> directory")
    parser.add_argument("--catalog", type=Path, default=None, help="Path to rule-catalog.md")
    args = parser.parse_args()

    audit_dir = args.audit_dir
    if not audit_dir.is_dir():
        print(f"Error: Audit directory not found: {audit_dir}", file=sys.stderr)
        sys.exit(1)

    catalog_path = args.catalog
    if not catalog_path:
        # Default relative to script location
        script_dir = Path(__file__).resolve().parent
        candidate = script_dir.parent / "references" / "rule-catalog.md"
        if candidate.is_file():
            catalog_path = candidate
        else:
            print("Error: Could not locate rule-catalog.md. Specify with --catalog", file=sys.stderr)
            sys.exit(1)

    results = evaluate_audit(audit_dir, catalog_path)
    render_report(results, audit_dir)
    sys.exit(0 if results["passed"] else 1)

if __name__ == "__main__":
    main()
