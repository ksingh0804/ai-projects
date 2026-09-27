"""Project a balance with yearly compound interest."""


def balance(principal, rate, years):
    return round(principal * (1 + rate) ** years, 2)


if __name__ == "__main__":
    for year in range(0, 6):
        print(f"year {year}: ${balance(1000, 0.05, year):.2f}")
