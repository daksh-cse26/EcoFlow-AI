import urllib.request
import time
import socket
import sys

sys.stdout.reconfigure(encoding='utf-8')
socket.setdefaulttimeout(10)

url_health = "https://ecoflow-ai-glug.onrender.com/healthz"
url_home = "https://ecoflow-ai-glug.onrender.com"

print("--> Starting continuous Render deployment monitor...", flush=True)

success = False
for attempt in range(1, 40):
    timestamp = time.strftime("%H:%M:%S")
    try:
        req = urllib.request.Request(url_health, headers={"User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64)"})
        with urllib.request.urlopen(req, timeout=10) as resp:
            status = resp.status
            body = resp.read().decode('utf-8', errors='ignore')
            print(f"[{timestamp}] Attempt {attempt}: Health check HTTP {status} -> {body}", flush=True)
            if status == 200:
                print("==> SERVICE IS CONFIRMED LIVE ON RENDER! 🎉", flush=True)
                success = True
                break
    except urllib.error.HTTPError as e:
        print(f"[{timestamp}] Attempt {attempt}: HTTP {e.code} ({e.reason})", flush=True)
    except socket.timeout:
        print(f"[{timestamp}] Attempt {attempt}: Request timed out (Container still building or booting)", flush=True)
    except Exception as e:
        print(f"[{timestamp}] Attempt {attempt}: Waiting... ({e})", flush=True)
    
    time.sleep(8)

if not success:
    print("Deployment monitor completed all attempts.", flush=True)
