
import React from 'react';
import { 
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Cell, PieChart, Pie, Legend
} from 'recharts';
import { AppData, TransactionType } from '../types';

interface DashboardProps {
  data: AppData;
}

const Dashboard: React.FC<DashboardProps> = ({ data }) => {
  const totalRevenue = data.transactions
    .filter(t => t.type === TransactionType.REVENUE)
    .reduce((acc, curr) => acc + curr.amount, 0);
  
  const contractRevenue = data.contracts
    .reduce((acc, curr) => acc + curr.monthlyValue, 0);

  const totalExpense = data.transactions
    .filter(t => t.type === TransactionType.EXPENSE)
    .reduce((acc, curr) => acc + curr.amount, 0);

  const profit = totalRevenue + contractRevenue - totalExpense;

  const expenseByCategory = data.transactions
    .filter(t => t.type === TransactionType.EXPENSE)
    .reduce((acc, curr) => {
      const existing = acc.find(item => item.name === curr.category);
      if (existing) {
        existing.value += curr.amount;
      } else {
        acc.push({ name: curr.category, value: curr.amount });
      }
      return acc;
    }, [] as { name: string; value: number }[]);

  const companyComparison = data.companies.map(company => {
    const rev = data.transactions
      .filter(t => t.companyId === company.id && t.type === TransactionType.REVENUE)
      .reduce((acc, curr) => acc + curr.amount, 0) +
      data.contracts
      .filter(c => c.companyId === company.id)
      .reduce((acc, curr) => acc + curr.monthlyValue, 0);

    const exp = data.transactions
      .filter(t => t.companyId === company.id && t.type === TransactionType.EXPENSE)
      .reduce((acc, curr) => acc + curr.amount, 0);

    return {
      name: company.name.split(' ').pop(),
      Receita: rev,
      Despesa: exp,
    };
  });

  // Paleta Baião: Teal, Dark Graphite, Slate, Light Gray
  const COLORS = ['#1ba198', '#2c3338', '#64748b', '#94a3b8', '#cbd5e1', '#f1f5f9'];

  return (
    <div className="space-y-8">
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-100 relative overflow-hidden group">
          <div className="absolute top-0 right-0 p-4 opacity-10 group-hover:scale-125 transition-transform">
            <i className="fas fa-file-contract text-4xl text-[#1ba198]"></i>
          </div>
          <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1">Recorrência Mensal</p>
          <p className="text-3xl font-black text-[#2c3338]">R$ {contractRevenue.toLocaleString()}</p>
          <div className="mt-3 text-[10px] font-black text-[#1ba198] bg-[#1ba198]/10 inline-block px-2 py-1 rounded">
            CONTRATOS ATIVOS
          </div>
        </div>
        
        <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-100 group">
          <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1">Receitas Avulsas</p>
          <p className="text-3xl font-black text-[#2c3338]">R$ {totalRevenue.toLocaleString()}</p>
          <div className="mt-3 text-[10px] font-black text-blue-500 bg-blue-50 inline-block px-2 py-1 rounded uppercase">
            Consultorias Extra
          </div>
        </div>

        <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-100">
          <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1">Custo Operacional</p>
          <p className="text-3xl font-black text-red-500">R$ {totalExpense.toLocaleString()}</p>
          <div className="mt-3 text-[10px] font-black text-red-500 bg-red-50 inline-block px-2 py-1 rounded uppercase">
            Viagens e Diárias
          </div>
        </div>

        <div className={`p-6 rounded-2xl shadow-lg transition shadow-${profit >= 0 ? '[#1ba198]' : 'red'}/20 bg-[#2c3338] text-white`}>
          <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1">Resultado Líquido</p>
          <p className={`text-3xl font-black ${profit >= 0 ? 'text-[#1ba198]' : 'text-red-400'}`}>
            R$ {profit.toLocaleString()}
          </p>
          <div className="mt-3 text-[10px] font-black text-slate-400 uppercase">Margem Consolidada</div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        <div className="bg-white p-8 rounded-2xl shadow-sm border border-slate-100">
          <h3 className="text-lg font-black text-[#2c3338] mb-8 uppercase tracking-widest border-l-4 border-[#1ba198] pl-4">Performance por Empresa</h3>
          <div className="h-80">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={companyComparison}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{fill: '#94a3b8', fontSize: 10, fontWeight: 900}} />
                <YAxis axisLine={false} tickLine={false} tick={{fill: '#94a3b8', fontSize: 10}} />
                <Tooltip cursor={{fill: '#f8fafc'}} contentStyle={{borderRadius: '12px', border: 'none', boxShadow: '0 10px 15px -3px rgba(0,0,0,0.1)'}} />
                <Legend iconType="circle" />
                <Bar dataKey="Receita" fill="#1ba198" radius={[6, 6, 0, 0]} barSize={20} />
                <Bar dataKey="Despesa" fill="#2c3338" radius={[6, 6, 0, 0]} barSize={20} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        <div className="bg-white p-8 rounded-2xl shadow-sm border border-slate-100">
          <h3 className="text-lg font-black text-[#2c3338] mb-8 uppercase tracking-widest border-l-4 border-[#1ba198] pl-4">Composição de Gastos</h3>
          <div className="h-80">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={expenseByCategory}
                  cx="50%"
                  cy="40%"
                  innerRadius={70}
                  outerRadius={100}
                  paddingAngle={8}
                  dataKey="value"
                >
                  {expenseByCategory.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip contentStyle={{borderRadius: '12px', border: 'none', boxShadow: '0 10px 15px -3px rgba(0,0,0,0.1)'}} />
                <Legend layout="horizontal" verticalAlign="bottom" align="center" iconType="circle" />
              </PieChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;
