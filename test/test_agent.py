#!/usr/bin/env python3
"""
🧪 Test Agent — 自动验证所有功能
读取 product-spec.yaml，逐项发包测试，输出报告。

用法:  python3 test/test_agent.py [--base http://localhost:3000] [--spec-id spec-003]
"""

import sys, os, json, time, urllib.request, urllib.error, urllib.parse

try:
    import yaml
except ImportError:
    print("⚠️  需要 pyyaml: pip3 install pyyaml")
    os.system("pip3 install pyyaml -q")
    import yaml

BASE = os.getenv("TEST_BASE_URL", "http://localhost:3000")
SPEC_FILE = os.path.join(os.path.dirname(__file__), "product-spec.yaml")

PASS = "✅"
FAIL = "❌"
SKIP = "⏭️"

results = {"pass": 0, "fail": 0, "skip": 0, "details": []}


def request(method: str, path: str, body: dict = None, headers: dict = None) -> tuple:
    """Send HTTP request and return (status, headers, body)."""
    url = f"{BASE}{path}"
    data = json.dumps(body).encode() if body else None
    hdrs = headers or {}
    if body:
        hdrs["Content-Type"] = "application/json"

    req = urllib.request.Request(url, data=data, headers=hdrs, method=method)
    try:
        with urllib.request.urlopen(req, timeout=30) as resp:
            rbody = resp.read().decode()
            return resp.status, dict(resp.headers), rbody
    except urllib.error.HTTPError as e:
        return e.code, {}, e.read().decode()
    except Exception as e:
        return -1, {}, str(e)


def test_page_load(spec: dict) -> bool:
    """Test a single page load."""
    endpoint = spec["endpoint"]
    method = endpoint.split()[0]
    path = endpoint.split()[1]
    expected = spec["expect"]

    status, headers, body = request(method, path)

    # Check status (supports both exact and "any of" matches)
    if "status_any" in expected:
        passed = status in expected["status_any"]
        detail = f"status={status} (expected one of {expected['status_any']})"
    else:
        expected_status = expected.get("status")
        passed = status == expected_status
        detail = f"status={status} (expected {expected_status})"

    if passed and "contains" in expected:
        for text in expected["contains"]:
            if text not in body:
                passed = False
                detail += f" | missing: '{text}'"
                break

    return passed, detail


def test_api_stream(spec: dict) -> bool:
    """Test streaming API endpoint."""
    endpoint = spec["endpoint"]
    path = endpoint.split()[1]
    body = spec.get("body", {})
    expected = spec["expect"]

    status, headers, body_str = request("POST", path, body)

    if "status_any" in expected:
        passed = status in expected["status_any"]
    else:
        passed = status == expected.get("status", 200)
    detail = f"status={status}"

    if passed and "contains_stream" in expected:
        marker = expected["contains_stream"]
        if marker in body_str:
            detail += f" | stream ok ({len(body_str)} bytes)"
        else:
            passed = False
            detail += f" | stream missing '{marker}'"

    return passed, detail


def test_api_json(spec: dict) -> bool:
    """Test JSON API endpoint."""
    endpoint = spec["endpoint"]
    path = endpoint.split()[1]
    body = spec.get("body", {})
    expected = spec["expect"]

    status, _, body_str = request("POST", path, body)

    if "status_any" in expected:
        passed = status in expected["status_any"]
    else:
        passed = status == expected.get("status", 200)
    detail = f"status={status}"

    if passed and "json_keys" in expected:
        try:
            data = json.loads(body_str)
            for key in expected["json_keys"]:
                if key not in data:
                    passed = False
                    detail += f" | missing key: '{key}'"
                    break
            if passed:
                detail += " | all keys present"
        except json.JSONDecodeError:
            passed = False
            detail += " | invalid JSON"

    return passed, detail


def test_seo_pages(spec: dict) -> bool:
    """Test all SEO landing pages."""
    endpoints = spec["endpoints"]
    all_pass = True
    details = []

    for ep in endpoints:
        path = ep.split()[1]
        status, _, _ = request("GET", path)
        ok = status == 200
        details.append(f"  {'✅' if ok else '❌'} {path} → {status}")
        if not ok:
            all_pass = False

    return all_pass, "\n" + "\n".join(details)


def run():
    global results
    print("=" * 60)
    print("  🧪 RePurposeFast — Test Agent")
    print(f"  Target: {BASE}")
    print("=" * 60)

    # Load spec
    if not os.path.exists(SPEC_FILE):
        print(f"\n{FAIL} 找不到规格文件: {SPEC_FILE}")
        sys.exit(1)

    with open(SPEC_FILE) as f:
        specs = yaml.safe_load(f).get("specs", [])

    # Filter by ID if specified
    filter_id = None
    for arg in sys.argv:
        if arg.startswith("--spec-id="):
            filter_id = arg.split("=")[1]

    test_count = 0
    for spec in specs:
        sid = spec["id"]
        if filter_id and sid != filter_id:
            continue

        name = spec["name"]
        test_count += 1

        print(f"\n[{sid}] {name} ...", end=" ", flush=True)

        try:
            if "contains_stream" in spec.get("expect", {}):
                ok, detail = test_api_stream(spec)
            elif "endpoints" in spec:
                ok, detail = test_seo_pages(spec)
            elif spec["endpoint"].startswith("POST") and spec.get("body"):
                ok, detail = test_api_json(spec)
            else:
                ok, detail = test_page_load(spec)
        except Exception as e:
            ok, detail = False, f"exception: {e}"

        icon = PASS if ok else FAIL
        print(icon)

        if ok:
            results["pass"] += 1
        else:
            results["fail"] += 1
            print(f"     {detail}")

        results["details"].append({
            "id": sid,
            "name": name,
            "passed": ok,
            "detail": detail,
        })

    # Summary
    print("\n" + "=" * 60)
    total = results["pass"] + results["fail"] + results["skip"]
    print(f"  结果: {results['pass']}{PASS} / {results['fail']}{FAIL} / {test_count} total")
    print("=" * 60)

    return results["fail"] == 0


if __name__ == "__main__":
    ok = run()
    sys.exit(0 if ok else 1)
