(() => {
    const elements = Array.from(document.querySelectorAll('p, h1, h2, h3, h4, h5, h6, li, a'));
    const visibleElementsText = elements.map(el => {
        const htmlContent = el.outerHTML;
        const parser = new DOMParser();
        const doc = parser.parseFromString(htmlContent, 'text/html');
        doc.querySelectorAll('script, style').forEach(el => el.remove());
        let textContent = doc.body.innerText.trim();
        textContent = textContent.replace(/\s\s+/g, ' ');
        textContent = textContent.replace(/^\s*[\r\n]/gm, '');
        textContent = textContent.replace(/\n/g, ' ');
        return textContent;
    });
    return visibleElementsText;
})();