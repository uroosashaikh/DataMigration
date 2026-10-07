import math
import json
from app import schema_loader
from app import llm_client
from app import database
from .models import Mapping
from .prompt_builder import build_prompt
from pathlib import Path

BASE_DIR = Path(__file__).resolve().parent.parent
source_file = BASE_DIR / "data" / "source.json"
target_file = BASE_DIR / "data" / "target.json"

def main():

    validated_mappings = []
    print("This is the entry point.")
    # Commenting while i test as i already have used this function to convert my excel to json.
    # schema_loader.create_json_files("Source Schema SAP.xlsx", "source")
    # schema_loader.create_json_files("Target Schema CompanyMaster.xlsx","target")
    source_schema = schema_loader.read_schema(source_file)
    target_schema = schema_loader.read_schema(target_file)
    previous_mappings = database.get_previous_mappings(source, target)
    prompt = build_prompt(source_schema, target_schema, previous_mappings)
    # Commenting for test as we are not calling the LLM while testing.calling a function that reads response from excel/json
    # result = get_mapping(prompt)
    result = llm_client.get_mapping_from_file(prompt)
    print(result)
    for item in result:
         risk = item["Risk Level"]
         if isinstance(risk, float) and math.isnan(risk):
             risk = None
         mapping = Mapping(
             source_field=item["Source Field"],
             target_field=item["Target Field"],
             confidence=item["Mapping Score"],
             reasoning=item["Explanation"],
             risk_level=risk,
             comments=item["Comments"]
         )
         validated_mappings.append(mapping)
    print(validated_mappings)
    database.save_mapping(validated_mappings, project_id, source, target)
    database.save_llm_execution(str(result), prompt, project_id)

    # with open("../output/mappings.json", "w") as file:
    #     file.write(validated_mappings)


if __name__ == "__main__":
    main()