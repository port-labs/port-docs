---
displayed_sidebar: null
description: Learn how to centralize internal documentation and enable AI-powered question answering using Port's general AI interface
---

import Tabs from "@theme/Tabs"
import TabItem from "@theme/TabItem"

# Set up internal docs for AI context


This guide demonstrates how to centralize your internal documentation in Port and enable AI-powered question answering using Port's general AI interface. By storing documentation as entities, you can ask questions like "When was this document last updated?", "Who owns this document?", or "What are all the product-related docs?" and get intelligent responses.

<img src="/img/guides/internal-docs-ai-context-1.png" width="100%" border="1px" />

## Common use cases

- **Document discovery**: Find relevant documentation quickly through natural language queries
- **Ownership tracking**: Identify document owners and maintainers
- **Version control**: Track document updates and changes over time
- **Categorization**: Organize docs by product, team, or topic for better searchability
- **Knowledge sharing**: Enable team members to find information without knowing exact document names

## Prerequisites

This guide assumes you have:
- A Port account with the [AI agents feature enabled](/ai-interfaces/ai-agents/overview#access-to-the-feature)

## Set up data model

We'll create an enhanced blueprint to store internal documentation with rich metadata for better AI context.

<h3> Create Internal Documentation blueprint</h3>

1. Go to the [Builder](https://app.getport.io/settings/data-model) page of your portal.

2. Click on `+ Blueprint`.

3. Click on `{...} Edit JSON`.

4. Copy and paste the following JSON schema:

    <details>
    <summary>Internal documentation blueprint (Click to expand)</summary>

    This blueprint stores internal documentation with rich metadata for AI context.

    ```json showLineNumbers
    {
    "identifier": "internal_docs",
    "description": "Represent internal documentation with instructions, guides, and organizational knowledge",
    "title": "Internal Documentation",
    "icon": "FileText",
    "schema": {
        "properties": {
        "content": {
            "type": "string",
            "title": "Content",
            "description": "The main document content",
            "format": "markdown"
        },
        "documentType": {
            "type": "string",
            "title": "Document Type",
            "description": "Type of document",
            "enum": ["Guide", "Policy", "Procedure", "FAQ", "Architecture", "Runbook", "API Documentation", "Onboarding", "Troubleshooting", "Best Practices"],
            "enumColors": {
            "Guide": "blue",
            "Policy": "red",
            "Procedure": "green",
            "FAQ": "yellow",
            "Architecture": "purple",
            "Runbook": "orange",
            "API Documentation": "cyan",
            "Onboarding": "pink",
            "Troubleshooting": "red",
            "Best Practices": "green"
            }
        },
        "product": {
            "type": "string",
            "title": "Product",
            "description": "Product or service this document relates to"
        },
        "team": {
            "type": "string",
            "title": "Team",
            "description": "Team responsible for this document"
        },
        "owner": {
            "type": "string",
            "title": "Owner",
            "description": "Primary owner/maintainer of this document"
        },
        "lastUpdated": {
            "type": "string",
            "format": "date-time",
            "title": "Last Updated",
            "description": "When this document was last modified"
        },
        "version": {
            "type": "string",
            "title": "Version",
            "description": "Document version number"
        },
        "status": {
            "type": "string",
            "title": "Status",
            "description": "Document status",
            "enum": ["Draft", "Review", "Approved", "Deprecated", "Archived"],
            "enumColors": {
            "Draft": "yellow",
            "Review": "orange",
            "Approved": "green",
            "Deprecated": "red",
            "Archived": "gray"
            }
        },
        "tags": {
            "type": "array",
            "title": "Tags",
            "description": "Tags for categorizing and searching documents"
        },
        "summary": {
            "type": "string",
            "title": "Summary",
            "description": "Brief summary of what this document covers"
        },
        "relatedDocs": {
            "type": "array",
            "title": "Related Documents",
            "description": "Identifiers of related documents"
        },
        "audience": {
            "type": "string",
            "title": "Audience",
            "description": "Target audience for this document",
            "enum": ["All Teams", "Engineering", "Product", "Operations", "Security", "New Hires", "Leadership"]
        },
        "priority": {
            "type": "string",
            "title": "Priority",
            "description": "Document priority level",
            "enum": ["Critical", "High", "Medium", "Low"],
            "enumColors": {
            "Critical": "red",
            "High": "orange",
            "Medium": "yellow",
            "Low": "green"
            }
        }
        },
        "required": ["content", "documentType", "summary"]
    },
    "mirrorProperties": {},
    "calculationProperties": {},
    "aggregationProperties": {},
    "relations": {}
    }
    ```
    </details>

5. Click `Create` to save the blueprint.

## Populate with sample documentation

Let's add some sample internal documentation to demonstrate the AI capabilities:

<Tabs groupId="ingestion-method" queryString defaultValue="ui" values={[
{label: "Port UI", value: "ui"},
{label: "API", value: "api"},
{label: "Webhook", value: "webhook"}
]}>

<TabItem value="ui">

<h3> API Documentation Example</h3>

1. Go to your [software catalog](https://app.getport.io/organization).

2. Find the "Internal Documentation" tab and click `+ Internal Documentation`.

3. Toggle JSON mode and copy the following:

    <details>
    <summary>API Documentation example</summary>

    ```json showLineNumbers
    {
        "properties": {
            "content": "# User Authentication API\n\n## Overview\nThis API handles user authentication and authorization for our platform.\n\n## Endpoints\n\n### POST /auth/login\nAuthenticates a user and returns a JWT token.\n\n**Request Body:**\n```json\n{\n  \"email\": \"user@example.com\",\n  \"password\": \"password123\"\n}\n```\n\n**Response:**\n```json\n{\n  \"token\": \"eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...\",\n  \"expires_in\": 3600\n}\n```\n\n### GET /auth/me\nReturns current user information.\n\n**Headers:**\n- `Authorization: Bearer <token>`\n\n**Response:**\n```json\n{\n  \"id\": \"user123\",\n  \"email\": \"user@example.com\",\n  \"name\": \"John Doe\"\n}\n```\n\n## Error Codes\n- `400`: Invalid credentials\n- `401`: Unauthorized\n- `429`: Rate limit exceeded",
            "documentType": "API Documentation",
            "product": "Authentication Service",
            "team": "Backend Engineering",
            "owner": "john.doe@company.com",
            "lastUpdated": "2024-01-15T10:30:00.000Z",
            "version": "2.1.0",
            "status": "Approved",
            "tags": ["api", "authentication", "jwt", "backend"],
            "summary": "Complete API documentation for user authentication endpoints",
            "audience": "Engineering",
            "priority": "High"
        },
        "relations": {},
        "icon": "FileText",
        "identifier": "auth-api-docs-v2",
        "title": "User Authentication API Documentation"
    }
    ```
    </details>

4. Click `Create` to save the document.

<h3> Troubleshooting Guide Example</h3>

1. Click `+ Internal Documentation` again.

2. Toggle JSON mode and copy the following:

    <details>
    <summary>Troubleshooting guide example</summary>

    ```json showLineNumbers
    {
        "properties": {
            "content": "# Database Connection Issues Troubleshooting\n\n## Common Issues\n\n### Connection Timeout\n**Symptoms:**\n- API requests timing out\n- Database connection errors in logs\n- High response times\n\n**Diagnosis:**\n1. Check database connection pool status\n2. Review connection timeout settings\n3. Monitor database server resources\n\n**Solutions:**\n1. Increase connection pool size\n2. Adjust timeout values\n3. Scale database resources\n\n### Connection Pool Exhaustion\n**Symptoms:**\n- \"No available connections\" errors\n- Application hangs\n- Database locks\n\n**Diagnosis:**\n1. Check active connections\n2. Review connection leak patterns\n3. Analyze connection usage\n\n**Solutions:**\n1. Fix connection leaks in code\n2. Implement connection monitoring\n3. Add connection pool alerts\n\n## Prevention\n- Regular connection pool monitoring\n- Code reviews for connection management\n- Load testing with realistic scenarios",
            "documentType": "Troubleshooting",
            "product": "Database Infrastructure",
            "team": "Platform Engineering",
            "owner": "jane.smith@company.com",
            "lastUpdated": "2024-01-20T14:15:00.000Z",
            "version": "1.3.0",
            "status": "Approved",
            "tags": ["database", "troubleshooting", "connections", "performance"],
            "summary": "Comprehensive guide for diagnosing and resolving database connection issues",
            "audience": "Engineering",
            "priority": "Critical"
        },
        "relations": {},
        "icon": "FileText",
        "identifier": "db-connection-troubleshooting",
        "title": "Database Connection Issues Troubleshooting Guide"
    }
    ```
    </details>

3. Click `Create` to save the document.

<h3> Onboarding Guide Example</h3>

1. Click `+ Internal Documentation` again.

2. Toggle JSON mode and copy the following:

    <details>
    <summary>Onboarding guide example</summary>

    ```json showLineNumbers
    {
        "properties": {
            "content": "# New Developer Onboarding Guide\n\n## Week 1: Environment Setup\n\n### Day 1-2: Development Environment\n1. **Access Setup**\n   - Request VPN access\n   - Set up development machine\n   - Install required tools (Docker, Git, IDE)\n\n2. **Repository Access**\n   - Clone main repositories\n   - Set up SSH keys\n   - Configure Git settings\n\n### Day 3-5: First Project\n1. **Choose Starter Task**\n   - Pick from \"good first issue\" list\n   - Set up local development environment\n   - Make first contribution\n\n## Week 2: Team Integration\n\n### Meetings and Processes\n1. **Team Meetings**\n   - Daily standups (9:30 AM)\n   - Weekly planning (Monday 2 PM)\n   - Retrospectives (Friday 4 PM)\n\n2. **Development Process**\n   - Code review process\n   - Testing requirements\n   - Deployment procedures\n\n## Resources\n- [Internal Wiki](https://wiki.company.com)\n- [API Documentation](/docs/api)\n- [Architecture Overview](/docs/architecture)\n- [Team Slack Channel](#dev-team)",
            "documentType": "Onboarding",
            "product": "Engineering",
            "team": "Engineering",
            "owner": "hr@company.com",
            "lastUpdated": "2024-01-10T09:00:00.000Z",
            "version": "3.0.0",
            "status": "Approved",
            "tags": ["onboarding", "new-hires", "development", "process"],
            "summary": "Complete onboarding guide for new developers joining the engineering team",
            "audience": "New Hires",
            "priority": "High"
        },
        "relations": {},
        "icon": "FileText",
        "identifier": "dev-onboarding-guide",
        "title": "New Developer Onboarding Guide"
    }
    ```
    </details>

3. Click `Create` to save the document.

</TabItem>

<TabItem value="api">

<h3> API Integration for Bulk Import</h3>

You can programmatically create documentation entities using Port's API:

```python showLineNumbers title="Create documentation via API"
import requests
from datetime import datetime

# Get API token
CLIENT_ID = 'YOUR_CLIENT_ID'
CLIENT_SECRET = 'YOUR_CLIENT_SECRET'
API_URL = 'https://api.getport.io/v1'

credentials = {'clientId': CLIENT_ID, 'clientSecret': CLIENT_SECRET}
token_response = requests.post(f'{API_URL}/auth/access_token', json=credentials)
access_token = token_response.json()['accessToken']

headers = {'Authorization': f'Bearer {access_token}'}

# Create API documentation entity
api_doc = {
    "properties": {
        "content": "# User Authentication API\n\n## Overview\nThis API handles user authentication...",
        "documentType": "API Documentation",
        "product": "Authentication Service",
        "team": "Backend Engineering",
        "owner": "john.doe@company.com",
        "lastUpdated": datetime.now().isoformat(),
        "version": "2.1.0",
        "status": "Approved",
        "tags": ["api", "authentication", "jwt"],
        "summary": "Complete API documentation for user authentication endpoints",
        "audience": "Engineering",
        "priority": "High"
    },
    "relations": {},
    "icon": "FileText",
    "identifier": "auth-api-docs-v2",
    "title": "User Authentication API Documentation"
}

# Create the entity
response = requests.post(
    f'{API_URL}/blueprints/internal_docs/entities', 
    json=api_doc, 
    headers=headers
)

if response.status_code == 201:
    print("Documentation entity created successfully!")
else:
    print(f"Error: {response.status_code} - {response.text}")
```

</TabItem>

<TabItem value="webhook">

<h3> Webhook Integration for Automatic Updates</h3>

Set up a webhook to automatically sync documentation from external systems:

1. Go to [data sources](https://app.getport.io/settings/data-sources).

2. Click `+ Data source` → `Webhook` → `Custom integration`.

3. Configure the webhook mapping:

```json showLineNumbers title="Documentation Webhook Mapping"
[
  {
    "blueprint": "internal_docs",
    "operation": "upsert",
    "filter": ".body.event_type == \"document_updated\"",
    "entity": {
      "identifier": ".body.doc_id",
      "title": ".body.title",
      "properties": {
        "content": ".body.content",
        "documentType": ".body.document_type",
        "product": ".body.product",
        "team": ".body.team",
        "owner": ".body.owner",
        "lastUpdated": ".body.updated_at",
        "version": ".body.version",
        "status": ".body.status",
        "tags": ".body.tags",
        "summary": ".body.summary",
        "audience": ".body.audience",
        "priority": ".body.priority"
      }
    }
  }
]
```

</TabItem>

</Tabs>

## Test AI-powered documentation queries

Now let's test the AI capabilities with various types of questions. **Key principle**: Keep questions concise when the context is clear, but add specificity when there's potential for ambiguity.

<h3> Basic document discovery</h3>

**Question**: "What API documentation do we have in our catalog?"

**Expected response**: The AI should list all documents with `documentType: "API Documentation"` and provide summaries.

**Note**: Without "in our catalog", this question is ambiguous - the AI will search Port's own API documentation (docs.getport.io) instead of your cataloged internal docs.

<h3> Ownership and maintenance</h3>

**Question**: "Who owns the authentication API documentation?"

**Expected response**: The AI should identify the owner and provide document details.

**Note**: The context of "authentication API documentation" makes it clear you're asking about cataloged docs, not external documentation.

<h3> Time-based queries</h3>

**Question**: "What documentation was updated in the last month in our catalog?"

**Expected response**: The AI should filter documents by `lastUpdated` date and show recent changes.

**Note**: Without "in our catalog", this could be ambiguous - the AI might search Port's documentation instead of your cataloged internal docs.

<h3> Product-specific queries</h3>

**Question**: "Show me all documentation related to the authentication service in our catalog"

**Expected response**: The AI should find documents where `product` contains "authentication" or related tags.

**Note**: Without "in our catalog", this could be ambiguous - the AI might search Port's documentation about authentication instead of your cataloged docs.

<h3> Status and priority queries</h3>

**Question**: "What critical documentation needs review in our catalog?"

**Expected response**: The AI should find documents with `priority: "Critical"` and `status: "Review"`.

**Note**: Without "in our catalog", this could be ambiguous - the AI might search Port's documentation instead of your cataloged internal docs.

## Advanced AI prompt techniques

Here are some effective ways to get the most out of your documentation AI:

<h3> 1. Start concise, add context only when needed:</h3>

**✅ Concise (when context is clear):**
- "Who owns the database docs?" (ownership implies cataloged entities)
- "Show me troubleshooting guides" (in catalog context, this is clear)
- "What's the status of our onboarding docs?" (status implies cataloged entities)

**✅ Add context when ambiguous with Port docs:**
- "What API documentation do we have in our catalog?" (vs Port's API docs)
- "Show me troubleshooting guides in our catalog" (vs Port's troubleshooting docs)
- "What documentation was updated recently in our catalog?" (vs Port's docs)

**❌ Ambiguous (will search Port docs instead):**
- "What API documentation do we have?" (searches docs.getport.io)
- "Show me authentication documentation" (searches Port's auth docs)
- "What's the latest documentation?" (searches Port's docs)

<h3> 2. Use specific keywords when needed</h3>

**❌ Vague queries:**
- "Show me docs"
- "What's available?"

**✅ Specific queries:**
- "Show me all documentation for the authentication service in our catalog"
- "What documentation was updated this week in our catalog?"
- "Find critical documentation that needs review in our catalog"

<h3> 3. Contextual Queries</h3>

Instead of: "Show me the API docs"
Try: "I'm working on integrating user authentication, what API documentation should I reference in our catalog?"

<h3> 4. Comparative Analysis</h3>

"Compare the troubleshooting guides for database and authentication issues in our catalog"

<h3> 5. Gap Analysis</h3>

"What documentation do we have for new developers versus what's missing in our catalog?"

<h3> 6. Maintenance Queries</h3>

"Which documents haven't been updated in 6 months and might be outdated in our catalog?"

<h3> 7. Cross-referencing</h3>

"Find all documents that reference the authentication service in our catalog"

<h3> 8. When to add context</h3>

**Key rule**: Any question that could be answered by docs.getport.io will be ambiguous and needs "in our catalog" to clarify.

**Always add "in our catalog" for:**
- **"API documentation"** - Without this, searches Port's API docs (docs.getport.io)
- **"Authentication docs"** - Without this, searches Port's authentication docs
- **"Troubleshooting guides"** - Without this, searches Port's troubleshooting docs
- **"What documentation..."** - Without this, searches Port's general docs
- **"Show me docs..."** - Without this, searches Port's docs

**Don't need "in our catalog" for:**
- **"Who owns..."** - Ownership implies cataloged entities
- **"What's the status of..."** - Status implies cataloged entities  
- **"Which team maintains..."** - Team ownership implies cataloged entities

**Rule of thumb**: If Port has documentation on the topic, add "in our catalog" to avoid ambiguity.





## Conclusion

You've successfully set up a centralized documentation system with AI-powered question answering! Your internal documentation is now searchable through natural language queries, making it easier for team members to find the information they need.

The enhanced blueprint provides rich metadata that enables sophisticated queries about document ownership, updates, categorization, and relationships. This approach can be extended to other types of organizational knowledge and integrated with your existing workflows.

## Next steps

- **Expand content**: Add more documentation types and examples
- **Integrate workflows**: Connect with your existing documentation tools
- **Monitor usage**: Track which documents are accessed most frequently
- **Iterate**: Refine metadata and content based on AI query patterns
- **Scale**: Consider adding more specialized blueprints for different document types
