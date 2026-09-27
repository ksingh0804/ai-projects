"""Roll a handful of six-sided dice."""
import random


def roll(count, rng):
    return [rng.randint(1, 6) for _ in range(count)]


if __name__ == "__main__":
    faces = roll(5, random.Random(3))
    print("rolls:", " ".join(str(face) for face in faces))
    print("total:", sum(faces))
