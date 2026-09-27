"""Format a duration given as a number of seconds."""


def format_elapsed(seconds):
    minutes, sec = divmod(int(seconds), 60)
    hours, minutes = divmod(minutes, 60)
    return f"{hours:02d}:{minutes:02d}:{sec:02d}"


if __name__ == "__main__":
    for seconds in (0, 75, 3661):
        print(seconds, "->", format_elapsed(seconds))
