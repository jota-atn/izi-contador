import { Categorias } from '../config/categorias';

// um item pertence a uma categoria quando sua descrição é o nome dela (item categorizado
// no parser) ou começa com "CATEGORIA - " (fatia gerada por uma divisão feita no app); o
// resto (a maioria das compras, sem palavra-chave de categoria) cai em "Outros"
export function categorizarGasto(descricao: string, categorias: Categorias): string {
  const nomesCategorias = Object.keys(categorias);
  return (
    nomesCategorias.find((c) => descricao === c || descricao.startsWith(`${c} - `)) ?? 'Outros'
  );
}
