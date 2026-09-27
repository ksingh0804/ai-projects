"""Walk a high-low search toward a secret number."""


def guesses(secret, low, high):
    steps = []
    while low <= high:
        mid = (low + high) // 2
        steps.append(mid)
        if mid == secret:
            return steps
        if mid < secret:
            low = mid + 1
        else:
            high = mid - 1
    return steps


if __name__ == "__main__":
    print(" ".join(str(n) for n in guesses(23, 1, 50)))
