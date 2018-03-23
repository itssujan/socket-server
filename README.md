# Socket server
Processes high volumes of various events and sends it to the appropriate users


## Usage
Install docker : https://docs.docker.com/install/

docket-compose up --build

This starts off both the services and the rabbitmq instance.
More details about the services can be found in the service directories.


## Challenge

Implementation of a coding challenge I encountered on some website.

The client directory has two files

* `followermaze.sh`, an executable bash script
* `FollowerMaze-assembly-2.0.jar`, a JAR file to be executed on a JDK 7 JVM

## The Challenge

The challenge proposed here is to build a system which acts as a socket
server, reading events from an _event source_ and forwarding them when
appropriate to _user clients_.

Clients will connect through TCP and use the simple protocol described in a
section below. There will be two types of clients connecting to your server:

* **One** _event source_: It will send you a
  stream of events which may or may not require clients to be notified
* **Many** _user clients_: Each one representing a specific user,
  these wait for notifications for events which would be relevant to the
  user they represent

### The Protocol

The protocol used by the clients is string-based (i.e. a `CRLF` control
character terminates each message). All strings are encoded in `UTF-8`.

The _event source_ **connects on port 9090** and will start sending
events as soon as the connection is accepted.

The many _user clients_ will **connect on port 9099**. As soon
as the connection is accepted, they will send to the server the ID of
the represented user, so that the server knows which events to
inform them of. For example, once connected a _user client_ may send down:
`2932\n`, indicating that they are representing user 2932.

After the identification is sent, the _user client_ starts waiting for
events to be sent to them. Events coming from _event source_ should be
sent to relevant _user clients_ exactly like read, no modification is
required or allowed.

There are five possible events. The table below describe payloads
sent by the _event source_ and what they represent:

| Payload        | Sequence # | Type          | From User Id | To User Id |
| -------------- | ---------- | ------------- | ------------ | ---------- |
| 666\|F\|60\|50 | 666        | Follow        | 60           | 50         |
| 1\|U\|12\|9    | 1          | Unfollow      | 12           | 9          |
| 542532\|B      | 542532     | Broadcast     | -            | -          |
| 43\|P\|32\|56  | 43         | Private Msg   | 32           | 56         |
| 634\|S\|32     | 634        | Status Update | 32           | -          |

Using the verification program supplied, you will receive exactly 10000000 events,
with sequence number from 1 to 10000000. **The events will arrive out of order**.

_Note: **The server to handle an arbitrarily large event stream**
(i.e. you would not be able to keep all events in memory or any other storage)_

Events may generate notifications for _user clients_. **If there is a
_user client_ ** connected for them, these are the users to be
informed for different event types:

* **Follow**: Only the `To User Id` should be notified
* **Unfollow**: No clients should be notified
* **Broadcast**: All connected _user clients_ should be notified
* **Private Message**: Only the `To User Id` should be notified
* **Status Update**: All current followers of the `From User ID` should be notified

If there are no _user client_ connected for a user, any notifications
for them must be silently ignored. _user clients_ expect to be notified of
events **in the correct order**, regardless of the order in which the
_event source_ sent them.

### The Configuration

During development, it is possible to modify the test program behavior using the
following environment variables:

1.  **logLevel** - Default: info

    Modify to "debug" to print debug messages.

2.  **eventListenerPort** - Default: 9090

    The port used by the event source.

3.  **clientListenerPort** - Default: 9099

    The port used to register clients.

4.  **totalEvents** - Default: 10000000

    Number of messages to send.

5.  **concurrencyLevel** - Default: 100

    Number of conected users.

6.  **numberOfUsers** Default: concurrencyLevel \* 10

    Total number of users (connected or not)

7.  **randomSeed** - Default: 666

    The seed to generate random values

8.  **timeout** - Default: 20000

    Timeout in milliseconds for clients while waiting for new messages

9.  **maxEventSourceBatchSize** - Default: 100

    The event source flushes messages in batches of random sizes up to `maxEventSourceBatchSize` and randomizes the order of
    the messages in each batch. For example, if this configuration is "1" the event source
    will send only ordered messages flushing the connection for each message.

10. **logInterval** - Default: 1000

The interval in milliseconds used to log the sent messages counter.

### Solution

The source code should be a fully functional server for the
proposed challenge **using the default configurations**. You still might want
to stress-test your code with different configuration parameters to make sure
it is not too tailored to our test-suite, and is generic enough.

To run the clients, first make sure you have the server you wrote
running and listening to ports 9090 and 9099, then run:

```
$ ./followermaze.sh
```

This will start the clients, which will immediately start sending
message to your server. You know it finished without errors when it
outputs:

```
 [INFO] ==================================
 [INFO] \o/ ALL NOTIFICATIONS RECEIVED \o/
 [INFO] ==================================
```
