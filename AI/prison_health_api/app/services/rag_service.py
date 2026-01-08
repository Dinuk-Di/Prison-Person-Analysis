import os
from langchain_google_genai import ChatGoogleGenerativeAI
from langchain_community.vectorstores import Chroma
from langchain_core.prompts import PromptTemplate
from app.services.pdf_service import get_embeddings, PERSIST_DIRECTORY # Import shared config

GOOGLE_API_KEY = os.getenv("GOOGLE_API_KEY")

def generate_health_profile(inmate_data, recent_emotions, survey_summary):
    # 1. Initialize Embeddings (Must match the one used in pdf_service)
    embeddings = get_embeddings()
    
    # 2. Load the existing Vector DB
    vector_db = Chroma(persist_directory=PERSIST_DIRECTORY, embedding_function=embeddings)
    
    # 3. Setup Retriever (Search for top 3 relevant doc chunks)
    retriever = vector_db.as_retriever(search_kwargs={"k": 3})
    
    # 4. Setup Gemini LLM
    llm = ChatGoogleGenerativeAI(model="gemini-pro", google_api_key=GOOGLE_API_KEY, temperature=0.3)
    
    # 5. Retrieve Context based on the inmate's survey summary
    # We search the medical records for symptoms mentioned in the survey
    relevant_docs = retriever.get_relevant_documents(f"treatment guidelines for {survey_summary}")
    context_text = "\n".join([doc.page_content for doc in relevant_docs])
    
    # 6. Define the Prompt
    template = """
    You are an AI assistant for a Prison Management System.
    
    User Context:
    - Name: {name}
    - Age: {age}
    - Gender: {gender}
    - Recent Dominant Emotions (Video Analysis): {emotions}
    - Self-Reported Survey Summary: {survey}
    
    Relevant Medical Guidelines/Records (from Vector DB):
    {context}
    
    Based on the above, provide a structured JSON response with the following keys:
    1. "Current_Situation": Analysis of their mental state.
    2. "Health_Profile": Risk level (Low/Medium/High) and observations.
    3. "Recommended_Actions": Specific rehabilitation steps or counselor interventions.
    
    Response (JSON only):
    """
    
    prompt = PromptTemplate(
        template=template,
        input_variables=["context", "name", "age", "gender", "emotions", "survey"]
    )
    
    # 7. Generate Response
    final_prompt = prompt.format(
        context=context_text,
        name=inmate_data.name,
        age=inmate_data.age,
        gender=inmate_data.gender,
        emotions=recent_emotions,
        survey=survey_summary
    )
    
    response = llm.invoke(final_prompt)
    return response.content