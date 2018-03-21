const net = require("net");
const amqp = require("amqplib/callback_api");

let server = net.createServer();
let users = [];
server.on("connection", handleConnection);
consumeMessages();

server.listen(9099, function() {
  console.log("server listening to %j", server.address());
});

function handleConnection(conn) {
  var remoteAddress = conn.remoteAddress + ":" + conn.remotePort;
  console.log("new client connection from %s", remoteAddress);

  conn.setEncoding("utf8");

  conn.on("data", onConnData);
  conn.once("close", onConnClose);
  conn.on("error", onConnError);

  function onConnData(d) {
    let tmp = d.trim().split("\n");
    users = users.concat(tmp);
    console.log(users.length);
  }

  function onConnClose() {
    console.log("connection from %s closed", remoteAddress);
  }

  function onConnError(err) {
    console.log("Connection %s error: %s", remoteAddress, err.message);
  }
}

function consumeMessages() {
  amqp.connect("amqp://rabbitmq:rabbitmq@172.18.0.2:5672", function(err, conn) {
    conn.createChannel(function(err, ch) {
      var q = "test";

      ch.assertQueue(q, { durable: false });
      //console.log(" [*] Waiting for messages in %s. To exit press CTRL+C", q);
      ch.consume(
        q,
        function(msg) {
          console.log(" [x] Received %s", msg.content.toString());
        },
        { noAck: true }
      );
    });
  });
}
