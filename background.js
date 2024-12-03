chrome.runtime.onInstalled.addListener(() => {
    console.log('Extension installed');
    (async () => {
        const { available, defaultTemperature, defaultTopK, maxTopK } = await ai.languageModel.capabilities();

        if (available !== "no") {
            const session = await ai.languageModel.create();

            // Prompt the model and wait for the whole result to come back.  
            const result = await session.prompt("Write me a poem");
            console.log(result);
        }
    })();
});