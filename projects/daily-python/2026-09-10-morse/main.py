"""Encode a short message as Morse code."""
CODE = {
    "A": ".-", "B": "-...", "C": "-.-.", "D": "-..", "E": ".",
    "H": "....", "I": "..", "L": ".-..", "O": "---", "S": "...",
}


def morse(text):
    words = []
    for word in text.upper().split():
        words.append(" ".join(CODE[ch] for ch in word))
    return " / ".join(words)


if __name__ == "__main__":
    print(morse("SOS"))
    print(morse("HELLO"))
