"""Check whether a phrase reads the same forwards and backwards."""


def is_palindrome(text):
    letters = [ch.lower() for ch in text if ch.isalnum()]
    return letters == letters[::-1]


if __name__ == "__main__":
    for phrase in ("racecar", "A man a plan a canal Panama", "github"):
        print(phrase, "yes" if is_palindrome(phrase) else "no")
