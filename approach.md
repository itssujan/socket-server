# Socket Server

Tech Stack :

NodeJS has been used to develop the application. The net module of Node has been used mostly for the TCP connections.

### Docker

Docker is used to run all the services in separate containers. Docker really helps developers to build,
run and ship micro services with ease

`docker-compose up --build ` is used to start all the services.

## Architecture

The solution has been implemented using a micro service architecture. Currently it has 2 services
and a queue running in parallel each performing individual duties as mentioned in detail below.


## Components

1. Message Listener service
2. Message Processor service
3. RabbitMQ


### Message Listener service

This service is responsible for listening to all the events from the client.

As soon as the service starts, it creates a connection with the RabbitMQ and creates a queue if not already available.
The service then checks each incoming message and splits into individual events by ensuring the message is a complete message
i.e. ends with control character.
Finally, it puts each message into the queue as it gets and that ends its responsibility.

### RabbitMQ

RabbitMQ is used as a queue service which gets its messages from Message listener service and is then transferred to
the message Processor service.

### Message Processor service

This service is responsible for

  a. Listening to the client and registering each user connections and sending it the respective events.
  b. Listen to the RabbitMQ queue

As soon as the service receives the messages, it puts the message into the priority queue (details mentioned below). Then each event
which we receive in sequence is taken and rules applied on them.
Also the service takes the responsibility of listening to the clients and storing the client and their connection details in memory.

This service finally sends appropriate events to the respective users using the connection information stored.

*To be honest I felt, this service takes lot of responsibility and could be split into two proper services if required.
But need to properly evaluate to ensure that its not an overkill.*

Priority Queue :

A special priority queue is implemented in this service which has a priority system with 1 having the
highest priority and so on. One unique character of this priority queue is that it only pops out the next priority message or null.

For ex : if the queue has [1,2,4,5] it pops 1,2 and waits until 3 is pushed into the queue and keeps returning
null until then when ever a pop/dequeue function is called on it.

#### Challenges

The major challenge for this application is scaling it. It now takes considerable time to process 10M events
since NodeJS is a single threaded application. We could use various scaling strategies like horizontal scaling, sticky sessions, load balancers etc
to scale the application and increase the processing speed of the application on the whole.

##### Todo
Need to add proper tests to ensure the code is always has good coverage and all basic cases are tested automatically.
