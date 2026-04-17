import { socket } from "../../socket";

export default function NetworkToggle() {
  return (
    <div>
      <button
        onClick={() => socket.emit("toggle_network", "5G")}
        className="bg-green-500 p-2 mr-2"
      >
        5G
      </button>
      <button
        onClick={() => socket.emit("toggle_network", "DEAD_ZONE")}
        className="bg-red-500 p-2"
      >
        Dead Zone
      </button>
    </div>
  );
}