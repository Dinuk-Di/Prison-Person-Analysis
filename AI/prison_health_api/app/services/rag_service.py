import os
from typing import List
from langchain_chroma import Chroma
from langchain_core.prompts import PromptTemplate
from langchain_core.output_parsers import JsonOutputParser
from pydantic import BaseModel, Field
from langchain_google_genai import ChatGoogleGenerativeAI
from langchain_huggingface import HuggingFaceEmbeddings
from dotenv import load_dotenv

load_dotenv()

# --- 1. Define the Structure (Schema) ---
class HealthProfile(BaseModel):
    risk_level: str = Field(description="Risk level: Low, Medium, or High")
    suspected_conditions: List[str] = Field(description="List of potential mental health conditions identified")
    recommended_actions: List[str] = Field(description="Actionable steps for prison staff")
    urgent_alert: bool = Field(description="True if immediate medical intervention is required, else False")
    reasoning: str = Field(description="A brief summary explaining why this risk level was assigned")

# Setup Gemini
llm = ChatGoogleGenerativeAI(
    model="gemini-2.0-flash",
    temperature=0.3,
    google_api_key=os.getenv("GOOGLE_API_KEY")
)

PERSIST_DIRECTORY = "./chroma_db"

def generate_health_profile(inmate_data, emotion_history, survey_summary):
    try:
        # Setup Embeddings & DB
        embeddings = HuggingFaceEmbeddings(model_name="sentence-transformers/all-MiniLM-L6-v2")
        vector_db = Chroma(persist_directory=PERSIST_DIRECTORY, embedding_function=embeddings)
        retriever = vector_db.as_retriever(search_kwargs={"k": 3})
        
        # Retrieve Context
        query = f"treatment guidelines for {survey_summary} and mental health interventions"
        relevant_docs = retriever.invoke(query)
        context_text = "\n\n".join([doc.page_content for doc in relevant_docs])
        
        # --- 2. Setup the Parser ---
        parser = JsonOutputParser(pydantic_object=HealthProfile)

        # --- 3. Update Prompt with Format Instructions ---
        template = """
        You are an AI Prison Health Assistant. Analyze the inmate's profile based on the data provided.
        
        INMATE INFO:
        Name: {name}
        Age: {age}
        Crime: {crime}
        
        RECENT EMOTIONS (Video Analysis):
        {emotions}
        
        SELF-REPORTED SYMPTOMS (Survey):
        {survey}
        
        MEDICAL GUIDELINES (Retrieved Context):
        {context}
        
        TASK:
        Analyze the inputs and generate a health profile.
        {format_instructions}
        """
        
        prompt = PromptTemplate(
            template=template,
            input_variables=["name", "age", "crime", "emotions", "survey", "context"],
            partial_variables={"format_instructions": parser.get_format_instructions()}
        )
        
        # --- 4. Chain with Parser ---
        chain = prompt | llm | parser
        
        # Handle missing fields safely
        inmate_name = getattr(inmate_data, 'name', 'Unknown Inmate')
        
        # Execute Chain
        response_dict = chain.invoke({
            "name": inmate_name,
            "age": getattr(inmate_data, 'age', 'N/A'),
            "crime": getattr(inmate_data, 'crime_details', 'N/A'),
            "emotions": emotion_history,
            "survey": survey_summary,
            "context": context_text
        })
        
        # The 'response_dict' is now a real Python dictionary, not a string!
        return response_dict

    except Exception as e:
        print(f"Error generating profile: {e}")
        # Return a safe fallback structure on error
        return {
            "risk_level": "Unknown",
            "suspected_conditions": [],
            "recommended_actions": ["System Error - Manual Review Required"],
            "urgent_alert": False,
            "reasoning": str(e)
        }