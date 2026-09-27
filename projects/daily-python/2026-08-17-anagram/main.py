"""See whether two words use the same letters."""


def is_anagram(left, right):
    norm = lambda word: sorted(ch.lower() for ch in word if ch.isalpha())
    return norm(left) == norm(right)


if __name__ == "__main__":
    pairs = [("listen", "silent"), ("python", "typhon"), ("night", "thing")]
    for left, right in pairs:
        print(f"{left} / {right}: {is_anagram(left, right)}")
