"""Compute factorials for a few small integers."""


def factorial(number):
    result = 1
    for value in range(2, number + 1):
        result *= value
    return result


if __name__ == "__main__":
    for number in range(0, 8):
        print(f"{number}! = {factorial(number)}")
