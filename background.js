chrome.runtime.onInstalled.addListener(() => {
    console.log('Extension installed');
    (async () => {
        const { available, defaultTemperature, defaultTopK, maxTopK } = await ai.languageModel.capabilities();

        if (available !== "no") {
            const session = await ai.languageModel.create({
                systemPrompt: "Scan every website for tasks for the user, sort them by priority, and summarize them. Other website content should also be summarized but not marked as tasks."
            });

            const result = await session.prompt('Do you like nuts?');
            console.log(result);
        }
    })();
});