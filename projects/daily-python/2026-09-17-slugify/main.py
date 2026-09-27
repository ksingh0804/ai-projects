"""Make a lowercase hyphenated slug from a title."""


def slugify(title):
    cleaned = []
    for ch in title.lower():
        cleaned.append(ch if ch.isalnum() else "-")
    slug = "".join(cleaned)
    while "--" in slug:
        slug = slug.replace("--", "-")
    return slug.strip("-")


if __name__ == "__main__":
    print(slugify("Daily Python: Mini Projects!"))
