const regex = /\b(?:0?[1-9]|[12][0-9]|3[01])(?:[-/](?:0?[1-9]|1[012])[-/](?:20\d\d|\d\d)|(?:st|nd|rd|th)?\s+(?:Jan|Feb|Mar|Apr|May|Jun|Jul|Aug|Sep|Oct|Nov|Dec)[a-z]*(?:\s+(?:20\d\d|\d\d))?)\b/gi;
console.log("01 Aug".match(regex));
console.log("1 Sep 26".match(regex));
console.log("31-08-2026".match(regex));
console.log("12/05/26".match(regex));
