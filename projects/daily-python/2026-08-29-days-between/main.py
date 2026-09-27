"""Count the days between two calendar dates."""
from datetime import date


def days_between(start, end):
    return (end - start).days


if __name__ == "__main__":
    start = date(2026, 8, 1)
    end = date(2026, 9, 30)
    print(f"{start} -> {end}: {days_between(start, end)} days")
