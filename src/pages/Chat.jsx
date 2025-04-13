import { useEffect, useRef, useState } from "react";
import { io } from "socket.io-client";

const socket = io(import.meta.env.VITE_API_BASE_URL); // Replace with your backend URL

const Chat = () => {
  const [users] = useState(["Alice", "Bob", "Charlie"]); // Replace with real users
  const [selectedUser, setSelectedUser] = useState("Alice");
  const [messages, setMessages] = useState([]);
  const [newMsg, setNewMsg] = useState("");
  const bottomRef = useRef(null);

  useEffect(() => {
    socket.on("receiveMessage", (msg) => {
      setMessages((prev) => [...prev, msg]);
    });

    return () => socket.off("receiveMessage");
  }, []);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  const sendMessage = (e) => {
    e.preventDefault();
    if (!newMsg.trim()) return;

    const msgData = {
      sender: "You",
      receiver: selectedUser,
      text: newMsg,
      timestamp: new Date(),
    };

    socket.emit("sendMessage", msgData);
    setMessages((prev) => [...prev, msgData]);
    setNewMsg("");
  };

  return (
    <div className="h-screen flex font-sans">
      {/* Sidebar */}
      <aside className="w-1/4 bg-gray-900 text-white flex flex-col">
        <header className="px-4 py-4 text-2xl font-bold border-b border-gray-700">
          Chatterly
        </header>
        <ul className="flex-1 overflow-y-auto px-2 py-2">
          {users.map((user, idx) => (
            <li
              key={idx}
              onClick={() => setSelectedUser(user)}
              className={`flex items-center p-3 mb-2 rounded-lg cursor-pointer transition ${
                selectedUser === user
                  ? "bg-blue-600"
                  : "hover:bg-gray-800"
              }`}
            >
              <div className="w-10 h-10 rounded-full bg-gray-600 flex items-center justify-center text-white mr-3">
                {user[0]}
              </div>
              <span className="font-medium">{user}</span>
            </li>
          ))}
        </ul>
      </aside>

      {/* Chat Window */}
      <main className="flex-1 flex flex-col bg-gray-100">
        {/* Header */}
        <header className="bg-white shadow px-6 py-4 flex items-center justify-between">
          <div>
            <h3 className="text-lg text-black font-semibold">{selectedUser}</h3>
            <p className="text-sm text-gray-500">Online</p>
          </div>
        </header>

        {/* Messages */}
        <section className="flex-1 p-4 overflow-y-auto space-y-3">
          {messages.map((msg, idx) => (
            <div
              key={idx}
              className={`max-w-[75%] p-3 rounded-xl text-sm shadow ${
                msg.sender === "You"
                  ? "ml-auto bg-blue-500 text-white"
                  : "bg-white text-gray-800"
              }`}
            >
              <p>{msg.text}</p>
              <div className="text-[10px] mt-1 opacity-70 text-right">
                {new Date(msg.timestamp).toLocaleTimeString()}
              </div>
            </div>
          ))}
          <div ref={bottomRef}></div>
        </section>

        {/* Input */}
        <form
          onSubmit={sendMessage}
          className="bg-white text-black border-t px-4 py-3 flex gap-2"
        >
          <input
            type="text"
            placeholder="Type your message..."
            className="flex-1 px-4 py-2 border border-gray-300 rounded-full focus:outline-none focus:ring-2 focus:ring-blue-400"
            value={newMsg}
            onChange={(e) => setNewMsg(e.target.value)}
          />
          <button
            type="submit"
            className="bg-blue-600 text-white px-6 py-2 rounded-full hover:bg-blue-700"
          >
            Send
          </button>
        </form>
      </main>
    </div>
  );
};

export default Chat;
