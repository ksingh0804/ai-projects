"""Show decimal numbers as binary without the 0b prefix."""


def to_binary(number):
    if number == 0:
        return "0"
    bits = []
    while number:
        bits.append(str(number % 2))
        number //= 2
    return "".join(reversed(bits))


if __name__ == "__main__":
    for number in (0, 1, 5, 13, 32):
        print(f"{number} = {to_binary(number)}")
