import os
from openai import OpenAI
from dotenv import load_dotenv
from app import schema_loader
from pathlib import Path

BASE_DIR = Path(__file__).resolve().parent.parent
recom_file = BASE_DIR / "data" / "mapping_recommendations.xlsx"
response_file = BASE_DIR / "data" / "response.json"
load_dotenv()
client = OpenAI(api_key=os.getenv("OPENAI_API_KEY"))

def get_mapping(prompt):
    response = client.chat.completions.create(
        model="gpt-4.1-mini",
        messages=[
            {
                "role": "user",
                "content": prompt
            }
        ],
        temperature=0
    )
    return response.choices[0].message.content

def get_mapping_from_file(prompt):
    schema_loader.create_json_files(recom_file, "response")
    response = schema_loader.load_schema(response_file)
    return response