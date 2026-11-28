#!/usr/bin/env python3
"""Install Ollama on a Colab GPU, pull Inkling 2 Mini, and verify JSON output."""

import json
import os
import shutil
import subprocess
import time
import urllib.error
import urllib.request

MODEL = "inkling-2-mini:26b-a5b"


def request(path, payload=None, timeout=600):
    data = None if payload is None else json.dumps(payload).encode()
    req = urllib.request.Request(
        f"http://127.0.0.1:11434{path}",
        data=data,
        headers={"Content-Type": "application/json"},
    )
    try:
        return urllib.request.urlopen(req, timeout=timeout)
    except urllib.error.HTTPError as error:
        detail = error.read().decode(errors="replace")
        raise RuntimeError(f"Ollama HTTP {error.code}: {detail}") from error


def install_ollama():
    subprocess.run(["apt-get", "update", "-qq"], check=True)
    subprocess.run(["apt-get", "install", "-y", "-qq", "zstd"], check=True)
    with urllib.request.urlopen("https://ollama.com/install.sh", timeout=30) as response:
        installer = response.read()
    result = subprocess.run(
        ["bash"], input=installer, capture_output=True, text=False, check=False
    )
    print(result.stdout.decode(errors="replace"))
    print(result.stderr.decode(errors="replace"))
    if result.returncode:
        raise RuntimeError(f"Ollama installer exited with {result.returncode}")


def ensure_model():
    with request("/api/tags") as response:
        models = json.load(response)["models"]
    if any(item["name"] == MODEL for item in models):
        print(f"Model already cached: {MODEL}")
        return

    print(f"Pulling {MODEL}; the download is approximately 18 GB.")
    with request("/api/pull", {"name": MODEL, "stream": True}, timeout=3600) as response:
        for line in response:
            item = json.loads(line)
            if item.get("error"):
                raise RuntimeError(f"Ollama model pull failed: {item['error']}")
            if item.get("status") in {"success", "verifying sha256 digest"}:
                print(item["status"])


def main():
    gpu = subprocess.run(["nvidia-smi"], check=True, capture_output=True, text=True)
    print(gpu.stdout)
    if not shutil.which("ollama"):
        install_ollama()

    server_log = open("/tmp/ollama-inkling-smoke.log", "w")
    server = subprocess.Popen(
        ["ollama", "serve"],
        stdout=server_log,
        stderr=subprocess.STDOUT,
    )
    try:
        for _ in range(60):
            if server.poll() is not None:
                raise RuntimeError(f"Ollama server exited with {server.returncode}")
            try:
                with request("/api/version", timeout=3):
                    break
            except urllib.error.URLError:
                time.sleep(2)
        else:
            raise TimeoutError("Ollama server did not become ready")

        ensure_model()
        options = {"temperature": 0}
        context = os.environ.get("INKLING_NUM_CTX")
        if context:
            options["num_ctx"] = int(context)
        gpu_layers = os.environ.get("INKLING_NUM_GPU")
        if gpu_layers:
            options["num_gpu"] = int(gpu_layers)

        prompt = (
            'Return only a JSON object with keys "status" and "count". '
            'Set status to "ready" and count to 3.'
        )
        started = time.monotonic()
        with request(
            "/api/chat",
            {
                "model": MODEL,
                "messages": [{"role": "user", "content": prompt}],
                "stream": False,
                "format": "json",
                "options": options,
            },
            timeout=900,
        ) as response:
            result = json.load(response)

        parsed = json.loads(result["message"]["content"])
        print(
            json.dumps(
                {
                    "model": result["model"],
                    "response": parsed,
                    "valid_json": True,
                    "elapsed_seconds": round(time.monotonic() - started, 2),
                    "done_reason": result.get("done_reason"),
                    "num_ctx": options.get("num_ctx", "Ollama default"),
                    "num_gpu": options.get("num_gpu", "Ollama default"),
                }
            )
        )
        if parsed != {"status": "ready", "count": 3}:
            raise AssertionError(f"Unexpected model response: {parsed!r}")
    finally:
        server.terminate()
        server.wait(timeout=20)
        server_log.close()
        with open("/tmp/ollama-inkling-smoke.log") as log:
            tail = log.read()[-4000:]
        if tail:
            print("Ollama log tail:")
            print(tail)


if __name__ == "__main__":
    main()
