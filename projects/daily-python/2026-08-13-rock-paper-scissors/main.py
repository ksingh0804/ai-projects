"""Score one round of rock, paper, scissors."""


def winner(left, right):
    beats = {"rock": "scissors", "paper": "rock", "scissors": "paper"}
    if left == right:
        return "tie"
    return "left" if beats[left] == right else "right"


if __name__ == "__main__":
    rounds = [("rock", "scissors"), ("paper", "paper"), ("rock", "paper")]
    for left, right in rounds:
        print(f"{left} vs {right}: {winner(left, right)}")
