import React, { useState, useEffect } from "react";
import qs from "query-string";
import io from "socket.io-client";
import "./index.css";
import InfoBar from "./../InfoBar/InfoBar";
import Input from "./../Input/Input";
import Messages from "./../Messages/Messages";

let socket;

const Chat = ({ location }) => {
  const [name, setName] = useState("");
  const [room, setRoom] = useState("");
  const [message, setMessage] = useState(""); // single message
  const [messages, setMessages] = useState([]); // store all message
  const ENTPOINT = "localhost:5000";

  useEffect(() => {
    const { name, room } = qs.parse(location.search);
    socket = io(ENTPOINT);

    setName(name);
    setRoom(room);
    socket.emit("join", { name, room }, (error) => {});
    return () => {
      socket.emit("disconnect");
      socket.off();
    };
  }, [ENTPOINT, location.search]);
  useEffect(() => {
    socket.on("message", (message) => {
      setMessages([...messages, message]);
    });
  }, [messages]);

  // function sending messages
  const sendMessage = (event) => {
    event.preventDefault();
    if (message) {
      socket.emit("sendMessage", message, () => setMessage(""));
    }
  };

  return (
    <div className="outerContainer">
      <div className="container">
        <InfoBar room={room} />
        <Messages messages={messages} name={name} />
        <Input message={message} setMessage={setMessage} sendMessage={sendMessage} />
      </div>
    </div>
  );
};

export default Chat;
