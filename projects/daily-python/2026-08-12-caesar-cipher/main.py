"""Shift letters by a fixed amount, leaving other characters alone."""


def shift(text, steps):
    out = []
    for ch in text:
        if ch.isalpha():
            base = "A" if ch.isupper() else "a"
            out.append(chr((ord(ch) - ord(base) + steps) % 26 + ord(base)))
        else:
            out.append(ch)
    return "".join(out)


if __name__ == "__main__":
    secret = shift("Hello, GitHub", 3)
    print(secret)
    print(shift(secret, -3))
