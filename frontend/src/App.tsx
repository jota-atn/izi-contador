import { useEffect, useState } from 'react';
import { getRelatorio } from './api';
import { Wallet, Users, Receipt, AlertTriangle, ArrowRight, UserCircle, CreditCard, PieChart as PieIcon, Copy, Check } from 'lucide-react';
import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip } from 'recharts';

interface Gasto {
  descricao: string;
  valor: number;
  data: string;
}

interface RelatorioPessoa {
  dono: string;
  itens: Gasto[];
  total_individual: number;
}

interface RelatorioFatura {
  total_fatura: number;
  relatorio_por_pessoa: RelatorioPessoa[];
}

const COLORS = ['#7C3AED', '#EC4899', '#3B82F6', '#10B981', '#F59E0B', '#6366F1'];

export default function App() {
  const [dados, setDados] = useState<RelatorioFatura | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [copiado, setCopiado] = useState(false);

  useEffect(() => {
    getRelatorio()
      .then(setDados)
      .catch(() => setError("Erro ao conectar com o backend."))
      .finally(() => setLoading(false));
  }, []);

  const copiarResumo = () => {
    if (!dados) return;

    const texto = dados.relatorio_por_pessoa
      .map((pessoa) => {
        const itens = pessoa.itens
          .map((item) => `${item.descricao} - ${item.valor.toFixed(2)}`)
          .join('\n');
        return `${pessoa.dono}\n${itens}\nTotal = ${pessoa.total_individual.toFixed(2)}`;
      })
      .join('\n\n');

    navigator.clipboard.writeText(texto);
    setCopiado(true);
    setTimeout(() => setCopiado(false), 2000);
  };

  if (loading) return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-slate-900">
      <div className="w-12 h-12 border-4 border-purple-500 border-t-transparent rounded-full animate-spin mb-4"></div>
      <p className="text-slate-400 font-medium">Sincronizando faturas...</p>
    </div>
  );

  if (error) return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-slate-900 p-6 text-center">
      <AlertTriangle className="text-red-500 w-16 h-16 mb-4" />
      <h2 className="text-xl font-bold text-white mb-2">{error}</h2>
      <button onClick={() => window.location.reload()} className="bg-purple-600 hover:bg-purple-700 text-white px-6 py-2 rounded-lg transition">Tentar novamente</button>
    </div>
  );

  const chartData = dados?.relatorio_por_pessoa.map(p => ({
    name: p.dono,
    value: p.total_individual
  })) || [];

  return (
    <div className="min-h-screen bg-slate-950 text-slate-200 font-sans selection:bg-purple-500/30">
      <nav className="border-b border-slate-800 bg-slate-950/50 backdrop-blur-md sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-6 py-4 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="bg-gradient-to-br from-purple-500 to-indigo-600 p-2 rounded-lg shadow-lg shadow-purple-500/20">
              <Wallet className="text-white w-5 h-5" />
            </div>
            <h1 className="text-xl font-black tracking-tight text-white uppercase">Izi<span className="text-purple-500">Contador</span></h1>
          </div>
          
          <div className="flex items-center gap-3">
            <button 
              onClick={copiarResumo}
              className={`flex items-center gap-2 px-4 py-2 rounded-full border transition-all active:scale-95 ${
                copiado 
                ? 'bg-green-500/20 border-green-500 text-green-400' 
                : 'bg-slate-900 border-slate-700 hover:border-purple-500 text-slate-300'
              }`}
            >
              {copiado ? <Check size={14} /> : <Copy size={14} />}
              <span className="text-xs font-bold uppercase tracking-wider">
                {copiado ? 'Copiado!' : 'Copiar Resumo'}
              </span>
            </button>

            <div className="flex items-center gap-3 bg-slate-900 px-4 py-2 rounded-full border border-slate-800">
              <UserCircle className="text-purple-400 w-4 h-4" />
              <span className="text-xs font-bold uppercase tracking-wider">Olá, Jota</span>
            </div>
          </div>
        </div>
      </nav>

      <main className="max-w-7xl mx-auto px-6 py-8 grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
        <aside className="lg:col-span-4 space-y-6">
          <div className="bg-gradient-to-br from-slate-900 to-slate-950 p-8 rounded-3xl border border-slate-800 shadow-2xl">
            <div className="flex items-center justify-between mb-6">
              <span className="text-xs font-bold text-slate-500 uppercase tracking-widest">Fatura Total</span>
              <CreditCard className="text-purple-500 w-6 h-6" />
            </div>
            <p className="text-5xl font-black text-white tracking-tighter mb-4">
              R$ {dados?.total_fatura.toFixed(2)}
            </p>
            <div className="inline-flex items-center gap-2 bg-purple-500/10 text-purple-400 px-3 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider border border-purple-500/20">
              <Users size={12} /> {dados?.relatorio_por_pessoa.length} Pessoas Processadas
            </div>
          </div>

          <div className="bg-slate-900 p-8 rounded-3xl border border-slate-800 shadow-xl">
            <h3 className="text-sm font-bold text-white mb-6 flex items-center gap-2 uppercase tracking-wider">
              <PieIcon size={16} className="text-purple-500" /> Divisão de Gastos
            </h3>
            <div className="h-64">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie data={chartData} cx="50%" cy="50%" innerRadius={60} outerRadius={80} paddingAngle={8} dataKey="value">
                    {chartData.map((_, i) => <Cell key={i} fill={COLORS[i % COLORS.length]} stroke="none" />)}
                  </Pie>
                  <Tooltip contentStyle={{ backgroundColor: '#0f172a', border: '1px solid #1e293b', borderRadius: '12px', fontSize: '12px' }} />
                </PieChart>
              </ResponsiveContainer>
            </div>
          </div>
        </aside>

        <section className="lg:col-span-8 grid grid-cols-1 md:grid-cols-2 gap-6">
          {dados?.relatorio_por_pessoa.map((pessoa) => (
            <div key={pessoa.dono} className="bg-slate-900 rounded-3xl border border-slate-800 overflow-hidden flex flex-col shadow-xl hover:border-purple-500/50 transition-colors group">
              <div className="bg-slate-800/50 p-6 flex items-center justify-between border-b border-slate-800">
                <h2 className="text-white font-black uppercase tracking-tight text-lg flex items-center gap-2">
                  <div className="w-1.5 h-4 bg-purple-500 rounded-full"></div> {pessoa.dono}
                </h2>
                <span className="text-xl font-mono font-bold text-purple-400">
                  R$ {pessoa.total_individual.toFixed(2)}
                </span>
              </div>

              <div className="p-6 space-y-4 max-h-96 overflow-y-auto scrollbar-hide">
                {pessoa.itens.map((item, idx) => (
                  <div key={idx} className="flex justify-between items-start group/item">
                    <div className="space-y-1">
                      <p className="text-slate-200 text-xs font-bold uppercase tracking-tight group-hover/item:text-purple-400 transition-colors">{item.descricao}</p>
                      <p className="text-slate-500 text-[10px] font-medium">{item.data}</p>
                    </div>
                    <p className="text-slate-300 font-mono text-xs font-bold bg-slate-800 px-2 py-1 rounded">
                      R$ {item.valor.toFixed(2)}
                    </p>
                  </div>
                ))}
              </div>

              <div className="p-4 mt-auto border-t border-slate-800 bg-slate-900/80 flex justify-end">
                <button className="text-[10px] font-black uppercase tracking-widest text-slate-500 hover:text-white flex items-center gap-2 transition-colors">
                  Detalhes <ArrowRight size={12} />
                </button>
              </div>
            </div>
          ))}
        </section>
      </main>

      <footer className="max-w-7xl mx-auto px-6 py-12 text-center border-t border-slate-900">
        <p className="text-slate-600 text-[10px] font-bold uppercase tracking-[0.2em]">IziContador • Automático • 2026</p>
      </footer>
    </div>
  );
}
