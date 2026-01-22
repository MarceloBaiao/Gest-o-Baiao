
import { GoogleGenAI, GenerateContentResponse } from "@google/genai";
import { AppData } from "../types";

export const getFinancialInsights = async (data: AppData) => {
  // Fix: Inicialização seguindo estritamente as diretrizes do SDK para usar process.env.API_KEY
  const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
  
  const summary = {
    totalRevenue: data.transactions
      .filter(t => t.type === 'REVENUE')
      .reduce((acc, curr) => acc + curr.amount, 0),
    totalExpenses: data.transactions
      .filter(t => t.type === 'EXPENSE')
      .reduce((acc, curr) => acc + curr.amount, 0),
    contractMonthlyPotential: data.contracts
      .reduce((acc, curr) => acc + curr.monthlyValue, 0),
    expenseBreakdown: data.transactions
      .filter(t => t.type === 'EXPENSE')
      .reduce((acc, curr) => {
        acc[curr.category] = (acc[curr.category] || 0) + curr.amount;
        return acc;
      }, {} as Record<string, number>)
  };

  const prompt = `
    Como um consultor financeiro especialista em empresas de assessoria pública para RPPS, analise os seguintes dados:
    - Receita Total Realizada: R$ ${summary.totalRevenue}
    - Despesa Total: R$ ${summary.totalExpenses}
    - Receita Mensal Recorrente de Contratos: R$ ${summary.contractMonthlyPotential}
    - Quebra de Despesas: ${JSON.stringify(summary.expenseBreakdown)}
    
    Temos 4 empresas no grupo. Os custos incluem viagens, hotéis e manutenção de carros. 
    Dê 3 dicas estratégicas para otimizar a lucratividade e controle de custos baseado nesses dados. 
    Seja conciso e profissional. Responda em Português.
  `;

  try {
    // Fix: Uso de gemini-3-flash-preview para tarefas de análise de texto conforme diretriz
    const response: GenerateContentResponse = await ai.models.generateContent({
      model: 'gemini-3-flash-preview',
      contents: prompt,
    });
    // Fix: Acessando .text como propriedade, não como método ()
    return response.text;
  } catch (error) {
    console.error("Erro ao obter insights da IA:", error);
    return "Não foi possível gerar insights no momento. Verifique sua conexão ou tente novamente mais tarde.";
  }
};
