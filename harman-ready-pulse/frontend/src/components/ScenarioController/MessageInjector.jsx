import { useState } from "react";
import { socket } from "../../socket";

export default function MessageInjector() {
  const [text, setText] = useState("");

  const send = () => {
    socket.emit("inject_mock_message", {
      sender: "Tester",
      text,
    });
    setText("");
  };

  return (
    <div>
      <input
        value={text}
        onChange={(e) => setText(e.target.value)}
        className="border p-2"
      />
      <button onClick={send} className="bg-blue-500 p-2">
        Send
      </button>
    </div>
  );
}