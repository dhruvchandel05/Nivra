const { GoogleGenAI } = require('@google/genai');
const env = require('../config/env');

const client = env.geminiApiKey ? new GoogleGenAI({ apiKey: env.geminiApiKey }) : null;

const FALLBACK_MESSAGE =
  "I'm not able to reach the AI assistant right now. Please try again later or submit your question so an admin can respond.";

function buildSystemPrompt(kbContext, language) {
  const contextLines =
    Array.isArray(kbContext) && kbContext.length > 0
      ? kbContext
          .map((item, index) => `${index + 1}. [${item.category}] Q: ${item.question} A: ${item.answer}`)
          .join('\n')
      : '(no relevant knowledge-base entries found)';

  let prompt = `You are CampusConnect, a college enquiry assistant. Only use the following knowledge-base context when it is relevant to the student's question; otherwise answer generally and clearly say you are not fully certain.\n\nKnowledge base context:\n${contextLines}`;

  if (language && language !== 'en') {
    prompt += `\n\nRespond in ${language}.`;
  }

  prompt += "\n\nEnd your reply with a final line exactly in this format: CONFIDENCE: <0.0-1.0>";

  return prompt;
}

function parseConfidence(text) {
  const match = text.match(/CONFIDENCE:\s*([0-9]*\.?[0-9]+)/i);

  if (!match) {
    return { answer: text.trim(), confidence: 0.4 };
  }

  let confidence = parseFloat(match[1]);
  if (Number.isNaN(confidence)) confidence = 0.4;
  confidence = Math.min(1, Math.max(0, confidence));

  const answer = text.replace(match[0], '').trim();

  return { answer, confidence };
}

async function askLlm(question, kbContext, language) {
  if (!client) {
    return { answer: FALLBACK_MESSAGE, confidence: 0 };
  }

  try {
    const response = await client.models.generateContent({
      model: env.geminiModel,
      contents: question,
      config: {
        systemInstruction: buildSystemPrompt(kbContext, language),
        maxOutputTokens: 400,
      },
    });

    const text = response.text || '';

    return parseConfidence(text);
  } catch (err) {
    console.error('LLM request failed:', err);
    return { answer: FALLBACK_MESSAGE, confidence: 0 };
  }
}

async function translate(text, language) {
  if (!client || !language || language === 'en') {
    return text;
  }

  try {
    const response = await client.models.generateContent({
      model: env.geminiModel,
      contents: text,
      config: {
        systemInstruction: `Translate the given text into ${language}. Only output the translation, nothing else.`,
        maxOutputTokens: 400,
      },
    });

    const translated = (response.text || '').trim();

    return translated || text;
  } catch (err) {
    console.error('Translation request failed:', err);
    return text;
  }
}

const MAX_EXTRACT_CHARS = 40000;

async function extractKnowledgeFromText(text) {
  if (!client || !text || !text.trim()) {
    return [];
  }

  const truncated = text.slice(0, MAX_EXTRACT_CHARS);

  try {
    const response = await client.models.generateContent({
      model: env.geminiModel,
      contents:
        'Extract distinct question-and-answer knowledge base entries for a college enquiry chatbot ' +
        'from the following document text. Each entry needs a short category ' +
        '(e.g. Admissions, Fees, Exams, Hostel, Placement, Scholarships), a clear question a student ' +
        'might ask, a concise answer drawn only from the document, and a few comma-separated keywords. ' +
        'Skip anything that is not useful as a standalone FAQ entry.\n\nDocument text:\n' +
        truncated,
      config: {
        responseMimeType: 'application/json',
        responseSchema: {
          type: 'ARRAY',
          items: {
            type: 'OBJECT',
            properties: {
              category: { type: 'STRING' },
              question: { type: 'STRING' },
              answer: { type: 'STRING' },
              keywords: { type: 'STRING' },
            },
            required: ['category', 'question', 'answer'],
          },
        },
        maxOutputTokens: 4000,
      },
    });

    const parsed = JSON.parse(response.text || '[]');
    return Array.isArray(parsed) ? parsed : [];
  } catch (err) {
    console.error('Knowledge extraction failed:', err);
    return [];
  }
}

module.exports = { buildSystemPrompt, parseConfidence, askLlm, translate, extractKnowledgeFromText };
