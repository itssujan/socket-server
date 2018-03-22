const util = require("util");
const EventEmitter = require("events").EventEmitter;

let QElement = require("./QElement");

// PriorityQueue class
class PriorityQueue {
  constructor() {
    this.items = [];
    this.currentPriority = 1;
    EventEmitter.call(this);
    this.emitting = false;
  }

  enqueue(element, priority) {
    console.log("Adding to queue****************");
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
    // if (!emitting) {
    //   console.log("Trying to inform subscribers ********");
    //   this.informSubscribers();
    // } else {
    //   console.log("Sorry **********");
    // }
  }

  dequeue() {
    if (this.isEmpty()) return null;
    if (!this.isEmpty() && this.currentPriority == this.items[0].priority) {
      this.currentPriority++;
      return this.items.shift();
    } else {
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

  informSubscribers() {
    while (!this.isEmpty()) {
      console.log("Emitting***********");
      let e = this.dequeue();
      this.emitting = true;
      if (e) {
        this.emit("popAvailable", e);
      }
    }
    if (this.isEmpty()) {
      console.log("nothing to emit*********");
      this.emitting = false;
    }
  }
}

util.inherits(PriorityQueue, EventEmitter);
module.exports = PriorityQueue;
