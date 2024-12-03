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
                files: ['contentScript.js']
            }, async (results) => {
                try {
                    if (results && results[0] && results[0].result) {
                        const elementsTextContent = results[0].result;
                        chrome.storage.sync.get(['tags', 'action'], async (result) => {
                            const { tags, action } = result;
                            if (tags && action) {
                                if (!aiSession || aiSession.tokensLeft < 1000) { // Check if session exists and has enough tokens
                                    if (aiSession) {
                                        await aiSession.destroy(); // Terminate the existing session
                                    }
                                    aiSession = await ai.languageModel.create({
                                        systemPrompt: `You will receive plain text extracted from a webpage. Check if the content contains any forbidden tags and provide a summary.`
                                    });
                                }
                                for (const textContent of elementsTextContent) {
                                    const promptText = `Might this content contain text about ${tags.join(", ")}: ${textContent}?`;
                                    const aiResult = await aiSession.prompt(promptText);
                                    if (aiResult.includes('yes')) {
                                        const elements = Array.from(document.querySelectorAll('p, h1, h2, h3, h4, h5, h6, li, a'));
                                        const el = elements[elementsTextContent.indexOf(textContent)];
                                        if (el) {
                                            if (action === 'blur') {
                                                el.style.filter = 'blur(5px)';
                                            } else if (action === 'remove') {
                                                el.remove();
                                            } else if (action === 'highlight') {
                                                el.classList.add('highlight');
                                            }
                                        }
                                    }
                                }
                            } else {
                                console.log('No tags or action specified.');
                            }
                        });
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