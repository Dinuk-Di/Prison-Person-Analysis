import os
import time
from langchain_community.document_loaders import PyPDFLoader
from langchain_text_splitters import RecursiveCharacterTextSplitter
from langchain_community.vectorstores import Chroma
from langchain_google_genai import GoogleGenerativeAIEmbeddings
from dotenv import load_dotenv

load_dotenv()
GOOGLE_API_KEY = os.getenv("GOOGLE_API_KEY")

PERSIST_DIRECTORY = "./chroma_db"

def get_embeddings():
    if not GOOGLE_API_KEY:
        raise ValueError("GOOGLE_API_KEY not found in environment variables.")
    return GoogleGenerativeAIEmbeddings(
        model="models/embedding-001", 
        google_api_key=GOOGLE_API_KEY
    )

def store_pdf_in_vector_db(file_path):
    try:
        # 1. Load the PDF
        loader = PyPDFLoader(file_path)
        pages = loader.load_and_split()
        
        # 2. Split text into chunks
        text_splitter = RecursiveCharacterTextSplitter(chunk_size=1000, chunk_overlap=200)
        texts = text_splitter.split_documents(pages)
        print(f"Total chunks created: {len(texts)}")
        
        # 3. Initialize Embeddings and Vector DB (Connect to existing DB)
        embeddings = get_embeddings()
        vector_db = Chroma(
            persist_directory=PERSIST_DIRECTORY, 
            embedding_function=embeddings
        )
        
        # 4. BATCH PROCESSING (The Fix)
        # Send 5 chunks at a time, then wait 2 seconds.
        batch_size = 5
        for i in range(0, len(texts), batch_size):
            batch = texts[i : i + batch_size]
            print(f"Processing batch {i//batch_size + 1}/{len(texts)//batch_size + 1}...")
            
            # Add batch to DB (This calls the API)
            vector_db.add_documents(batch)
            
            # WAIT to respect the rate limit
            time.sleep(2) 
            
        print("All batches processed successfully.")
        return True
    
    except Exception as e:
        print(f"Error processing PDF: {e}")
        return False