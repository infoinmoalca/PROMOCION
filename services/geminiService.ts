import { GoogleGenAI, GenerateContentResponse } from "@google/genai";
import { FeasibilityParams } from "../types";

// Helper to ensure API key is present
const getAIClient = () => {
  if (!process.env.API_KEY) {
    throw new Error("API Key is missing. Please set process.env.API_KEY.");
  }
  return new GoogleGenAI({ apiKey: process.env.API_KEY });
};

// 1. Chat Bot (General Assistance)
export const sendChatMessage = async (history: { role: 'user' | 'model', text: string }[], newMessage: string) => {
  const ai = getAIClient();
  
  const chat = ai.chats.create({
    model: 'gemini-3-pro-preview', // Requested by user for chat
    config: {
      systemInstruction: "You are an expert AI assistant for a Real Estate Developer (Promotor Inmobiliario). You help with accounting, project management, and construction technicalities. You are concise, professional, and helpful. Use Spanish.",
    },
    history: history.map(h => ({
      role: h.role,
      parts: [{ text: h.text }]
    }))
  });

  const result = await chat.sendMessage({ message: newMessage });
  return result.text;
};

// 2. Feasibility Study (Thinking Mode)
export const analyzeFeasibility = async (params: FeasibilityParams) => {
  const ai = getAIClient();

  const prompt = `
    Actúa como un Analista Financiero Senior especializado en Promociones Inmobiliarias. 
    Realiza un **Estudio de Viabilidad detallado** para una promoción con los siguientes datos:
    
    - Coste del Suelo: €${params.landCost.toLocaleString()}
    - Coste de Construcción: €${params.constructionCost.toLocaleString()}
    - Superficie Vendible: ${params.saleableArea} m²
    - Precio Estimado Venta/m²: €${params.estimatedPricePerSqm.toLocaleString()}
    - Costes Indirectos (Soft Costs): ${params.softCostsPercent}% sobre la construcción.
    - Duración: ${params.durationMonths} meses
    - Tasa de Interés Financiación: ${params.financingRate}%
    
    **Instrucciones de Salida:**
    1. **Idioma:** Español.
    2. **Estructura:**
       - **Resumen Ejecutivo:** Visión general rápida.
       - **Análisis Financiero:** Desglose detallado de costes (Hard Costs, Soft Costs, Financieros) e Ingresos. Calcula el Beneficio Neto, Margen sobre Ventas y ROI.
       - **Análisis de Riesgos:** Evalúa riesgos de mercado, construcción y financieros.
       - **Recomendaciones:** Estrategias para mejorar la rentabilidad.
    3. **Formato:** Usa Markdown profesional. **Incluye Tablas** para mostrar los números claramente.
    4. **Profundidad:** Utiliza tu capacidad de razonamiento para inferir posibles problemas ocultos (ej. costes de licencias, tiempos de venta).
  `;

  // Using Thinking Config as requested
  const response = await ai.models.generateContent({
    model: 'gemini-3-pro-preview',
    contents: prompt,
    config: {
      thinkingConfig: {
        thinkingBudget: 32768, // Max for Gemini 3 Pro
      }
    }
  });

  return response.text;
};

// 3. Document Analysis (Vision & PDF)
export const analyzeDocument = async (fileBase64: string, mimeType: string) => {
  const ai = getAIClient();

  const prompt = `
    Analiza este documento adjunto (puede ser imagen o PDF de una constructora, ayuntamiento o proveedor).
    
    Tu objetivo es extraer datos estructurados para automatizar la gestión en un software inmobiliario.
    
    Devuelve SOLAMENTE un objeto JSON válido con la siguiente estructura (sin bloques de código markdown):
    {
      "type": "Budget" | "Invoice" | "License" | "Contract" | "Blueprint" | "Other",
      "summary": "Breve descripción de una frase del documento",
      "date": "YYYY-MM-DD" (Fecha del documento o null),
      "amount": number (Importe total sin moneda o null si no aplica),
      "concept": "Titulo o concepto principal (ej: Instalación Eléctrica)",
      "providerName": "Nombre de la empresa o persona emisora detectada",
      "projectName": "Nombre del proyecto o promoción detectada (si aparece)",
      "confidence": number (1-100, seguridad de la extracción)
    }
  `;

  const response = await ai.models.generateContent({
    model: 'gemini-2.5-flash', // Flash is fast and good for extraction
    contents: {
      parts: [
        {
          inlineData: {
            mimeType: mimeType,
            data: fileBase64
          }
        },
        { text: prompt }
      ]
    },
    config: {
        responseMimeType: "application/json"
    }
  });

  return response.text;
};