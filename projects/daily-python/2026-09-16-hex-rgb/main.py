"""Turn a #RRGGBB color into red, green, and blue."""


def hex_to_rgb(color):
    text = color.removeprefix("#")
    if len(text) != 6:
        raise ValueError("expected #RRGGBB")
    return tuple(int(text[i:i + 2], 16) for i in (0, 2, 4))


if __name__ == "__main__":
    for color in ("#9be9a8", "#216e39", "#ebedf0"):
        print(color, hex_to_rgb(color))
