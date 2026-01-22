
import { AppData, TransactionType, ExpenseCategory } from './types';

export const INITIAL_DATA: AppData = {
  companies: [
    { id: '1', name: 'Baião Assessoria Alpha', cnpj: '00.000.001/0001-01' },
    { id: '2', name: 'Baião Gestão Beta', cnpj: '00.000.002/0001-02' },
    { id: '3', name: 'Baião Consultoria Gamma', cnpj: '00.000.003/0001-03' },
    { id: '4', name: 'Baião Soluções Delta', cnpj: '00.000.004/0001-04' },
  ],
  clients: [
    { id: 'c1', name: 'Prefeitura Municipal Exemplo', city: 'São Paulo - SP' },
  ],
  employees: [
    { id: 'e1', name: 'Empresário (Admin)', role: 'Diretor Geral', isAdmin: true },
    { id: 'e2', name: 'Consultor Técnico', role: 'Colaborador' },
  ],
  contracts: [],
  transactions: []
};
