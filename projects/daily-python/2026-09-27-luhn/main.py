"""Validate a number with the Luhn checksum."""


def luhn_ok(number):
    digits = [int(ch) for ch in number if ch.isdigit()]
    total = 0
    for index, digit in enumerate(reversed(digits)):
        if index % 2 == 1:
            digit *= 2
            if digit > 9:
                digit -= 9
        total += digit
    return total % 10 == 0


if __name__ == "__main__":
    for sample in ("4539578763621486", "4539578763621487"):
        print(sample, "valid" if luhn_ok(sample) else "invalid")
