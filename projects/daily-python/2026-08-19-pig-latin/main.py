"""Move the first letter of each word to the end and add 'ay'."""


def pig_latin(sentence):
    words = []
    for word in sentence.split():
        words.append(word[1:] + word[0] + "ay" if word.isalpha() else word)
    return " ".join(words)


if __name__ == "__main__":
    print(pig_latin("green squares today"))
