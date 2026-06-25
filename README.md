# DriveSync: Connected Vehicle HMI Notification Triage & Telemetry Link

A Human-Machine Interface (HMI) and telemetry simulation system for connected vehicles that prioritizes and queues notifications when passing through cellular dead zones.

---

## 2. Live Demo

*   **Live Application (Frontend)**: [https://drive-sync-deployment.vercel.app/](https://drive-sync-deployment.vercel.app/)
*   **GitHub Repository**: [https://github.com/rriddhijain/DriveSync-Deployment](https://github.com/rriddhijain/DriveSync-Deployment)
*   **System Walkthrough Video**: *[Link Placeholder]*

> **Demo Note**
>
> The deployed Vercel application demonstrates the complete notification workflow, including prioritization, routing, and summary generation.
>
> To ensure the application remains functional without a locally hosted LLM, DriveSync includes rule-based fallback classifiers and summarization logic. When Ollama is unavailable, these fallback components handle notification processing.
>
> When running the project locally with Ollama and the Phi-3 model installed, the application uses LLM-based intent classification and summarization in place of the fallback logic.

---

## 3. Project Origin

This project was developed collaboratively as part of the MAHE Mobility Challenge (AI Track), where our team won First Place.

The implementation involved extensive use of AI-assisted development tools to accelerate coding, refactoring, and debugging. Architectural decisions, system design, technology selection, feature integration, testing, and engineering trade-offs were made collaboratively by the team.

My primary contributions included:

* End-to-end system architecture and workflow design
* Geospatial telemetry integration using TurfJS
* Node.js backend routing and WebSocket synchronization
* Repository organization, documentation, and technical design

This repository is maintained to showcase the project, my individual contributions, and the engineering decisions behind the implementation. The original project was built collaboratively with the contributors listed below.

---

## 4. Overview

### The Problem
Connected vehicles continuously receive notifications, such as navigation updates, messages, and alerts. When a vehicle enters a low-connectivity area (cellular dead zone), WebSocket connections can drop, leading to failed deliveries or a sudden flood of delayed notifications once connectivity is restored. This sudden influx of messages can distract the driver.

### Why It Matters
In-vehicle displays should minimize driver distraction. While non-essential alerts (e.g., chat messages, promotional notifications) can be delayed, critical alerts (e.g., collision warnings) must be delivered immediately regardless of connection state.

### The Solution
DriveSync simulates an in-vehicle triage system. It queues low-priority alerts during dead zones, allows high-priority messages to bypass the queue, and aggregates deferred notifications into a single summary card once the vehicle re-enters network coverage, utilizing a local language model (Phi-3) to classify incoming message intents.

---

## 5. Key Features

*   **Notification Prioritization Logic**: Evaluates incoming alerts based on the application category, user-defined VIP contacts, and active time windows.
*   **Signal Stability Hysteresis**: Employs a dual-threshold hysteresis algorithm (fails at `< 0.6` signal strength, recovers at `> 0.8` signal strength with a 3-second hold) to prevent rapid connection state toggling at dead zone boundaries.
*   **Vehicle Telemetry Simulator**: Updates simulated vehicle coordinates on a timer, checking whether they lie inside cellular dead zones using TurfJS polygon intersection checks.
*   **Offline Message Grouping**: Aggregates deferred notifications into a single summary card upon network recovery, while using a local Phi-3 LLM via Ollama to classify incoming message intents.
*   **Interactive Control Dashboard**: Allows manual injection of mock notifications (emergency alerts, spam, custom messages), queue flushing, and network provider toggling.
*   **Settings Synchronization**: Keeps user notification preferences in sync between the React client and Node.js backend using WebSockets.

---

## 6. My Contributions

*   **End-to-End Architecture**: Architected an event-driven data pipeline and HMI state synchronization model, designing the routing logic between a React frontend and Node.js microservices for asynchronous telemetry updates.
*   **Geospatial Telemetry Engine**: Engineered a real-time telemetry simulation coordinating 15 concurrent vehicle threads, integrating TurfJS for high-performance polygon intersection checks against complex geographical dead zones.
*   **Full-Stack Integration**: Integrated Socket.io WebSockets to bridge the frontend visualization map with backend priority scoring and FIFO queues, ensuring sub-100ms state updates under variable network conditions.
*   **Product Research & Domain Modeling**: Modeled HMI distraction metrics to develop a dual-threshold signal hysteresis algorithm, resolving high cognitive load scenarios during intermittent network connectivity.

---

## 7. System Architecture

```mermaid
flowchart TD
    subgraph Vehicle HMI Client (React)
        A[In-Vehicle GPS/Sensors] -->|Position Coordinates| B[Signal Strength Interpolator]
        B -->|Signal strength < 0.6| C{Hysteresis Filter}
        B -->|Signal strength >= 0.8| C
        C -->|Fast Fail / Slow Recover| D[Stable Connection State]
        D -->|Transition Event| E[Socket.io client]
    end

    subgraph Telemetry & Triage Server (Node.js)
        E -->|State Change| F[Socket.io Namespace]
        G[Incoming Message] --> H[Triage Protocol]
        H -->|1. AI Intent Classification| I{Edge AI Classifier / Phi3}
        I -->|EMERGENCY/SPAM/ROUTINE| J{Priority Engine}
        J -->|2. VIP / Time Overrides| K[Priority Score]
        
        F -->|Current Network State| L{Routing Decider}
        K -->|Priority Score| L
        
        L -->|5G OR Priority <= 1| M[Deliver Instantly to Screen]
        L -->|DEAD ZONE & Priority > 1| N[Store in FIFO Queue]
        
        D -->|Transition to 5G| O[Auto-Flush Queue]
        O -->|Format Queue Summary| P[Summary Card Builder]
        P -->|Deliver to Screen| M
    end
    
    subgraph Fleet Analytics Map (Leaflet)
        Q[15 simulated vehicles] -->|Live Coordinates| R[TurfJS Deadzone Check]
        R -->|Heat Points| S[Unified Heatmap Layer]
    end
```
### Stage Explanations
1.  **Coordinate Simulation**: The backend updates the position of simulated vehicles. The HMI determines local signal strength by calculating the inverse-distance-weighted (IDW) average of the closest points on the heatmap.
2.  **Hysteresis Filtering**: The calculated signal strength passes through a filter. If the signal drops below 0.6, the state changes to `DEAD_ZONE`. It only changes back to `5G` when the signal exceeds 0.8 and remains there for 3 seconds.
3.  **State Synchronization**: Changes in connection state are emitted via Socket.io to the server to update the global network state.
4.  **Intent Classification**: Incoming mock messages are classified using a local model into `EMERGENCY`, `SPAM`, `OOO`, or `ROUTINE`.
5.  **Priority Scoring**: The preferences manager calculates a priority score (0 to 999) based on application type, active time windows, and VIP contact overrides.
6.  **Message Routing**: If the state is `5G` or the priority score is high (0 or 1), the message is delivered immediately. Otherwise, it is appended to the FIFO queue.
7.  **Summarization on Recovery**: Upon transitioning back to `5G`, the server aggregates the queued messages into a single summary card, broadcasts it to the client, and clears the queue.

---

## 8. Tech Stack

*   **Frontend**: React (SPA), Leaflet (Mapping), TurfJS (GeoJSON intersection), Tailwind CSS, Framer Motion
*   **Backend**: Node.js, Express, Socket.io
*   **AI/ML**: Ollama API, Phi-3 (3.8B parameter lightweight LLM)
*   **Testing**: Jest (Unit Testing), CommonJS/ESM VM sandbox bridge
*   **Infrastructure**: Python 3.14 venv, `nodeenv` (isolated local Node runtime)

---

## 9. Project Structure

```
├── harman-ready-pulse/
│   ├── backend/
│   │   ├── ai_engine/          # Edge AI client & prompt templates
│   │   │   ├── edge_ai_client.js
│   │   │   └── prompts.js
│   │   ├── data/               # GeoJSON dead zones & simulation route datasets
│   │   │   ├── deadzones.json
│   │   │   └── simulation_route.json
│   │   ├── state/              # Core business logic
│   │   │   ├── queue.js        # FIFO Message queue & stats tracker
│   │   │   ├── preferences.js  # Triage prioritization manager
│   │   │   ├── queue.test.js   # Jest unit tests
│   │   │   ├── preferences.test.js
│   │   │   └── signal.test.js
│   │   ├── server.js           # Express and Socket.io bootstrap
│   │   ├── socketEvents.js     # WebSocket handlers & input sanitization
│   │   └── fleetSimulator.js   # Telemetry simulation and TurfJS caching
│   │
│   └── frontend/
│       ├── src/
│       │   ├── components/     # UI components (navigation, dashboard cards)
│       │   ├── hooks/          # Hysteresis and network stability hooks
│       │   ├── utils/          # Haversine distance & signal IDW interpolation
│       │   ├── socket.js       # socket client
│       │   └── main.jsx
│       └── vercel.json         # SPA client-side routing config
```

---

## 10. How It Works

1.  **Input Payload**: A JSON message payload is generated from the control dashboard or client actions.
2.  **Validation**: The payload is validated at the WebSocket boundary (types are checked, strings trimmed, and a UUID is generated).
3.  **Intent Classification**: The text is sent to the local LLM. If the text indicates an emergency, it is classified as `EMERGENCY`. Other categories include `SPAM`, `OOO`, or `ROUTINE`.
4.  **Priority Scoring**:
    *   `EMERGENCY` = Priority `0` (Bypasses all queues).
    *   `SPAM` / `OOO` = Priority `999` (Muted).
    *   System apps (e.g., Navigation, Weather) = Priority `1`.
    *   Social/Work apps (e.g., Chat, Email) = Base Priority `2` (Muted to `999` outside active hours; upgraded to `1` if sent by a VIP contact).
5.  **Queueing**: During dead zone states, priority `0` and `1` messages are delivered immediately. Priority `2` messages are queued.
6.  **Recovery Summarization**: When connection transitions to `5G`, the queued messages are aggregated into a summary text block.
7.  **HMI Output**: The frontend displays the summary card and reads it aloud using the browser's native `SpeechSynthesis` API.

---

## 11. Engineering Decisions

### In-Memory Queue vs. Database Persistence
*   **Decision**: For this simulation, the message queue is maintained in-memory rather than persisted to a database (such as SQLite).
*   **Trade-off**: Since the application simulates a vehicle's transient state and does not require durable history across server restarts, an in-memory array avoids database setup and I/O overhead while keeping queue operations simple.

### Leaflet Heatmap Updates
*   **Decision**: Instead of destroying and recreating the Leaflet heatmap layer on every telemetry tick (every 1 second), the layer instance is stored in a React `useRef` and updated in-place using `.setLatLngs()`.
*   **Trade-off**: This avoids recreating DOM nodes and reduces browser layout thrashing during telemetry updates.

### Testing ES Modules in Jest
*   **Decision**: Rather than installing and configuring Babel or Webpack transpilers to run the tests, a testing bridge was written using Node's native `vm` module.
*   **Trade-off**: Jest defaults to CommonJS syntax, whereas some frontend files (like `signal.js`) are written as ES Modules. The script reads the ESM file as a string, replaces `export` statements with `module.exports` via regular expressions, and executes the code inside a sandboxed VM context. This keeps the test runner setup simple and free of build-tool dependencies.

---

## 12. Challenges

*   **Monorepo Path Coupling**: The backend simulator originally imported GeoJSON files directly from the frontend source directory. This tight coupling made it difficult to deploy the frontend and backend to separate hosting services. We resolved this by copying the required route datasets into the backend's directory structure.
*   **Preferences State Synchronization**: Navigating between pages in the React SPA originally reset user preference selections to client-side defaults, which would overwrite saved settings on the server. We resolved this by fetching the current preference state from the backend on connection and establishing WebSocket listeners to synchronize preferences bidirectionally when modifications occur.

---

## 13. Future Improvements

*   **Offline Local Storage**: Integrate an IndexedDB store on the client side so that if the HMI client crashes or refreshes, the active message log is retained.
*   **WebGPU or WebAssembly Inference**: Run the Phi-3 model directly in-browser using WebGPU/WASM to remove the local backend LLM dependency.
*   **Client Telemetry Throttling**: Implement a throttle/debounce mechanism for telemetry broadcasts to handle network toggling under highly fluctuating signal conditions.

---

## 14. Installation

Ensure you have Python 3.10+ and a package manager installed.

```bash
# Clone the repository
git clone https://github.com/rriddhijain/DriveSync-Deployment.git
cd DriveSync-Deployment

# Create and activate Python virtual environment
python3 -m venv venv
source venv/bin/activate

# Install nodeenv to manage Node locally inside the virtual environment
pip install nodeenv
nodeenv -p
```

---

## 15. Running Locally

```bash
# Install backend packages
cd harman-ready-pulse/backend
npm install

# Install frontend packages
cd ../frontend
npm install

# Run Jest test suite
cd ../backend
npm run test

# Run Backend
npm start

# Run Frontend (in a separate terminal)
cd harman-ready-pulse/frontend
npm run dev
```

---

## 16. Environment Variables

*   **`PORT`** (Backend): The port on which the Express and Socket.io server listens (Defaults to `3001`).
*   **`VITE_SOCKET_URL`** (Frontend): The URL of the backend socket server (e.g. `https://drivesync-backend.onrender.com` in production, defaults to `http://localhost:3001` in development).

---

## 17. License

Distributed under the MIT License. See `LICENSE` for more information.
