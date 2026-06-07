import pandas as pd
import re

CATEGORIAS_MAP = {
    "TRANSPORTE": ["UBER", "99POP", "99APP", "99 POP", "POSTO", "ESTACIONAMENTO"],
    "ALMOÇO": ["IFOOD", "QUENTINHA", "ALMOÇO", "RESTAURANTE", "LANCHONETE", "BURGER", "IFD"],
    "NECESSIDADES": ["SUPERMERCADO", "FARMACIA", "DROGARIA", "PANIFICADORA", "MINIBOX"],
    "STREAMING": ["HBO", "PRIME VIDEO", "SPOTIFY", "CRUNCHYROLL", "NETFLIX", "DISNEY", "YOUTUBE PREMIUM"]
}

# Sufixos que não são pessoas (método de pagamento, etc.)
NON_PERSONS = {'NUPAY'}

# "Metade Pessoa" com parênteses: Item(Metade Sofia) - João
SPLIT_PARENS = re.compile(r'\(metade\s+(\w+)\)', re.IGNORECASE)
# "Metade Pessoa" sem parênteses: Uber - Metade Sofia
SPLIT_DASH = re.compile(r'\s*-\s*metade\s+(\w+)\s*$', re.IGNORECASE)
# Valor fixo nos parênteses: (Menos 44 Dante) ou (20 Sofia)
SPLIT_FIXED = re.compile(r'\((?:menos\s+)?(\d+(?:[.,]\d+)?)\s+(\w+)\)', re.IGNORECASE)
# Parcela no final: - Parcela 2/3
PARCELA_SUFFIX = re.compile(r'\s*-\s*parcela\s+\d+/\d+\s*$', re.IGNORECASE)


def _expand_split_rows(df):
    rows_to_add = []
    indices_to_drop = []

    for idx, row in df.iterrows():
        title = str(row['title'])

        parens_match = SPLIT_PARENS.search(title)
        fixed_match = SPLIT_FIXED.search(title)
        dash_match = SPLIT_DASH.search(title)

        if fixed_match:
            raw_amount = fixed_match.group(1).replace(',', '.')
            person_amount = float(raw_amount)
            split_person = fixed_match.group(2).capitalize()
            payer_amount = row['amount'] - person_amount
            base_title = SPLIT_FIXED.sub('', title).strip()

            row_payer = row.copy()
            row_payer['amount'] = payer_amount
            row_payer['title'] = base_title
            rows_to_add.append(row_payer)

            row_split = row.copy()
            row_split['amount'] = person_amount
            row_split['title'] = f"{base_title} - {split_person}"
            rows_to_add.append(row_split)

            indices_to_drop.append(idx)

        elif parens_match:
            split_person = parens_match.group(1).capitalize()
            half = row['amount'] / 2
            base_title = SPLIT_PARENS.sub('', title).strip()

            row_payer = row.copy()
            row_payer['amount'] = half
            row_payer['title'] = base_title
            rows_to_add.append(row_payer)

            row_split = row.copy()
            row_split['amount'] = half
            row_split['title'] = f"{base_title} - {split_person}"
            rows_to_add.append(row_split)

            indices_to_drop.append(idx)

        elif dash_match:
            split_person = dash_match.group(1).capitalize()
            half = row['amount'] / 2
            base_title = SPLIT_DASH.sub('', title).strip()

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
            # Extrai o número da parcela antes de remover o sufixo
            parcela_match = PARCELA_SUFFIX.search(titulo)
            parcela_str = ''
            if parcela_match:
                nums = re.search(r'(\d+/\d+)', parcela_match.group(0))
                if nums:
                    parcela_str = f" - {nums.group(1)}"

            # Remove "- Parcela X/X" do final antes de qualquer extração de dono
            titulo_clean = PARCELA_SUFFIX.sub('', titulo).strip()

            dono_match = re.search(r' - ([^-\n()]+)$', titulo_clean)
            explicit_dono = dono_match.group(1).strip() if dono_match else None

            if explicit_dono and explicit_dono.upper() in NON_PERSONS:
                explicit_dono = None

            titulo_base = titulo_clean.split('(')[0].strip()

            for categoria, palavras in CATEGORIAS_MAP.items():
                if any(palavra in titulo_base for palavra in palavras):
                    return categoria, explicit_dono if explicit_dono else "JOÃO"

            if explicit_dono and not explicit_dono.isdigit():
                titulo_display = re.sub(r'\s*-\s*[^-()]+$', '', titulo_clean).strip()
                return (titulo_display or titulo_clean) + parcela_str, explicit_dono

            return titulo_clean + parcela_str, "JOÃO"

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
