import sqlite3

conn = sqlite3.connect("app.db")
cursor = conn.cursor()

user_id = 1

cursor.execute(
    """
    DELETE FROM project_versions
    WHERE project_id IN (
        SELECT id
        FROM projects
        WHERE user_id = ?
    )
    """,
    (user_id,)
)

cursor.execute(
    """
    DELETE FROM projects
    WHERE user_id = ?
    """,
    (user_id,)
)

conn.commit()

print("Deleted projects:", cursor.rowcount)

conn.close()