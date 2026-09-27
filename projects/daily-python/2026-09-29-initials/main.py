"""Take the initials from a full name."""


def initials(name):
    return "".join(part[0].upper() for part in name.split() if part)


if __name__ == "__main__":
    for name in ("Kaustubh Singh", "ada lovelace", "grace brewster murray hopper"):
        print(initials(name), "<-", name)
