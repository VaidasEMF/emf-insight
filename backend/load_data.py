import pandas as pd
import json

# 1. nuskaityti CSV
df = pd.read_csv("measurements.csv")

print("RAW DATA:")
print(df.head())

# 2. grupuoti pagal kambarius
rooms = []

for room_name, group in df.groupby("room"):

    print(f"\nProcessing room: {room_name}")

    points = []

    for _, row in group.iterrows():
        point = {
            "id": row["point_id"],
            "x": float(row["x"]),
            "y": float(row["y"]),
            "rf_before": float(row["rf_before"]),
            "rf_after": float(row["rf_after"]),
            "electric": float(row["electric"]),
            "magnetic": float(row["magnetic"])
        }
        points.append(point)

    rooms.append({
        "name": room_name,
        "points": points
    })

# 3. galutinis JSON
data = {
    "rooms": rooms
}

# 4. išsaugoti JSON
with open("output.json", "w") as f:
    json.dump(data, f, indent=2)

print("\n✅ JSON sukurtas: output.json")