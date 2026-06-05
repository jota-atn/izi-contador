import pandas as pd
import re

CATEGORIAS_MAP = {
    "TRANSPORTE": ["UBER", "99POP", "99APP", "99 POP", "POSTO", "ESTACIONAMENTO"],
    "ALMOÇO": ["IFOOD", "QUENTINHA", "ALMOÇO", "RESTAURANTE", "LANCHONETE", "BURGER", "IFD"],
    "NECESSIDADES": ["SUPERMERCADO", "FARMACIA", "DROGARIA", "PANIFICADORA", "MINIBOX"],
    "STREAMING": ["HBO", "PRIME VIDEO", "SPOTIFY", "CRUNCHYROLL", "NETFLIX", "DISNEY", "YOUTUBE PREMIUM"]
}

SPLIT_PATTERN = re.compile(r'\(metade\s+(\w+)\)', re.IGNORECASE)

def _expand_split_rows(df):
    rows_to_add = []
    indices_to_drop = []

    for idx, row in df.iterrows():
        split_match = SPLIT_PATTERN.search(str(row['title']))
        if not split_match:
            continue

        split_person = split_match.group(1).capitalize()
        half = row['amount'] / 2

        base_title = re.split(r'\s*\(', str(row['title']))[0].strip()

        dono_match = re.search(r'\)\s*-\s*(\w+)\s*$', str(row['title']), re.IGNORECASE)
        payer = dono_match.group(1).capitalize() if dono_match else 'João'

        row_payer = row.copy()
        row_payer['amount'] = half
        row_payer['title'] = base_title
        rows_to_add.append(row_payer)

        row_split = row.copy()
        row_split['amount'] = half
        row_split['title'] = f"{base_title} - {split_person}"
        rows_to_add.append(row_split)

        indices_to_drop.append(idx)

    if indices_to_drop:
        df = df.drop(indices_to_drop)
        df = pd.concat([df, pd.DataFrame(rows_to_add)], ignore_index=True)

    return df

def processar_csv_nubank(file_path):
    try:
        df = pd.read_csv(file_path)
        df['amount'] = (
            df['amount']
            .astype(str)
            .str.replace(r'\s+', '', regex=True)
            .str.replace('.', '', regex=False)
            .str.replace(',', '.', regex=False)
            .astype(float)
        )

        palavras_para_ignorar = ["PAGAMENTO RECEBIDO", "PAGAMENTO EFETUADO"]
        df = df[~df['title'].str.upper().str.contains('|'.join(palavras_para_ignorar), na=False)]

        df = _expand_split_rows(df)

        df['title'] = df['title'].str.upper()

        def categorizar_item(titulo):
            dono_match = re.search(r' - ([^-\n()]+)$', titulo)
            explicit_dono = dono_match.group(1).strip() if dono_match else None

            titulo_base = titulo.split('(')[0].strip()

            for categoria, palavras in CATEGORIAS_MAP.items():
                if any(palavra in titulo_base for palavra in palavras):
                    return categoria, explicit_dono if explicit_dono else "JOÃO"

            if explicit_dono and not explicit_dono.isdigit():
                titulo_display = re.sub(r'\s*-\s*[^-]+$', '', titulo_base).strip()
                return titulo_display or titulo_base, explicit_dono

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
