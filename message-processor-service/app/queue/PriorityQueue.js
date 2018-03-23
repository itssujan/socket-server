let QElement = require("./QElement");

// PriorityQueue class
class PriorityQueue {
  constructor() {
    this.items = [];
    this.currentPriority = 1;
  }

  enqueue(element, priority) {
    // console.log("Adding to queue " + priority);
    let qElement = new QElement(element, priority);
    let contain = false;

    for (let i = 0; i < this.items.length; i++) {
      if (this.items[i].priority > qElement.priority) {
        this.items.splice(i, 0, qElement);
        contain = true;
        break;
      }
    }

    if (!contain) {
      this.items.push(qElement);
    }
  }

  dequeue() {
    if (this.isEmpty()) return null;
    if (!this.isEmpty() && this.currentPriority == this.items[0].priority) {
      this.currentPriority++;
      return this.items.shift();
    } else if (this.currentPriority > this.items[0].priority) {
      console.log(
        "**************** Removing " + JSON.stringify(this.items[0].element)
      );
      this.items.shift();
    } else {
      // console.log(
      //   "Cant find " + this.currentPriority + " , " + this.items[0].priority
      // );
      // console.log(JSON.stringify(this.items[0]));
      return null;
    }
  }

  front() {
    if (this.isEmpty()) return "No elements in Queue";
    return this.items[0];
  }

  rear() {
    if (this.isEmpty()) return "No elements in Queue";
    return this.items[this.items.length - 1];
  }

  isEmpty() {
    return this.items.length == 0;
  }

  printPQueue() {
    let str = "";
    for (let i = 0; i < this.items.length; i++)
      str += JSON.stringify(this.items[i].element) + " ";
    return str;
  }
}

module.exports = PriorityQueue;
