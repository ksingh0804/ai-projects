"""Reverse the order of words, and also reverse each word."""


def reverse_order(sentence):
    return " ".join(reversed(sentence.split()))


def reverse_each(sentence):
    return " ".join(word[::-1] for word in sentence.split())


if __name__ == "__main__":
    text = "upload the mini projects"
    print(reverse_order(text))
    print(reverse_each(text))
