"""Work out a tip and the total for a meal."""


def tip_and_total(bill, percent):
    tip = round(bill * percent / 100, 2)
    return tip, round(bill + tip, 2)


if __name__ == "__main__":
    tip, total = tip_and_total(48.50, 18)
    print(f"tip=${tip:.2f}")
    print(f"total=${total:.2f}")
