# Custom API Integration for DORA Metrics

If your team relies on custom tooling, internal scripts, or external systems, Port’s API integration enables you to track both deployments and incidents directly. This flexible approach ensures that your DORA metrics accurately reflect your unique workflows, regardless of your underlying technologies or systems.

### Prerequisites
- An installed DORA Metrics experience.
- Admin permissions in Port.

### Get started

**1. Obtain your client ID and client secret**
- In Port, click the ... menu in the top right corner.
- Select Credentials.
- Copy your client ID and client secret for API authentication.

**2. Create a deployment entity (Python)**
Use the client credentials from the previous step to retrieve an API access token,
Then send a POST request to the Port API to create a deployment entity.

Below is an example using Python:
```python
import requests

# Consider using environment variables instead of the hardcoded values
CLIENT_ID = "YOUR_CLIENT_ID"
CLIENT_SECRET = "YOUR_CLIENT_SECRET"
PORT_API_URL = "https://api.port.io"

# Step 1: Get the access token

auth_response = requests.post(
    f"{PORT_API_URL}/v1/auth/access_token",
    json={
        "clientId": CLIENT_ID,
        "clientSecret": CLIENT_SECRET
    }
)

auth_response.raise_for_status()
access_token = auth_response.json().get("accessToken")

# Step 2: Use the access token to create a deployment entity

blueprint_id = "dora_deployment"

entity = {
    "identifier": "some_deployment_1", # Unique identifier for the deployment
    "title": "Some Deployment",
    "properties": {
        "lead_time_hours": 0,
        "deployment_time": "2025-01-01T00:00:00.000Z",
        "deployment_type": "Custom API",
        "environment": "production",
        "status": "success"
    },
    "relations": {
        "group": "all_teams"
    }
}

headers = {
    "Authorization": f"Bearer {access_token}"
}

res = requests.post(
    f"{PORT_API_URL}/v1/blueprints/{blueprint_id}/entities?upsert=true",
    json=entity,
    headers=headers
)

res.raise_for_status()
```

**3. Create an incident entity (Python)**

Similarly, create incidents using Port's API:

```python
import requests

# Consider using environment variables instead of the hardcoded values
CLIENT_ID = "YOUR_CLIENT_ID"
CLIENT_SECRET = "YOUR_CLIENT_SECRET"
PORT_API_URL = "https://api.port.io"

# Step 1: Get the access token

auth_response = requests.post(
    f"{PORT_API_URL}/v1/auth/access_token",
    json={
        "clientId": CLIENT_ID,
        "clientSecret": CLIENT_SECRET
    }
)

auth_response.raise_for_status()
access_token = auth_response.json().get("accessToken")

# Step 2: Use the access token to create an incident entity

blueprint_id = "dora_incident"

entity = {
    "identifier": "some_incident_1",
    "title": "Some Incident",
    "properties": {
        "incident_type": "Custom incident",
        "description": "some description",
        "status": "resolved",
        "incident_url": "https://example.com",
        "created_at": "2025-01-01T00:00:00.000Z",
        "resolved_at": "2025-01-01T00:00:00.000Z",
        "priority": "low",
        "time_to_resolve": 0,
        "urgency": "low"
    },
    "relations": {
        "group": "all_teams"
    }
}

headers = {
    "Authorization": f"Bearer {access_token}"
}

res = requests.post(
    f"{PORT_API_URL}/v1/blueprints/{blueprint_id}/entities?upsert=true",
    json=entity,
    headers=headers
)

res.raise_for_status()
```

### Advanced Use Cases

**Automated Event Tracking**: Incorporate API calls into existing CI/CD pipelines or incident management scripts for automatic tracking.

**Contextual Insights**: Add relations to teams or services to enhance analytics within your DORA dashboards.

### Tips & Best practices

Use environment variables or a secrets manager for credentials—avoid hardcoding sensitive data in scripts.
Refer to the Port API reference documentation for more advanced use cases, such as updating or deleting entities.

With this custom API approach, you can bring any deployment or incident event into Port for unified, accurate DORA tracking—no matter where or how it happens in your software delivery pipeline.

