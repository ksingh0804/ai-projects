"""Flip a coin and tally heads and tails."""
import random


def flip(times, rng):
    tosses = [rng.choice(("heads", "tails")) for _ in range(times)]
    return tosses, tosses.count("heads"), tosses.count("tails")


if __name__ == "__main__":
    tosses, heads, tails = flip(8, random.Random(2))
    print(" ".join(tosses))
    print(f"heads={heads} tails={tails}")
