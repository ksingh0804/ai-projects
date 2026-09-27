"""Count words, lines, and characters in a short note."""


def counts(text):
    lines = text.splitlines()
    words = text.split()
    return len(lines), len(words), len(text)


if __name__ == "__main__":
    note = "Green squares\nneed small projects.\nOne script each day."
    lines, words, chars = counts(note)
    print(f"lines={lines} words={words} chars={chars}")
