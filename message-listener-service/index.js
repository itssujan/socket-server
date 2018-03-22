const net = require("net");
const amqp = require("amqp");
const server = net.createServer();

const CONTROL_CHARACTER = "\n";

let i = 0;
let _exchange = null;
let _queue = null;

server.on("connection", handleConnection);
server.listen(9090, function() {
  console.log("server listening to %j", server.address());
});

const connection = amqp.createConnection({
  host: "172.18.0.2",
  port: "5672",
  login: "rabbitmq",
  password: "rabbitmq"
});

// add this for better debuging
connection.on("error", function(e) {
  // console.log("Error from amqp: ", e);
});

// Wait for connection to become established.
connection.on("ready", function() {
  console.log("Connected to RabbitMQ");
  _exchange = connection.exchange("soundcloud_exchange");
  _queue = connection.queue("event_queue");
  _queue.bind("soundcloud_exchange", "key.b.a");
});

function handleConnection(conn) {
  var remoteAddress = conn.remoteAddress + ":" + conn.remotePort;
  console.log("new client connection from %s", remoteAddress);

  conn.setEncoding("utf8");

  conn.on("data", onConnData);
  conn.once("close", onConnClose);
  conn.on("error", onConnError);

  function onConnData(d) {
    addMessageToQueue(d);
  }

  function onConnClose() {
    console.log("connection from %s closed", remoteAddress);
  }

  function onConnError(err) {
    console.log("Connection %s error: %s", remoteAddress, err.message);
  }
}

function addMessageToQueue(d) {
  let events = d.trim().split(CONTROL_CHARACTER);
  events.forEach(function(event) {
    _exchange.publish("key.b.a", event);
    console.log("Publishing event " + i++);
  });
}
