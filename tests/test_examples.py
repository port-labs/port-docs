import unittest

class TestScorecardExamples(unittest.TestCase):

    def test_ownership_scorecard(self):
        ownership_scorecard = {
            "title": "Ownership",
            "identifier": "ownership",
            "filter": {
                "combinator": "and",
                "conditions": [
                    {
                        "property": "is_production",
                        "operator": "=",
                        "value": True
                    }
                ]
            },
            "rules": [
                {
                    "title": "Has on call?",
                    "identifier": "has_on_call",
                    "level": "Gold",
                    "query": {
                        "combinator": "and",
                        "conditions": [
                            {"operator": "isNotEmpty", "property": "on_call"},
                            {"operator": "<", "property": "open_incidents", "value": 5}
                        ]
                    }
                },
                {
                    "title": "Has a team?",
                    "identifier": "has_team",
                    "level": "Silver",
                    "query": {
                        "combinator": "and",
                        "conditions": [
                            {"operator": "isNotEmpty", "property": "$team"}
                        ]
                    }
                }
            ]
        }
        self.assertEqual(ownership_scorecard["filter"]["conditions"][0]["property"], "is_production")
        self.assertEqual(ownership_scorecard["rules"][0]["level"], "Gold")

    def test_domain_definition(self):
        domain_definition = {
            "title": "Domain definition",
            "identifier": "domain_definition",
            "rules": [
                {
                    "identifier": "hasDomain",
                    "title": "Has domain",
                    "level": "Bronze",
                    "query": {
                        "combinator": "and",
                        "conditions": [
                            {"operator": "isNotEmpty", "relation": "domain"}
                        ]
                    }
                }
            ]
        }
        self.assertEqual(domain_definition["rules"][0]["level"], "Bronze")

    def test_dora_metrics(self):
        dora_metrics = {
            "title": "DORA Metrics",
            "identifier": "dora_metrics",
            "rules": [
                {
                    "identifier": "deployFreqBronze",
                    "title": "Deployment frequency > 2",
                    "level": "Bronze",
                    "query": {
                        "combinator": "and",
                        "conditions": [
                            {"operator": ">", "property": "deployment_frequency", "value": 3}
                        ]
                    }
                },
                {
                    "identifier": "deployFreqSilver",
                    "title": "Deployment frequency > 4",
                    "level": "Silver",
                    "query": {
                        "combinator": "and",
                        "conditions": [
                            {"operator": ">", "property": "deployment_frequency", "value": 4}
                        ]
                    }
                }
            ]
        }
        self.assertEqual(dora_metrics["rules"][0]["identifier"], "deployFreqBronze")
        self.assertEqual(dora_metrics["rules"][1]["level"], "Silver")

if __name__ == "__main__":
    unittest.main()
