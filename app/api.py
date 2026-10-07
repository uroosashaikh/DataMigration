

from fastapi import FastAPI, UploadFile, File, Form, HTTPException
from app import database
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
from pathlib import Path
import shutil
from app import schema_loader

UPLOAD_DIR = Path("data/uploads")
app = FastAPI(
    title="Data Migration API",
    version="1.0.0"
)

app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:3000"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


class CreateProjectRequest(BaseModel):
    project_name: str
    source: str
    target: str


@app.post("/createProject")
async def createProject(
    project_name: str = Form(...),
    source: str = Form(...),
    target: str = Form(...),
    source_schema: UploadFile = File(...),
    target_schema: UploadFile = File(...)
):
    try:
        # 1. Create project in database
        project_id = database.create_project(project_name, source, target)

        # 2. Read source schema (Triggers ValueError if columns are missing)
        source_df = await schema_loader.load_schema(source_schema)

        # 3. Read target schema (Triggers ValueError if columns are missing)
        target_df = await schema_loader.load_schema(target_schema)

        # 4. Insert source fields
        database.insert_schema_fields(
            project_id,
            "sourceSchema",
            source_df
        )

        # 5. Insert target fields
        database.insert_schema_fields(
            project_id,
            "targetSchema",
            target_df
        )

        # 6. Return successful result
        return {
            "success": True,
            "project_id": project_id,
            "source_fields": len(source_df),
            "target_fields": len(target_df)
        }

    except ValueError as val_err:
        # Catches missing columns (fieldtype, size) and returns a clean 400 Bad Request
        raise HTTPException(
            status_code=400,
            detail=f"Schema Validation Error: {str(val_err)}"
        )

    except Exception as e:
        # Catches database connection drops or any other generic code crashes
        raise HTTPException(
            status_code=500,
            detail=f"Internal Database Server Error: {str(e)}"
        )


async def save_file(upload_file, project_id, file_type):

    project_directory = UPLOAD_DIR / str(project_id)

    project_directory.mkdir(
        parents=True,
        exist_ok=True
    )

    extension = Path(upload_file.filename).suffix

    file_path = (
        project_directory
        / f"{file_type.lower()}_schema{extension}"
    )

    with open(file_path, "wb") as buffer:
        shutil.copyfileobj(
            upload_file.file,
            buffer
        )

    return file_path

@app.get("/")
def root():
    return {
        "message": "Data Migration API is running"
    }

@app.get("/health")
def health():
    return {
        "status": "healthy"
    }