"""Score a three-question quiz."""
QUIZ = (
    ("2 + 2", "4"),
    ("color of grass", "green"),
    ("days in a week", "7"),
)


def score(answers):
    return sum(got.strip().lower() == want for (_, want), got in zip(QUIZ, answers))


if __name__ == "__main__":
    mine = ["4", "Green", "7"]
    print(f"{score(mine)}/{len(QUIZ)}")
