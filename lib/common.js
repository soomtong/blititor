function destructMarkdown(markdownText) {
    var title = markdownText.toString().match(/^##[^#].+/m)[0].trim();
    var quote = markdownText.toString().match(/^>.+/m)[0].trim();
    var credit = markdownText.toString().match(/^###[^#].*redit(.|\n)*/igm)[0].trim().split('\n');
    console.log(credit.slice(1, 1));

    return {
        title: title.substring(title.indexOf('##') + 2).trim(),
        quote: quote.substring(quote.indexOf('>') + 1).trim(),
        credit: credit.slice(1).join('').trim()
    };
}

module.exports = {
    destructMarkdown: destructMarkdown
};