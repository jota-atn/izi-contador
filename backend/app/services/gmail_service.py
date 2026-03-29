import os
import base64
import json
from google.oauth2.credentials import Credentials
from google_auth_oauthlib.flow import InstalledAppFlow
from google.auth.transport.requests import Request
from googleapiclient.discovery import build

SCOPES = ['https://www.googleapis.com/auth/gmail.readonly']

google_creds_content = os.environ.get('GOOGLE_CREDENTIALS')
google_token_content = os.environ.get('GOOGLE_TOKEN')

CREDENTIALS_FILE = 'credentials.json'
TOKEN_PATH = 'token.json'
DATA_FOLDER = 'app/data'

if google_creds_content:
    with open(CREDENTIALS_FILE, 'w') as f:
        f.write(google_creds_content)

if google_token_content:
    with open(TOKEN_PATH, 'w') as f:
        f.write(google_token_content)

def get_gmail_service():
    creds = None
    
    if os.path.exists(TOKEN_PATH):
        creds = Credentials.from_authorized_user_file(TOKEN_PATH, SCOPES)
    
    if not creds or not creds.valid:
        if creds and creds.expired and creds.refresh_token:
            creds.refresh(Request())
        else:
            if os.path.exists(CREDENTIALS_FILE):
                flow = InstalledAppFlow.from_client_secrets_file(CREDENTIALS_FILE, SCOPES)
                creds = flow.run_local_server(port=0)
            else:
                raise Exception("Credenciais nao encontradas")
        
        with open(TOKEN_PATH, 'w') as token:
            token.write(creds.to_json())

    return build('gmail', 'v1', credentials=creds)

def download_latest_csv(service):
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
            
            path = os.path.join(DATA_FOLDER, "fatura_recent.csv")
            with open(path, 'wb') as f:
                f.write(file_data)
            
            return path
            
    return None
