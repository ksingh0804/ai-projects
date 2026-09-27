"""Find the smaller angle between the hour and minute hands."""


def clock_angle(hour, minute):
    hour_deg = 30 * (hour % 12) + 0.5 * minute
    minute_deg = 6 * minute
    diff = abs(hour_deg - minute_deg)
    return min(diff, 360 - diff)


if __name__ == "__main__":
    for hour, minute in ((3, 0), (12, 0), (6, 30)):
        print(f"{hour:02d}:{minute:02d} -> {clock_angle(hour, minute):.1f} deg")
