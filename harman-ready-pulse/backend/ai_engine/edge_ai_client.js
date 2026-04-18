// backend/ai_engine/edge_ai_client.js

async function queryEdgeAI(promptText) {
    // Timeout after 5 seconds to keep the backend responsive
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 5000);

    try {
        const response = await fetch('http://localhost:11434/api/generate', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                model: 'phi3', 
                prompt: promptText,
                stream: false,
                options: {
                    num_predict: 80,      // Tightened for TTS speed
                    temperature: 0.0,     // 0.0 for absolute consistency
                    stop: ["\n", "Summary:", "Messages:"]
                }
            }),
            signal: controller.signal
        });

        clearTimeout(timeoutId);
        const data = await response.json();
        return data.response.trim();
        
    } catch (error) {
        console.error("[AI Engine] Edge AI Unreachable. Falling back to passthrough.");
        return "ERROR_AI_OFFLINE";
    }
}

module.exports = { queryEdgeAI };