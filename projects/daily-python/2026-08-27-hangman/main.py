"""Reveal letters that have been guessed and hide the rest."""


def mask(word, guesses):
    known = {letter.lower() for letter in guesses}
    return " ".join(ch if ch.lower() in known else "_" for ch in word)


if __name__ == "__main__":
    print(mask("python", "pn"))
    print(mask("python", "python"))
