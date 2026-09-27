"""Print FizzBuzz for the numbers 1 through 20."""


def label(number):
    if number % 15 == 0:
        return "FizzBuzz"
    if number % 3 == 0:
        return "Fizz"
    if number % 5 == 0:
        return "Buzz"
    return str(number)


if __name__ == "__main__":
    print(" ".join(label(n) for n in range(1, 21)))
