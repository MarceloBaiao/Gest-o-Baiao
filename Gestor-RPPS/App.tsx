
import React, { useState, useEffect } from 'react';
import { AppData, Transaction, Client, Contract, Employee, TransactionType } from './types';
import { INITIAL_DATA } from './constants';
import Dashboard from './components/Dashboard';
import TransactionForm from './components/TransactionForm';
import Reports from './components/Reports';
import { getFinancialInsights } from './services/geminiService';

const STORAGE_KEY = 'baiao_gestor_v1';

const App: React.FC = () => {
  const [data, setData] = useState<AppData>(() => {
    const saved = localStorage.getItem(STORAGE_KEY);
    return saved ? JSON.parse(saved) : INITIAL_DATA;
  });

  const [currentUser, setCurrentUser] = useState<Employee | null>(null);
  const [activeCompanyId, setActiveCompanyId] = useState<string>('all');
  const [activeTab, setActiveTab] = useState<'dashboard' | 'transactions' | 'clients' | 'contracts' | 'employees' | 'reports'>('dashboard');
  const [aiInsight, setAiInsight] = useState<string | null>(null);
  const [isAiLoading, setIsAiLoading] = useState(false);
  const [showModal, setShowModal] = useState<'client' | 'contract' | 'employee' | 'sync' | null>(null);
  const [isSaving, setIsSaving] = useState(false);
  const [importData, setImportData] = useState('');

  useEffect(() => {
    setIsSaving(true);
    localStorage.setItem(STORAGE_KEY, JSON.stringify(data));
    const timer = setTimeout(() => setIsSaving(false), 800);
    return () => clearTimeout(timer);
  }, [data]);

  const handleAddTransaction = (newTx: Transaction) => {
    const txWithAudit: Transaction = {
      ...newTx,
      createdBy: currentUser?.id || 'system',
      createdAt: new Date().toISOString(),
      companyId: activeCompanyId === 'all' ? newTx.companyId : activeCompanyId
    };
    setData(prev => ({ ...prev, transactions: [txWithAudit, ...prev.transactions] }));
  };

  const handleAddClient = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const formData = new FormData(e.currentTarget);
    const newClient: Client = {
      id: Math.random().toString(36).substr(2, 9),
      name: formData.get('name') as string,
      city: formData.get('city') as string,
    };
    setData(prev => ({ ...prev, clients: [...prev.clients, newClient] }));
    setShowModal(null);
  };

  const handleAddContract = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const formData = new FormData(e.currentTarget);
    const newContract: Contract = {
      id: Math.random().toString(36).substr(2, 9),
      clientId: formData.get('clientId') as string,
      companyId: formData.get('companyId') as string,
      monthlyValue: Number(formData.get('monthlyValue')),
      startDate: formData.get('startDate') as string,
      endDate: formData.get('endDate') as string,
      description: formData.get('description') as string,
    };
    setData(prev => ({ ...prev, contracts: [...prev.contracts, newContract] }));
    setShowModal(null);
  };

  const handleFetchAiInsight = async () => {
    setIsAiLoading(true);
    const insight = await getFinancialInsights(data);
    setAiInsight(insight);
    setIsAiLoading(false);
  };

  if (!currentUser) {
    return (
      <div className="min-h-screen bg-[#2c3338] flex items-center justify-center p-6">
        <div className="bg-white w-full max-w-md rounded-[40px] shadow-2xl p-12 text-center">
          <div className="flex justify-center mb-8">
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 bg-[#1ba198] rounded-2xl flex items-center justify-center text-white text-3xl font-black">B</div>
              <div className="text-left leading-none">
                <span className="text-[#2c3338] text-3xl font-black tracking-tighter block">BAIAO</span>
                <span className="text-[#1ba198] text-[10px] font-black uppercase tracking-[0.3em]">HUB GESTÃO</span>
              </div>
            </div>
          </div>
          <h2 className="text-xl font-black text-[#2c3338] mb-10 uppercase tracking-tight">Identifique-se para entrar</h2>
          <div className="space-y-3">
            {data.employees.map(emp => (
              <button key={emp.id} onClick={() => setCurrentUser(emp)} className="w-full p-5 border border-slate-100 rounded-2xl flex items-center gap-4 hover:border-[#1ba198] hover:bg-slate-50 transition-all group">
                <div className="w-10 h-10 bg-slate-100 rounded-xl flex items-center justify-center font-black text-[#1ba198] group-hover:bg-[#1ba198] group-hover:text-white">{emp.name.charAt(0)}</div>
                <div className="text-left">
                  <p className="font-black text-[#2c3338] text-sm">{emp.name}</p>
                  <p className="text-[10px] font-bold text-slate-400 uppercase">{emp.role}</p>
                </div>
                <i className="fas fa-chevron-right ml-auto text-slate-200"></i>
              </button>
            ))}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex flex-col md:flex-row font-sans text-[#2c3338] bg-[#f8fafc]">
      <aside className="w-full md:w-72 bg-[#2c3338] text-white flex flex-col shadow-2xl z-10">
        <div className="p-8 border-b border-slate-700">
           <div className="bg-white p-4 rounded-2xl mb-4 w-full flex items-center justify-center min-h-[70px]">
             <div className="flex items-center gap-2">
               <div className="w-8 h-8 bg-[#1ba198] rounded-lg flex items-center justify-center text-white text-xl font-black">B</div>
               <div className="flex flex-col leading-none">
                 <span className="text-[#2c3338] text-xl font-black tracking-tighter">BAIAO</span>
                 <span className="text-[#1ba198] text-[8px] font-black uppercase tracking-[0.2em]">GRUPO</span>
               </div>
             </div>
           </div>
           <div className="flex items-center gap-2 px-3 py-1.5 bg-slate-800 rounded-full border border-slate-700">
             <div className={`w-2 h-2 rounded-full ${isSaving ? 'bg-yellow-400 animate-pulse' : 'bg-green-500'}`}></div>
             <span className="text-[8px] font-black uppercase text-slate-400">{isSaving ? 'Gravando...' : 'Sistema Ativo'}</span>
           </div>
        </div>
        
        <nav className="flex-1 p-4 space-y-1">
          {[
            { id: 'dashboard', icon: 'fa-th-large', label: 'Painel Geral' },
            { id: 'transactions', icon: 'fa-exchange-alt', label: 'Lançamentos' },
            { id: 'clients', icon: 'fa-landmark', label: 'Cidades/RPPS' },
            { id: 'contracts', icon: 'fa-file-contract', label: 'Contratos' },
            { id: 'employees', icon: 'fa-users', label: 'Equipe' },
            { id: 'reports', icon: 'fa-print', label: 'Relatórios' },
          ].map((item) => (
            <button key={item.id} onClick={() => setActiveTab(item.id as any)} className={`w-full text-left px-4 py-3 rounded-xl flex items-center transition-all ${activeTab === item.id ? 'bg-[#1ba198] text-white shadow-lg' : 'text-slate-400 hover:bg-slate-800 hover:text-white'}`}>
              <i className={`fas ${item.icon} w-6 mr-3 text-lg`}></i>
              <span className="font-bold text-xs uppercase tracking-wider">{item.label}</span>
            </button>
          ))}
        </nav>

        <div className="p-6 border-t border-slate-700">
          <button onClick={handleFetchAiInsight} disabled={isAiLoading} className="w-full bg-[#1ba198] text-white text-[10px] font-black py-4 rounded-xl flex items-center justify-center mb-4 transition disabled:opacity-50">
            <i className={`fas ${isAiLoading ? 'fa-spinner fa-spin' : 'fa-robot'} mr-2`}></i> CONSULTORIA IA
          </button>
          <button onClick={() => setCurrentUser(null)} className="w-full text-[10px] font-black uppercase text-red-400">Sair</button>
        </div>
      </aside>

      <main className="flex-1 p-4 md:p-10 overflow-y-auto">
        <header className="mb-10 flex flex-col lg:flex-row lg:items-center justify-between gap-6">
          <div className="flex items-center gap-6">
            <h2 className="text-2xl font-black text-[#2c3338] uppercase tracking-tight">
               {activeTab === 'dashboard' && 'Panorama Consolidado'}
               {activeTab === 'transactions' && 'Fluxo de Caixa'}
               {activeTab === 'clients' && 'Cidades e Municípios'}
               {activeTab === 'contracts' && 'Contratos e Vigência'}
               {activeTab === 'reports' && 'Relatórios e Auditoria'}
            </h2>
            <div className="h-10 w-px bg-slate-200 hidden lg:block"></div>
            <select value={activeCompanyId} onChange={(e) => setActiveCompanyId(e.target.value)} className="bg-white border border-slate-200 rounded-xl px-4 py-2 font-bold text-xs">
              <option value="all">TODAS AS 4 EMPRESAS</option>
              {data.companies.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
            </select>
          </div>
        </header>

        {aiInsight && (
          <div className="mb-8 bg-[#2c3338] text-white p-8 rounded-3xl shadow-2xl relative border-b-8 border-[#1ba198]">
            <button onClick={() => setAiInsight(null)} className="absolute top-6 right-6 text-slate-500 hover:text-white transition"><i className="fas fa-times"></i></button>
            <div className="flex items-start gap-6">
              <div className="bg-[#1ba198] p-4 rounded-2xl"><i className="fas fa-lightbulb text-2xl"></i></div>
              <div className="flex-1"><h4 className="font-black text-xs uppercase text-[#1ba198] mb-2">Análise Estratégica</h4><p className="text-slate-300 font-medium">{aiInsight}</p></div>
            </div>
          </div>
        )}

        <div className="space-y-10">
          {activeTab === 'dashboard' && <Dashboard data={activeCompanyId === 'all' ? data : { ...data, transactions: data.transactions.filter(t => t.companyId === activeCompanyId) }} />}
          {activeTab === 'transactions' && (
             <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
               <div className="lg:col-span-1"><TransactionForm data={data} onSave={handleAddTransaction} /></div>
               <div className="lg:col-span-2">
                  <div className="bg-white rounded-3xl shadow-sm border border-slate-100 overflow-hidden">
                    <div className="p-6 border-b bg-slate-50/50"><h3 className="font-black text-xs uppercase text-[#2c3338]">Histórico de Gastos e Receitas</h3></div>
                    <div className="overflow-x-auto">
                      <table className="w-full text-left">
                        <thead className="bg-slate-50 text-[10px] font-black text-slate-400 uppercase">
                          <tr><th className="px-6 py-4">Data</th><th className="px-6 py-4">Usuário</th><th className="px-6 py-4">Descrição</th><th className="px-6 py-4 text-right">Valor</th></tr>
                        </thead>
                        <tbody className="divide-y divide-slate-100">
                          {data.transactions.filter(t => activeCompanyId === 'all' || t.companyId === activeCompanyId).map(tx => (
                            <tr key={tx.id} className="hover:bg-slate-50 transition">
                              <td className="px-6 py-4 text-xs font-bold text-slate-600">{new Date(tx.date).toLocaleDateString()}</td>
                              <td className="px-6 py-4"><span className="text-[9px] font-black bg-[#1ba198]/10 text-[#1ba198] px-2 py-1 rounded">{data.employees.find(e => e.id === tx.createdBy)?.name || 'SISTEMA'}</span></td>
                              <td className="px-6 py-4"><p className="text-sm font-bold text-[#2c3338]">{tx.description}</p><p className="text-[9px] text-slate-400 font-black uppercase">{tx.category}</p></td>
                              <td className={`px-6 py-4 text-sm text-right font-black ${tx.type === 'REVENUE' ? 'text-green-500' : 'text-red-500'}`}>R$ {tx.amount.toLocaleString(undefined, { minimumFractionDigits: 2 })}</td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  </div>
               </div>
             </div>
          )}
          {activeTab === 'clients' && (
            <div className="bg-white p-8 rounded-3xl shadow-sm border border-slate-100">
               <div className="flex justify-between items-center mb-8"><h3 className="font-black text-lg uppercase tracking-widest">Cadastro de Cidades</h3><button onClick={() => setShowModal('client')} className="bg-[#1ba198] text-white px-6 py-3 rounded-xl text-xs font-black shadow-lg">Novo Município</button></div>
               <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                 {data.clients.map(c => (
                   <div key={c.id} className="p-6 border border-slate-100 rounded-2xl bg-slate-50/50 flex flex-col items-center text-center">
                     <i className="fas fa-city text-2xl text-[#1ba198] mb-4"></i>
                     <h4 className="font-black text-[#2c3338] mb-1">{c.name}</h4>
                     <p className="text-[10px] font-bold text-slate-400 uppercase">{c.city}</p>
                   </div>
                 ))}
               </div>
            </div>
          )}
          {activeTab === 'contracts' && (
            <div className="bg-white p-8 rounded-3xl shadow-sm border border-slate-100">
               <div className="flex justify-between items-center mb-8"><h3 className="font-black text-lg uppercase tracking-widest">Contratos Recorrentes</h3><button onClick={() => setShowModal('contract')} className="bg-[#1ba198] text-white px-6 py-3 rounded-xl text-xs font-black shadow-lg">Adicionar Contrato</button></div>
               <div className="space-y-4">
                 {data.contracts.map(c => (
                   <div key={c.id} className="flex items-center justify-between p-6 border border-slate-100 rounded-2xl hover:border-[#1ba198] transition">
                      <div className="flex-1">
                        <h5 className="font-black text-[#2c3338]">{data.clients.find(cli => cli.id === c.clientId)?.name}</h5>
                        <p className="text-xs text-slate-400 font-bold uppercase">{c.description}</p>
                      </div>
                      <div className="text-right px-10"><p className="text-[9px] font-black text-slate-400 uppercase">Valor Mensal</p><p className="font-black text-[#1ba198]">R$ {c.monthlyValue.toLocaleString()}</p></div>
                      <div className="text-right"><span className="px-3 py-1 bg-green-50 text-green-600 rounded-full text-[10px] font-black uppercase">Vigente até {new Date(c.endDate).toLocaleDateString()}</span></div>
                   </div>
                 ))}
               </div>
            </div>
          )}
          {activeTab === 'reports' && <Reports data={data} />}
        </div>
      </main>

      {/* MODAL DE CADASTRO */}
      {showModal === 'client' && (
        <div className="fixed inset-0 bg-[#2c3338]/90 z-50 flex items-center justify-center p-4">
          <div className="bg-white w-full max-w-md rounded-3xl p-8">
            <h3 className="text-xl font-black mb-6 uppercase">Novo Município</h3>
            <form onSubmit={handleAddClient} className="space-y-4">
              <input name="name" placeholder="Nome da Prefeitura/RPPS" className="w-full p-4 bg-slate-50 border rounded-xl font-bold" required />
              <input name="city" placeholder="Cidade/UF" className="w-full p-4 bg-slate-50 border rounded-xl font-bold" required />
              <button type="submit" className="w-full bg-[#1ba198] text-white font-black py-4 rounded-xl shadow-lg">SALVAR MUNICÍPIO</button>
              <button type="button" onClick={() => setShowModal(null)} className="w-full text-slate-400 font-black text-xs">CANCELAR</button>
            </form>
          </div>
        </div>
      )}

      {showModal === 'contract' && (
        <div className="fixed inset-0 bg-[#2c3338]/90 z-50 flex items-center justify-center p-4">
          <div className="bg-white w-full max-w-lg rounded-3xl p-8">
            <h3 className="text-xl font-black mb-6 uppercase">Cadastrar Novo Contrato</h3>
            <form onSubmit={handleAddContract} className="space-y-4">
              <select name="clientId" className="w-full p-4 bg-slate-50 border rounded-xl font-bold" required>
                <option value="">Selecione o Cliente</option>
                {data.clients.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
              </select>
              <select name="companyId" className="w-full p-4 bg-slate-50 border rounded-xl font-bold" required>
                <option value="">Empresa Contratada</option>
                {data.companies.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
              </select>
              <input name="monthlyValue" type="number" placeholder="Valor Mensal (R$)" className="w-full p-4 bg-slate-50 border rounded-xl font-bold" required />
              <div className="grid grid-cols-2 gap-4">
                <input name="startDate" type="date" className="w-full p-4 bg-slate-50 border rounded-xl font-bold" required />
                <input name="endDate" type="date" className="w-full p-4 bg-slate-50 border rounded-xl font-bold" required />
              </div>
              <textarea name="description" placeholder="Descrição do Objeto" className="w-full p-4 bg-slate-50 border rounded-xl font-bold" rows={2} required />
              <button type="submit" className="w-full bg-[#1ba198] text-white font-black py-4 rounded-xl shadow-lg">SALVAR CONTRATO</button>
              <button type="button" onClick={() => setShowModal(null)} className="w-full text-slate-400 font-black text-xs">VOLTAR</button>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default App;
