import { AppData } from './types';
export const INITIAL_DATA: AppData = {
  companies: [
    { id: '1', name: 'Assessoria Alpha', cnpj: '01' },
    { id: '2', name: 'Gestão Beta', cnpj: '02' },
    { id: '3', name: 'Consultoria Gamma', cnpj: '03' },
    { id: '4', name: 'Soluções Delta', cnpj: '04' },
  ],
  clients: [],
  employees: [{ id: 'e1', name: 'Empresário', role: 'Dono', isAdmin: true }],
  contracts: [],
  transactions: []
};