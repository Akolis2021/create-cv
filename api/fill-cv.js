export const config = { maxDuration: 30 };

export default async function handler(req, res) {
  // CORS
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');
  if (req.method === 'OPTIONS') return res.status(200).end();
  if (req.method !== 'POST') return res.status(405).json({ error: 'Method not allowed' });

  const apiKey = process.env.GEMINI_API_KEY;
  if (!apiKey) return res.status(500).json({ error: 'API key not configured on server.' });

  const { jobRole, cvText } = req.body;
  if (!jobRole || !cvText) return res.status(400).json({ error: 'Missing jobRole or cvText.' });

  const prompt = `
You are a professional CV writer and career consultant.

A person is applying for this role: "${jobRole}"

Below is their existing CV text:
---
${cvText.slice(0, 8000)}
---

Your job:
1. Extract all relevant information from the CV
2. Reframe and rewrite each section to be maximally relevant for the "${jobRole}" role
3. Keep all facts accurate — do NOT invent experience or qualifications
4. Make the language action-oriented, concise, and professional

Return ONLY a valid JSON object (no markdown, no backticks, no explanation) with this exact structure:
{
  "name": "Full name",
  "role": "Job title tailored to the role being applied for",
  "tagline": "One sentence professional tagline for this role",
  "email": "email address",
  "phone": "phone number",
  "website": "website or portfolio",
  "location": "location",
  "availability": "availability statement e.g. Available immediately · Full-time",
  "profile": "3-4 sentence professional summary tailored to the job role. Make it compelling.",
  "experience": [
    {
      "title": "Job title",
      "company": "Company name",
      "date": "Date range",
      "body": "2-3 sentence description reframed for relevance to the target role",
      "bullets": "bullet point 1\nbullet point 2\nbullet point 3",
      "tags": "Tag1 · Tag2 · Tag3"
    }
  ],
  "skills": ["skill 1", "skill 2", "skill 3", "skill 4", "skill 5", "skill 6", "skill 7", "skill 8"],
  "tools": ["Tool1", "Tool2", "Tool3", "Tool4", "Tool5"],
  "languages": [
    { "name": "Language name", "level": 5 }
  ],
  "education": [
    {
      "degree": "Degree / Certificate",
      "school": "Institution",
      "year": "Year"
    }
  ],
  "interests": ["Interest 1", "Interest 2", "Interest 3"],
  "refQuote": "A short compelling testimonial quote (real if available in CV, or leave blank)",
  "refName": "Referee name or role",
  "refCo": "Referee company"
}

Rules:
- skills array: 7-10 items most relevant to "${jobRole}"
- tools: real tools mentioned in CV or commonly used in "${jobRole}"  
- language levels: 1=basic, 2=conversational, 3=professional, 4=fluent, 5=native
- If any field is not in the CV, use a sensible placeholder or leave as empty string
- bullets: newline-separated bullet points (can be empty string if not applicable)
- Return ONLY the JSON. No other text.
`;

  try {
    const geminiRes = await fetch(
      `https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key=${apiKey}`,
      {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          contents: [{ parts: [{ text: prompt }] }],
          generationConfig: { temperature: 0.4, maxOutputTokens: 2048 }
        })
      }
    );

    if (!geminiRes.ok) {
      const errText = await geminiRes.text();
      console.error('Gemini error:', errText);
      return res.status(502).json({ error: 'Gemini API error. Check your API key and quota.' });
    }

    const geminiData = await geminiRes.json();
    const rawText = geminiData?.candidates?.[0]?.content?.parts?.[0]?.text || '';

    // Strip any accidental markdown fences
    const clean = rawText.replace(/```json|```/g, '').trim();

    let parsed;
    try {
      parsed = JSON.parse(clean);
    } catch (e) {
      console.error('JSON parse error. Raw response:', rawText);
      return res.status(500).json({ error: 'AI returned invalid JSON. Try again.', raw: rawText.slice(0, 500) });
    }

    return res.status(200).json({ success: true, data: parsed });
  } catch (err) {
    console.error('Handler error:', err);
    return res.status(500).json({ error: 'Server error: ' + err.message });
  }
}
