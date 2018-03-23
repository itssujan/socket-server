const express = require("express");
const amqp = require("amqp");
const net = require("net");
const HashMap = require("hashmap");
const dotenv = require("dotenv");
dotenv.config(); //loads env variables..used mostly just for dev

const Event = require("./app/models/event.js");
const PriorityQueue = require("./app/queue/PriorityQueue");

const CONTROL_CHARACTER = "\n";
const EVENT_SEPARATOR = "|";
const EXCHANGE = "event_exchange";
const QUEUE = "event_queue";

let server = net.createServer();
const app = express();
const connection = amqp.createConnection({
  host: process.env.rabbitmq_host,
  port: process.env.rabbitmq_port,
  login: process.env.rabbitmq_login,
  password: process.env.rabbitmq_password
});

let userMap = new HashMap(); // used to store the client's connection
let followerMap = new HashMap(); // used to store the user's followers
let pQueue = new PriorityQueue(); //a priority queue that pops data as per the priority (1 being the highest)

let closedConnectionsCount = 0;

server.on("connection", handleConnection);
server.listen(process.env.port, function() {
  console.log("server listening to %j", server.address());
});

//handles socket connections..
function handleConnection(conn) {
  let remoteAddress = conn.remoteAddress + ":" + conn.remotePort;
  console.log("Got connection :" + conn.remoteAddress);

  conn.setEncoding("utf8");

  conn.on("data", onConnData);
  conn.once("close", onConnClose);
  conn.on("error", onConnError);

  //add connection data to usermap when client sends userid
  function onConnData(d) {
    let users = d.trim().split(CONTROL_CHARACTER);
    let userID = users[0];
    userMap.set(userID, conn);
    followerMap.set(userID, []);
  }

  function onConnClose() {
    console.log("connection from %s closed", remoteAddress);
    closedConnectionsCount++;
    if (closedConnectionsCount == userMap.keys().length) {
      console.log(" All connections closed.. cleaning up");
      cleanup();
    }
  }

  function onConnError(err) {
    console.log("***** ERRORRR : " + err);
  }
}

let cleanup = () => {
  closedConnectionsCount = 0;
  userMap = new HashMap();
  followerMap = new HashMap();
  pQueue = new PriorityQueue();
};

// Wait for connection to become established.
connection.on("ready", function() {
  console.log("**Connected to RabbitMQ**");
  let ex = connection.exchange(EXCHANGE);
  let queue = connection.queue(QUEUE);
  queue.bind(EXCHANGE, "key.b.a");

  queue.subscribe(function(message) {
    let event = getEvent(message.data.toString());
    if (event) {
      pQueue.enqueue(event, parseInt(event.sequence));
      attemptDequeue();
    }
  });
});

//keep looking for next priority item
function attemptDequeue() {
  let e;
  do {
    e = pQueue.dequeue();
    if (e) {
      processEvent(e.element);
    }
  } while (e);
}

// parses the event string from queue and converts to an event object
let getEvent = eventStr => {
  let strArray = eventStr.split(EVENT_SEPARATOR);
  if (strArray && strArray.length >= 2) {
    let e = new Event(strArray[0], strArray[1], eventStr);
    if (strArray[2]) {
      e.setFromUserID(strArray[2]);
    }
    if (strArray[3]) {
      e.setToUserID(strArray[3]);
    }
    return e;
  }
  return null;
};

// process event based on event type
let processEvent = event => {
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

// send event to the respective user on the socket
let sendEvent = function(e, uid) {
  let con = userMap.get(uid);
  if (con) {
    con.write(e.rawEvent);
  }
};

//add follower data to followermap
let addFollower = event => {
  let followers = followerMap.get(event.toUserID);
  if (!followers || followers.length == 0) {
    followers = [];
  }
  followers.push(event.fromUserID);
  followerMap.set(event.toUserID, followers);
};

// remove follower from the followermap
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

//notify user about follow event
let notifyFollow = event => {
  addFollower(event);
  sendEvent(event, event.toUserID);
};

//notify broadcast event to all connected users
let notifyBroadcast = event => {
  userMap.forEach(function(con, userID) {
    sendEvent(event, userID);
  });
};

//send private message to the user
let notifyPrivateMessage = event => {
  sendEvent(event, event.toUserID);
};

// send status update to all followers
let notifyStatusUpdate = event => {
  let followers = followerMap.get(event.fromUserID);
  if (followers && followers.length > 0) {
    followers.forEach(function(follower) {
      sendEvent(event, follower);
    });
  }
};
