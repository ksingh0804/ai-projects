"""Fill a tiny story template."""


def story(noun, verb, place):
    return f"The {noun} decided to {verb} at the {place}."


if __name__ == "__main__":
    print(story("script", "run", "terminal"))
    print(story("calendar", "glow", "profile"))
