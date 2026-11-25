import unittest

from engine.analysis.home.deeper_analysis import validate_input


class DeeperAnalysisValidationTests(unittest.TestCase):

    def make_project(self, zone):
        return {
            "type": "home",
            "floors": [
                {
                    "id": "floor_1",
                    "zones": [zone],
                }
            ],
            "homeMeasurementProfile": {
                "measurementTypes": ["rf"],
            },
        }

    def test_all_supported_lifestyle_zone_types(self):
        supported_types = [
            "sleep",
            "work",
            "rest",
            "relax",
            "child",
        ]

        for zone_type in supported_types:
            with self.subTest(zone_type=zone_type):
                result = validate_input(
                    self.make_project({
                        "id": f"zone_{zone_type}",
                        "zoneType": zone_type,
                        "type": "sofa",
                    })
                )

                self.assertTrue(result["valid"])
                self.assertEqual(
                    len(result["lifestyle_zones"]),
                    1,
                )

    def test_zone_type_has_priority_over_object_type(self):
        result = validate_input(
            self.make_project({
                "id": "zone_1",
                "type": "bed",
                "zoneType": "sleep",
            })
        )

        self.assertTrue(result["valid"])
        self.assertEqual(
            result["lifestyle_zones"][0]["zoneType"],
            "sleep",
        )

    def test_invalid_lifestyle_type_is_rejected(self):
        result = validate_input(
            self.make_project({
                "id": "zone_invalid",
                "zoneType": "unknown",
                "type": "sofa",
            })
        )

        self.assertFalse(result["valid"])
        self.assertIn(
            "No Lifestyle Areas found in the project.",
            result["errors"],
        )


if __name__ == "__main__":
    unittest.main()