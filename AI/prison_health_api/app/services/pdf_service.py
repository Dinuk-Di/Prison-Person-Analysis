import os
from langchain_community.document_loaders import PyPDFLoader
from langchain_text_splitters import RecursiveCharacterTextSplitter
from langchain_community.vectorstores import Chroma
# Updated Import for Hugging Face
from langchain_huggingface import HuggingFaceEmbeddings 
from dotenv import load_dotenv

load_dotenv()

PERSIST_DIRECTORY = "./chroma_db"

def get_embeddings():
    """
    Returns a locally running Hugging Face embedding model.
    'all-MiniLM-L6-v2' is a standard, efficient model for RAG.
    """
    return HuggingFaceEmbeddings(model_name="sentence-transformers/all-MiniLM-L6-v2")

def store_pdf_in_vector_db(file_path):
    try:
        # 1. Load the PDF
        loader = PyPDFLoader(file_path)
        pages = loader.load_and_split()
        
        # 2. Split text into chunks
        # Adjusted chunk size slightly for MiniLM (smaller context window than Gemini)
        text_splitter = RecursiveCharacterTextSplitter(chunk_size=800, chunk_overlap=150)
        texts = text_splitter.split_documents(pages)
        print(f"Total chunks created: {len(texts)}")
        
        # 3. Initialize Embeddings and Vector DB
        embeddings = get_embeddings()
        vector_db = Chroma(
            persist_directory=PERSIST_DIRECTORY, 
            embedding_function=embeddings
        )
        
        # 4. Add to DB
        # No batching/sleep needed for local execution
        print("Embedding and storing documents locally...")
        vector_db.add_documents(texts)
        
        print("All documents processed successfully.")
        return True
    
    except Exception as e:
        print(f"Error processing PDF: {e}")
        return False