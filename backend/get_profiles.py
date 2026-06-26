import json
import urllib.request
import threading
import time

player_ids = [
    "607720", "17259", "40680", "1009439", "344695", "196357", "503482", "353892",
    "424204", "170986", "483046", "223967", "792380", "161056", "1118495", "822959",
    "153084", "1497653", "580195", "1075147", "480692", "566723", "159471", "132098",
    "776890"
]

results = {}
lock = threading.Lock()

def fetch_profile(pid):
    url = f"https://transfermarkt-api.fly.dev/players/{pid}/profile"
    headers = {"User-Agent": "Mozilla/5.0"}
    req = urllib.request.Request(url, headers=headers)
    
    # Try up to 3 times
    for attempt in range(3):
        try:
            with urllib.request.urlopen(req, timeout=30) as response:
                data = json.loads(response.read().decode('utf-8'))
                image_url = data.get("imageUrl", "")
                shirt_number = data.get("shirtNumber", "")
                if shirt_number.startswith("#"):
                    shirt_number = shirt_number[1:]
                
                with lock:
                    results[pid] = {
                        "imageUrl": image_url,
                        "shirtNumber": shirt_number,
                        "name": data.get("name", "")
                    }
                print(f"Success for {pid}: {data.get('name')}")
                return
        except Exception as e:
            print(f"Attempt {attempt+1} failed for {pid}: {e}")
            time.sleep(2)

threads = []
for pid in player_ids:
    t = threading.Thread(target=fetch_profile, args=(pid,))
    threads.append(t)
    t.start()
    time.sleep(0.5)  # Stagger slightly

for t in threads:
    t.join()

print("\n--- JAVA MAP GENERATION ---")
print("private static final java.util.Map<Long, PlayerProfile> TM_PROFILES = new java.util.HashMap<>();")
print("static {")
for pid in sorted(results.keys()):
    res = results[pid]
    img = res["imageUrl"]
    num = res["shirtNumber"]
    name = res["name"]
    print(f'    TM_PROFILES.put({pid}L, new PlayerProfile("{img}", "{num}", "{name}"));')
print("}")
