"""Decide whether a year is a leap year."""


def is_leap(year):
    if year % 400 == 0:
        return True
    if year % 100 == 0:
        return False
    return year % 4 == 0


if __name__ == "__main__":
    for year in (1900, 2000, 2024, 2026):
        print(year, "leap" if is_leap(year) else "common")
