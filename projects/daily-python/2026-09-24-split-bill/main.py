"""Split a bill, including tip, across a group."""


def per_person(bill, tip_percent, people):
    if people < 1:
        raise ValueError("need at least one person")
    total = bill * (1 + tip_percent / 100)
    return round(total / people, 2)


if __name__ == "__main__":
    share = per_person(86.40, 20, 4)
    print(f"each person owes ${share:.2f}")
