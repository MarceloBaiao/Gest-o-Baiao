
export type Company = {
  id: string;
  name: string;
  cnpj: string;
};

export enum TransactionType {
  REVENUE = 'REVENUE',
  EXPENSE = 'EXPENSE'
}

export enum ExpenseCategory {
  TRAVEL = 'Viagem',
  HOTEL = 'Diária Hotel',
  MAINTENANCE = 'Manutenção Carro',
  SALARY = 'Salário/Colaborador',
  OFFICE = 'Escritório',
  OTHER = 'Outros'
}

export type Employee = {
  id: string;
  name: string;
  role: string;
  isAdmin?: boolean;
};

export type Client = {
  id: string;
  name: string;
  city: string;
};

export type Contract = {
  id: string;
  clientId: string;
  companyId: string;
  monthlyValue: number;
  startDate: string;
  endDate: string;
  description: string;
};

export type Transaction = {
  id: string;
  type: TransactionType;
  category: ExpenseCategory | string;
  amount: number;
  date: string;
  description: string;
  companyId: string;
  employeeId?: string;
  contractId?: string;
  createdBy: string;
  createdAt: string;
};

export type AppData = {
  companies: Company[];
  clients: Client[];
  employees: Employee[];
  contracts: Contract[];
  transactions: Transaction[];
};
