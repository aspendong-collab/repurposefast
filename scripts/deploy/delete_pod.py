#!/usr/bin/env python3
"""删除指定的 RunPod GPU Pod，停止计费。"""
import os, sys, json, urllib.request

API_KEY = os.getenv("RUNPOD_API_KEY")
if not API_KEY:
    print("请设置 RUNPOD_API_KEY")
    sys.exit(1)

if len(sys.argv) < 2:
    print("用法: python3 delete_pod.py <pod_id>")
    sys.exit(1)

pod_id = sys.argv[1]
endpoint = f"https://api.runpod.io/graphql?api_key={API_KEY}"

query = """
mutation StopPod($id: String!) {
    podStop(input: { podId: $id }) {
        id
        desiredStatus
    }
}
"""

payload = json.dumps({"query": query, "variables": {"id": pod_id}}).encode()
req = urllib.request.Request(endpoint, data=payload, headers={"Content-Type": "application/json"})

try:
    with urllib.request.urlopen(req, timeout=10) as resp:
        data = json.loads(resp.read())
        if "errors" in data:
            print(f"错误: {data['errors'][0]['message']}")
        else:
            print(f"✅ Pod {pod_id} 已停止，不再计费")
except Exception as e:
    print(f"失败: {e}")
