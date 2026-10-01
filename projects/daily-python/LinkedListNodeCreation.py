class Node:
    """One item in a singly linked list.
    value is the data stored in this item.
    next points to the following node. It is None when this item is last.
    """
    def __init__(self, value):
        self.value = value
        self.next = None

class LinkedList:
    """A singly linked list that starts with one node.
    head points to the first node.
    tail points to the last node.
    length is how many nodes are in the list.
    """
    def __init__(self, value):
        new_node = Node(value)
        self.head = new_node
        self.tail = new_node
        self.length = 1



firstLinkedList = LinkedList(4)

print(firstLinkedList.head.value)

print(LinkedList.__doc__)
print(Node.__doc__)
