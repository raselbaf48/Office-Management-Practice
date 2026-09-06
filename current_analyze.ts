  app.post('/api/import/analyze-duty-doc', async (req, res) => {
    try {
      const { fileBase64, files, mimeType, textSnippet, targetYear = 2026, targetFlight = 'Overall' } = req.body || {};

      const fileList: Array<{ base64: string; mime: string; name?: string }> = [];
      if (Array.isArray(files) && files.length > 0) {
        for (const f of files) {
          if (f.fileBase64 || f.base64) {
            fileList.push({
              base64: f.fileBase64 || f.base64,
              mime: f.mimeType || f.mime || 'application/pdf',
              name: f.fileName || f.name || 'Document',
            });
          }
        }
      } else if (fileBase64) {
        fileList.push({
          base64: fileBase64,
          mime: mimeType || 'application/pdf',
          name: 'Document',
        });
      }

      if (fileList.length === 0 && !textSnippet) {
        return res.status(400).json({ error: 'No file data or text provided for analysis' });
      }

      // Airmen reference roster
      const airmenRoster = db.airmen.map((a) => ({
        id: a.id,
        serNo: a.serNo,
        code: a.code,
        bdNo: a.bdNo,
        rank: a.rank,
        name: a.name,
        trade: a.trade,
        flight: a.flightName,
      }));

      const airmenContext = airmenRoster
        .map((a) => `- ID: "${a.id}" | ${a.rank} ${a.name} | BD/${a.bdNo} | ${a.flight} Flight | Trade: ${a.trade}`)
        .join('\n');

      const systemPrompt = `You are an expert military duty roster and parade state parser for Bangladesh Air Force (BAF) 155 UASU.
Your task is to accurately analyze the provided document (multi-page PDF / image tables / text) containing a daily duty roster or parade state matrix and extract ALL assigned duties for EVERY SINGLE DATE and airman across ALL pages without skipping or stopping early.

DATABASE PERSONNEL ROSTER (Reference for matching names/ranks):
${airmenContext}

STANDARD DUTY CODES:
- GD: Base Security Duty / Guard Duty
- BTF: Base Taskforce Duty
- NTF: Najirpara Taskforce Duty
- HALISHAHAR: Halishahar Taskforce Duty
- AIRFIELD_DUTY: Airfield Duty
- LEAVE: Leave / Casual Leave / Privilege Leave
- IDAC: IDA CENTER Duty (specify idaShift as 'Morning', 'Afternoon', or 'Night')
- DUTY_OFF: Duty Off / Rest Day (Skip from output)
- ON_PARADE: Available On Parade / Routine Duty (Skip from output)
- BAKE_N_BITE: Bake & Bite
- ESSN: Essential Task / ESSN
- CMH: Hospital / CMH / Medical Admission
- SICK_REPORT: Sick Report / S/Q / ED
- DRILL_CAT_C: Drill Cat C
- RECEPTION: Reception / KO
- TDY: Temporary Duty / Attachment / Detachment
- ADMIN_ORDER: Admin Order
- CLASS_TRG: Class / Training
- GAMES: Games / GH
- ABSENT: Absent / AWOL

CRITICAL MANDATORY MULTI-PAGE INSTRUCTIONS:
1. FULL DOCUMENT ITERATION ACROSS ALL PAGES:
   - The document may contain multiple pages (Page 1 to Page 20+). You MUST extract duties from EVERY SINGLE PAGE.
   - Iterate through EVERY SINGLE ROW in every table from the first date to the very last date.
   - DO NOT STOP AFTER THE FIRST PAGE OR FIRST ROW.
   - DO NOT SKIP ANY DATES OR PERSONNEL.
   - Output every valid date into the "dates" array.

2. COLUMN-BY-COLUMN DUTY MAPPING:
   For every date row, check ALL columns:
   - "Base Security Duty" / "Base Secutity Duty" -> dutyCode: "GD" (extract all numbered or listed airmen)
   - "Base Taskforce Duty" -> dutyCode: "BTF"
   - "Najirpara Taskforce Duty" -> dutyCode: "NTF"
   - "Airfield Duty" / "Airport" -> dutyCode: "AIRFIELD_DUTY"
   - "Halishahar Duty" -> dutyCode: "HALISHAHAR"
   - "Bake N Bite" -> dutyCode: "BAKE_N_BITE"
   - "Tdy" / "TDY" -> dutyCode: "TDY"
   - "Leave" -> dutyCode: "LEAVE"
   - "IDA CENTER Duty":
     * "Morning" sub-column -> dutyCode: "IDAC", idaShift: "Morning"
     * "Afternoon" sub-column -> dutyCode: "IDAC", idaShift: "Afternoon"
     * "Night" sub-column -> dutyCode: "IDAC", idaShift: "Night"

3. DATE FORMAT:
   - Target Year is ${targetYear}. Output format: YYYY-MM-DD (e.g. "${targetYear}-08-20").

4. EXCLUDE "Duty Off" and "On Parade" (do not output them).

Return ONLY valid JSON matching this structure:
{
  "documentTitle": "PARADE STATE : AIRMEN 155 UASU BAF",
  "detectedFlight": "Avionics",
  "dates": [
    {
      "date": "${targetYear}-08-20",
      "day": "Thursday",
      "assignments": [
        { "rawText": "Cpl Sajib", "dutyCode": "GD" },
        { "rawText": "LAC Rakib", "dutyCode": "GD" },
        { "rawText": "LAC Mahedi", "dutyCode": "NTF" },
        { "rawText": "Sgt Mustakim", "dutyCode": "AIRFIELD_DUTY" },
        { "rawText": "LAC Joy", "dutyCode": "IDAC", "idaShift": "Morning" },
        { "rawText": "Cpl Koraishi", "dutyCode": "IDAC", "idaShift": "Night" }
      ]
    }
  ]
}`;

      let totalPagesCount = 0;
      const extractedPagesList: Array<{ pageNumber: number; text: string; fileIndex: number }> = [];

      // Extract all pages from all supplied PDF files
      for (let fIdx = 0; fIdx < fileList.length; fIdx++) {
        const fileItem = fileList[fIdx];
        const cleanBase64 = fileItem.base64.replace(/^data:[^;]+;base64,/, '');
        const buffer = Buffer.from(cleanBase64, 'base64');

        if (buffer.slice(0, 5).toString().includes('%PDF')) {
          const pdfExtracted = await extractAllPagesFromPdf(buffer);
          totalPagesCount += pdfExtracted.totalPages;
          for (const p of pdfExtracted.pages) {
            extractedPagesList.push({
              pageNumber: p.pageNumber,
              text: p.text,
              fileIndex: fIdx,
            });
          }
        } else if (fileItem.name.toLowerCase().endsWith('.docx') || fileItem.name.toLowerCase().endsWith('.doc') || fileItem.mime.includes('word') || fileItem.mime.includes('officedocument')) {
          try {
            const mammoth = await import('mammoth');
            const result = await mammoth.extractRawText({ buffer });
            const docxText = (result.value || '').trim();
            totalPagesCount += 1;
            extractedPagesList.push({
              pageNumber: 1,
              text: docxText,
              fileIndex: fIdx,
            });
          } catch (mErr) {
            console.error('Mammoth docx parse error:', mErr);
            totalPagesCount += 1;
            extractedPagesList.push({
              pageNumber: 1,
              text: '',
              fileIndex: fIdx,
            });
          }
        } else {
          // Image or other document
          totalPagesCount += 1;
          extractedPagesList.push({
            pageNumber: 1,
            text: '',
            fileIndex: fIdx,
          });
        }
      }

      const combinedTextFromPages = extractedPagesList
        .filter((p) => p.text && p.text.trim())
        .map((p) => `--- [PAGE ${p.pageNumber} OF ${totalPagesCount}] ---\n${p.text}`)
        .join('\n\n');

      const allTextSnippet = [textSnippet || '', combinedTextFromPages].filter(Boolean).join('\n\n');

      let parsedDatesMap = new Map<string, { date: string; day: string; assignments: any[] }>();
      let detectedDocTitle = 'PARADE STATE / DUTY ROSTER';
      let detectedFlight: FlightName | 'Overall' = targetFlight;

      // AI Analysis with Gemini
      if (process.env.GEMINI_API_KEY) {
        const candidateModels = ['gemini-2.5-flash', 'gemini-2.0-flash', 'gemini-1.5-flash'];

        // If total pages <= 6: analyze all in one prompt
        // If total pages > 6: chunk into batches of 3-4 pages to guarantee complete coverage
        const pageBatches: Array<{ pageNumbers: number[]; textChunk: string; fileItems: typeof fileList }> = [];

        if (extractedPagesList.length <= 6) {
          pageBatches.push({
            pageNumbers: extractedPagesList.map((p) => p.pageNumber),
            textChunk: allTextSnippet,
            fileItems: fileList,
          });
        } else {
          const batchSize = 4;
          for (let i = 0; i < extractedPagesList.length; i += batchSize) {
            const chunk = extractedPagesList.slice(i, i + batchSize);
            const chunkText = chunk.map((p) => `--- [PAGE ${p.pageNumber} OF ${totalPagesCount}] ---\n${p.text}`).join('\n\n');
            pageBatches.push({
              pageNumbers: chunk.map((p) => p.pageNumber),
              textChunk: chunkText,
              fileItems: [], // Text chunk contains the exact page text
            });
          }
        }

        for (const batch of pageBatches) {
          for (const model of candidateModels) {
            try {
              const ai = getGeminiAI();
              const contents: any[] = [];

              if (batch.fileItems.length > 0 && batch.fileItems[0]?.base64) {
                const cleanBase64 = batch.fileItems[0].base64.replace(/^data:[^;]+;base64,/, '');
                contents.push({
                  inlineData: {
                    mimeType: batch.fileItems[0].mime || 'application/pdf',
                    data: cleanBase64,
                  },
                });
              }

              if (batch.textChunk) {
                contents.push({ text: `Document text transcription (Pages ${batch.pageNumbers.join(', ')}):\n${batch.textChunk}` });
              }

              contents.push({
                text: `CRITICAL INSTRUCTION:
Please analyze ALL pages in this batch (${batch.pageNumbers.join(', ')} of ${totalPagesCount} pages).
Extract EVERY SINGLE DATE ROW and all duty columns (GD, BTF, NTF, Airfield, Halishahar, Bake N Bite, TDY, Leave, IDAC Morning/Afternoon/Night) without stopping early.`,
              });

              const response = await ai.models.generateContent({
                model,
                contents: { parts: contents },
                config: {
                  systemInstruction: systemPrompt,
                  responseMimeType: 'application/json',
                  maxOutputTokens: 16384,
                },
              });

              const responseText = response.text || '';
              const cleanedJson = responseText.replace(/```json\s*|\s*```/g, '').trim();
              const parsed = JSON.parse(cleanedJson);

              if (parsed && Array.isArray(parsed.dates) && parsed.dates.length > 0) {
                if (parsed.documentTitle) detectedDocTitle = parsed.documentTitle;
                if (parsed.detectedFlight) detectedFlight = normalizeFlightName(parsed.detectedFlight);

                for (const dEntry of parsed.dates) {
                  if (!dEntry.date) continue;
                  if (!parsedDatesMap.has(dEntry.date)) {
                    parsedDatesMap.set(dEntry.date, {
                      date: dEntry.date,
                      day: dEntry.day || dEntry.dayName || '',
                      assignments: [],
                    });
                  }
                  const curEntry = parsedDatesMap.get(dEntry.date)!;
                  const rawAsns = Array.isArray(dEntry.assignments) ? dEntry.assignments : [];
                  for (const asn of rawAsns) {
                    const alreadyExists = curEntry.assignments.some(
                      (a) => a.rawText === asn.rawText && a.dutyCode === asn.dutyCode && (asn.dutyCode !== 'IDAC' || a.idaShift === asn.idaShift)
                    );
                    if (!alreadyExists) {
                      curEntry.assignments.push(asn);
                    }
                  }
                }
                break; // Batch succeeded
              }
            } catch (geminiErr: any) {
              // Try next candidate model
              console.log(`[Gemini Model Batch Note] Model ${model} failed for pages ${batch.pageNumbers.join(', ')}:`, geminiErr.message);
            }
          }
        }
      }

      // If AI did not extract enough dates or is unavailable, run multi-page heuristic parser across all pages
      if (parsedDatesMap.size === 0 && allTextSnippet.trim()) {
        const heuristicResult = parseRosterTextHeuristically(allTextSnippet, targetYear, targetFlight);
        if (heuristicResult && Array.isArray(heuristicResult.dates)) {
          detectedDocTitle = heuristicResult.documentTitle;
          detectedFlight = heuristicResult.detectedFlight;
          for (const dEntry of heuristicResult.dates) {
            parsedDatesMap.set(dEntry.date, dEntry);
          }
        }
      }

      if (parsedDatesMap.size === 0) {
        return res.status(400).json({
          error: 'No duty dates or personnel assignments could be recognized in the provided document or text. Please check the document format or paste table text directly in the Paste Text / OCR tab.',
        });
      }

      const allDatesList = Array.from(parsedDatesMap.values()).sort((a, b) => a.date.localeCompare(b.date));

      // Post-process, validate and enrich all assignments with local airmen database records
      let totalAssignmentsCount = 0;
      let matchedCount = 0;
      let unmatchedCount = 0;

      const enrichedDates = allDatesList.map((dateEntry) => {
        const rawAssignments = Array.isArray(dateEntry.assignments) ? dateEntry.assignments : [];
        const validAssignments = rawAssignments.filter(
          (asn: any) => asn && asn.dutyCode && asn.dutyCode !== 'ON_PARADE' && asn.dutyCode !== 'DUTY_OFF'
        );

        const enrichedAssignments = validAssignments.map((asn: any) => {
          totalAssignmentsCount++;

          let airman = db.airmen.find((a) => a.id === asn.matchedAirmanId);
          let confidence = asn.confidence || 0.8;

          if (!airman) {
            const match = findBestAirmanMatch(asn.rawText || asn.matchedAirmanName || '', detectedFlight);
            if (match.airman) {
              airman = match.airman;
              confidence = match.confidence;
            }
          }

          if (airman) {
            matchedCount++;
            return {
              rawText: asn.rawText || `${airman.rank} ${airman.name}`,
              dutyCode: asn.dutyCode as DutyCategoryCode,
              dutyName: asn.dutyName || DUTY_TYPES.find((d) => d.code === asn.dutyCode)?.name || asn.dutyCode,
              idaShift: (asn.idaShift || null) as IDAShift | null,
              matchedAirmanId: airman.id,
              matchedAirmanName: airman.name,
              matchedAirmanRank: airman.rank,
              matchedAirmanTrade: airman.trade,
              matchedAirmanFlight: airman.flightName,
              matchedAirmanBdNo: airman.bdNo,
              confidence,
              isIgnored: false,
            };
          } else {
            unmatchedCount++;
            return {
              rawText: asn.rawText || 'Unknown Airman',
              dutyCode: asn.dutyCode as DutyCategoryCode,
              dutyName: asn.dutyName || asn.dutyCode,
              idaShift: (asn.idaShift || null) as IDAShift | null,
              matchedAirmanId: null,
              matchedAirmanName: asn.rawText,
              confidence: 0,
              isIgnored: false,
            };
          }
        });

        return {
          date: dateEntry.date,
          dayName: dateEntry.day || (dateEntry as any).dayName || '',
          assignments: enrichedAssignments,
        };
      });

      const responsePayload = {
        documentTitle: detectedDocTitle,
        detectedFlight: normalizeFlightName(detectedFlight),
        year: targetYear,
        month: 8,
        totalDates: enrichedDates.length,
        totalPages: Math.max(totalPagesCount, 1),
        totalFiles: fileList.length,
        dateRange: {
          start: enrichedDates[0]?.date || `${targetYear}-08-01`,
          end: enrichedDates[enrichedDates.length - 1]?.date || `${targetYear}-08-31`,
        },
        dates: enrichedDates,
        totalAssignmentsCount,
        matchedCount,
        unmatchedCount,
      };

      res.json(responsePayload);
    } catch (err: any) {
      console.error('Error in /api/import/analyze-duty-doc:', err);
      res.status(500).json({ error: err.message || 'Failed to analyze duty document' });
    }
  });
