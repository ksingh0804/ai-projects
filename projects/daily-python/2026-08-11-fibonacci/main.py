"""Print the first few Fibonacci numbers."""


def fibonacci(count):
    seq = []
    a, b = 0, 1
    for _ in range(count):
        seq.append(a)
        a, b = b, a + b
    return seq


if __name__ == "__main__":
    print(" ".join(str(n) for n in fibonacci(12)))
