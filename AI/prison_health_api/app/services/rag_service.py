import os
from langchain_community.vectorstores import Chroma
from langchain_core.prompts import PromptTemplate
from langchain_google_genai import ChatGoogleGenerativeAI
from langchain_huggingface import HuggingFaceEmbeddings
from dotenv import load_dotenv

load_dotenv()

# Setup Gemini for the Answer Generation (LLM)
# Note: We still use Gemini for generating the text, just not for embeddings
llm = ChatGoogleGenerativeAI(
    model="gemini-pro",
    temperature=0.3,
    google_api_key=os.getenv("GOOGLE_API_KEY")
)

PERSIST_DIRECTORY = "./chroma_db"

def generate_health_profile(inmate_data, emotion_history, survey_summary):
    try:
        # 2. Use Hugging Face Embeddings (MUST match what you used in pdf_service.py)
        embeddings = HuggingFaceEmbeddings(model_name="sentence-transformers/all-MiniLM-L6-v2")
        
        # Connect to existing DB
        vector_db = Chroma(
            persist_directory=PERSIST_DIRECTORY, 
            embedding_function=embeddings
        )
        
        # Create Retriever
        retriever = vector_db.as_retriever(search_kwargs={"k": 3})
        
        # 3. FIX: Change 'get_relevant_documents' to 'invoke'
        query = f"treatment guidelines for {survey_summary} and mental health interventions"
        relevant_docs = retriever.invoke(query)
        
        # Combine retrieved context
        context_text = "\n\n".join([doc.page_content for doc in relevant_docs])
        
        # Create the Prompt
        template = """
        You are an AI Prison Health Assistant. Analyze the inmate's profile based on the following data:
        
        INMATE INFO:
        Name: {name} (ID: {id})
        Age: {age}
        Crime: {crime}
        
        RECENT EMOTIONS (Video Analysis):
        {emotions}
        
        SELF-REPORTED SYMPTOMS (Survey):
        {survey}
        
        MEDICAL GUIDELINES (Retrieved from Knowledge Base):
        {context}
        
        TASK:
        Generate a JSON health profile with:
        1. "risk_level" (Low/Medium/High)
        2. "suspected_conditions" (List of potential issues like Depression, Anxiety, etc.)
        3. "recommended_actions" (Specific steps for prison staff based on the guidelines)
        4. "urgent_alert" (Boolean: True if immediate intervention is needed)
        
        Return ONLY valid JSON.
        """
        
        prompt = PromptTemplate(
            template=template,
            input_variables=["name", "id", "age", "crime", "emotions", "survey", "context"]
        )
        
        chain = prompt | llm
        
        response = chain.invoke({
            "name": inmate_data.first_name + " " + inmate_data.last_name,
            "id": inmate_data.id,
            "age": inmate_data.age,
            "crime": inmate_data.crime_details,
            "emotions": emotion_history,
            "survey": survey_summary,
            "context": context_text
        })
        
        # Clean up response to ensure it's just JSON
        content = response.content.replace("```json", "").replace("```", "").strip()
        return content

    except Exception as e:
        print(f"Error generating profile: {e}")
        return {"error": str(e)}