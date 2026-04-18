// backend/ai_engine/prompts.js
const { queryEdgeAI } = require('./edge_ai_client');

async function checkEmergencyIntent(messageText) {
    const prompt = `Task: Emergency Classification. 
Message: "${messageText}"
Is this life-threatening or time-critical? Answer ONLY TRUE or FALSE.
Answer:`;
    
    const response = await queryEdgeAI(prompt);
    
    if (response === "ERROR_AI_OFFLINE") return false; // Default to non-emergency for safety
    return response.toUpperCase().includes('TRUE'); 
}

async function summarizeQueue(queueArray) {
    if (queueArray.length === 0) return "No missed messages.";
    
    const rawText = queueArray.map(msg => `From ${msg.sender}: ${msg.text}`).join(' | ');
    
    // Explicitly forbidding special characters/markdown for TTS
    const prompt = `You are an automotive AI. Summarize the messages below into exactly ONE plain-text sentence. 
Rules: No bullet points. No bold text. No special characters like asterisks or hashtags. Use clear spoken English.

Messages: ${rawText}
Summary:`;
    
    const response = await queryEdgeAI(prompt);
    
    if (response === "ERROR_AI_OFFLINE") {
        return "Network signal restored. You have missed messages waiting in your inbox.";
    }

    // Stripping any remaining markdown just in case
    return response.replace(/[*#_\[\]]/g, ''); 
}

module.exports = { checkEmergencyIntent, summarizeQueue };