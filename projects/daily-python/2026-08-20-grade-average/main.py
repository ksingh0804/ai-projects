"""Average scores and map the result to a letter grade."""


def average(scores):
    return sum(scores) / len(scores)


def letter(score):
    for cutoff, grade in ((90, "A"), (80, "B"), (70, "C"), (60, "D")):
        if score >= cutoff:
            return grade
    return "F"


if __name__ == "__main__":
    scores = [92, 81, 77, 88]
    mean = average(scores)
    print(f"{mean:.1f} {letter(mean)}")
