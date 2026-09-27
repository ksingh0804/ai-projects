"""Replace each value with the sum of everything up to it."""


def running_sum(values):
    total = 0
    out = []
    for value in values:
        total += value
        out.append(total)
    return out


if __name__ == "__main__":
    print(running_sum([1, 2, 3, 4, 5]))
