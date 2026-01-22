
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
  const [showModal, setShowModal] = useState<'client' | 'contract' | 'employee' | 'backup' | null>(null);
  const [isSaving, setIsSaving] = useState(false);

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

  const exportData = () => {
    const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `backup_financeiro_${new Date().toISOString().split('T')[0]}.json`;
    a.click();
  };

  const importData = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = (event) => {
      try {
        const imported = JSON.parse(event.target?.result as string);
        if (window.confirm('Isso substituirá todos os dados atuais. Deseja continuar?')) {
          setData(imported);
          setShowModal(null);
        }
      } catch (err) {
        alert('Erro ao importar arquivo.');
      }
    };
    reader.readAsText(file);
  };

  const handleFetchAiInsight = async () => {
    setIsAiLoading(true);
    const insight = await getFinancialInsights(data);
    setAiInsight(insight);
    setIsAiLoading(false);
  };

  if (!currentUser) {
    return (
      <div className="min-h-screen bg-[#1a1f24] flex items-center justify-center p-6 font-sans">
        <div className="bg-white w-full max-w-md rounded-[40px] shadow-2xl p-12 text-center border-b-8 border-[#1ba198]">
          <div className="flex justify-center mb-8">
            <div className="flex items-center gap-3">
              <div className="w-14 h-14 bg-[#1ba198] rounded-2xl flex items-center justify-center text-white text-4xl font-black shadow-lg shadow-[#1ba198]/30">B</div>
              <div className="text-left leading-none">
                <span className="text-[#2c3338] text-3xl font-black tracking-tighter block">BAIAO</span>
                <span className="text-[#1ba198] text-[10px] font-black uppercase tracking-[0.3em]">HUB FINANCEIRO</span>
              </div>
            </div>
          </div>
          <h2 className="text-xl font-black text-[#2c3338] mb-10 uppercase tracking-tight">Acesso ao Sistema</h2>
          <div className="space-y-3">
            {data.employees.map(emp => (
              <button key={emp.id} onClick={() => setCurrentUser(emp)} className="w-full p-5 border border-slate-100 rounded-2xl flex items-center gap-4 hover:border-[#1ba198] hover:bg-slate-50 transition-all group active:scale-95">
                <div className="w-10 h-10 bg-slate-100 rounded-xl flex items-center justify-center font-black text-[#1ba198] group-hover:bg-[#1ba198] group-hover:text-white transition-colors">{emp.name.charAt(0)}</div>
                <div className="text-left">
                  <p className="font-black text-[#2c3338] text-sm">{emp.name}</p>
                  <p className="text-[10px] font-bold text-slate-400 uppercase">{emp.role}</p>
                </div>
                <i className="fas fa-chevron-right ml-auto text-slate-200 group-hover:text-[#1ba198]"></i>
              </button>
            ))}
          </div>
          <p className="mt-8 text-[10px] text-slate-400 font-bold uppercase tracking-widest">4 Empresas • 1 Gestão Consolidada</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex flex-col md:flex-row font-sans text-[#2c3338] bg-[#f8fafc]">
      {/* SIDEBAR */}
      <aside className="w-full md:w-72 bg-[#2c3338] text-white flex flex-col shadow-2xl z-20">
        <div className="p-8 border-b border-slate-700">
           <div className="bg-white p-4 rounded-2xl mb-4 w-full flex items-center justify-center min-h-[70px] shadow-inner">
             <div className="flex items-center gap-2">
               <div className="w-8 h-8 bg-[#1ba198] rounded-lg flex items-center justify-center text-white text-xl font-black">B</div>
               <div className="flex flex-col leading-none">
                 <span className="text-[#2c3338] text-xl font-black tracking-tighter">BAIAO</span>
                 <span className="text-[#1ba198] text-[8px] font-black uppercase tracking-[0.2em]">GRUPO</span>
               </div>
             </div>
           </div>
           <div className="flex items-center gap-2 px-3 py-2 bg-slate-800/50 rounded-full border border-slate-700">
             <div className={`w-2 h-2 rounded-full ${isSaving ? 'bg-yellow-400 animate-pulse' : 'bg-green-500'}`}></div>
             <span className="text-[9px] font-black uppercase text-slate-300">{isSaving ? 'Gravando dados...' : 'Localmente Ativo'}</span>
           </div>
        </div>
        
        <nav className="flex-1 p-4 space-y-1">
          {[
            { id: 'dashboard', icon: 'fa-chart-pie', label: 'Panorama' },
            { id: 'transactions', icon: 'fa-cash-register', label: 'Fluxo de Caixa' },
            { id: 'clients', icon: 'fa-building-columns', label: 'Municípios' },
            { id: 'contracts', icon: 'fa-file-signature', label: 'Contratos' },
            { id: 'reports', icon: 'fa-print', label: 'Relatórios' },
          ].map((item) => (
            <button key={item.id} onClick={() => setActiveTab(item.id as any)} className={`w-full text-left px-4 py-3.5 rounded-xl flex items-center transition-all ${activeTab === item.id ? 'bg-[#1ba198] text-white shadow-lg shadow-[#1ba198]/20' : 'text-slate-400 hover:bg-slate-800 hover:text-white'}`}>
              <i className={`fas ${item.icon} w-6 mr-3 text-lg`}></i>
              <span className="font-black text-[11px] uppercase tracking-wider">{item.label}</span>
            </button>
          ))}
        </nav>

        <div className="p-6 border-t border-slate-700 space-y-3">
          <button onClick={handleFetchAiInsight} disabled={isAiLoading} className="w-full bg-[#1ba198] hover:bg-[#15857d] text-white text-[10px] font-black py-4 rounded-xl flex items-center justify-center transition disabled:opacity-50 active:scale-95 shadow-lg">
            <i className={`fas ${isAiLoading ? 'fa-spinner fa-spin' : 'fa-robot'} mr-2`}></i> ANALISTA IA
          </button>
          <div className="grid grid-cols-2 gap-2">
            <button onClick={() => setShowModal('backup')} className="bg-slate-800 hover:bg-slate-700 text-slate-300 text-[9px] font-black py-3 rounded-lg flex items-center justify-center transition">
              <i className="fas fa-save mr-2"></i> BACKUP
            </button>
            <button onClick={() => setCurrentUser(null)} className="bg-red-900/20 hover:bg-red-900/40 text-red-400 text-[9px] font-black py-3 rounded-lg flex items-center justify-center transition">
              <i className="fas fa-sign-out-alt mr-2"></i> SAIR
            </button>
          </div>
        </div>
      </aside>

      {/* CONTEÚDO PRINCIPAL */}
      <main className="flex-1 p-6 md:p-10 overflow-y-auto">
        <header className="mb-10 flex flex-col lg:flex-row lg:items-center justify-between gap-6">
          <div className="flex items-center gap-6">
            <div>
               <h2 className="text-3xl font-black text-[#2c3338] uppercase tracking-tighter leading-none">
                 {activeTab === 'dashboard' && 'Dashboard Consolidado'}
                 {activeTab === 'transactions' && 'Movimentações'}
                 {activeTab === 'clients' && 'Gestão de Municípios'}
                 {activeTab === 'contracts' && 'Gestão de Contratos'}
                 {activeTab === 'reports' && 'Auditoria e Relatórios'}
               </h2>
               <p className="text-slate-400 text-xs font-bold mt-2 uppercase tracking-widest">
                 {currentUser.name} • {currentUser.role}
               </p>
            </div>
            <div className="h-10 w-px bg-slate-200 hidden lg:block"></div>
            <div className="flex flex-col">
              <span className="text-[9px] font-black text-slate-400 uppercase mb-1">Visão da Empresa</span>
              <select value={activeCompanyId} onChange={(e) => setActiveCompanyId(e.target.value)} className="bg-white border border-slate-200 rounded-xl px-4 py-2 font-black text-xs text-[#1ba198] focus:ring-2 focus:ring-[#1ba198] outline-none shadow-sm cursor-pointer">
                <option value="all">TODAS AS 4 EMPRESAS</option>
                {data.companies.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
              </select>
            </div>
          </div>
        </header>

        {aiInsight && (
          <div className="mb-10 bg-[#2c3338] text-white p-8 rounded-[32px] shadow-2xl relative border-b-8 border-[#1ba198] animate-in fade-in slide-in-from-top-4 duration-500">
            <button onClick={() => setAiInsight(null)} className="absolute top-6 right-6 w-8 h-8 flex items-center justify-center bg-white/10 rounded-full text-white hover:bg-white/20 transition"><i className="fas fa-times"></i></button>
            <div className="flex items-start gap-6">
              <div className="bg-[#1ba198] w-14 h-14 rounded-2xl flex items-center justify-center shadow-lg shadow-[#1ba198]/40"><i className="fas fa-brain text-2xl"></i></div>
              <div className="flex-1">
                <h4 className="font-black text-[10px] uppercase text-[#1ba198] mb-3 tracking-[0.2em]">Consultoria Estratégica via IA</h4>
                <div className="text-slate-200 font-medium leading-relaxed whitespace-pre-line text-sm">{aiInsight}</div>
              </div>
            </div>
          </div>
        )}

        <div className="space-y-10 pb-20">
          {activeTab === 'dashboard' && <Dashboard data={activeCompanyId === 'all' ? data : { ...data, transactions: data.transactions.filter(t => t.companyId === activeCompanyId) }} />}
          
          {activeTab === 'transactions' && (
             <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
               <div className="lg:col-span-4"><TransactionForm data={data} onSave={handleAddTransaction} /></div>
               <div className="lg:col-span-8">
                  <div className="bg-white rounded-[32px] shadow-sm border border-slate-100 overflow-hidden">
                    <div className="p-8 border-b bg-slate-50/50 flex justify-between items-center">
                      <h3 className="font-black text-xs uppercase text-[#2c3338] tracking-widest">Últimos Lançamentos</h3>
                      <span className="text-[10px] font-black text-slate-400">{data.transactions.length} registros</span>
                    </div>
                    <div className="overflow-x-auto">
                      <table className="w-full text-left">
                        <thead className="bg-slate-50 text-[10px] font-black text-slate-400 uppercase tracking-widest">
                          <tr><th className="px-8 py-4">Data</th><th className="px-8 py-4">Empresa</th><th className="px-8 py-4">Descrição</th><th className="px-8 py-4 text-right">Valor</th></tr>
                        </thead>
                        <tbody className="divide-y divide-slate-100">
                          {data.transactions.filter(t => activeCompanyId === 'all' || t.companyId === activeCompanyId).slice(0, 15).map(tx => (
                            <tr key={tx.id} className="hover:bg-slate-50/80 transition-colors group">
                              <td className="px-8 py-5 text-xs font-bold text-slate-600">{new Date(tx.date).toLocaleDateString()}</td>
                              <td className="px-8 py-5">
                                <span className="text-[9px] font-black bg-[#1ba198]/10 text-[#1ba198] px-2 py-1 rounded uppercase">
                                  {data.companies.find(c => c.id === tx.companyId)?.name.split(' ').pop()}
                                </span>
                              </td>
                              <td className="px-8 py-5">
                                <p className="text-sm font-black text-[#2c3338]">{tx.description}</p>
                                <div className="flex gap-2 mt-1">
                                  <span className="text-[9px] text-slate-400 font-bold uppercase">{tx.category}</span>
                                  <span className="text-[9px] text-slate-300 font-bold uppercase">• {data.employees.find(e => e.id === tx.createdBy)?.name || 'SISTEMA'}</span>
                                </div>
                              </td>
                              <td className={`px-8 py-5 text-sm text-right font-black ${tx.type === 'REVENUE' ? 'text-green-500' : 'text-red-500'}`}>
                                {tx.type === 'REVENUE' ? '+' : '-'} R$ {tx.amount.toLocaleString(undefined, { minimumFractionDigits: 2 })}
                              </td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                      {data.transactions.length === 0 && (
                        <div className="p-20 text-center text-slate-300">
                          <i className="fas fa-inbox text-4xl mb-4 block"></i>
                          <p className="font-black text-xs uppercase">Nenhum lançamento encontrado</p>
                        </div>
                      )}
                    </div>
                  </div>
               </div>
             </div>
          )}

          {activeTab === 'clients' && (
            <div className="bg-white p-10 rounded-[40px] shadow-sm border border-slate-100">
               <div className="flex flex-col md:flex-row justify-between items-center mb-10 gap-4">
                 <div>
                    <h3 className="font-black text-2xl text-[#2c3338] uppercase tracking-tighter">Cidades de Atuação</h3>
                    <p className="text-slate-400 text-xs font-bold">Municípios com assessoria ativa</p>
                 </div>
                 <button onClick={() => setShowModal('client')} className="bg-[#1ba198] hover:bg-[#15857d] text-white px-8 py-4 rounded-2xl text-xs font-black shadow-lg shadow-[#1ba198]/20 transition-all active:scale-95">
                   <i className="fas fa-plus mr-2"></i> CADASTRAR MUNICÍPIO
                 </button>
               </div>
               <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                 {data.clients.map(c => (
                   <div key={c.id} className="p-8 border border-slate-100 rounded-3xl bg-slate-50/30 flex flex-col items-center text-center group hover:border-[#1ba198] hover:bg-white transition-all hover:shadow-xl hover:shadow-[#1ba198]/5">
                     <div className="w-16 h-16 bg-white shadow-sm rounded-2xl flex items-center justify-center text-[#1ba198] text-3xl mb-4 group-hover:scale-110 transition-transform">
                       <i className="fas fa-university"></i>
                     </div>
                     <h4 className="font-black text-[#2c3338] text-lg mb-1">{c.name}</h4>
                     <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">{c.city}</p>
                     <div className="mt-6 pt-6 border-t border-slate-100 w-full flex justify-between text-[10px] font-black text-slate-400">
                        <span>CONTRATOS: {data.contracts.filter(con => con.clientId === c.id).length}</span>
                        <button className="text-[#1ba198]">VER DETALHES</button>
                     </div>
                   </div>
                 ))}
               </div>
            </div>
          )}

          {activeTab === 'contracts' && (
            <div className="bg-white p-10 rounded-[40px] shadow-sm border border-slate-100">
               <div className="flex flex-col md:flex-row justify-between items-center mb-10 gap-4">
                 <div>
                   <h3 className="font-black text-2xl text-[#2c3338] uppercase tracking-tighter">Carteira de Contratos</h3>
                   <p className="text-slate-400 text-xs font-bold">Acompanhamento de vigência e faturamento mensal</p>
                 </div>
                 <button onClick={() => setShowModal('contract')} className="bg-[#1ba198] hover:bg-[#15857d] text-white px-8 py-4 rounded-2xl text-xs font-black shadow-lg shadow-[#1ba198]/20 transition-all active:scale-95">
                   <i className="fas fa-file-contract mr-2"></i> NOVO CONTRATO
                 </button>
               </div>
               <div className="space-y-4">
                 {data.contracts.map(c => (
                   <div key={c.id} className="flex flex-col md:flex-row md:items-center justify-between p-8 border border-slate-100 rounded-3xl hover:border-[#1ba198] hover:bg-slate-50/50 transition-all gap-6">
                      <div className="flex gap-6 items-center flex-1">
                        <div className="w-12 h-12 bg-[#2c3338] text-white rounded-xl flex items-center justify-center font-black">
                          {data.clients.find(cli => cli.id === c.clientId)?.name.charAt(0)}
                        </div>
                        <div>
                          <h5 className="font-black text-lg text-[#2c3338] leading-tight">{data.clients.find(cli => cli.id === c.clientId)?.name}</h5>
                          <p className="text-[10px] text-slate-400 font-black uppercase tracking-widest mt-1">{c.description}</p>
                          <p className="text-[9px] text-[#1ba198] font-bold mt-1 uppercase">Vínculo: {data.companies.find(comp => comp.id === c.companyId)?.name}</p>
                        </div>
                      </div>
                      <div className="grid grid-cols-2 md:grid-cols-1 gap-4 text-right px-0 md:px-10 border-t md:border-t-0 md:border-l border-slate-100 pt-4 md:pt-0">
                        <div>
                          <p className="text-[9px] font-black text-slate-400 uppercase tracking-widest">Valor Mensal</p>
                          <p className="font-black text-xl text-[#1ba198]">R$ {c.monthlyValue.toLocaleString()}</p>
                        </div>
                        <div className="mt-2">
                          <span className="px-4 py-2 bg-green-50 text-green-600 rounded-full text-[10px] font-black uppercase tracking-tighter inline-block">
                             Expira {new Date(c.endDate).toLocaleDateString()}
                          </span>
                        </div>
                      </div>
                   </div>
                 ))}
               </div>
            </div>
          )}
          
          {activeTab === 'reports' && <Reports data={data} />}
        </div>
      </main>

      {/* MODAL BACKUP / IMPORTAR */}
      {showModal === 'backup' && (
        <div className="fixed inset-0 bg-[#2c3338]/95 z-[100] flex items-center justify-center p-4 backdrop-blur-sm">
          <div className="bg-white w-full max-w-md rounded-[40px] p-10 shadow-2xl border-b-8 border-[#1ba198]">
            <h3 className="text-2xl font-black mb-2 uppercase tracking-tighter">Central de Dados</h3>
            <p className="text-slate-400 text-sm mb-8 font-medium">Gerencie a segurança dos seus lançamentos locais.</p>
            
            <div className="space-y-4">
              <button onClick={exportData} className="w-full bg-[#2c3338] text-white font-black py-5 rounded-2xl shadow-xl flex items-center justify-center gap-3 hover:bg-[#1a1f24] transition-all group">
                <i className="fas fa-download group-hover:bounce transition-transform"></i> EXPORTAR BACKUP (.JSON)
              </button>
              
              <div className="relative">
                <input type="file" accept=".json" onChange={importData} id="import-file" className="hidden" />
                <label htmlFor="import-file" className="w-full border-2 border-dashed border-slate-200 text-slate-400 font-black py-5 rounded-2xl flex items-center justify-center gap-3 cursor-pointer hover:border-[#1ba198] hover:text-[#1ba198] transition-all">
                  <i className="fas fa-upload"></i> IMPORTAR DADOS EXISTENTES
                </label>
              </div>
            </div>

            <button onClick={() => setShowModal(null)} className="w-full mt-8 text-slate-300 font-black text-xs uppercase tracking-widest hover:text-red-500 transition-colors">Fechar Painel</button>
          </div>
        </div>
      )}

      {/* MODAIS DE CADASTRO (IGUAIS AOS ANTERIORES MAS REESTILIZADOS) */}
      {showModal === 'client' && (
        <div className="fixed inset-0 bg-[#2c3338]/95 z-[100] flex items-center justify-center p-4 backdrop-blur-sm">
          <div className="bg-white w-full max-w-md rounded-[40px] p-10 shadow-2xl">
            <h3 className="text-2xl font-black mb-8 uppercase tracking-tighter">Nova Cidade/RPPS</h3>
            <form onSubmit={handleAddClient} className="space-y-4">
              <div className="space-y-1">
                <label className="text-[10px] font-black text-slate-400 uppercase ml-2 tracking-widest">Nome da Instituição</label>
                <input name="name" placeholder="Ex: Prefeitura de Itapema" className="w-full p-4 bg-slate-50 border border-slate-100 rounded-2xl font-bold focus:ring-2 focus:ring-[#1ba198] outline-none" required />
              </div>
              <div className="space-y-1">
                <label className="text-[10px] font-black text-slate-400 uppercase ml-2 tracking-widest">Localização (Cidade/UF)</label>
                <input name="city" placeholder="Ex: Itapema - SC" className="w-full p-4 bg-slate-50 border border-slate-100 rounded-2xl font-bold focus:ring-2 focus:ring-[#1ba198] outline-none" required />
              </div>
              <div className="pt-4 flex gap-4">
                 <button type="submit" className="flex-1 bg-[#1ba198] text-white font-black py-4 rounded-2xl shadow-xl shadow-[#1ba198]/20">SALVAR</button>
                 <button type="button" onClick={() => setShowModal(null)} className="flex-1 border border-slate-100 text-slate-400 font-black py-4 rounded-2xl">CANCELAR</button>
              </div>
            </form>
          </div>
        </div>
      )}

      {showModal === 'contract' && (
        <div className="fixed inset-0 bg-[#2c3338]/95 z-[100] flex items-center justify-center p-4 backdrop-blur-sm">
          <div className="bg-white w-full max-w-lg rounded-[40px] p-10 shadow-2xl">
            <h3 className="text-2xl font-black mb-8 uppercase tracking-tighter">Protocolar Contrato</h3>
            <form onSubmit={handleAddContract} className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-1">
                  <label className="text-[10px] font-black text-slate-400 uppercase ml-2">Município Cliente</label>
                  <select name="clientId" className="w-full p-4 bg-slate-50 border border-slate-100 rounded-2xl font-bold text-sm" required>
                    <option value="">Selecione...</option>
                    {data.clients.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
                  </select>
                </div>
                <div className="space-y-1">
                  <label className="text-[10px] font-black text-slate-400 uppercase ml-2">Empresa do Grupo</label>
                  <select name="companyId" className="w-full p-4 bg-slate-50 border border-slate-100 rounded-2xl font-bold text-sm" required>
                    <option value="">Selecione...</option>
                    {data.companies.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
                  </select>
                </div>
              </div>
              <div className="space-y-1">
                <label className="text-[10px] font-black text-slate-400 uppercase ml-2">Faturamento Mensal (R$)</label>
                <input name="monthlyValue" type="number" placeholder="0.000,00" className="w-full p-4 bg-slate-50 border border-slate-100 rounded-2xl font-black text-[#1ba198] text-lg" required />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-1">
                  <label className="text-[10px] font-black text-slate-400 uppercase ml-2">Início</label>
                  <input name="startDate" type="date" className="w-full p-4 bg-slate-50 border border-slate-100 rounded-2xl font-bold text-xs" required />
                </div>
                <div className="space-y-1">
                  <label className="text-[10px] font-black text-slate-400 uppercase ml-2">Término</label>
                  <input name="endDate" type="date" className="w-full p-4 bg-slate-50 border border-slate-100 rounded-2xl font-bold text-xs" required />
                </div>
              </div>
              <div className="space-y-1">
                <label className="text-[10px] font-black text-slate-400 uppercase ml-2">Objeto do Contrato</label>
                <textarea name="description" placeholder="Ex: Assessoria técnica atuarial..." className="w-full p-4 bg-slate-50 border border-slate-100 rounded-2xl font-bold text-sm" rows={2} required />
              </div>
              <div className="pt-6 flex gap-4">
                 <button type="submit" className="flex-1 bg-[#1ba198] text-white font-black py-5 rounded-2xl shadow-xl shadow-[#1ba198]/20">PROTOCOLAR</button>
                 <button type="button" onClick={() => setShowModal(null)} className="flex-1 border border-slate-100 text-slate-400 font-black py-5 rounded-2xl">VOLTAR</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default App;
