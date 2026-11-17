"""Compare AI picks (production, Gemini on) with non-AI picks (local, Gemini off).

Same catalog on both sides. Each trial is a fresh three-dish request with the same
conditions. Read-only: it only calls the public recommendations endpoint.
"""
import json
import re
import statistics as st
import sys
import time
import urllib.request

PROD = "https://kinraidee-512615.web.app"
LOCAL = "http://localhost:3000"
ORIGIN = {PROD: PROD, LOCAL: "http://localhost:5173"}
TRIALS = int(sys.argv[1]) if len(sys.argv) > 1 else 5
OUT = sys.argv[2]


def call(base, path, body=None):
    data = json.dumps(body).encode() if body is not None else None
    req = urllib.request.Request(
        base + path,
        data=data,
        headers={"content-type": "application/json", "origin": ORIGIN[base]},
    )
    t = time.perf_counter()
    with urllib.request.urlopen(req, timeout=30) as r:
        payload = json.load(r)
    return payload["data"], time.perf_counter() - t


tastes, _ = call(PROD, "/api/tastes")
taste_ids = [None] + [t["id"] for t in tastes["items"]]
taste_name = {None: "any", **{t["id"]: t["name"]["en"] for t in tastes["items"]}}
conditions = [
    {"budget": b, "tasteId": t, "foodTypeId": None, "zoneId": None}
    for b in ("BETWEEN_50_100", "BETWEEN_101_200")
    for t in taste_ids
]

rows = []
for cond in conditions:
    for trial in range(TRIALS):
        for side, base in (("ai", PROD), ("plain", LOCAL)):
            body = {
                "conditions": cond,
                "rejectedMenuItemIds": [],
                "displayedMenuItemIds": [],
                "count": 3,
            }
            try:
                data, seconds = call(base, "/api/recommendations", body)
            except Exception as error:  # noqa: BLE001
                rows.append({"side": side, "cond": cond, "error": str(error)})
                continue
            rows.append(
                {
                    "side": side,
                    "cond": cond,
                    "taste": taste_name[cond["tasteId"]],
                    "seconds": seconds,
                    "adjusted": bool(data.get("adjustment")),
                    "items": [
                        {
                            "id": i["id"],
                            "name": i["name"]["en"],
                            "price": i["price"],
                            "restaurant": i["restaurant"]["id"],
                            "restaurantTh": i["restaurant"]["name"]["th"],
                            "foodType": i["foodType"]["id"],
                            "tastes": [t["id"] for t in i["tastes"]],
                            "tasteNamesTh": [t["name"]["th"] for t in i["tastes"]],
                            "source": i["selection"]["source"],
                            "reason": i["selection"]["reasonTh"],
                        }
                        for i in data["items"]
                    ],
                }
            )
            time.sleep(0.7)
    print("done", cond["budget"], taste_name[cond["tasteId"]], flush=True)

json.dump(rows, open(OUT, "w", encoding="utf-8"), ensure_ascii=False, indent=1)
print("saved", len(rows), "responses")
