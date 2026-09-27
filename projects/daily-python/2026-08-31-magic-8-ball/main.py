"""Answer a yes-or-no question with a fixed reply list."""
import random

REPLIES = (
    "Yes",
    "Ask again later",
    "Definitely",
    "Not likely",
    "Signs point to yes",
)


def answer(question, rng):
    return rng.choice(REPLIES)


if __name__ == "__main__":
    print(answer("Will the script run?", random.Random(8)))
