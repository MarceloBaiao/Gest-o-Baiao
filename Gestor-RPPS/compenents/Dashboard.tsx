
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

  const COLORS = ['#1ba198', '#2c3338', '#64748b', '#94a3b8', '#cbd5e1', '#f1f5f9'];

  return (
    <div className="space-y-8">
      {/* KPI Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <div className="bg-white p-8 rounded-[32px] shadow-sm border border-slate-100 relative overflow-hidden group hover:shadow-xl transition-shadow">
          <div className="absolute top-0 right-0 p-6 opacity-5 group-hover:scale-110 transition-transform">
            <i className="fas fa-file-contract text-5xl text-[#1ba198]"></i>
          </div>
          <p className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] mb-2">Recorrência Mensal</p>
          <p className="text-3xl font-black text-[#2c3338] tracking-tighter">R$ {contractRevenue.toLocaleString()}</p>
          <div className="mt-4 flex items-center gap-2">
            <span className="text-[9px] font-black text-[#1ba198] bg-[#1ba198]/10 px-2 py-1 rounded uppercase">Fluxo Garantido</span>
          </div>
        </div>
        
        <div className="bg-white p-8 rounded-[32px] shadow-sm border border-slate-100 group hover:shadow-xl transition-shadow">
          <p className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] mb-2">Entradas Extras</p>
          <p className="text-3xl font-black text-[#2c3338] tracking-tighter">R$ {totalRevenue.toLocaleString()}</p>
          <div className="mt-4 flex items-center gap-2">
            <span className="text-[9px] font-black text-blue-500 bg-blue-50 px-2 py-1 rounded uppercase">Lançamentos Avulsos</span>
          </div>
        </div>

        <div className="bg-white p-8 rounded-[32px] shadow-sm border border-slate-100 hover:shadow-xl transition-shadow">
          <p className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] mb-2">Despesa Total</p>
          <p className="text-3xl font-black text-red-500 tracking-tighter">R$ {totalExpense.toLocaleString()}</p>
          <div className="mt-4 flex items-center gap-2">
            <span className="text-[9px] font-black text-red-500 bg-red-50 px-2 py-1 rounded uppercase">Custos Operacionais</span>
          </div>
        </div>

        <div className={`p-8 rounded-[32px] shadow-2xl transition-all ${profit >= 0 ? 'bg-[#2c3338] shadow-[#1ba198]/20' : 'bg-red-900 shadow-red-500/20'} text-white`}>
          <p className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] mb-2">Saldo Consolidado</p>
          <p className={`text-3xl font-black tracking-tighter ${profit >= 0 ? 'text-[#1ba198]' : 'text-red-300'}`}>
            R$ {profit.toLocaleString()}
          </p>
          <div className="mt-4 flex items-center gap-2">
            <span className="text-[9px] font-black text-white/20 uppercase">4 Empresas em análise</span>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        {/* Gráfico Barras */}
        <div className="lg:col-span-7 bg-white p-10 rounded-[40px] shadow-sm border border-slate-100">
          <div className="flex justify-between items-center mb-10">
            <h3 className="text-sm font-black text-[#2c3338] uppercase tracking-widest border-l-4 border-[#1ba198] pl-4">Receita vs Despesa por Unidade</h3>
          </div>
          <div className="h-80">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={companyComparison} margin={{top: 0, right: 0, left: -20, bottom: 0}}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{fill: '#94a3b8', fontSize: 10, fontWeight: 900}} />
                <YAxis axisLine={false} tickLine={false} tick={{fill: '#94a3b8', fontSize: 10}} />
                <Tooltip cursor={{fill: '#f8fafc'}} contentStyle={{borderRadius: '24px', border: 'none', boxShadow: '0 20px 25px -5px rgba(0,0,0,0.1)', padding: '15px'}} />
                <Legend iconType="circle" wrapperStyle={{paddingTop: '20px', fontSize: '10px', fontWeight: 'bold'}} />
                <Bar dataKey="Receita" fill="#1ba198" radius={[10, 10, 0, 0]} barSize={24} />
                <Bar dataKey="Despesa" fill="#2c3338" radius={[10, 10, 0, 0]} barSize={24} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Gráfico Pizza */}
        <div className="lg:col-span-5 bg-white p-10 rounded-[40px] shadow-sm border border-slate-100">
          <h3 className="text-sm font-black text-[#2c3338] mb-10 uppercase tracking-widest border-l-4 border-[#1ba198] pl-4">Perfil de Gastos</h3>
          <div className="h-80">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={expenseByCategory}
                  cx="50%"
                  cy="45%"
                  innerRadius={70}
                  outerRadius={100}
                  paddingAngle={8}
                  dataKey="value"
                  animationBegin={0}
                  animationDuration={800}
                >
                  {expenseByCategory.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip contentStyle={{borderRadius: '24px', border: 'none', boxShadow: '0 20px 25px -5px rgba(0,0,0,0.1)', fontSize: '12px'}} />
                <Legend layout="horizontal" verticalAlign="bottom" align="center" iconType="circle" wrapperStyle={{fontSize: '10px', fontWeight: 'black', textTransform: 'uppercase'}} />
              </PieChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;
