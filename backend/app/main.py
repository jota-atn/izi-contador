from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from google.auth.exceptions import RefreshError
from .services import gmail_service, parser_service

app = FastAPI(title="IziContador API")

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

@app.get("/")
def read_root():
    return {"status": "IziContador Backend Rodando!"}

@app.get("/api/relatorio")
async def obter_relatorio():
    try:
        service = gmail_service.get_gmail_service()
        csv_path = gmail_service.download_latest_csv(service)

        if not csv_path:
            raise HTTPException(status_code=404, detail="Nenhum extrato encontrado no e-mail.")

        dados_processados = parser_service.processar_csv_nubank(csv_path)

        return dados_processados

    except RefreshError:
        raise HTTPException(status_code=401, detail="token_expired")
    except HTTPException:
        raise
    except Exception as e:
        print(f"Erro no processamento: {e}")
        raise HTTPException(status_code=500, detail=str(e))

@app.get("/api/extrato/atualizar")
async def atualizar_extrato():
    try:
        service = gmail_service.get_gmail_service()
        csv_path = gmail_service.download_latest_csv(service)
        if not csv_path:
            raise HTTPException(status_code=404, detail="Nenhum extrato encontrado.")
        return {"message": "Extrato baixado!", "file": csv_path}
    except RefreshError:
        raise HTTPException(status_code=401, detail="token_expired")
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))
