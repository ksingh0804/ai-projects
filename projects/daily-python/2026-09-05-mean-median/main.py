"""Compute the mean and median of a list of numbers."""


def mean(values):
    return sum(values) / len(values)


def median(values):
    ordered = sorted(values)
    mid = len(ordered) // 2
    if len(ordered) % 2:
        return ordered[mid]
    return (ordered[mid - 1] + ordered[mid]) / 2


if __name__ == "__main__":
    sample = [4, 1, 7, 7, 2]
    print(f"mean={mean(sample):.1f} median={median(sample)}")
