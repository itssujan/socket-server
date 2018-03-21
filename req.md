The client directory has two files

* `followermaze.sh`, an executable bash script
* `FollowerMaze-assembly-2.0.jar`, a JAR file to be executed on a JDK 7 JVM

If you haven't received any of these, or if you think there are any
problems with the files, please contact us immediately and
we will re-send you the missing pieces.

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

### The Events

### Sample : 253167|F|299|125\n253218|S|988\n253173|S|184\n253160|F|574|839\n253213|S|887\n253151|F|751|657\n253155|S|979\n253231|P|752|473\n253210|F|206|893\n253187|U|12|290\n253179|U|93|1\n253177|F|210|411\n253220|S|30\n253202|S|136\n253172|S|297\n253236|U|210|411\n253203|S|30\n253161|S|336\n253217|S|873\n253216|S|5\n253189|S|668\n253154|S|170\n253219|U|783|787\n253240|P|591|276\n253212|S|631\n253230|F|790|292\n253164|S|594\n253193|S|478\n253157|S|170\n253147|S|695\n253242|S|213\n253182|S|412\n253204|S|187\n253192|S|1000\n253165|S|819\n253181|S|62\n253169|S|818\n253201|P|10|524\n253199|U|890|802\n253180|F|838|264\n253221|F|592|17\n253163|P|180|62\n253146|F|722|675\n253226|S|804\n253232|F|774|956\n253209|S|825\n253215|S|235\n253234|S|73\n253184|P|486|11\n253152|U|185|913\n253243|S|603\n253205|S|239\n253211|P|326|133\n253206|U|621|332\n253176|S|212\n253188|S|119\n253214|S|413\n253171|S|77\n253194|S|207\n253156|P|162|416\n253191|S|2\n253233|P|240|669\n253170|F|890|802\n253225|F|767|141\n253207|S|26\n253162|S|655\n253183|S|687\n253168|S|324\n253150|S|939\n253159|S|530\n253241|U|751|657\n253166|S|315\n253174|U|299|125\n253200|S|977\n253186|U|574|839\n253178|U|193|45\n253235|S|652\n253229|F|816|317\n253196|P|274|363\n253195|S|696\n253238|P|625|155\n253237|U|838|264\n253149|P|271|25\n253198|S|192\n253175|S|128\n253224|S|177\n253190|F|808|178\n253227|S|650\n253153|S|243\n253239|S|511\n"

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

_Note: **We expect your server to handle an arbitrarily large event stream**
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

### Your Solution

We expect you to send us the source code of a fully functional server for the
proposed challenge **using the default configurations**. You still might want
to stress-test your code with different configuration parameters to make sure
it is not too tailored to our test-suite, and is generic enough.

Your code should build and run on a Mac or GNU/Linux machine running a
recent OS release.

_As a **non-exhaustive** example, we have received successful applications
developed on: Node.js, Ruby, JRuby, Haskell, Clojure, Scala, Go, Python,
Java, and C/C++._

If your language does not provide what you need in its standard library,
you may use 3rd party libraries. Our goal is to review your work and understand
your design choices, so please include a description of the 3rd party libraries
used in your solution and a short rationale explaining your choices.

### Before submitting your code

With this document you received a jar file and a shell script. These
contain one possible implementation of the _event source_ and _user
client_ described previously.

**IMPORTANT**: we have anonymised code reviews so please ensure you omit any
personal details from your challenge response which note your gender, age,
ethnicity, etc.

**We expect you to make sure that your solution works with the
supplied clients before sending it to us**. The first thing we will do
with your code is to run it agains these clients, so you can have very
early feedback by treating it as a test suite.

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

### Assesment Criteria

We expect you to write **code you would consider production-ready**.
This means we want your code to be well-factored, without needless
duplication, follow good practices and be automatically verified.

What we will look at:

* If your code fulfils the requirement, and runs against the
  supplied example server
* How clean is your design and implementation, how easy it is to
  understand and maintain your code
* How you verified your software, if by automated tests or some
  other way
* What kind of documentation you ship with your code
