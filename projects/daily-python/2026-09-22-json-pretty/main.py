"""Pretty-print a small dictionary as JSON."""
import json


def pretty(data):
    return json.dumps(data, indent=2, sort_keys=True)


if __name__ == "__main__":
    print(pretty({"day": "2026-09-22", "lang": "python", "lines": 30}))
