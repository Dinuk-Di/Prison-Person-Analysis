import os
from typing import List
from pydantic import BaseModel, Field
from langchain_chroma import Chroma
from langchain_core.prompts import PromptTemplate
from langchain_openai import ChatOpenAI
from langchain_huggingface import HuggingFaceEmbeddings
from dotenv import load_dotenv

load_dotenv()

class HealthProfile(BaseModel):
    risk_level: str = Field(description="Risk level: Low, Medium, or High")
    suspected_conditions: List[str] = Field(description="List of potential mental health conditions identified")
    recommended_actions: List[str] = Field(description="Actionable steps for prison staff")
    urgent_alert: bool = Field(description="True if immediate medical intervention is required, else False")
    reasoning: str = Field(description="A brief summary explaining why this risk level was assigned")


llm = ChatOpenAI(
    model="gpt-4o",  
    temperature=0.0, 
    api_key=os.getenv("OPENAI_API_KEY")
)

structured_llm = llm.with_structured_output(HealthProfile)

PERSIST_DIRECTORY = "./chroma_db"

def generate_health_profile(inmate_data, emotion_history, survey_summary):
    try:
        embeddings = HuggingFaceEmbeddings(model_name="sentence-transformers/all-MiniLM-L6-v2")
        vector_db = Chroma(persist_directory=PERSIST_DIRECTORY, embedding_function=embeddings)
        retriever = vector_db.as_retriever(search_kwargs={"k": 3})
        query = f"treatment guidelines for {survey_summary} and mental health interventions"
        relevant_docs = retriever.invoke(query)
        context_text = "\n\n".join([doc.page_content for doc in relevant_docs])
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
        Analyze the inputs and generate a health profile based strictly on the schema provided.
        """
        
        prompt = PromptTemplate(
            template=template,
            input_variables=["name", "age", "crime", "emotions", "survey", "context"]
        )
        chain = prompt | structured_llm
        inmate_name = getattr(inmate_data, 'name', 'Unknown Inmate')
        response_obj = chain.invoke({
            "name": inmate_name,
            "age": getattr(inmate_data, 'age', 'N/A'),
            "crime": getattr(inmate_data, 'crime_details', 'N/A'),
            "emotions": emotion_history,
            "survey": survey_summary,
            "context": context_text
        })
        return response_obj.model_dump()

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