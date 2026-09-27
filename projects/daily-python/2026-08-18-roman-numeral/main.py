"""Turn integers from 1 to 39 into Roman numerals."""
TABLE = ((10, "X"), (9, "IX"), (5, "V"), (4, "IV"), (1, "I"))


def to_roman(number):
    parts = []
    for value, glyph in TABLE:
        while number >= value:
            parts.append(glyph)
            number -= value
    return "".join(parts)


if __name__ == "__main__":
    for number in (1, 4, 9, 14, 29):
        print(f"{number}={to_roman(number)}")
