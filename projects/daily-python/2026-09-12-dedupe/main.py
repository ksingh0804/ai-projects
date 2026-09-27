"""Drop duplicate items and keep the first occurrence."""


def unique(items):
    seen = set()
    result = []
    for item in items:
        if item not in seen:
            seen.add(item)
            result.append(item)
    return result


if __name__ == "__main__":
    print(unique(["py", "go", "py", "rs", "go", "py"]))
