import { GoogleGenAI } from "@google/genai";
import { AppData } from "../types";

export const getFinancialInsights = async (data: AppData) => {
  const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
  const prompt = `Analise financeiramente os gastos desta empresa de RPPS: ${JSON.stringify(data.transactions)}. Dê 3 conselhos de economia.`;
  
  try {
    const response = await ai.models.generateContent({
      model: 'gemini-3-flash-preview',
      contents: prompt,
    });
    return response.text;
  } catch (e) {
    return "Erro ao carregar análise.";
  }
};