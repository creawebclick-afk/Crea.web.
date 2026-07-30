import express from 'express';
import path from 'path';
import { fileURLToPath } from 'url';
import { GoogleGenAI } from '@google/genai';
import dotenv from 'dotenv';
import { INITIAL_SERVICES } from './src/data/mockData.js';

dotenv.config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const PORT = 3000;

app.use(express.json());

// Nota: toda la data de usuarios/proyectos/portafolio/reuniones/notificaciones
// ahora vive en Supabase (Postgres + RLS), no en memoria del servidor.
// Este servidor Express solo se usa para:
//  1) servir el catálogo estático de servicios
//  2) hacer de proxy al API de Gemini (así la GEMINI_API_KEY nunca se expone al navegador)

// Gemini AI Client Initialization (Server-side only)
const ai = new GoogleGenAI({
  apiKey: process.env.GEMINI_API_KEY || 'MOCK_KEY_IF_MISSING',
  httpOptions: {
    headers: {
      'User-Agent': 'aistudio-build',
    },
  },
});

// API Routes
app.get('/api/health', (req, res) => {
  res.json({ status: 'ok', time: new Date().toISOString() });
});

// Services API (catálogo estático, no requiere base de datos)
app.get('/api/services', (req, res) => {
  res.json(INITIAL_SERVICES);
});

// CreaBot Gemini Chat Endpoint
app.post('/api/creabot/chat', async (req, res) => {
  try {
    const { message, history } = req.body;

    const systemInstruction = `
Eres "CreaBot IA", el asistente inteligente oficial de CreaWeb (plataforma peruana de servicios digitales para pequeños emprendedores en Perú).
Información clave de CreaWeb:
- Web: https://creaempresasweb.my.canva.site/
- WhatsApp: +51 905 551 491
- Email: crea.web.click@gmail.com
- Servicios & Precios:
  * Diseño Web: Básico (S/ 50), Intermedio (S/ 80), Tienda Online E-commerce (S/ 100).
  * Diseño Gráfico: Logo (S/ 15-20), Banner (S/ 10-15), Afiche (S/ 8-12), Post Redes (S/ 5-10).
  * Publicidad Digital: Desde S/ 20 por campaña.
  * Redes Sociales: Desde S/ 40 al mes.
  * Branding Completo: Desde S/ 50.
- Modelo de Pago: 50% anticipo para iniciar + 50% saldo al completar el proyecto (100%).
- Horario de Reuniones: Lun/Mié/Vie/Sáb 3:00pm - 10:00pm, Mar/Jue 3:00pm - 6:00pm, Domingo cerrado.

Instrucciones de comportamiento:
1. Sé muy amigable, profesional, empático y usa un tono acogedor orientado a pequeños emprendedores peruanos.
2. Si el usuario pregunta por un servicio o desea cotizar, hazle preguntas breves y concisas (tipo de negocio, presupuesto, funciones necesarias).
3. Cuando tengas suficiente información o el usuario te pida cotizar, preséntale un resumen claro con el precio en Soles (S/) y sugiérele registrar su solicitud con el 50% de anticipo.
4. Manten tus respuestas concisas (máximo 2 a 3 párrafos cortos) con buen formato.
5. Si detectas que el usuario pregunta cosas no relacionadas o necesita atención personalizada, ofrece hablar con un asesor por WhatsApp (+51 905 551 491).
`;

    if (!process.env.GEMINI_API_KEY || process.env.GEMINI_API_KEY === 'MY_GEMINI_API_KEY') {
      // Rule fallback if key is unconfigured or mock
      return res.json({
        reply: `¡Hola! 👋 Soy CreaBot IA. Me encantaría ayudarte a cotizar tu proyecto.
Nuestros servicios principales para emprendedores en Perú son:
• Páginas Web (desde S/ 50)
• Diseño Gráfico & Logos (desde S/ 8)
• Publicidad Digital (desde S/ 20)
• Redes Sociales (desde S/ 40/mes)
• Branding Completo (desde S/ 50)

¿Qué tipo de proyecto deseas cotizar hoy para tu negocio?`,
      });
    }

    const contents = [];
    if (Array.isArray(history)) {
      for (const h of history) {
        contents.push({
          role: h.rol === 'usuario' ? 'user' : 'model',
          parts: [{ text: h.contenido }],
        });
      }
    }
    contents.push({
      role: 'user',
      parts: [{ text: message }],
    });

    const response = await ai.models.generateContent({
      model: 'gemini-3.6-flash',
      contents: contents,
      config: {
        systemInstruction,
        temperature: 0.7,
      },
    });

    const replyText = response.text || 'Entendido. ¿Deseas que preparemos tu cotización para continuar?';

    res.json({ reply: replyText });
  } catch (error: any) {
    console.error('Gemini API Error:', error);
    res.json({
      reply: `¡Hola! Veo que estás interesado en nuestros servicios. Podemos ayudarte con Diseño Web (S/ 50-100), Logos (S/ 15-20) y Marketing Digital. ¿Cuál se adapta mejor a tu emprendimiento?`,
    });
  }
});

// Serve Vite dev server or production static assets
async function startServer() {
  if (process.env.NODE_ENV !== 'production') {
    const { createServer: createViteServer } = await import('vite');
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: 'spa',
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), 'dist');
    app.use(express.static(distPath));
    app.get('*', (req, res) => {
      res.sendFile(path.join(distPath, 'index.html'));
    });
  }

  app.listen(PORT, '0.0.0.0', () => {
    console.log(`CreaWeb Express Server running on http://0.0.0.0:${PORT}`);
  });
}

startServer();
