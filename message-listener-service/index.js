const net = require("net");
var amqp = require("amqplib/callback_api");

var server = net.createServer();
server.on("connection", handleConnection);

server.listen(9091, function() {
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
    //console.log("****connection11 data from %s: %j", remoteAddress, d);
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
  //todo-- fix the ip address issue
  // amqp.connect("amqp://rabbitmq:rabbitmq@172.18.0.2:5672", function(err, con) {
  //   if (err) {
  //     console.log(err);
  //   }
  //   con.createChannel(function(err, ch) {
  //     var q = "test";
  //
  //     ch.assertQueue(q, { durable: false });
  //     // Note: on Node 6 Buffer.from(msg) should be used
  //     ch.sendToQueue(q, new Buffer(d));
  //     //console.log(" [x] Sent " + d);
  //   });
  // });
}
