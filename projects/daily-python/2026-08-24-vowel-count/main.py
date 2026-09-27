"""Count vowels in a sentence."""
VOWELS = set("aeiou")


def vowel_count(text):
    return sum(ch.lower() in VOWELS for ch in text)


if __name__ == "__main__":
    sentence = "Daily python projects fill the calendar."
    print(sentence)
    print("vowels:", vowel_count(sentence))
