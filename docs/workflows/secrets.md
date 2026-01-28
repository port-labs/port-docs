---
sidebar_position: 8
title: Use secrets in workflows
sidebar_label: "Secrets"
---

# Use secrets in workflows

You can reference your organization secrets in workflow node templates using the same syntax used elsewhere in Port.

## Reference secrets in templates

Secrets are available via the `{{ .secrets.<SECRET_NAME> }}` template. You can use them in any templated field of a node configuration, for example:

- **Webhook headers.**
- **Webhook body or URL.**
- **Kafka payloads.**
- **Third-party action node configs** that support templating.

### Examples

Add a bearer token from a secret to a webhook header:

```json showLineNumbers
{
  "identifier": "send_webhook",
  "title": "Send webhook",
  "config": {
    "type": "WEBHOOK",
    "url": "https://example.com/webhook",
    "method": "POST",
    "synchronized": true,
    "headers": {
      "Authorization": "Bearer {{ .secrets.MY_API_TOKEN }}"
    },
    "body": {
      "message": "{{ .outputs.trigger.message }}"
    }
  }
}
```

Use a secret inside a webhook URL:

```json showLineNumbers
{
  "config": {
    "type": "WEBHOOK",
    "url": "https://{{ .secrets.MY_DOMAIN }}/hooks/{{ .secrets.HOOK_ID }}",
    "method": "POST"
  }
}
```

Publish a Kafka payload containing a secret-derived token (only when required by your sink):

```json showLineNumbers
{
  "config": {
    "type": "KAFKA",
    "payload": {
      "token": "{{ .secrets.SERVICE_TOKEN }}",
      "requestId": "{{ .outputs.send_webhook.request_id }}"
    }
  }
}
```

## Security considerations

:::warning Avoid exposing secrets
Templates resolve at runtime. If you place a secret in a field that becomes part of stored outputs, variables, or logs, it can become visible to users who can view the run. Avoid assigning secrets to `variables` and avoid echoing them in request/response logs.
:::

- Secrets are not stored in workflow definitions; they are resolved at runtime.
- Use secrets in headers or transient request fields whenever possible.
- Control who can view runs via workflow permissions and `allowAnyoneToViewRuns`. See [Permissions](/workflows/permissions).

## Manage your secrets

To create and manage organization secrets, see [Port secrets](/sso-rbac/port-secrets/port-secrets.md). Once created, reference them by name in your workflow templates as shown above.


