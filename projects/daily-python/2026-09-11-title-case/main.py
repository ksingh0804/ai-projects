"""Capitalize each word without using str.title."""


def title_case(sentence):
    return " ".join(word[:1].upper() + word[1:].lower() for word in sentence.split())


if __name__ == "__main__":
    print(title_case("small PYTHON projects FOR github"))
