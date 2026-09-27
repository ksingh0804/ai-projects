"""Add tax to a list of prices and print a receipt total."""
TAX = 0.08


def receipt(prices):
    subtotal = sum(prices)
    tax = round(subtotal * TAX, 2)
    return subtotal, tax, round(subtotal + tax, 2)


if __name__ == "__main__":
    subtotal, tax, total = receipt([4.50, 3.25, 12.00])
    print(f"subtotal=${subtotal:.2f}")
    print(f"tax=${tax:.2f}")
    print(f"total=${total:.2f}")
