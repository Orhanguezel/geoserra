#!/usr/bin/env python3
"""
DNS record checker for GEO-SEO audit.
Checks SPF, DMARC, and DKIM email authentication records.
"""

import sys
import json
import subprocess
import re
from urllib.parse import urlparse


def run_dig(record_type: str, domain: str) -> str:
    """Run dig command and return output."""
    try:
        result = subprocess.run(
            ["dig", "+short", record_type, domain],
            capture_output=True, text=True, timeout=10
        )
        return result.stdout.strip()
    except FileNotFoundError:
        # dig not available, try nslookup
        try:
            result = subprocess.run(
                ["nslookup", "-type=" + record_type, domain],
                capture_output=True, text=True, timeout=10
            )
            return result.stdout.strip()
        except Exception:
            return ""
    except Exception:
        return ""


def check_spf(domain: str) -> dict:
    """Check SPF record."""
    result = {
        "exists": False,
        "record": None,
        "valid": False,
        "issues": [],
    }

    output = run_dig("TXT", domain)
    if not output:
        result["issues"].append("No TXT records found for domain")
        return result

    # Look for SPF record in TXT records
    for line in output.split("\n"):
        line = line.strip().strip('"')
        if "v=spf1" in line.lower():
            result["exists"] = True
            result["record"] = line

            # Basic validation
            if "v=spf1" in line:
                result["valid"] = True

            # Check for common issues
            if "+all" in line:
                result["issues"].append("DANGEROUS: +all allows ANY server to send email for this domain")
                result["valid"] = False
            elif "~all" in line:
                result["issues"].append("WARNING: ~all (softfail) is weaker than -all (hardfail)")
            elif "-all" in line:
                pass  # Good
            elif "?all" in line:
                result["issues"].append("WARNING: ?all (neutral) provides no protection")

            # Check for too many lookups
            lookup_count = len(re.findall(r'(include:|a:|mx:|ptr:|exists:)', line))
            if lookup_count > 10:
                result["issues"].append(f"WARNING: {lookup_count} DNS lookups (max recommended: 10)")

            break

    if not result["exists"]:
        result["issues"].append("No SPF record found. Email spoofing is possible.")

    return result


def check_dmarc(domain: str) -> dict:
    """Check DMARC record."""
    result = {
        "exists": False,
        "record": None,
        "valid": False,
        "policy": None,
        "issues": [],
    }

    dmarc_domain = f"_dmarc.{domain}"
    output = run_dig("TXT", dmarc_domain)

    if not output:
        result["issues"].append("No DMARC record found. Domain is vulnerable to email spoofing.")
        return result

    for line in output.split("\n"):
        line = line.strip().strip('"')
        if "v=dmarc1" in line.lower():
            result["exists"] = True
            result["record"] = line
            result["valid"] = True

            # Extract policy
            policy_match = re.search(r'p=(\w+)', line)
            if policy_match:
                policy = policy_match.group(1).lower()
                result["policy"] = policy
                if policy == "none":
                    result["issues"].append("WARNING: p=none only monitors, does not reject spoofed emails")
                elif policy == "quarantine":
                    result["issues"].append("INFO: p=quarantine sends suspicious emails to spam")
                elif policy == "reject":
                    pass  # Best practice

            # Check for reporting
            if "rua=" not in line:
                result["issues"].append("WARNING: No aggregate report (rua) configured")
            if "ruf=" not in line:
                result["issues"].append("INFO: No forensic report (ruf) configured")

            break

    return result


def check_dkim(domain: str) -> dict:
    """Check DKIM record (tries common selectors)."""
    result = {
        "exists": False,
        "selector": None,
        "record": None,
        "issues": [],
    }

    common_selectors = [
        "default", "google", "k1", "selector1", "selector2",
        "mail", "dkim", "s1", "s2", "email"
    ]

    for selector in common_selectors:
        dkim_domain = f"{selector}._domainkey.{domain}"
        output = run_dig("TXT", dkim_domain)
        if output and "v=dkim1" in output.lower():
            result["exists"] = True
            result["selector"] = selector
            result["record"] = output.strip().strip('"')
            break

    if not result["exists"]:
        result["issues"].append(
            "No DKIM record found with common selectors. "
            "Note: DKIM selector may use a custom name."
        )

    return result


def check_dns_records(domain: str) -> dict:
    """Run all DNS checks for a domain."""
    # Clean domain
    if domain.startswith("http"):
        domain = urlparse(domain).netloc
    domain = domain.replace("www.", "")

    return {
        "domain": domain,
        "spf": check_spf(domain),
        "dmarc": check_dmarc(domain),
        "dkim": check_dkim(domain),
        "summary": {
            "email_security_score": 0,  # calculated below
        }
    }


def calculate_score(data: dict) -> int:
    """Calculate email security score (0-100)."""
    score = 0
    if data["spf"]["exists"] and data["spf"]["valid"]:
        score += 35
    if data["dmarc"]["exists"] and data["dmarc"]["valid"]:
        score += 40
        if data["dmarc"]["policy"] == "reject":
            score += 10
        elif data["dmarc"]["policy"] == "quarantine":
            score += 5
    if data["dkim"]["exists"]:
        score += 15
    return score


if __name__ == "__main__":
    if len(sys.argv) < 2:
        print("Usage: python dns_checker.py <domain>")
        sys.exit(1)

    domain = sys.argv[1]
    data = check_dns_records(domain)
    data["summary"]["email_security_score"] = calculate_score(data)
    print(json.dumps(data, indent=2, ensure_ascii=False, default=str))
