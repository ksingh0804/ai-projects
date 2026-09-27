"""Sort a list with bubble sort."""


def bubble_sort(values):
    items = list(values)
    for end in range(len(items) - 1, 0, -1):
        for i in range(end):
            if items[i] > items[i + 1]:
                items[i], items[i + 1] = items[i + 1], items[i]
    return items


if __name__ == "__main__":
    print(bubble_sort([5, 1, 4, 2, 8, 3]))
