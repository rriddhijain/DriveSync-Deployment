// benchmark.js
const { performance } = require('perf_hooks');

// Import backend modules dynamically
const preferences = require('./harman-ready-pulse/backend/state/preferences');
const queue = require('./harman-ready-pulse/backend/state/queue');
const { classifyMessageIntent } = require('./harman-ready-pulse/backend/ai_engine/prompts');
const { queryEdgeAI } = require('./harman-ready-pulse/backend/ai_engine/edge_ai_client');

async function runBenchmarks() {
    console.log("=========================================");
    console.log("       DRIVESYNC BENCHMARK SUITE         ");
    console.log("=========================================\n");

    // 1. Memory Usage Baseline
    const memBaseline = process.memoryUsage();
    console.log(`[Memory] Baseline Heap Used: ${(memBaseline.heapUsed / 1024 / 1024).toFixed(2)} MB`);
    console.log(`[Memory] Baseline RSS: ${(memBaseline.rss / 1024 / 1024).toFixed(2)} MB\n`);

    // 2. Priority Calculation Latency (1,000 iterations)
    console.log("--- Benchmarking Priority Engine ---");
    const testMsg = { app: "WhatsApp", sender: "Mom", text: "Hello", timestamp: Date.now() };
    const t0 = performance.now();
    for (let i = 0; i < 1000; i++) {
        preferences.calculateAbsolutePriority(testMsg, "ROUTINE");
    }
    const t1 = performance.now();
    const avgPriorityTime = (t1 - t0) / 1000;
    console.log(`[Priority Engine] Average latency over 1,000 runs: ${avgPriorityTime.toFixed(4)} ms\n`);

    // 3. In-Memory Queue Push & Memory Overhead
    console.log("--- Benchmarking Message Queue ---");
    const q0 = performance.now();
    const numMessages = 10000;
    for (let i = 0; i < numMessages; i++) {
        queue.push({
            id: `msg-${i}`,
            app: "WhatsApp",
            sender: "User",
            text: `This is mock message number ${i}`,
            absolutePriority: 2,
            timestamp: Date.now()
        });
    }
    const q1 = performance.now();
    const memAfterQueue = process.memoryUsage();
    const pushTime = (q1 - q0) / numMessages;
    
    console.log(`[Queue] Queue Depth: ${queue.length} messages`);
    console.log(`[Queue] Average push latency: ${pushTime.toFixed(4)} ms`);
    console.log(`[Memory] Post-Queue Heap Used: ${(memAfterQueue.heapUsed / 1024 / 1024).toFixed(2)} MB`);
    console.log(`[Memory] Queue Memory Overhead: ${((memAfterQueue.heapUsed - memBaseline.heapUsed) / 1024 / 1024).toFixed(2)} MB\n`);

    // Clean up queue
    queue.clear();

    // 4. Local AI (Phi-3) Inference Latency (if online)
    console.log("--- Benchmarking Edge AI (Ollama/Phi-3) ---");
    const aiStartTime = performance.now();
    const response = await queryEdgeAI('Hello');
    const aiEndTime = performance.now();
    
    if (response === "ERROR_AI_OFFLINE") {
        console.log("[AI Engine] Ollama is unreachable. Skipping live model latency test.\n");
    } else {
        const aiLatency = aiEndTime - aiStartTime;
        console.log(`[AI Engine] Ollama/Phi-3 response latency: ${aiLatency.toFixed(2)} ms`);
        console.log(`[AI Engine] Ollama reply: "${response}"\n`);
    }

    // 5. Fallback Classifier Latency
    console.log("--- Benchmarking Fallback Classifier ---");
    const emergencyText = "Help, accident occurred, call an ambulance!";
    const f0 = performance.now();
    const intentResult = await classifyMessageIntent(emergencyText);
    const f1 = performance.now();
    console.log(`[Fallback] Classified intent: "${intentResult}"`);
    console.log(`[Fallback] Classifier execution time: ${(f1 - f0).toFixed(4)} ms\n`);

    console.log("=========================================");
    console.log("           BENCHMARK COMPLETE            ");
    console.log("=========================================");
}

runBenchmarks().catch(err => console.error("Benchmark failed:", err));
