import sqlite3

# 🔥 change if your DB file has different name
DB_NAME = "app.db"

conn = sqlite3.connect(DB_NAME)

cur = conn.cursor()

try:

    cur.execute("""
        ALTER TABLE users
        ADD COLUMN plan TEXT
        """)

    print("✅ plan column added")

except Exception as e:

    print("ℹ️", e)

# 🔥 set default plan
cur.execute("""
    UPDATE users
    SET plan='premium'
    WHERE plan IS NULL
    """)

conn.commit()

conn.close()

print("✅ DB fixed")
