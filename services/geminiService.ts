
import { GoogleGenAI } from "@google/genai";
import { Match } from "../types";

/**
 * Analyzes a match using Gemini AI.
 * Updated to follow @google/genai SDK guidelines:
 * - Uses process.env.API_KEY directly in the constructor.
 * - Uses a named parameter for the apiKey.
 * - Accesses response.text as a property, not a method.
 * - Uses 'gemini-3-flash-preview' for basic text tasks.
 */
export const getMatchAnalysis = async (match: Match): Promise<string> => {
  // Always use a named parameter for the API key and assume it is pre-configured.
  const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
  
  const homeName = match.home_team?.name || 'Local';
  const homeRanking = match.home_team?.ranking || 'N/A';
  const awayName = match.away_team?.name || 'Visitante';
  const awayRanking = match.away_team?.ranking || 'N/A';

  const prompt = `
    Analiza el siguiente partido de la Copa del Mundo FIFA 2026:
    Local: ${homeName} (Ranking FIFA: ${homeRanking})
    Visitante: ${awayName} (Ranking FIFA: ${awayRanking})
    
    Proporciona una predicción concisa (resultado probable) y una razón táctica en una sola frase.
    Responde exclusivamente en español. Mantén un tono deportivo y profesional.
  `;

  try {
    const response = await ai.models.generateContent({
      model: 'gemini-3-flash-preview',
      contents: prompt,
    });
    // Access the text property directly as it is not a method.
    return response.text || "No hay análisis disponible.";
  } catch (error) {
    console.error("Error de Gemini:", error);
    return "El árbitro del VAR (IA) está revisando la jugada. ¡Inténtalo más tarde!";
  }
};
