// backend/ai_engine/prompts.js
const { queryEdgeAI } = require('./edge_ai_client');

function classifyLocalFallback(messageText) {
    if (!messageText) return "ROUTINE";
    const text = messageText.toLowerCase();

    // EMERGENCY: life-threatening, medical, accident, etc.
    const emergencyRegex = /\b(accident|ambulance|crash|hospital|heart attack|chest pain|stroke|fire|emergency|911|police|help me)\b/;
    if (emergencyRegex.test(text)) {
        return "EMERGENCY";
    }

    // OOO: out of office, vacation, autoreply
    const oooRegex = /\b(out of office|vacation|autoreply|auto-reply|annual leave)\b/;
    if (oooRegex.test(text)) {
        return "OOO";
    }

    // SPAM: promotions, marketing, discount, off, deal
    const spamRegex = /\b(discount|promo|code|deal|off|sale|win|winner|free|percent off|click here|subscribe|unsubscribe|opt-out|optout|free gift)\b/;
    if (spamRegex.test(text)) {
        return "SPAM";
    }

    return "ROUTINE";
}

async function classifyMessageIntent(messageText) {
    const prompt = `Task: Message Classification.
Message: "${messageText}"
Classify this text strictly into exactly ONE of these four strings based on meaning:
- EMERGENCY (Only for actual life-threatening accidents, severe health crises, or literal emergencies).
- OOO (Out of office, auto-replies).
- SPAM (Promotions, marketing, gibberish like 'IHIOUODBK').
- ROUTINE (Standard messages, normal conversations).

If the message is random letters or doesn't make sense, classify it as SPAM or ROUTINE, NOT EMERGENCY.
Output only the single classification string without punctuation or explanation.
Classification:`;
    
    const response = await queryEdgeAI(prompt);
    
    if (response === "ERROR_AI_OFFLINE") {
        console.log("[AI Engine] Local AI is offline. Using keyword-matching fallback classifier.");
        return classifyLocalFallback(messageText);
    }
    
    let intent = response.toUpperCase().trim().replace(/[^A-Z]/g, '');
    
    if (intent.includes('EMERGENCY')) intent = 'EMERGENCY';
    else if (intent.includes('OOO')) intent = 'OOO';
    else if (intent.includes('SPAM')) intent = 'SPAM';
    else intent = 'ROUTINE'; // Default fallback

    return intent; 
}

async function summarizeQueue(queueArray) {
    if (queueArray.length === 0) return "No missed messages.";

    // Group messages by app
    const appCounts = {};
    const whatsappSenders = new Set();
    let whatsappCount = 0;

    queueArray.forEach(m => {
        const app = m.app ? m.app.toLowerCase() : 'system';
        
        if (app.includes('whatsapp')) {
            whatsappCount++;
            if (m.sender) {
                whatsappSenders.add(m.sender);
            }
        } else {
            appCounts[app] = (appCounts[app] || 0) + 1;
        }
    });

    let parts = [];

    if (whatsappCount > 0) {
        const sendersList = Array.from(whatsappSenders).join(" and ");
        parts.push(`${whatsappCount} WhatsApp message${whatsappCount > 1 ? 's' : ''} from ${sendersList}`);
    }

    for (const [app, count] of Object.entries(appCounts)) {
        const capitalizedApp = app.charAt(0).toUpperCase() + app.slice(1);
        parts.push(`${count} notification${count > 1 ? 's' : ''} from ${capitalizedApp}`);
    }

    let summaryText = "";
    if (parts.length === 1) {
        summaryText = `You missed ${parts[0]}.`;
    } else if (parts.length > 1) {
        const lastPart = parts.pop();
        summaryText = `You missed ${parts.join(", ")} and got ${lastPart}.`;
    }

    return summaryText;
}

module.exports = { classifyMessageIntent, summarizeQueue };