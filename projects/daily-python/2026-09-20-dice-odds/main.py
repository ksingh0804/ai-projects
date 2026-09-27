"""Count how often each total appears for two dice."""


def totals():
    counts = {total: 0 for total in range(2, 13)}
    for a in range(1, 7):
        for b in range(1, 7):
            counts[a + b] += 1
    return counts


if __name__ == "__main__":
    for total, count in totals().items():
        print(f"{total:2d}: {count} ways")
