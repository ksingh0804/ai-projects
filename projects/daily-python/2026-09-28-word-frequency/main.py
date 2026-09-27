"""Count how often each word appears."""


def frequency(text):
    counts = {}
    for word in text.lower().split():
        counts[word] = counts.get(word, 0) + 1
    return counts


if __name__ == "__main__":
    note = "green green square square square day"
    for word, count in frequency(note).items():
        print(f"{word}: {count}")
