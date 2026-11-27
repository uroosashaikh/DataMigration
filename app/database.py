from . import connection as DB
import logging
import pymysql

def get_connection():
    return DB.connect()

MAPPING_COLUMNS = """
    MappingId AS mapping_id,
    ProjectId AS project_id,
    SourceField AS source_field,
    TargetField AS target_field,
    Confidence AS confidence,
    Reasoning AS reasoning,
    Status AS status,
    ReviewComment AS review_comment,
    ReviewedBy AS reviewed_by,
    ReviewedDate AS reviewed_date,
    UpdatedBy AS updated_by,
    UpdatedDate AS updated_date
"""

def get_project(project_id):
    conn = get_connection()
    try:
        with conn.cursor(pymysql.cursors.DictCursor) as cursor:
            cursor.execute(
                """
                SELECT
                    ProjectId AS project_id,
                    ProjectName AS project_name,
                    SourceSystem AS source_system,
                    TargetSystem AS target_system
                FROM migrationProjects
                WHERE ProjectId = %s
                """,
                (project_id,),
            )
            return cursor.fetchone()
    finally:
        conn.close()

def get_mappings(project_id):
    conn = get_connection()
    try:
        with conn.cursor(pymysql.cursors.DictCursor) as cursor:
            cursor.execute(
                f"SELECT {MAPPING_COLUMNS} FROM Mappings WHERE ProjectId = %s ORDER BY SourceField",
                (project_id,),
            )
            return cursor.fetchall()
    finally:
        conn.close()

def get_mapping(mapping_id):
    conn = get_connection()
    try:
        with conn.cursor(pymysql.cursors.DictCursor) as cursor:
            cursor.execute(
                f"SELECT {MAPPING_COLUMNS} FROM Mappings WHERE MappingId = %s",
                (mapping_id,),
            )
            return cursor.fetchone()
    finally:
        conn.close()

def get_target_field_names(project_id):
    conn = get_connection()
    try:
        with conn.cursor() as cursor:
            cursor.execute(
                "SELECT FieldName FROM targetSchema WHERE ProjectId = %s ORDER BY FieldName",
                (project_id,),
            )
            return [row[0] for row in cursor.fetchall()]
    finally:
        conn.close()

def review_mapping(mapping_id, status, reviewer, target_field=None, comment=None, set_comment=False):
    """Record a review decision. The comment is only written when set_comment is True,
    so quick approve/reject actions keep the existing comment."""
    assignments = [
        "Status = %s",
        "ReviewedBy = %s",
        "ReviewedDate = NOW()",
        "UpdatedBy = %s",
        "UpdatedDate = NOW()",
    ]
    params = [status, reviewer, reviewer]
    if target_field is not None:
        assignments.append("TargetField = %s")
        params.append(target_field)
    if set_comment:
        assignments.append("ReviewComment = %s")
        params.append(comment)
    params.append(mapping_id)

    conn = get_connection()
    try:
        with conn.cursor() as cursor:
            cursor.execute(
                f"UPDATE Mappings SET {', '.join(assignments)} WHERE MappingId = %s",
                params,
            )
        conn.commit()
    except Exception:
        conn.rollback()
        raise
    finally:
        conn.close()

def create_project(name, source, target):
    query = """
            INSERT INTO migrationProjects
        (
            CompanyId,
            CompanyName,
            ProjectId,
            ProjectName,
            SourceSystem,
            TargetSystem,
            CreatedDate
        )
            VALUES ('2026', 'Demo', %s, %s, %s, %s,NOW())
            """
    conn = get_connection()
    cursor = conn.cursor()
    cursor.execute("select UUID()")
    projectid = cursor.fetchone()[0]
    params = (projectid,name,source,target)
    cursor.execute(query, params)
    conn.commit()
    return projectid

def save_mapping(mapping, projectid, source, target):
    try:
        conn = get_connection()
        cursor = conn.cursor()
        query = """
            INSERT INTO Mappings
            (
                MappingId,
                ProjectId,
                SourceSystem,
                TargetSystem,
                SourceField,
                TargetField,
                Confidence,
                Reasoning,
                Status,
                CreatedBy,
                CreatedDate,
                UpdatedBy,
                UpdatedDate,
                ApprovedBy,
                ApprovedDate
            )
            VALUES (UUID(), %s, %s, %s, %s, %s, %s, %s, 'Suggested', '', NOW(),'', NOW(),'', NOW())
            """
        params = [(projectid, source, target, m.source_field, m.target_field, m.confidence, m.reasoning ) for m in mapping]
        print(params)
        cursor.executemany(query, params)
        conn.commit()

    except Exception as e:
        conn.rollback()
        print(f"Error saving mappings: {e}")
        raise

    finally:
        cursor.close()
        conn.close()

def save_llm_execution(result, prompt, projectid):
    conn = get_connection()
    cursor = conn.cursor()
    query = """
        INSERT INTO LLMExecutions
        (
        ExecutionId,
        ProjectId,
        Prompt,
        Response,
        Model,
        ExecutionDate
        )
        VALUES (UUID(), %s, %s, %s, 'GPT4', NOW())
        """
    params = (projectid, prompt, result)
    cursor.execute(query, params)
    conn.commit()

    cursor.close()
    conn.close()

def get_previous_mappings(source, target):
    conn = get_connection()
    cursor = conn.cursor()
    query = """
        SELECT
            SourceField,
            TargetField
        FROM Mappings m
        JOIN migrationProjects p
            ON m.ProjectId = p.ProjectId
        WHERE
            (p.SourceSystem = %s
            OR p.TargetSystem = %s)
            AND m.Status = 'Approved'
        """
    params = (source, target)
    cursor.execute(query,params)
    rows = cursor.fetchall()

    if rows:
        for row in rows:
            print(row)
        return rows
    else:
        print("No mapping found. ")
        return 0

    # def get_source_patterns(source):
    #     return 0

    # def get_learning_context(source, target):
    #     exact_matches = get_previous_mappings(source, target)
    #
    #     if exact_matches:
    #         return exact_matches
    #
    #     return get_source_patterns(source)


def insert_schema_fields(project_id, schemaType, df):
    try:
        conn = get_connection()
        cursor = conn.cursor()

        query = f"""
            INSERT INTO {schemaType}
            (
                ProjectId,
                FieldName,
                Description,
                FieldType,
                Size,
                Comments,
                CreatedDate
            )
            VALUES
            (
                %s, %s, %s, %s, %s, %s, NOW()
            )
        """
        params = []
        for _, row in df.iterrows():
            params.append(
                (
                    project_id,
                    row["fieldname"],
                    row["description"],
                    row["fieldtype"],
                    row["size"],
                    row["comments"]
                )
            )
        if params:
            print(f"parameters are {params}")
            cursor.executemany(query, params)
            conn.commit()

    except Exception as e:
        conn.rollback()
        print(f"Error saving mappings: {e}")
        raise

    finally:
        print(cursor._executed)
        cursor.close()
        conn.close()