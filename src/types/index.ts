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

