      const dateRegex = /\b(?:0?[1-9]|[12][0-9]|3[01])(?:[-/](?:0?[1-9]|1[012])[-/](?:20\d\d|\d\d)|(?:st|nd|rd|th)?\s+(?:Jan|Feb|Mar|Apr|May|Jun|Jul|Aug|Sep|Oct|Nov|Dec)[a-z]*(?:\s+(?:20\d\d|\d\d))?)\b/gi;
      const match = "Nominal_Roll_2026-09-06_260906140155.pdf".match(dateRegex);
      console.log(match);
