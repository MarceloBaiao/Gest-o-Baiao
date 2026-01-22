
import React, { useState } from 'react';
import { AppData, TransactionType, ExpenseCategory } from '../types';

interface ReportsProps {
  data: AppData;
}

const Reports: React.FC<ReportsProps> = ({ data }) => {
  const [selectedCompany, setSelectedCompany] = useState<string>('all');
  const [reportType, setReportType] = useState<'financial' | 'contracts' | 'employees' | 'fleet'>('financial');

  const filteredTransactions = selectedCompany === 'all' 
    ? data.transactions 
    : data.transactions.filter(t => t.companyId === selectedCompany);

  const filteredContracts = selectedCompany === 'all' 
    ? data.contracts 
    : data.contracts.filter(c => c.companyId === selectedCompany);

  return (
    <div className="space-y-8 animate-fade-in">
      {/* Filtros de Topo */}
      <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-100 flex flex-wrap items-center justify-between gap-6">
        <div className="flex gap-4 items-center">
          <div>
            <label className="block text-[9px] font-black text-slate-400 uppercase mb-1 tracking-widest">Empresa Selecionada</label>
            <select 
              value={selectedCompany}
              onChange={(e) => setSelectedCompany(e.target.value)}
              className="bg-slate-50 border border-slate-200 rounded-xl px-4 py-2 font-bold text-sm outline-none focus:ring-2 focus:ring-[#1ba198]"
            >
              <option value="all">Consolidado (Todas)</option>
              {data.companies.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
            </select>
          </div>
        </div>
        
        <div className="flex gap-2">
          <button className="px-4 py-2 bg-slate-100 text-slate-600 rounded-xl text-xs font-bold hover:bg-slate-200 transition">
            <i className="fas fa-file-pdf mr-2 text-red-500"></i> PDF
          </button>
          <button className="px-4 py-2 bg-slate-100 text-slate-600 rounded-xl text-xs font-bold hover:bg-slate-200 transition">
            <i className="fas fa-file-excel mr-2 text-green-600"></i> EXCEL
          </button>
        </div>
      </div>

      {/* Menu de Tipos de Relatório */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {[
          { id: 'financial', icon: 'fa-file-invoice-dollar', label: 'Fluxo Financeiro' },
          { id: 'contracts', icon: 'fa-file-contract', label: 'Vigência Contratos' },
          { id: 'employees', icon: 'fa-user-tag', label: 'Gastos Equipe' },
          { id: 'fleet', icon: 'fa-car-mechanic', label: 'Manutenção Frota' },
        ].map(type => (
          <button
            key={type.id}
            onClick={() => setReportType(type.id as any)}
            className={`p-6 rounded-2xl border transition-all flex flex-col items-center text-center ${reportType === type.id ? 'bg-[#1ba198] border-[#1ba198] text-white shadow-xl shadow-[#1ba198]/20 translate-y-[-4px]' : 'bg-white border-slate-100 text-slate-400 hover:bg-slate-50'}`}
          >
            <i className={`fas ${type.icon} text-2xl mb-3`}></i>
            <span className="text-xs font-black uppercase tracking-wider">{type.label}</span>
          </button>
        ))}
      </div>

      {/* Área do Relatório */}
      <div className="bg-white rounded-3xl shadow-sm border border-slate-100 overflow-hidden">
        <div className="p-8 border-b border-slate-50 bg-slate-50/30 flex justify-between items-center">
          <div>
            <h4 className="font-black text-[#2c3338] uppercase tracking-widest text-lg">
              {reportType === 'financial' && 'Relatório de Movimentações Consolidado'}
              {reportType === 'contracts' && 'Mapa de Prazos e Vigência'}
              {reportType === 'employees' && 'Extrato de Reembolsos e Diárias'}
              {reportType === 'fleet' && 'Gestão de Manutenção de Veículos'}
            </h4>
            <p className="text-sm text-slate-500 font-medium">Dados atualizados em tempo real para as {selectedCompany === 'all' ? '4 empresas' : 'empresa selecionada'}.</p>
          </div>
          <i className="fas fa-print text-slate-200 text-4xl"></i>
        </div>

        <div className="p-8">
          {reportType === 'financial' && (
            <div className="overflow-x-auto">
              <table className="w-full text-left">
                <thead className="text-[10px] font-black text-slate-400 uppercase tracking-widest border-b border-slate-100">
                  <tr>
                    <th className="pb-4 px-2">Data</th>
                    <th className="pb-4 px-2">Empresa</th>
                    <th className="pb-4 px-2">Descrição</th>
                    <th className="pb-4 px-2">Categoria</th>
                    <th className="pb-4 px-2 text-right">Valor</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-50">
                  {filteredTransactions.map(tx => (
                    <tr key={tx.id} className="hover:bg-slate-50 transition group">
                      <td className="py-4 px-2 text-sm font-bold text-slate-600">{new Date(tx.date).toLocaleDateString()}</td>
                      <td className="py-4 px-2 text-xs font-black text-[#1ba198]">{data.companies.find(c => c.id === tx.companyId)?.name.split(' ').pop()}</td>
                      <td className="py-4 px-2 text-sm font-medium text-slate-500">{tx.description}</td>
                      <td className="py-4 px-2">
                        <span className="text-[9px] font-black px-2 py-1 bg-slate-100 rounded text-slate-400">{tx.category}</span>
                      </td>
                      <td className={`py-4 px-2 text-right font-black ${tx.type === 'REVENUE' ? 'text-green-500' : 'text-red-500'}`}>
                        R$ {tx.amount.toLocaleString(undefined, { minimumFractionDigits: 2 })}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}

          {reportType === 'contracts' && (
            <div className="space-y-4">
               {filteredContracts.map(c => {
                 const client = data.clients.find(cli => cli.id === c.clientId);
                 const endDate = new Date(c.endDate);
                 const today = new Date();
                 const diffDays = Math.ceil((endDate.getTime() - today.getTime()) / (1000 * 60 * 60 * 24));
                 
                 return (
                   <div key={c.id} className="flex items-center justify-between p-6 border border-slate-100 rounded-2xl hover:border-[#1ba198] transition">
                      <div className="flex-1">
                        <h5 className="font-black text-[#2c3338]">{client?.name}</h5>
                        <p className="text-xs text-slate-400 font-bold uppercase">{c.description}</p>
                      </div>
                      <div className="text-right px-10">
                        <p className="text-[9px] font-black text-slate-400 uppercase">Faturamento</p>
                        <p className="font-black text-[#1ba198]">R$ {c.monthlyValue.toLocaleString()}</p>
                      </div>
                      <div className="text-right">
                        <span className={`px-3 py-1 rounded-full text-[10px] font-black uppercase ${diffDays < 90 ? 'bg-red-50 text-red-500' : 'bg-green-50 text-green-600'}`}>
                          {diffDays} dias para vencer
                        </span>
                      </div>
                   </div>
                 );
               })}
            </div>
          )}

          {reportType === 'employees' && (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {data.employees.map(e => {
                const expenses = data.transactions.filter(t => t.employeeId === e.id && t.type === TransactionType.EXPENSE);
                const total = expenses.reduce((acc, curr) => acc + curr.amount, 0);
                return (
                  <div key={e.id} className="p-6 bg-slate-50 rounded-2xl border border-slate-100 flex justify-between items-center">
                    <div>
                      <h5 className="font-black text-[#2c3338]">{e.name}</h5>
                      <p className="text-xs text-[#1ba198] font-bold uppercase">{e.role}</p>
                      <p className="text-[10px] text-slate-400 mt-2 font-black uppercase">{expenses.length} lançamentos de despesas</p>
                    </div>
                    <div className="text-right">
                      <p className="text-[9px] font-black text-slate-400 uppercase">Total Reembolsos</p>
                      <p className="text-xl font-black text-red-500">R$ {total.toLocaleString()}</p>
                    </div>
                  </div>
                );
              })}
            </div>
          )}

          {reportType === 'fleet' && (
            <div className="flex flex-col items-center justify-center py-20 text-center space-y-4">
              <div className="w-20 h-20 bg-slate-50 text-slate-200 rounded-full flex items-center justify-center text-3xl">
                <i className="fas fa-car-crash"></i>
              </div>
              <div>
                <h5 className="font-black text-[#2c3338] uppercase tracking-widest">Aguardando mais dados de manutenção</h5>
                <p className="text-sm text-slate-400 font-medium">Lance despesas na categoria 'Manutenção Carro' para ver este relatório.</p>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default Reports;
