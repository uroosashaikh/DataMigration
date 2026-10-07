from . import connection as DB
import logging

def get_connection():
    return DB.connect()

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