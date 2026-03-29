from pydantic import BaseModel
from typing import List

class ItemGasto(BaseModel):
    descricao: str
    valor: float
    data: str

class SecaoPessoa(BaseModel):
    dono: str
    itens: List[ItemGasto]
    total_individual: float

class RelatorioFatura(BaseModel):
    total_fatura: float
    relatorio_por_pessoa: List[SecaoPessoa]
