const net = require("net");
// const redis = require("redis");
// const client = redis.createClient();

var server = net.createServer();
var server1 = net.createServer();
//server.on("connection", handleConnection);
server1.on("connection", handleConnection1);

server.listen(9090, function() {
  console.log("server listening to %j", server.address());
});

server1.listen(9099, function() {
  console.log("server1 listening to %j", server1.address());
});

function handleConnection(conn) {
  var remoteAddress = conn.remoteAddress + ":" + conn.remotePort;
  console.log("new client connection from %s", remoteAddress);

  conn.setEncoding("utf8");

  conn.on("data", onConnData);
  conn.once("close", onConnClose);
  conn.on("error", onConnError);

  function onConnData(d) {
    console.log("****connection11 data from %s: %j", remoteAddress, d);
  }

  function onConnClose() {
    console.log("connection from %s closed", remoteAddress);
  }

  function onConnError(err) {
    console.log("Connection %s error: %s", remoteAddress, err.message);
  }
}

function handleConnection1(conn) {
  var remoteAddress = conn.remoteAddress + ":" + conn.remotePort;
  console.log("#######new client connection from %s", remoteAddress);

  conn.setEncoding("utf8");

  conn.on("data", onConnData);
  conn.once("close", onConnClose);
  conn.on("error", onConnError);

  function onConnData(d) {
    console.log("connection data from %s: %j", remoteAddress, d);
    conn.write(d);
  }

  function onConnClose() {
    console.log("connection from %s closed", remoteAddress);
  }

  function onConnError(err) {
    console.log("Connection %s error: %s", remoteAddress, err.message);
  }
}
