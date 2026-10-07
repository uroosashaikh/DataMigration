from io import BytesIO

import pandas as pd
import json
from app import prompt_builder
import pandas as pd
from fastapi import UploadFile
import numpy as np

REQUIRED_COLUMNS = {
    "fieldname",
    "description",
    "fieldtype",
    "size",
    "comments",
}

def create_json_files(filename, type="jsonResponse"):
    # Load the Excel file
    # You can specify a sheet name with: sheet_name='Sheet1'
    prompt = ""
    print(filename)
    filename_json= type+".json"
    excel_df = pd.read_excel(f"{filename}", engine='openpyxl')

    try:
        # Convert to JSON
        # 'records' orientation creates a list of objects (standard for JSON data)
        json_data = excel_df.to_json(orient='records')
        json_string = json.dumps(excel_df.to_dict(orient="records"), indent=4)
        # Save the JSON to a file
        with open(f"../data/{filename_json}", 'w') as f:
            f.write(json_string)
        print(f"file converted successfully - {filename_json}")
    except Exception as e:
        # By this way we can know about the type of error occurring
        print("There was an error in creating json file, the error is: ", e)

def read_schema(path):
    with open(path, "r") as file:
        return json.load(file)

async def load_schema(upload_file: UploadFile):

    contents = await upload_file.read()
    df = pd.read_excel(BytesIO(contents))

    # Normalize column names
    df.columns = [
        str(column).strip().lower()
        for column in df.columns
    ]
    print(f"Columns - {df.columns}")
    missing_columns = REQUIRED_COLUMNS - set(df.columns)

    if missing_columns:
        raise ValueError(
            f"Missing required columns: {', '.join(sorted(missing_columns))}"
        )

    # Replace NaN with None
    df = df.replace({np.nan: None, np.inf: None, -np.inf: None})
    print(f"returning dataframe to insert WITHOUT nan {df}")
    return df