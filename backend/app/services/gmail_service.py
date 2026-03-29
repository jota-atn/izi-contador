import os
import base64
from google.oauth2.credentials import Credentials
from google_auth_oauthlib.flow import InstalledAppFlow
from google.auth.transport.requests import Request
from googleapiclient.discovery import build

SCOPES = ['https://www.googleapis.com/auth/gmail.readonly']

BASE_DIR = os.path.dirname(os.path.abspath(__file__))
BACKEND_DIR = os.path.dirname(os.path.dirname(BASE_DIR))

CREDENTIALS_PATH = os.environ.get('GOOGLE_CREDENTIALS')

if google_creds_json:
    with open('credentials.json', 'w') as f:
        f.write(google_creds_json)

TOKEN_PATH = os.path.join(BACKEND_DIR, 'token.json')
DATA_FOLDER = os.path.join(BACKEND_DIR, 'app', 'data')

def get_gmail_service():
    creds = None
    if os.path.exists(TOKEN_PATH):
        creds = Credentials.from_authorized_user_file(TOKEN_PATH, SCOPES)
    
    if not creds or not creds.valid:
        if creds and creds.expired and creds.refresh_token:
            creds.refresh(Request()) 
        else:
            flow = InstalledAppFlow.from_client_secrets_file(CREDENTIALS_PATH, SCOPES)
            creds = flow.run_local_server(port=0)
        
        with open(TOKEN_PATH, 'w') as token:
            token.write(creds.to_json())

    return build('gmail', 'v1', credentials=creds)

def download_latest_csv(service):
    """
    Busca o último e-mail de extrato do Nubank e baixa o anexo CSV.
    """
    query = 'subject:"Extrato da fatura do Cartão Nubank" has:attachment'
    results = service.users().messages().list(userId='me', q=query, maxResults=1).execute()
    messages = results.get('messages', [])

    if not messages:
        return None

    msg = service.users().messages().get(userId='me', id=messages[0]['id']).execute()
    
    for part in msg['payload'].get('parts', []):
        if part['filename'].endswith('.csv'):
            if 'data' in part['body']:
                data = part['body']['data']
            else:
                att_id = part['body']['attachmentId']
                att = service.users().messages().attachments().get(userId='me', messageId=msg['id'], id=att_id).execute()
                data = att['data']
            
            file_data = base64.urlsafe_b64decode(data.encode('UTF-8'))
            
            if not os.path.exists(DATA_FOLDER):
                os.makedirs(DATA_FOLDER)
            
            path = os.path.join(DATA_FOLDER, "fatura_recente.csv")
            with open(path, 'wb') as f:
                f.write(file_data)
            
            return path
            
    return None
