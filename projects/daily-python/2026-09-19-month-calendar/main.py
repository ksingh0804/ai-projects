"""Print a text calendar for September 2026."""
import calendar


def month_text(year, month):
    return calendar.month(year, month)


if __name__ == "__main__":
    print(month_text(2026, 9), end="")
