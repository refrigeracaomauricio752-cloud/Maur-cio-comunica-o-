import express, { Request, Response } from 'express';
import { createServer as createViteServer } from 'vite';
import path from 'path';
import dotenv from 'dotenv';
import { GoogleGenAI } from '@google/genai';

dotenv.config();

const app = express();
const PORT = 3000;

app.use(express.json({ limit: '20mb' }));

const apiKey = process.env.GEMINI_API_KEY || '';
const ai = new GoogleGenAI({
  apiKey,
  httpOptions: {
    headers: {
      'User-Agent': 'aistudio-build',
    },
  },
});

// Robust script generator fallback for Brazilian retail and refrigeration
function generateFallbackScript(
  businessName: string,
  category: string,
  highlights: string,
  servicePartner: string,
  location: string,
  phone: string
) {
  const partnerMention = servicePartner ? ` com a qualidade e refrigeração da ${servicePartner}` : '';
  const locationMention = location ? ` no endereço ${location}` : '';
  const phoneMention = phone ? ` Mande um WhatsApp para ${phone}!` : '';

  return {
    title: `Super Promoção no ${businessName}!`,
    openingHook: `Alô minha gente! O melhor pra sua família tá no ${businessName}!`,
    narrationText: `Alô minha gente! No ${businessName} você encontra tudo que precisa com qualidade e economia de verdade! ${highlights}! Tudo com balcões impecáveis${partnerMention}! Atendimento nota dez que você já conhece! Vem correndo aproveitar as melhores ofertas da semana!${locationMention}.${phoneMention}`,
    offersBulletPoints: [
      highlights.split(',')[0]?.trim() || 'Qualidade de primeira em tudo',
      highlights.split(',')[1]?.trim() || 'Preço baixo e economia garantida',
      servicePartner ? `Refrigeração garantida por ${servicePartner}` : 'Balcões e produtos sempre fresquinhos',
    ],
    callToAction: `Vem correndo pro ${businessName}! Economia e qualidade no mesmo lugar!`,
    carroDeSomScript: `ATENÇÃO, ATENÇÃO MINHA GENTE! É NO ${businessName.toUpperCase()}! ${highlights.toUpperCase()}! PREÇO BAIXO DE VERDADE${locationMention ? ' ' + locationMention.toUpperCase() : ''}! VEM CORRENDO PRA CÁ!`,
    whatsappText: `🛒 *SUPER OFERTAS NO ${businessName.toUpperCase()}!* 🔥\n\n${highlights}!\n${servicePartner ? `❄️ Refrigeração garantida: ${servicePartner}\n` : ''}${location ? `📍 Local: ${location}\n` : ''}${phone ? `📲 WhatsApp: ${phone}\n` : ''}\nVenha conferir hoje mesmo!`,
  };
}

// Endpoint to generate commercial ad copy & scripts
app.post('/api/generate-script', async (req: Request, res: Response) => {
  const {
    businessName = 'Mercado do Elias',
    category = 'mercado',
    highlights = 'Cerveja trincando de gelada, carnes frescas, balcões refrigerados de primeira, frutas e verduras do dia',
    servicePartner = 'Refrigeração Maurício',
    location = '',
    phone = '',
    tone = 'alegre_comercial',
    targetDuration = '30s',
  } = req.body || {};

  try {
    const prompt = `Você é o melhor redator publicitário de rádio, carro de som e anúncios comerciais do Brasil, especializado no varejo popular e no setor de refrigeração comercial.
Crie um comercial de rádio / carro de som irresistível, com energia contagiante e linguagem bem brasileira.

Informações da propaganda:
- Nome do Comércio / Cliente: ${businessName}
- Ramo / Foco: ${category}
- Destaques / Ofertas / Qualidades: ${highlights}
- Parceria / Instalação de Refrigeração: ${servicePartner || 'Refrigeração especializada'}
- Endereço / Localização: ${location || 'No centro da cidade'}
- Telefone / WhatsApp: ${phone || 'Consulte nosso WhatsApp'}
- Tom do comercial: ${tone} (animado, vendedor, estilo locução sertaneja/varejo popular)
- Duração estimada de leitura: cerca de ${targetDuration} (aproximadamente 60 a 90 palavras, ritmo ágil e empolgante).

REGRAS IMPORTANTES PARA O TEXTO DE LOCUÇÃO (narrationText):
1. O texto DEVE ser escrito exatamente como o locutor vai falar.
2. Use pontuação clara com exclamações e pausas pontuais para a IA ler de forma bem dinâmica.
3. Não inclua legendas entre parênteses como "(música sobe)" dentro do narrationText, pois o narrationText será lido diretamente pela voz do sintetizador de áudio!
4. Mantenha as frases curtas, impactantes e muito calorosas, com o autêntico clima do comércio brasileiro ("Alô minha gente!", "Vem correndo pro...", "Aqui tem bebida trincando de gelada!").

Responda ESTRITAMENTE em formato JSON com o seguinte schema:
{
  "title": "Título chamativo do comercial",
  "openingHook": "Frase de abertura de impacto",
  "narrationText": "Texto contínuo completo para o locutor narrar sem rubricas, ideal para síntese de voz",
  "offersBulletPoints": ["Destaque 1", "Destaque 2", "Destaque 3"],
  "callToAction": "Chamada final com WhatsApp ou convite",
  "carroDeSomScript": "Versão com repetições e ênfase para caixa de som / carro de rua",
  "whatsappText": "Texto formatado com emojis para disparar no WhatsApp dos clientes"
}`;

    const geminiPromise = ai.models.generateContent({
      model: 'gemini-3.8-flash',
      contents: prompt,
      config: {
        responseMimeType: 'application/json',
        temperature: 0.8,
      },
    });

    const timeoutPromise = new Promise<null>((resolve) =>
      setTimeout(() => resolve(null), 7000)
    );

    const response = await Promise.race([geminiPromise, timeoutPromise]);

    const outputText = response ? response.text || '' : '';
    if (outputText) {
      try {
        const parsed = JSON.parse(outputText);
        if (parsed.narrationText) {
          return res.json({ success: true, data: parsed });
        }
      } catch (jsonErr) {
        console.warn('JSON parse error in Gemini script response:', jsonErr);
      }
    }

    // Fallback if empty or malformed
    const fallbackData = generateFallbackScript(
      businessName,
      category,
      highlights,
      servicePartner,
      location,
      phone
    );
    return res.json({ success: true, data: fallbackData });
  } catch (err: unknown) {
    const error = err as Error;
    console.warn('Gemini script generation issue, using dynamic template:', error.message);
    const fallbackData = generateFallbackScript(
      businessName,
      category,
      highlights,
      servicePartner,
      location,
      phone
    );
    return res.json({ success: true, data: fallbackData });
  }
});

// Endpoint to generate speech audio using Gemini TTS
app.post('/api/generate-speech', async (req: Request, res: Response) => {
  try {
    const {
      text,
      voice = 'Fenrir',
      tone = 'entusiasmado',
    } = req.body;

    if (!text || typeof text !== 'string') {
      return res.status(400).json({ success: false, error: 'Texto para locução é obrigatório.' });
    }

    // Clean any brackets or markdown if any
    const cleanText = text.replace(/\[.*?\]|\(.*?\)/g, '').trim();

    // 1. Try flagship high-quality model: gemini-3.8-flash-tts
    // 2. Fallback to gemini-3.8-flash-lite-tts if needed
    const modelsToTry = ['gemini-3.8-flash-tts', 'gemini-3.8-flash-lite-tts'];
    let lastError: Error | null = null;
    let audioBase64: string | undefined = undefined;

    for (const modelName of modelsToTry) {
      try {
        const speechPromise = ai.models.generateContent({
          model: modelName,
          contents: [
            {
              role: 'user',
              parts: [
                {
                  text: cleanText,
                  speechMetadata: {
                    style: `Voz de locutor profissional de rádio comercial brasileiro e varejo popular, ${tone || 'animado e vibrante'}, dicção perfeita e ritmo contagiante`,
                  },
                },
              ],
            },
          ],
          config: {
            responseModalities: ['AUDIO'],
            speechConfig: {
              voiceConfig: {
                prebuiltVoiceConfig: { voiceName: voice || 'Fenrir' },
              },
            },
          },
        });

        const timeoutPromise = new Promise<null>((resolve) =>
          setTimeout(() => resolve(null), 45000)
        );

        const response = await Promise.race([speechPromise, timeoutPromise]);
        if (response && response.candidates?.[0]?.content?.parts?.[0]?.inlineData?.data) {
          audioBase64 = response.candidates[0].content.parts[0].inlineData.data;
          break; // Succeeded!
        }
      } catch (err) {
        lastError = err as Error;
        console.warn(`Model ${modelName} failed or quota exceeded:`, (err as Error).message);
        // Continue to next model in loop
      }
    }

    if (!audioBase64) {
      return res.json({
        success: false,
        fallback: true,
        error: lastError?.message || 'Cota da IA de voz temporariamente ocupada. Usando sintetizador local.',
      });
    }

    return res.json({
      success: true,
      audioBase64,
      mimeType: 'audio/wav',
    });
  } catch (err: unknown) {
    const error = err as Error;
    console.warn('Error in Gemini TTS, providing client fallback:', error.message);
    return res.json({
      success: false,
      fallback: true,
      error: error.message || 'Erro temporário na IA de voz. Usando sintetizador nativo.',
    });
  }
});

async function startServer() {
  if (process.env.NODE_ENV === 'production') {
    app.use(express.static('dist'));
    app.get('*', (_req: Request, res: Response) => {
      res.sendFile(path.resolve(process.cwd(), 'dist', 'index.html'));
    });
  } else {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: 'spa',
    });
    app.use(vite.middlewares);
  }

  app.listen(PORT, '0.0.0.0', () => {
    console.log(`PropagandaFácil server rodando em http://localhost:${PORT}`);
  });
}

startServer();
