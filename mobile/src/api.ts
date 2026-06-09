const API_URL = __DEV__
  ? "http://192.168.0.3:8080/api"  // IP da máquina na rede local (Expo Go no celular)
  : "https://izi-contador-backend.onrender.com/api";

export interface Gasto {
  descricao: string;
  valor: number;
  data: string;
}

export interface RelatorioPessoa {
  dono: string;
  itens: Gasto[];
  total_individual: number;
}

export interface RelatorioFatura {
  total_fatura: number;
  relatorio_por_pessoa: RelatorioPessoa[];
}

export async function getRelatorio(): Promise<RelatorioFatura> {
  const res = await fetch(`${API_URL}/relatorio`);
  if (res.status === 401) {
    const err: any = new Error("token_expired");
    err.status = 401;
    throw err;
  }
  if (!res.ok) {
    throw new Error(`Erro ${res.status}`);
  }
  return res.json();
}
