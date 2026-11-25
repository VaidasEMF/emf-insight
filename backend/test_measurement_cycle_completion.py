import unittest

from routes.projects import (
    _calculate_measurement_cycle_completion,
)


def make_floor(measured_count, total_count=3):
    zone = {
        "id": "test_zone",
        "type": "bed",
        "zoneType": "bed",
        "x": 100,
        "y": 100,
        "measurementZoneDimensions": {
            "width": 200,
            "depth": 200,
        },
        "measurementPoints": [
            {
                "id": f"measurement_test_zone_{i}",
                "status": (
                    "measured" if i <= measured_count else "pending"
                ),
            }
            for i in range(1, total_count + 1)
        ],
    }

    return {
        "currentScale": 1,
        "zones": [zone],
    }


class MeasurementCycleCompletionTests(unittest.TestCase):

    def test_empty_cycle(self):
        result = _calculate_measurement_cycle_completion({})

        self.assertFalse(result["eligible"])
        self.assertEqual(result["overall_percent"], 0)
        self.assertEqual(result["total_points"], 0)

    def test_area_below_50_percent(self):
        result = _calculate_measurement_cycle_completion({
            "floor_1": make_floor(1),
        })

        self.assertEqual(result["areas"][0]["percent"], 33)
        self.assertFalse(result["areas"][0]["eligible"])
        self.assertFalse(result["eligible"])

    def test_area_above_60_percent(self):
        result = _calculate_measurement_cycle_completion({
            "floor_1": make_floor(2),
        })

        self.assertEqual(result["areas"][0]["percent"], 67)
        self.assertTrue(result["eligible"])
        self.assertEqual(result["overall_percent"], 67)

    def test_multiple_areas_each_must_reach_50_percent(self):
        result = _calculate_measurement_cycle_completion({
            "floor_1": make_floor(2),
            "floor_2": make_floor(1),
        })

        self.assertEqual(result["overall_percent"], 50)
        self.assertTrue(result["areas"][0]["eligible"])
        self.assertFalse(result["areas"][1]["eligible"])
        self.assertFalse(result["eligible"])


if __name__ == "__main__":
    unittest.main(verbosity=2)