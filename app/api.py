

from fastapi import FastAPI, UploadFile, File, Form, HTTPException
from app import database
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
from pathlib import Path
import os
import shutil
from dotenv import load_dotenv
from app import schema_loader
from app.models import MappingReviewRequest

load_dotenv()

UPLOAD_DIR = Path("data/uploads")
# There is no authentication yet, so every review is attributed to this user.
CURRENT_USER = os.getenv("CURRENT_USER", "Farisha Shaikh")
NO_MAPPING = "NO MAPPING"
REVIEW_STATUSES = {
    "approve": "Approved",
    "reject": "Rejected",
    "update": "Modified",
}
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


@app.get("/projects/{project_id}")
def get_project(project_id: str):
    try:
        project = database.get_project(project_id)
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Internal Database Server Error: {str(e)}")
    if project is None:
        raise HTTPException(status_code=404, detail="Project not found")
    return project


@app.get("/projects/{project_id}/mappings")
def get_project_mappings(project_id: str):
    try:
        return database.get_mappings(project_id)
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Internal Database Server Error: {str(e)}")


@app.get("/projects/{project_id}/target-fields")
def get_project_target_fields(project_id: str):
    try:
        return database.get_target_field_names(project_id)
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Internal Database Server Error: {str(e)}")


@app.patch("/mappings/{mapping_id}")
def review_mapping(mapping_id: str, review: MappingReviewRequest):
    try:
        mapping = database.get_mapping(mapping_id)
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Internal Database Server Error: {str(e)}")
    if mapping is None:
        raise HTTPException(status_code=404, detail="Mapping not found")

    comment = review.comment.strip() if review.comment else None
    target_field = None

    if review.action == "update":
        target_field = (review.target_field or "").strip()
        if not target_field:
            raise HTTPException(status_code=400, detail="A target field is required to update a mapping")
        if not comment:
            raise HTTPException(status_code=400, detail="A comment explaining the change is required")
        if target_field != NO_MAPPING:
            try:
                valid_fields = database.get_target_field_names(mapping["project_id"])
            except Exception as e:
                raise HTTPException(status_code=500, detail=f"Internal Database Server Error: {str(e)}")
            if target_field not in valid_fields:
                raise HTTPException(
                    status_code=400,
                    detail=f"'{target_field}' is not a field in this project's target schema",
                )

    try:
        database.review_mapping(
            mapping_id,
            status=REVIEW_STATUSES[review.action],
            reviewer=CURRENT_USER,
            target_field=target_field,
            comment=comment,
            set_comment="comment" in review.model_fields_set,
        )
        return database.get_mapping(mapping_id)
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Internal Database Server Error: {str(e)}")


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