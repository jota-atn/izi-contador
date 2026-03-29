import pandas as pd
import re

# Configuração das Categorias e suas Palavras-Chave
CATEGORIAS_MAP = {
    "TRANSPORTE": ["UBER", "99POP", "99APP", "99 POP", "POSTO", "ESTACIONAMENTO"],
    "REFEIÇÃO": ["IFOOD", "QUENTINHA", "ALMOÇO", "RESTAURANTE", "LANCHONETE", "BURGER", "IFD"],
    "NECESSIDADES": ["MERCADO", "SUPERMERCADO", "FARMACIA", "DROGARIA", "PANIFICADORA"],
    "STREAMING": ["HBO", "PRIME VIDEO", "SPOTIFY", "CRUNCHYROLL", "NETFLIX", "DISNEY", "YOUTUBE PREMIUM"]
}

def processar_csv_nubank(file_path):
    try:
        df = pd.read_csv(file_path)

        palavras_para_ignorar = ["PAGAMENTO RECEBIDO", "PAGAMENTO EFETUADO"]
        
        df = df[~df['title'].str.upper().str.contains('|'.join(palavras_para_ignorar), na=False)]
        

        df['title'] = df['title'].str.upper()

        def categorizar_item(titulo):
            for categoria, palavras in CATEGORIAS_MAP.items():
                if any(palavra in titulo for palavra in palavras):
                    return categoria, "JOÃO"
            
            match = re.search(r' - ([^-\n]+)', titulo)
            if match:
                dono = match.group(1).strip()
                if not dono.isdigit():
                    return titulo, dono
            
            return titulo, "JOÃO"

        df[['exibicao', 'dono']] = df.apply(
            lambda x: pd.Series(categorizar_item(x['title'])), axis=1
        )

        relatorio_por_pessoa = []
        
        for dono, grupo in df.groupby('dono'):
            itens_agrupados = grupo.groupby('exibicao')['amount'].sum().reset_index()
            
            lista_itens = []
            for _, row in itens_agrupados.iterrows():
                lista_itens.append({
                    "descricao": row['exibicao'],
                    "valor": float(row['amount']),
                    "data": "Agrupado" if row['exibicao'] in CATEGORIAS_MAP else grupo[grupo['exibicao'] == row['exibicao']]['date'].iloc[0]
                })

            relatorio_por_pessoa.append({
                "dono": dono,
                "itens": lista_itens,
                "total_individual": round(grupo['amount'].sum(), 2)
            })

        return {
            "total_fatura": round(df['amount'].sum(), 2),
            "relatorio_por_pessoa": relatorio_por_pessoa
        }
        
    except Exception as e:
        print(f"Erro no Parser: {e}")
        raise e
