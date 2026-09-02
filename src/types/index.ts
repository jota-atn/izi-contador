export interface Gasto {
  descricao: string;
  valor: number;
  data: string;
  dividido?: boolean; // fatia de uma divisão (anotação no Nubank ou feita no app)
  editado?: boolean; // dono/descrição alterados via edição no app
  origemDivisao?: { item_desc: string; item_data: string; item_valor: number }; // chave do item original, só quando a divisão foi feita no app
  parcela?: { atual: number; total: number }; // ex.: 3/12, extraído do sufixo "- Parcela N/M" do Nubank
}

export interface RelatorioPessoa {
  dono: string;
  itens: Gasto[];
  total_individual: number;
}

export interface AnotacaoInvalida {
  titulo: string;
  valor: number;
  soma: number;
}

export interface RelatorioFatura {
  mes: string; // "YYYY-MM"
  total_fatura: number;
  relatorio_por_pessoa: RelatorioPessoa[];
  anotacoes_invalidas?: AnotacaoInvalida[];
  sincronizadoEm?: string; // ISO timestamp da última sincronização
}
