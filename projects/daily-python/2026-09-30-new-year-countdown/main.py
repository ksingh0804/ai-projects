"""Count the days from a date until the next New Year."""
from datetime import date


def days_until_new_year(today):
    new_year = date(today.year + 1, 1, 1)
    return (new_year - today).days


if __name__ == "__main__":
    today = date(2026, 9, 30)
    print(f"{days_until_new_year(today)} days until 2027")
