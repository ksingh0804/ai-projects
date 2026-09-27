"""Test which numbers in a small range are prime."""


def is_prime(number):
    if number < 2:
        return False
    for factor in range(2, int(number ** 0.5) + 1):
        if number % factor == 0:
            return False
    return True


if __name__ == "__main__":
    primes = [n for n in range(1, 31) if is_prime(n)]
    print(" ".join(str(n) for n in primes))
