let aiSession;
let isProcessing = false;

chrome.runtime.onInstalled.addListener(() => {
    console.log('Extension installed');
});

chrome.tabs.onUpdated.addListener((tabId, changeInfo, tab) => {
    if (changeInfo.status === 'complete' && tab.active) {
        const scanPage = async () => {
            if (isProcessing) return; // Skip if a request is already being processed
            isProcessing = true;

            chrome.scripting.executeScript({
                target: { tabId: tabId },
                func: () => {
                    const htmlContent = document.documentElement.outerHTML;
                    const parser = new DOMParser();
                    const doc = parser.parseFromString(htmlContent, 'text/html');
                    // Remove script and style elements
                    doc.querySelectorAll('script, style').forEach(el => el.remove());
                    let textContent = doc.body.innerText.trim(); // Return only the text content
                    textContent = textContent.replace(/\s\s+/g, ' '); // Replace multiple spaces with a single space
                    textContent = textContent.replace(/^\s*[\r\n]/gm, ''); // Remove empty lines
                    textContent = textContent.replace(/\n/g, ' '); // Replace new lines with spaces
                    return textContent;
                }
            }, async (results) => {
                try {
                    if (results && results[0] && results[0].result) {
                        const textContent = results[0].result;
                        if (textContent) {
                            if (!aiSession || aiSession.tokensLeft < 1000) { // Check if session exists and has enough tokens
                                if (aiSession) {
                                    await aiSession.destroy(); // Terminate the existing session
                                }
                                aiSession = await ai.languageModel.create({
                                    systemPrompt: `You will receive plain text extracted from a webpage. Try to extract user tasks from the text, provide meaningful descriptions, and prioritize them.`
                                });
                            }
                            const result = await aiSession.prompt(textContent);
                            console.log(result);
                        } else {
                            console.log('Empty site, skipping...');
                        }
                    }
                } catch (error) {
                    console.error('Error during HTML content processing:', error);
                } finally {
                    isProcessing = false; // Reset the flag after processing
                }
            });
        };

        // Run the scan repeatedly
        setInterval(scanPage, 5000); // Adjust the interval as needed
    }
});