"""Count down from a start value and finish with a blast-off line."""


def countdown(start):
    return [str(n) for n in range(start, 0, -1)] + ["liftoff"]


if __name__ == "__main__":
    print(" ".join(countdown(5)))
