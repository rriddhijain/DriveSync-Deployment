// run_multiple.js
const { execSync } = require('child_process');

const metrics = {
    baselineHeap: [],
    baselineRss: [],
    priorityEngine: [],
    pushLatency: [],
    postHeap: [],
    queueOverhead: [],
    aiLatency: [],
    fallbackTime: []
};

console.log("Running benchmarks 6 times...");

// Ensure the local path is set so node executes correctly
const env = { ...process.env };

for (let i = 1; i <= 6; i++) {
    console.log(`Execution ${i}/6...`);
    const output = execSync('node benchmark.js', { env }).toString();
    
    // Parse baseline heap
    const heapMatch = output.match(/\[Memory\] Baseline Heap Used: ([\d.]+) MB/);
    if (heapMatch) metrics.baselineHeap.push(parseFloat(heapMatch[1]));

    // Parse baseline RSS
    const rssMatch = output.match(/\[Memory\] Baseline RSS: ([\d.]+) MB/);
    if (rssMatch) metrics.baselineRss.push(parseFloat(rssMatch[1]));

    // Parse priority engine latency
    const priorityMatch = output.match(/\[Priority Engine\] Average latency over 1,000 runs: ([\d.]+) ms/);
    if (priorityMatch) metrics.priorityEngine.push(parseFloat(priorityMatch[1]));

    // Parse push latency
    const pushMatch = output.match(/\[Queue\] Average push latency: ([\d.]+) ms/);
    if (pushMatch) metrics.pushLatency.push(parseFloat(pushMatch[1]));

    // Parse post heap
    const postHeapMatch = output.match(/\[Memory\] Post-Queue Heap Used: ([\d.]+) MB/);
    if (postHeapMatch) metrics.postHeap.push(parseFloat(postHeapMatch[1]));

    // Parse queue overhead
    const overheadMatch = output.match(/\[Memory\] Queue Memory Overhead: ([\d.]+) MB/);
    if (overheadMatch) metrics.queueOverhead.push(parseFloat(overheadMatch[1]));

    // Parse AI latency
    const aiMatch = output.match(/\[AI Engine\] Ollama\/Phi-3 response latency: ([\d.]+) ms/);
    if (aiMatch) metrics.aiLatency.push(parseFloat(aiMatch[1]));

    // Parse fallback time
    const fallbackMatch = output.match(/\[Fallback\] Classifier execution time: ([\d.]+) ms/);
    if (fallbackMatch) metrics.fallbackTime.push(parseFloat(fallbackMatch[1]));
}

const mean = arr => arr.length ? (arr.reduce((a, b) => a + b, 0) / arr.length) : 0;

console.log("\n=========================================");
console.log("        AVERAGE BENCHMARK RESULTS        ");
console.log("=========================================\n");
console.log(`[Memory] Mean Baseline Heap Used: ${mean(metrics.baselineHeap).toFixed(2)} MB`);
console.log(`[Memory] Mean Baseline RSS: ${mean(metrics.baselineRss).toFixed(2)} MB`);
console.log(`[Priority Engine] Mean latency over 1,000 runs: ${mean(metrics.priorityEngine).toFixed(4)} ms`);
console.log(`[Queue] Mean push latency: ${mean(metrics.pushLatency).toFixed(4)} ms`);
console.log(`[Memory] Mean Post-Queue Heap Used: ${mean(metrics.postHeap).toFixed(2)} MB`);
console.log(`[Memory] Mean Queue Memory Overhead: ${mean(metrics.queueOverhead).toFixed(2)} MB`);
if (metrics.aiLatency.length) {
    console.log(`[AI Engine] Mean Ollama/Phi-3 response latency: ${mean(metrics.aiLatency).toFixed(2)} ms`);
}
console.log(`[Fallback] Mean Classifier execution time: ${mean(metrics.fallbackTime).toFixed(4)} ms`);
console.log("\n=========================================");
