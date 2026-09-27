"""Score a password on length, case, and digits."""


def strength(password):
    points = 0
    if len(password) >= 8:
        points += 1
    if any(ch.islower() for ch in password):
        points += 1
    if any(ch.isupper() for ch in password):
        points += 1
    if any(ch.isdigit() for ch in password):
        points += 1
    return ("weak", "fair", "good", "strong")[points - 1] if points else "weak"


if __name__ == "__main__":
    for sample in ("abc", "longpassword", "Longer1"):
        print(sample, strength(sample))
