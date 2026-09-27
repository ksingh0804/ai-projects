"""Greatest common divisor, plus a least common multiple."""


def gcd(a, b):
    while b:
        a, b = b, a % b
    return abs(a)


def lcm(a, b):
    return abs(a * b) // gcd(a, b)


if __name__ == "__main__":
    print("gcd(24, 36) =", gcd(24, 36))
    print("lcm(12, 18) =", lcm(12, 18))
