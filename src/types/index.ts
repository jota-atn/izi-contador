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

