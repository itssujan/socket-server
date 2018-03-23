const express = require("express");
const amqp = require("amqp");
const net = require("net");
const HashMap = require("hashmap");
let i = 0;

const Event = require("./app/models/event.js");
const PriorityQueue = require("./app/queue/PriorityQueue");

let server = net.createServer();
const app = express();
const connection = amqp.createConnection({
  host: "172.18.0.2",
  port: "5672",
  login: "rabbitmq",
  password: "rabbitmq"
});

const CONTROL_CHARACTER = "\n";
const EVENT_SEPARATOR = "|";

let userMap = new HashMap();
let followerMap = new HashMap();
let pQueue = new PriorityQueue();

server.on("connection", handleConnection);
server.listen(9099, function() {
  console.log("server listening to %j", server.address());
});

function handleConnection(conn) {
  let remoteAddress = conn.remoteAddress + ":" + conn.remotePort;
  console.log("Got connection :" + conn.remoteAddress);

  conn.setEncoding("utf8");

  conn.on("data", onConnData);
  conn.once("close", onConnClose);
  conn.on("error", onConnError);

  function onConnData(d) {
    let users = d.trim().split(CONTROL_CHARACTER);
    let userID = users[0];
    userMap.set(userID, conn);
    followerMap.set(userID, []);
  }

  function onConnClose() {
    console.log("connection from %s closed", remoteAddress);
  }

  function onConnError(err) {
    console.log("***** ERRORRR : " + err);
  }
}

// add this for better debuging
connection.on("error", function(e) {
  // console.log("Error connecting RabbitMQ..will keep retrying ", e);
});

// Wait for connection to become established.
connection.on("ready", function() {
  console.log("Connected to RabbitMQ");
  let exchange = connection.exchange("soundcloud_exchange");
  let queue = connection.queue("event_queue");
  queue.bind("soundcloud_exchange", "key.b.a");
  console.log("Exchange :" + exchange);
  console.log("Queue :" + queue);

  queue.subscribe(function(message) {
    let eventStr = message.data.toString();
    // console.log("Receiving message : " + eventStr);
    let event = getEvent(eventStr);
    if (event) {
      pQueue.enqueue(event, parseInt(event.sequence));
      attemptDequeue();
    }
  });
});

function attemptDequeue() {
  // console.log("Attempt dequeue");
  let e;
  do {
    e = pQueue.dequeue();
    if (e) {
      // console.log("Emitting " + JSON.stringify(e));
      processEvent(e.element);
    }
  } while (e);
}

let addToUsers = d => {
  users.concat(d.trim().split(CONTROL_CHARACTER));
};

let getEvent = eventStr => {
  let strArray = eventStr.split(EVENT_SEPARATOR);
  if (
    strArray &&
    strArray.length >= 2 &&
    !isNaN(strArray[0]) &&
    isNaN(strArray[1])
  ) {
    let e = new Event(strArray[0], strArray[1], eventStr);
    if (strArray[2]) {
      e.setFromUserID(strArray[2]);
    }
    if (strArray[3]) {
      e.setToUserID(strArray[3]);
    }
    return e;
  } else {
    console.log("******* Ignoring " + eventStr);
  }
  return null;
};

let processEvent = event => {
  // console.log("Processing " + JSON.stringify(event));
  switch (event.type) {
    case "F":
      notifyFollow(event);
      break;
    case "U":
      unfollow(event);
      break;
    case "B":
      notifyBroadcast(event);
      break;
    case "P":
      notifyPrivateMessage(event);
      break;
    case "S":
      notifyStatusUpdate(event);
      break;
    default:
      console.log("Unknown event");
  }
};

let sendEvent = function(e, uid) {
  let con = userMap.get(uid);
  if (con) {
    // console.log("Sending " + i++);
    con.write(e.rawEvent);
  }
};

let addFollower = event => {
  let followers = followerMap.get(event.toUserID);
  if (!followers || followers.length == 0) {
    followers = [];
  }
  followers.push(event.fromUserID);
  followerMap.set(event.toUserID, followers);
};

let unfollow = event => {
  let followers = followerMap.get(event.toUserID);
  if (
    followers &&
    followers.length > 0 &&
    followers.includes(event.fromUserID)
  ) {
    followers = followers.filter(e => e !== event.fromUserID);
    followerMap.set(event.toUserID, followers);
  }
};

let notifyFollow = event => {
  addFollower(event);
  sendEvent(event, event.toUserID);
};

let notifyBroadcast = event => {
  // console.log("Got broadcast event");
  userMap.forEach(function(con, userID) {
    sendEvent(event, userID);
  });
};

let notifyPrivateMessage = event => {
  // console.log("Got pvt message event");
  sendEvent(event, event.toUserID);
};

let notifyStatusUpdate = event => {
  let followers = followerMap.get(event.fromUserID);
  if (followers && followers.length > 0) {
    followers.forEach(function(follower) {
      sendEvent(event, follower);
    });
  }
};
