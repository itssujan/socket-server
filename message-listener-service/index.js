const net = require("net");
const amqp = require("amqp");
const dotenv = require("dotenv");
const server = net.createServer();

dotenv.config(); //loads env variables..used mostly just for dev

const CONTROL_CHARACTER = "\n";
const EXCHANGE = "event_exchange";
const QUEUE = "event_queue";
const EXCHANGE_KEY = "key.b.a";
let _exchange = null;
let _queue = null;

server.on("connection", handleConnection);
server.listen(process.env.port, function() {
  console.log("server listening to %j", server.address());
});

const connection = amqp.createConnection({
  host: process.env.rabbitmq_host,
  port: process.env.rabbitmq_port,
  login: process.env.rabbitmq_login,
  password: process.env.rabbitmq_password
});

// Wait for rabbitmq connection to become established.
connection.on("ready", function() {
  console.log("**Connected to RabbitMQ**");
  _exchange = connection.exchange(EXCHANGE);
  _queue = connection.queue(QUEUE);
  _queue.bind(EXCHANGE, EXCHANGE_KEY);
});

// socket connection
function handleConnection(conn) {
  var remoteAddress = conn.remoteAddress + ":" + conn.remotePort;
  console.log("new client connection from %s", remoteAddress);
  let partialMsg = "";

  conn.setEncoding("utf8");

  conn.on("data", onConnData);
  conn.once("close", onConnClose);
  conn.on("error", onConnError);

  //on receiving events...
  //hacky approach here as the CRLF character recognition was failing for some reason
  // @ approach needs to be changed to the ideal one....
  function onConnData(d) {
    let tmp = d.replace(/[\n]/g, "@");
    if (!tmp.trim().endsWith("@")) {
      partialMsg = partialMsg + tmp;
    } else {
      addMessageToQueue(partialMsg + "" + tmp);
      partialMsg = "";
    }
  }

  function onConnClose() {
    console.log("connection from %s closed", remoteAddress);
  }

  function onConnError(err) {
    console.log("Connection %s error: %s", remoteAddress, err.message);
  }
}

// splits the event list to individual events and puts into the queue
function addMessageToQueue(d) {
  let events = d.trim().split("@");
  events.forEach(function(event) {
    _exchange.publish(EXCHANGE_KEY, event);
  });
}
