function sleep(ms) {
    return new Promise(resolve => setTimeout(resolve, ms));
}

async function timedCount() {
    postMessage('move');
    await sleep(2);
    timedCount();
}

timedCount();