"""Convert between Celsius and Fahrenheit."""


def c_to_f(celsius):
    return celsius * 9 / 5 + 32


def f_to_c(fahrenheit):
    return (fahrenheit - 32) * 5 / 9


if __name__ == "__main__":
    print(f"0 C = {c_to_f(0):.1f} F")
    print(f"212 F = {f_to_c(212):.1f} C")
    print(f"37 C = {c_to_f(37):.1f} F")
