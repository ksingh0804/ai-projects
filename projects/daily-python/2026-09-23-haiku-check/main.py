"""Check that a haiku has three lines of 5, 7, and 5 words."""
SHAPE = (5, 7, 5)


def haiku_ok(text):
    lines = [line.split() for line in text.splitlines() if line.strip()]
    return len(lines) == 3 and tuple(len(line) for line in lines) == SHAPE


if __name__ == "__main__":
    poem = "small scripts fill the day\none folder made for every date here\npushed up to github now"
    print("ok" if haiku_ok(poem) else "no")
