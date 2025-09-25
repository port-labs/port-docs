---
sidebar_position: 3
title: API Interaction
---

import Tabs from "@theme/Tabs"
import TabItem from "@theme/TabItem"

# Port AI API Interaction

:::info Closed Beta
Port's AI offerings are currently in closed beta and will be gradually rolled out to users by the end of 2025.
:::

Port AI can be accessed programmatically through Port's API, enabling integration into custom applications and workflows. This provides the most flexible way to incorporate Port AI capabilities into your existing tools and processes.

## API Endpoints

Port AI provides streaming API endpoints for real-time interaction:

- **Port AI Assistant**: `/v1/ai/invoke` - General-purpose AI interactions
- **AI Agents**: `/v1/agent/<AGENT_IDENTIFIER>/invoke` - Domain-specific agent interactions

All interactions use streaming responses as Server-Sent Events (SSE) to provide real-time updates during execution. The response will be in `text/event-stream` format.

### Interaction Process

1. Invoke Port AI
2. The API will start sending Server-Sent Events
3. Your client should process these events as they arrive, with each event providing information about the AI's progress or final response

### Basic API Examples

**Port AI Assistant:**
```bash
curl 'https://api.port.io/v1/ai/invoke' \
  -H 'Authorization: Bearer <YOUR_API_TOKEN>' \
  -H 'Content-Type: application/json' \
  --data-raw '{"prompt":"What services are failing health checks?"}'
```

**AI Agents:**
```bash
curl 'https://api.port.io/v1/agent/<AGENT_IDENTIFIER>/invoke' \
  -H 'Authorization: Bearer <YOUR_API_TOKEN>' \
  -H 'Content-Type: application/json' \
  --data-raw '{"prompt":"Analyze the health of our production services"}'
```

**With metadata labels:**
```bash
curl 'https://api.port.io/v1/ai/invoke' \
  -H 'Authorization: Bearer <YOUR_API_TOKEN>' \
  -H 'Content-Type: application/json' \
  --data-raw '{
    "prompt":"What services are failing health checks?",
    "labels": {
      "source": "monitoring_system",
      "environment": "production",
      "triggered_by": "automated_check"
    }
```

## Streaming Response Format

The API responds with `Content-Type: text/event-stream; charset=utf-8`.

Each event in the stream has the following format:
```text
event: <event_name>
data: <json_payload_or_string>

```
Note the blank line after `data: ...` which separates events.

### Example Event Sequence

```text
event: tool_call
data: { "id": "call_0", "name": "get_entities", "arguments": "{\"blueprint\":\"service\"}" }

event: tool_result
data: { "id": "call_0", "content": "Found 15 services in your catalog..." }

event: tool_call
data: { "id": "call_1", "name": "run_action", "arguments": "{\"actionIdentifier\":\"create_incident\"}" }

event: tool_result
data: { "id": "call_1", "content": "Action run created successfully with ID: run_12345" }

event: execution
data: I found 15 services in your catalog and created an incident report as requested.

event: done
data: {
  "rateLimitUsage": {
    "maxRequests": 200,
    "remainingRequests": 193,
    "maxTokens": 200000,
    "remainingTokens": 179910,
    "remainingTimeMs": 903
  },
  "monthlyQuotaUsage": {
    "monthlyLimit": 20,
    "remainingQuota": 19,
    "month": "2025-09",
    "remainingTimeMs": 1766899073
  }
}
```

## Event Types

<details>
<summary><b><code>tool_call</code> (Click to expand)</b></summary>

Indicates that Port AI is about to execute a tool. This event provides details about the tool being called and its arguments. For large arguments, the data may be sent in multiple chunks.

```json
{
  "id": "call_0",
  "name": "get_entities", 
  "arguments": "{\"blueprint\":\"service\",\"limit\":10}",
  "lastChunk": true
}
```

**Fields:**
- `id`: Unique identifier for this tool call
- `name`: Name of the tool being executed (only included in the first chunk)
- `arguments`: JSON string containing the tool arguments (may be chunked for large payloads)
- `lastChunk`: Boolean indicating if this is the final chunk for this tool call (optional, only present on the last chunk)
</details>

<details>
<summary><b><code>tool_result</code> (Click to expand)</b></summary>

Contains the result of a tool execution. For large results, the data may be sent in multiple chunks.

```json
{
  "id": "call_0",
  "content": "Found 15 services in your catalog: api-gateway, user-service, payment-service...",
  "lastChunk": true
}
```

**Fields:**
- `id`: Unique identifier matching the corresponding tool call
- `content`: The result content from the tool execution (may be chunked for large responses)
- `lastChunk`: Boolean indicating if this is the final chunk for this tool result (optional, only present on the last chunk)
</details>

<details>
<summary><b><code>execution</code> (Click to expand)</b></summary>

The final textual answer or a chunk of the answer from Port AI. For longer responses, multiple `execution` events might be sent.
</details>

<details>
<summary><b><code>done</code> (Click to expand)</b></summary>

Signals that Port AI has finished processing and the response stream is complete. This event also includes quota usage information for managing your API limits.

```json showLineNumbers
{
  "rateLimitUsage": {
    "maxRequests": 200,
    "remainingRequests": 193,
    "maxTokens": 200000,
    "remainingTokens": 179910,
    "remainingTimeMs": 903
  },
  "monthlyQuotaUsage": {
    "monthlyLimit": 20,
    "remainingQuota": 19,
    "month": "2025-09",
    "remainingTimeMs": 1766899073
  }
}
```

**Quota Usage Fields:**
- `maxRequests`: Maximum number of requests allowed in the current rolling window
- `remainingRequests`: Number of requests remaining in the current window
- `maxTokens`: Maximum number of tokens allowed in the current rolling window  
- `remainingTokens`: Number of tokens remaining in the current window
- `remainingTimeMs`: Time in milliseconds until the rolling window resets
</details>

## Processing Quota Information

:::tip Managing quota usage
Use the quota information in the `done` event to implement client-side rate limiting and avoid hitting API limits. When `remainingRequests` or `remainingTokens` are low, consider adding delays between requests or queuing them for later execution.
:::

<details>
<summary><b>JavaScript Example: Processing Quota Information (Click to expand)</b></summary>

When processing the streaming response, you'll receive quota usage information in the final `done` event. Here's a JavaScript example of how to handle this:

```javascript showLineNumbers
const eventSource = new EventSource(apiUrl);

eventSource.addEventListener('done', (event) => {
  const data = JSON.parse(event.data);
  
  if (data.rateLimitUsage) {
    const { remainingRequests, remainingTokens, remainingTimeMs } = data.rateLimitUsage;
    
    // Check if quota is running low
    if (remainingRequests < 10 || remainingTokens < 10000) {
      console.warn('Quota running low, consider rate limiting');
      // Implement rate limiting logic
    }
    
    // Schedule next request after quota reset if needed
    if (remainingRequests === 0) {
      setTimeout(() => {
        // Safe to make next request
      }, remainingTimeMs);
    }
  }
  
  eventSource.close();
});
```
</details>

## Rate Limits and Quotas

Port AI operates with specific limits to ensure optimal performance for all users:

:::info LLM Provider Limits
These limits apply when using Port's managed AI infrastructure. When you [configure your own LLM provider](/ai-interfaces/port-ai/llm-providers-management/overview), these Port-specific limits no longer apply, and usage will be governed by your provider's own limits and pricing.

Port acts as a bridge to leading LLM providers and doesn't host LLM models internally.
:::

### Rate Limits (Hourly)
- **Request limit**: 1,000 requests per hour
- **Token usage limit**: 800,000 tokens per hour
- These limits reset hourly

### Monthly Quota
- **Default quota**: 20 AI invocations per month
- Each interaction with Port AI counts as one request against your quota
- Quota resets monthly

:::caution Usage limits
Usage limits may change without prior notice. Once a limit is reached, you will need to wait until it resets.  
If you attempt to interact with Port AI after reaching a limit, you will receive an error message indicating that the limit has been exceeded.
The query limit is estimated and depends on the actual token usage.
:::

### Monitor your usage

You can monitor your current usage in several ways:

#### Rate limits
- Check the final `done` event in streaming responses for remaining requests, tokens, and reset time

#### Monthly quota
You can monitor your current monthly quota usage by making a GET request to the `/v1/quota/ai-invocations` endpoint

:::tip Proactive quota monitoring
Check your monthly quota before making multiple Port AI requests to avoid hitting limits. When `remainingQuota` is low, consider implementing rate limiting or queuing requests until the monthly quota resets. Note that you may also encounter hourly rate limits, which are separate from this monthly quota.
:::

## Integration Patterns

<Tabs groupId="integration-patterns" queryString>
<TabItem value="api" label="API Integration">

**Direct API Calls**

Integrate Port AI directly into your applications using HTTP requests:

```bash
# Basic Port AI request
curl 'https://api.port.io/v1/ai/invoke' \
  -H 'Authorization: Bearer <YOUR_API_TOKEN>' \
  -H 'Content-Type: application/json' \
  --data-raw '{
    "prompt": "What services are failing health checks?",
    "labels": {
      "source": "monitoring_system",
      "check_type": "health_analysis"
    }'

# AI Agent request
curl 'https://api.port.io/v1/agent/<AGENT_IDENTIFIER>/invoke' \
  -H 'Authorization: Bearer <YOUR_API_TOKEN>' \
  -H 'Content-Type: application/json' \
  --data-raw '{
    "prompt": "Analyze the health of our production services",
    "labels": {
      "source": "monitoring_dashboard",
      "environment": "production"
    }'
```

**Application Integration Example**

```javascript showLineNumbers
// Example: Monitoring dashboard integration
async function checkServiceHealth(serviceName) {
  const response = await fetch('/api/port-ai/check-service', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      prompt: `Analyze the health of service ${serviceName}`,
      labels: {
        source: 'monitoring_dashboard',
        service: serviceName,
        check_type: 'health_analysis'
      }
    })
  });
  
  // Process streaming response
  const reader = response.body.getReader();
  // Handle SSE parsing...
}
```

</TabItem>
<TabItem value="automations" label="Actions & Automations">

**Port Automations**

Automatically trigger Port AI based on catalog events using Port's automation system:

<details>
<summary><b>Example: Infrastructure Healing Automation (Click to expand)</b></summary>

```json showLineNumbers
{
  "identifier": "ai_infrastructure_healing",
  "title": "AI Infrastructure Healing",
  "description": "Automatically trigger AI analysis when infrastructure becomes unhealthy",
  "icon": "Cluster",
  "trigger": {
    "type": "automation",
    "event": {
      "type": "ENTITY_UPDATED",
      "blueprintIdentifier": "k8s_workload"
    },
    "condition": {
      "type": "JQ",
      "expressions": [
        ".diff.before.properties.isHealthy == \"Healthy\"",
        ".diff.after.properties.isHealthy == \"Unhealthy\""
      ],
      "combinator": "and"
    }
  },
  "invocationMethod": {
    "type": "WEBHOOK",
    "url": "https://api.port.io/v1/ai/invoke",
    "method": "POST",
    "headers": {
      "Content-Type": "application/json"
    },
    "body": {
      "prompt": "Infrastructure component {{ .event.diff.after.title }} is unhealthy. Analyze the issue and suggest remediation steps based on current state and recent changes.",
      "labels": {
        "source": "automation",
        "entity_type": "{{ .event.diff.after.blueprint }}",
        "entity_id": "{{ .event.diff.after.identifier }}",
        "trigger_type": "health_degradation"
      }
    }
  },
  "publish": true
}
```
</details>

**Self-Service Actions**

Create actions that invoke Port AI for on-demand analysis:

<details>
<summary><b>Example: Service Health Analysis Action (Click to expand)</b></summary>

```json showLineNumbers
{
  "identifier": "analyze_service_health",
  "title": "Analyze Service Health with AI",
  "description": "Get AI-powered analysis of service health and recommendations",
  "trigger": {
    "type": "self-service",
    "operation": "DAY-2",
    "blueprintIdentifier": "service"
  },
  "invocationMethod": {
    "type": "WEBHOOK",
    "url": "https://api.port.io/v1/ai/invoke",
    "method": "POST",
    "headers": {
      "Content-Type": "application/json"
    },
    "body": {
      "prompt": "Analyze the health of service {{ .entity.title }}. Check metrics, recent deployments, incidents, and provide actionable recommendations.",
      "labels": {
        "source": "self_service",
        "service_name": "{{ .entity.identifier }}",
        "requested_by": "{{ .trigger.by.user.email }}"
      }
    }
  }
}
```
</details>

</TabItem>
</Tabs>

## Error Handling

Common error scenarios and handling strategies:

### Rate Limit Exceeded
```json
{
  "error": "Rate limit exceeded",
  "type": "RATE_LIMIT_ERROR",
  "retryAfter": 3600
}
```

### Quota Exceeded
```json
{
  "error": "Monthly quota exceeded",
  "type": "QUOTA_ERROR",
  "resetDate": "2025-10-01T00:00:00Z"
}
```

<details>
<summary><b>Implementation Example: Error Handling (Click to expand)</b></summary>

```javascript
async function handlePortAIRequest(prompt) {
  try {
    const response = await invokePortAI(prompt);
    return response;
  } catch (error) {
    if (error.type === 'RATE_LIMIT_ERROR') {
      // Wait and retry
      await new Promise(resolve => setTimeout(resolve, error.retryAfter * 1000));
      return handlePortAIRequest(prompt);
    } else if (error.type === 'QUOTA_ERROR') {
      // Queue for next month or upgrade plan
      console.log('Monthly quota exceeded, queuing request');
      return null;
    }
    throw error;
  }
}
```
</details>

## Security Considerations

When integrating Port AI via API:

- **Authentication**: Always use secure API token storage and rotation
- **Data privacy**: Port AI respects your organization's RBAC and data access policies
- **Audit trail**: All API interactions are logged and trackable
- **Rate limiting**: Implement client-side rate limiting to avoid hitting API limits

For comprehensive security information, see [AI Security and Data Controls](/ai-interfaces/port-ai/security-and-data-controls).

