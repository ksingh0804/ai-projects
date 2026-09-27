"""Do a small sanity check on an email address."""


def looks_like_email(text):
    if text.count("@") != 1:
        return False
    name, domain = text.split("@")
    if not name or "." not in domain:
        return False
    return not domain.startswith(".") and not domain.endswith(".")


if __name__ == "__main__":
    for sample in ("ada@example.com", "no-at-sign", "a@b", "a@.com"):
        print(sample, looks_like_email(sample))
