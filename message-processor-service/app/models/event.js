class Event {
  constructor(sequence, type, rawEvent) {
    this.sequence = sequence;
    this.type = type;
    this.rawEvent = rawEvent + "\n";
  }

  setFromUserID(fromUserID) {
    this.fromUserID = fromUserID;
  }

  setToUserID(toUserID) {
    this.toUserID = toUserID;
  }

  setRawEvent(rawEvent) {
    this.rawEvent = rawEvent;
  }
}

module.exports = Event;
