export interface ParsedJd {
  companyName: string;
  jobTitle: string;
  location?: string;
  salaryMin?: number;
  salaryMax?: number;
  salaryCurrency?: string;
  employmentType?: string;
  remoteStatus?: string;
  extractedSkills: string[];
}

export interface MatchAnalysis {
  matchScore: number;
  matchingSkills: string[];
  missingSkills: string[];
  summary: string;
  recommendations: string[];
}

export interface InterviewQuestion {
  category: 'behavioral' | 'technical' | 'situational';
  question: string;
  tip: string;
}

export interface UserAiConfig {
  aiProvider?: string | null;
  aiApiKey?: string | null;
  aiBaseUrl?: string | null;
  aiModel?: string | null;
}

const POLLINATIONS_API_KEY = process.env.POLLINATIONS_API_KEY || '';
const POLLINATIONS_URL = 'https://gen.pollinations.ai/v1/chat/completions';
const AI_FETCH_TIMEOUT = 30_000;

async function fetchWithTimeout(url: string, options: RequestInit = {}): Promise<Response> {
  const controller = new AbortController();
  const id = setTimeout(() => controller.abort(), AI_FETCH_TIMEOUT);
  try {
    return await fetch(url, { ...options, signal: controller.signal });
  } finally {
    clearTimeout(id);
  }
}

/** Response shape from chat completion providers (OpenAI-compatible). */
interface ChatCompletionResponse {
  choices?: { message?: { content?: string } }[];
  candidates?: { content?: { parts?: { text?: string }[] } }[];
}

async function callAiProvider(prompt: string, config?: UserAiConfig): Promise<string> {
  const provider = config?.aiProvider || 'system_default';
  const apiKey = config?.aiApiKey?.trim();

  // 1. Google Gemini API Direct
  if (provider === 'google' && apiKey) {
    const model = config?.aiModel?.trim() || 'gemini-2.5-flash';
    const geminiUrl = `https://generativelanguage.googleapis.com/v1beta/models/${model}:generateContent?key=${apiKey}`;
    const response = await fetchWithTimeout(geminiUrl, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        contents: [
          {
            parts: [
              {
                text: `System: You are an AI assistant for a Job Tracker app. ALWAYS respond strictly with valid raw JSON without markdown codeblock wrappers.\n\nUser: ${prompt}`,
              },
            ],
          },
        ],
      }),
    });

    if (!response.ok) {
      const errorText = await response.text();
      throw new Error(`Google Gemini API error (${response.status}): ${errorText}`);
    }

    const data = (await response.json()) as ChatCompletionResponse;
    let text = data.candidates?.[0]?.content?.parts?.[0]?.text;
    if (!text) throw new Error('Empty response from Google Gemini API');
    return text.trim().replace(/^```(?:json)?\s*|\s*```$/gi, '');
  }

  // 2. OpenRouter API
  if (provider === 'openrouter' && apiKey) {
    const model = config?.aiModel?.trim() || 'google/gemini-2.5-flash-lite:free';
    const response = await fetchWithTimeout('https://openrouter.ai/api/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${apiKey}`,
        'Content-Type': 'application/json',
        'HTTP-Referer': 'https://careertrack.app',
        'X-Title': 'CareerTrack Lite',
      },
      body: JSON.stringify({
        model,
        messages: [
          {
            role: 'system',
            content: 'You are an AI assistant for a Job Tracker app. ALWAYS respond strictly with valid raw JSON without markdown codeblock wrappers.',
          },
          { role: 'user', content: prompt },
        ],
      }),
    });

    if (!response.ok) {
      const errorText = await response.text();
      throw new Error(`OpenRouter API error (${response.status}): ${errorText}`);
    }

    const data = (await response.json()) as ChatCompletionResponse;
    let content = data.choices?.[0]?.message?.content;
    if (!content) throw new Error('Empty response from OpenRouter API');
    return content.trim().replace(/^```(?:json)?\s*|\s*```$/gi, '');
  }

  // 3. Official OpenAI API
  if (provider === 'openai' && apiKey) {
    const model = config?.aiModel?.trim() || 'gpt-4o-mini';
    const response = await fetchWithTimeout('https://api.openai.com/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${apiKey}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model,
        messages: [
          {
            role: 'system',
            content: 'You are an AI assistant for a Job Tracker app. ALWAYS respond strictly with valid raw JSON without markdown codeblock wrappers.',
          },
          { role: 'user', content: prompt },
        ],
      }),
    });

    if (!response.ok) {
      const errorText = await response.text();
      throw new Error(`OpenAI API error (${response.status}): ${errorText}`);
    }

    const data = (await response.json()) as ChatCompletionResponse;
    let content = data.choices?.[0]?.message?.content;
    if (!content) throw new Error('Empty response from OpenAI API');
    return content.trim().replace(/^```(?:json)?\s*|\s*```$/gi, '');
  }

  // 4. Custom OpenAI-Compatible Endpoint
  if (provider === 'custom' && (apiKey || config?.aiBaseUrl)) {
    const baseUrl = (config?.aiBaseUrl?.trim() || 'https://api.openai.com/v1').replace(/\/+$/, '');
    const model = config?.aiModel?.trim() || 'default';
    const url = baseUrl.endsWith('/chat/completions') ? baseUrl : `${baseUrl}/chat/completions`;
    const headers: Record<string, string> = { 'Content-Type': 'application/json' };
    if (apiKey) headers['Authorization'] = `Bearer ${apiKey}`;

    const response = await fetchWithTimeout(url, {
      method: 'POST',
      headers,
      body: JSON.stringify({
        model,
        messages: [
          {
            role: 'system',
            content: 'You are an AI assistant for a Job Tracker app. ALWAYS respond strictly with valid raw JSON without markdown codeblock wrappers.',
          },
          { role: 'user', content: prompt },
        ],
      }),
    });

    if (!response.ok) {
      const errorText = await response.text();
      throw new Error(`Custom AI Endpoint error (${response.status}): ${errorText}`);
    }

    const data = (await response.json()) as ChatCompletionResponse;
    let content = data.choices?.[0]?.message?.content;
    if (!content) throw new Error('Empty response from Custom AI API');
    return content.trim().replace(/^```(?:json)?\s*|\s*```$/gi, '');
  }

  // 5. System Default Fallback (Pollinations AI)
  if (!POLLINATIONS_API_KEY) {
    throw new Error('AI_NOT_CONFIGURED:No AI provider is configured. Add your API key in Settings to use AI features.');
  }
  const response = await fetchWithTimeout(POLLINATIONS_URL, {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${POLLINATIONS_API_KEY}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      model: 'openai',
      messages: [
        {
          role: 'system',
          content: 'You are an AI assistant for a Job Tracker app. ALWAYS respond strictly with valid raw JSON without markdown codeblock wrappers.',
        },
        { role: 'user', content: prompt },
      ],
    }),
  });

  if (!response.ok) {
    const errorText = await response.text();
    throw new Error(`System Default AI error (${response.status}): ${errorText}`);
  }

  const data = (await response.json()) as ChatCompletionResponse;
  let content = data.choices?.[0]?.message?.content;
  if (!content) throw new Error('Empty response from AI API');
  return content.trim().replace(/^```(?:json)?\s*|\s*```$/gi, '');
}

export class AiService {
  static async testAiConfig(config: UserAiConfig): Promise<{ success: boolean; message: string }> {
    const testPrompt = 'Respond strictly with valid JSON: {"status": "ok", "message": "Connection successful"}';
    const rawJson = await callAiProvider(testPrompt, config);
    try {
      const parsed = JSON.parse(rawJson);
      if (parsed.status === 'ok' || parsed.message) {
        return { success: true, message: 'AI Connection verified successfully!' };
      }
      return { success: true, message: 'AI Connected & responded.' };
    } catch {
      return { success: true, message: 'AI Connected successfully.' };
    }
  }

  static async parseJobDescription(jdText: string, config?: UserAiConfig): Promise<ParsedJd> {
    const prompt = `Extract structured job application information from the following Job Description (JD).
Return strictly a valid JSON object matching this TypeScript interface:
{
  "companyName": "string (or 'Unknown')",
  "jobTitle": "string (or 'Unknown')",
  "location": "string optional",
  "salaryMin": number optional,
  "salaryMax": number optional,
  "salaryCurrency": "USD/BDT/EUR/GBP optional",
  "employmentType": "Full-time / Part-time / Contract / Internship optional",
  "remoteStatus": "Remote / Hybrid / On-site optional",
  "extractedSkills": ["array of key technical & soft skills"]
}

Job Description Text:
${jdText}`;

    const rawJson = await callAiProvider(prompt, config);
    try {
      return JSON.parse(rawJson) as ParsedJd;
    } catch {
      throw new Error('AI returned invalid JSON for job description parsing. Please try again.');
    }
  }

  static async analyzeMatch(jdText: string, userResumeText: string, config?: UserAiConfig): Promise<MatchAnalysis> {
    const prompt = `Compare the candidate's Resume / Skills profile against the Job Description.
Return strictly a valid JSON object matching this schema:
{
  "matchScore": number between 0 and 100,
  "matchingSkills": ["array of skills present in both"],
  "missingSkills": ["array of skills required in JD but missing in candidate profile"],
  "summary": "1-2 sentence overview of candidate fit",
  "recommendations": ["2-3 concrete tips for candidate to tailor application"]
}

Candidate Profile / Resume:
${userResumeText || 'No resume text provided.'}

Job Description:
${jdText}`;

    const rawJson = await callAiProvider(prompt, config);
    try {
      return JSON.parse(rawJson) as MatchAnalysis;
    } catch {
      throw new Error('AI returned invalid JSON for match analysis. Please try again.');
    }
  }

  static async generateInterviewPrep(jobTitle: string, companyName: string, jdText?: string, config?: UserAiConfig): Promise<InterviewQuestion[]> {
    const prompt = `Generate 5 realistic interview practice questions (behavioral, technical, situational) for a candidate interviewing for:
Role: ${jobTitle}
Company: ${companyName}
${jdText ? `Job Description:\n${jdText}` : ''}

Return strictly a JSON array of objects:
[
  {
    "category": "behavioral" | "technical" | "situational",
    "question": "The question text",
    "tip": "1-2 sentence tip on how to answer using the STAR method"
  }
]`;

    const rawJson = await callAiProvider(prompt, config);
    try {
      return JSON.parse(rawJson) as InterviewQuestion[];
    } catch {
      throw new Error('AI returned invalid JSON for interview prep. Please try again.');
    }
  }

  static async generateOutreachEmail(
    type: 'follow_up' | 'thank_you' | 'cold_outreach',
    companyName: string,
    jobTitle: string,
    applicantName: string,
    config?: UserAiConfig
  ): Promise<{ subject: string; body: string }> {
    const prompt = `Draft a professional ${type.replace('_', ' ')} email for job application:
Applicant Name: ${applicantName}
Company Name: ${companyName}
Job Title: ${jobTitle}

Return strictly a valid JSON object:
{
  "subject": "Email Subject Line",
  "body": "Formatted plain text body with appropriate placeholders"
}`;

    const rawJson = await callAiProvider(prompt, config);
    try {
      return JSON.parse(rawJson) as { subject: string; body: string };
    } catch {
      throw new Error('AI returned invalid JSON for email draft. Please try again.');
    }
  }
}
