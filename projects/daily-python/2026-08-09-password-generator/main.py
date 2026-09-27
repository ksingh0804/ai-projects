"""Build a short password from letters and digits."""
import random
import string


def make_password(length, rng):
    pool = string.ascii_letters + string.digits
    return "".join(rng.choice(pool) for _ in range(length))


if __name__ == "__main__":
    print(make_password(12, random.Random(9)))
