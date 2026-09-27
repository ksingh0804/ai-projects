"""Compute body mass index from kilograms and meters."""


def bmi(weight_kg, height_m):
    return weight_kg / (height_m * height_m)


def band(score):
    if score < 18.5:
        return "under"
    if score < 25:
        return "normal"
    if score < 30:
        return "over"
    return "obese"


if __name__ == "__main__":
    score = bmi(70, 1.75)
    print(f"{score:.1f} {band(score)}")
