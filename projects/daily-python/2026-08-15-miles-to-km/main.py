"""Convert miles to kilometers and back."""
KM_PER_MILE = 1.60934


def miles_to_km(miles):
    return miles * KM_PER_MILE


def km_to_miles(km):
    return km / KM_PER_MILE


if __name__ == "__main__":
    print(f"5 miles = {miles_to_km(5):.2f} km")
    print(f"10 km = {km_to_miles(10):.2f} miles")
