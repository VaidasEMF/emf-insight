
from sqlalchemy import inspect, text

from db.database import engine


def migrate_measurement_cycle_data():

    if engine.dialect.name != "postgresql":
        raise RuntimeError("This migration requires PostgreSQL.")

    inspector = inspect(engine)

    if not inspector.has_table("measurement_cycles"):
        raise RuntimeError(
            "measurement_cycles table does not exist."
        )

    with engine.begin() as connection:

        connection.execute(text("""
            CREATE TABLE IF NOT EXISTS measurement_cycle_data (
                id SERIAL PRIMARY KEY,

                measurement_cycle_id INTEGER NOT NULL,

                schema_version INTEGER NOT NULL DEFAULT 1,

                data JSONB NOT NULL,

                created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),

                updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),

                CONSTRAINT uq_measurement_cycle_data_cycle
                    UNIQUE (measurement_cycle_id),

                CONSTRAINT ck_measurement_cycle_data_schema_version
                    CHECK (schema_version > 0),

                CONSTRAINT fk_measurement_cycle_data_cycle
                    FOREIGN KEY (measurement_cycle_id)
                    REFERENCES measurement_cycles(id)
                    ON DELETE RESTRICT
            )
        """))

    inspector = inspect(engine)

    required_columns = {
        "id",
        "measurement_cycle_id",
        "schema_version",
        "data",
        "created_at",
        "updated_at",
    }

    actual_columns = {
        column["name"]
        for column in inspector.get_columns(
            "measurement_cycle_data"
        )
    }

    missing_columns = required_columns - actual_columns

    if missing_columns:
        raise RuntimeError(
            f"Migration verification failed. "
            f"Missing columns: {missing_columns}"
        )

    foreign_keys = inspector.get_foreign_keys(
        "measurement_cycle_data"
    )

    cycle_fk_exists = any(
        fk["referred_table"] == "measurement_cycles"
        and fk["constrained_columns"] == ["measurement_cycle_id"]
        for fk in foreign_keys
    )

    if not cycle_fk_exists:
        raise RuntimeError(
            "Migration verification failed. "
            "Measurement Cycle foreign key is missing."
        )

    print("Migration completed successfully.")
    print("Verified columns:", sorted(required_columns))
    print("Verified FK: measurement_cycle_id -> measurement_cycles.id")


if __name__ == "__main__":
    migrate_measurement_cycle_data()
