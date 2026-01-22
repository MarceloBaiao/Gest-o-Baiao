
import React, { useState } from 'react';
import { AppData, TransactionType, ExpenseCategory, Transaction } from '../types';

interface TransactionFormProps {
  data: AppData;
  onSave: (transaction: Transaction) => void;
}

const TransactionForm: React.FC<TransactionFormProps> = ({ data, onSave }) => {
  const [formData, setFormData] = useState<Partial<Transaction>>({
    type: TransactionType.EXPENSE,
    category: ExpenseCategory.TRAVEL,
    amount: 0,
    date: new Date().toISOString().split('T')[0],
    description: '',
    companyId: data.companies[0]?.id || '',
    employeeId: '',
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.amount || !formData.companyId) return;

    onSave({
      ...formData,
      id: Math.random().toString(36).substr(2, 9),
    } as Transaction);

    setFormData({
      ...formData,
      amount: 0,
      description: '',
    });
  };

  return (
    <div className="bg-white p-8 rounded-2xl shadow-sm border border-slate-100">
      <h3 className="text-lg font-black text-[#2c3338] mb-6 uppercase tracking-widest border-l-4 border-[#1ba198] pl-4">Lançamento Rápido</h3>
      <form onSubmit={handleSubmit} className="space-y-5">
        <div className="space-y-4">
          <div>
            <label className="block text-[10px] font-black text-slate-400 uppercase mb-2 tracking-widest">Tipo de Fluxo</label>
            <div className="grid grid-cols-2 gap-2">
              <button
                type="button"
                onClick={() => setFormData({ ...formData, type: TransactionType.REVENUE })}
                className={`py-2 px-4 rounded-xl text-xs font-black uppercase tracking-tighter transition-all ${formData.type === TransactionType.REVENUE ? 'bg-green-500 text-white shadow-lg' : 'bg-slate-50 text-slate-400 hover:bg-slate-100'}`}
              >
                Receita
              </button>
              <button
                type="button"
                onClick={() => setFormData({ ...formData, type: TransactionType.EXPENSE })}
                className={`py-2 px-4 rounded-xl text-xs font-black uppercase tracking-tighter transition-all ${formData.type === TransactionType.EXPENSE ? 'bg-red-500 text-white shadow-lg' : 'bg-slate-50 text-slate-400 hover:bg-slate-100'}`}
              >
                Despesa
              </button>
            </div>
          </div>

          <div>
            <label className="block text-[10px] font-black text-slate-400 uppercase mb-2 tracking-widest">Empresa Origem/Destino</label>
            <select
              className="w-full p-3 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-[#1ba198] outline-none font-bold text-sm"
              value={formData.companyId}
              onChange={(e) => setFormData({ ...formData, companyId: e.target.value })}
            >
              {data.companies.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
            </select>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="col-span-2 md:col-span-1">
              <label className="block text-[10px] font-black text-slate-400 uppercase mb-2 tracking-widest">Categoria</label>
              {formData.type === TransactionType.EXPENSE ? (
                <select
                  className="w-full p-3 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-[#1ba198] outline-none font-bold text-sm"
                  value={formData.category}
                  onChange={(e) => setFormData({ ...formData, category: e.target.value })}
                >
                  {Object.values(ExpenseCategory).map(cat => <option key={cat} value={cat}>{cat}</option>)}
                </select>
              ) : (
                <input
                  type="text"
                  placeholder="Ex: Consultoria Extra"
                  className="w-full p-3 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-[#1ba198] outline-none font-bold text-sm"
                  value={formData.category}
                  onChange={(e) => setFormData({ ...formData, category: e.target.value })}
                />
              )}
            </div>

            <div className="col-span-2 md:col-span-1">
              <label className="block text-[10px] font-black text-slate-400 uppercase mb-2 tracking-widest">Valor (R$)</label>
              <input
                type="number"
                step="0.01"
                placeholder="0,00"
                className="w-full p-3 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-[#1ba198] outline-none font-black text-sm text-[#1ba198]"
                value={formData.amount || ''}
                onChange={(e) => setFormData({ ...formData, amount: parseFloat(e.target.value) })}
              />
            </div>
          </div>

          <div>
            <label className="block text-[10px] font-black text-slate-400 uppercase mb-2 tracking-widest">Colaborador Responsável</label>
            <select
              className="w-full p-3 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-[#1ba198] outline-none font-bold text-sm"
              value={formData.employeeId}
              onChange={(e) => setFormData({ ...formData, employeeId: e.target.value })}
            >
              <option value="">Geral / Sem Colaborador</option>
              {data.employees.map(e => <option key={e.id} value={e.id}>{e.name}</option>)}
            </select>
          </div>

          <div>
            <label className="block text-[10px] font-black text-slate-400 uppercase mb-2 tracking-widest">Breve Descritivo</label>
            <textarea
              className="w-full p-3 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-[#1ba198] outline-none font-medium text-sm"
              rows={2}
              value={formData.description}
              onChange={(e) => setFormData({ ...formData, description: e.target.value })}
              placeholder="Ex: Combustível para viagem ao município X..."
            />
          </div>
        </div>

        <button
          type="submit"
          className="w-full bg-[#1ba198] hover:bg-[#15857d] text-white font-black py-4 rounded-xl transition-all shadow-lg active:scale-95 uppercase tracking-widest text-sm"
        >
          Confirmar Lançamento
        </button>
      </form>
    </div>
  );
};

export default TransactionForm;