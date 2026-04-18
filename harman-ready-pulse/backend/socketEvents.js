const { checkEmergencyIntent, summarizeQueue } = require('./ai_engine/prompts');
const queue = require('./state/queue'); // Adjust path if necessary

let currentNetwork = "5G"; 

module.exports = (io) => {
    io.on('connection', (socket) => {
        console.log(`📡 New Device Connected: ${socket.id}`);

        // Initial State Sync
        socket.emit('network_state_changed', currentNetwork);
        socket.emit('queue_updated', queue.length);

        socket.on('network_state_changed', (state) => {
            currentNetwork = state;
            io.emit('network_state_changed', state);
            console.log(`[NETWORK] State changed to ${state}`);
        });

        socket.on('inject_mock_message', async (msg) => {
            try {
                const isEmergency = await checkEmergencyIntent(msg.text);
                
                if (isEmergency || currentNetwork === "5G") {
                    if (isEmergency) {
                        io.emit('emergency_alert', { ...msg, is_emergency: true });
                        console.log("🚨 Emergency Alert Broadcasted");
                    } else {
                        io.emit('receive_live_message', msg);
                        console.log("📲 Live Message Broadcasted");
                    }
                } else {
                    // DEAD_ZONE and non-emergency -> Queue
                    queue.push(msg);
                    console.log(`📦 Message Queued. Current queue size: ${queue.length}`);
                    io.emit('queue_updated', queue.length);
                }
            } catch (err) {
                console.error("AI Triage Error:", err);
                io.emit('receive_live_message', msg);
            }
        });

        socket.on('clear_queue', async () => {
            const currentQueue = [...queue]; // Get messages from queue array
            if (currentQueue.length === 0) return;
            
            const summary = await summarizeQueue(currentQueue);
            
            io.emit('ai_summary_generated', { 
                text: summary, 
                count: currentQueue.length 
            });
            
            queue.length = 0; // Clear the array
            io.emit('queue_updated', 0);
        });

        socket.on('disconnect', () => {
            console.log(`🔌 Device Disconnected: ${socket.id}`);
        });
    });
};