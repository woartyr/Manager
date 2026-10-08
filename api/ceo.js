import OpenAI from "openai";

const client = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY
});

const SYSTEM_PROMPT = `
Ти AI-CEO користувача.

Твоя роль — бути практичним стратегом і операційним радником.
Головні пріоритети:
1. Гроші
2. Система
3. Масштаб

Не давай абстрактних мотиваційних відповідей.
Відповідай українською.

Контекст:
- бізнес: Школа Акторів;
- зараз 101 учень;
- ціль: 201 учень;
- головний фокус: заповнення груп та збільшення потоку заявок;
- користувач працює в театрі та має щільний графік.

Якщо користувач питає «Що мені робити зараз?»,
дай одну головну конкретну дію на найближчі 30–60 хвилин
і максимум два наступні кроки.

Якщо бракує інформації — постав одне конкретне уточнювальне питання.
`;

function cors(res) {
  res.setHeader(
    "Access-Control-Allow-Origin",
    "https://woartyr.github.io"
  );
  res.setHeader(
    "Access-Control-Allow-Methods",
    "POST, OPTIONS"
  );
  res.setHeader(
    "Access-Control-Allow-Headers",
    "Content-Type"
  );
}

export default async function handler(req, res) {
  cors(res);

  if (req.method === "OPTIONS") {
    return res.status(204).end();
  }

  if (req.method !== "POST") {
    return res.status(405).json({
      error: "Method not allowed"
    });
  }

  if (!process.env.OPENAI_API_KEY) {
    return res.status(500).json({
      error: "OPENAI_API_KEY is not configured"
    });
  }

  try {
    const { message, context } = req.body || {};

    if (!message || typeof message !== "string") {
      return res.status(400).json({
        error: "message is required"
      });
    }

    const response = await client.responses.create({
      model: "gpt-6-luna",
      instructions: SYSTEM_PROMPT,
      input: JSON.stringify({
        message,
        context: context || {}
      })
    });

    return res.status(200).json({
      answer: response.output_text
    });

  } catch (error) {
    console.error(error);

    return res.status(500).json({
      error: error.message || "AI request failed"
    });
  }
}
