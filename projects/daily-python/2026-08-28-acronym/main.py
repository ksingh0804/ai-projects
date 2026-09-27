"""Build an acronym from the first letter of each word."""


def acronym(phrase):
    return "".join(word[0].upper() for word in phrase.split() if word)


if __name__ == "__main__":
    for phrase in ("portable network graphics", "daily python minis"):
        print(acronym(phrase), "<-", phrase)
