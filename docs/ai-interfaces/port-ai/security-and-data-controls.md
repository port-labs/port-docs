---
sidebar_position: 5
title: AI Security and Data Controls
---

# AI Security and Data Controls

:::info Closed Beta
Port's AI offerings are currently in closed beta and will be gradually rolled out to users by the end of 2025.
:::

Port is committed to developing AI responsibly, maintaining high standards of data privacy and security across all our AI interfaces. This page addresses common questions about security, data handling, permissions, and controls for Port's AI capabilities.

## Data Access & Permissions

### How does Port AI respect my organization's access controls?

Port AI strictly respects your organization's existing RBAC (Role-Based Access Control) settings. AI interfaces can only access data that you already have permission to view through Port's standard permissions system. No AI feature bypasses or circumvents your configured access controls.

### What if Port AI shows me data I didn't expect to have access to?

If Port AI displays information you didn't expect to see, this typically indicates that your organization's RBAC permissions are broader than intended, not that AI bypassed security controls. Port AI only shows data you already have access to through Port's RBAC system.

In this case, we recommend reviewing and tightening your RBAC settings to ensure permissions align with your intended access policies.

### Can AI features access data outside of Port?

AI can run tools you have permitted it to use. If you build tools that fetch external data outside of Port and Port AI has permission to run them, it will have access to that external data in those cases. This is a useful way to connect AI to external data sources, but should be used with caution and proper security considerations.

## Data Privacy & Retention

### What data does Port store from AI interactions?

We store data from your interactions with AI features for up to 30 days. This includes:
- Your prompts and questions
- AI responses and outputs  
- Tool execution logs and metadata
- Invocation details and performance metrics

### Why does Port store this interaction data?

We use this stored data strictly for:
- Ensuring AI features function correctly
- Identifying and preventing problematic or inappropriate AI behavior
- Performance monitoring and system optimization
- Debugging and troubleshooting issues

We limit data storage strictly to these operational purposes.

### How is my data processed by LLM providers?

All data processing occurs within Port's secure cloud infrastructure. We use different LLM models depending on the AI interface:
- **OpenAI GPT models** for certain AI features
- **Claude models** for enhanced reasoning capabilities

Your data is not used for model training by these providers. We ensure complete logical separation between different customers' data throughout the processing pipeline.

### Can I opt out of data storage?

Yes, you can contact us to opt out of the 30-day interaction data storage. However, opting out may impact our ability to provide support and troubleshoot issues with AI features.

## Rate Limits & Usage Controls

### What are the current rate limits for AI features?

Port AI operates with specific rate limits and monthly quotas to ensure fair usage across all customers. For detailed information about current limits, quotas, and monitoring your usage, see the [Limits and Usage section](/ai-interfaces/port-ai/overview#limits-and-usage) in the Port AI Overview.

### How can I monitor my current usage?

For detailed information about monitoring your AI usage, including API response headers, quota endpoints, and AI invocation records, see the [Limits and Usage section](/ai-interfaces/port-ai/overview#limits-and-usage) in the Port AI Overview.

### What happens when I reach a usage limit?

For detailed information about what happens when you reach usage limits and how to handle them, see the [Frequently Asked Questions](/ai-interfaces/port-ai/overview#frequently-asked-questions) in the Port AI Overview.

## Admin Controls & Organization Policies

### What controls do administrators have over AI usage?

Organization administrators can:
- Control access to AI features through existing Port RBAC settings
- Monitor AI usage through audit logs and invocation records
- Review all AI interactions through the AI invocations catalog
- Export audit logs for compliance and analysis
- Configure organization-wide policies for AI feature access

### Can we control which users have access to AI features?

Yes, AI feature access is controlled through Port's standard RBAC system. Administrators can manage access by configuring permissions for the AI invocation blueprint, which determines which users can interact with Port AI. For more details, see the [Security and Permissions section](/ai-interfaces/port-ai/overview#security-and-permissions) in the Port AI Overview.

### Are there organization-level vs user-level controls?

AI access controls operate at both levels:
- **Organization-level:** Overall AI feature enablement and policy settings
- **User-level:** Individual access permissions based on roles and configured RBAC rules

## Human Oversight & Autonomy

### Do AI features act autonomously without human oversight?

AI features in Port operate with different levels of autonomy depending on configuration:

**Query responses:** AI can autonomously read and analyze your Port data to answer questions
**Action execution:** You can configure whether AI can execute actions automatically or requires human approval before execution

For actions with significant impact, we recommend requiring human approval.

### What human oversight exists for AI actions?

- All AI interactions create detailed audit trails
- Action execution can be configured to require human approval
- Organization administrators can monitor all AI activity
- Users can review AI reasoning and tool usage for each interaction

### What visibility do customers have into AI usage?

Comprehensive visibility is provided through:
- **AI invocation records:** Every interaction creates a detailed log
- **Audit trails:** Complete history of AI usage across your organization
- **Tool execution logs:** See exactly which tools AI used and why
- **Performance metrics:** Token usage, response times, and error rates
- **Admin dashboards:** Organization-wide usage monitoring

## Opt-out & User Controls

### Can we opt out of AI features entirely?

Yes, you can contact our support team to opt out of AI features for your organization.

### Can individual users opt out of specific AI features?

Users cannot individually opt out of AI features that are enabled organization-wide, but administrators can use RBAC controls to restrict access for specific users or roles.

### Can we opt out of data storage while keeping AI functionality?

You can opt out of the 30-day interaction data storage by contacting our support team. However, this may impact our ability to provide support and troubleshoot issues with AI features.

## Performance & Expectations

### What are normal response times for AI features?

AI features typically respond within 20-40 seconds, depending on:
- Complexity of the query or request
- Amount of data being analyzed
- Current system load
- Which AI interface is being used

This is expected behavior for AI processing. If responses consistently take longer than 40 seconds, consider reaching out to support.

### What should I do if AI responses seem slow?

Response times between 20-40 seconds are normal and expected for AI processing. If you experience consistently longer response times:
- Check the AI invocation details for any errors
- Verify your usage hasn't hit rate limits
- Contact support if problems persist

## Compliance & Security Standards

### How does this integrate with our existing compliance requirements?

Port AI features respect your existing data governance and compliance policies:
- All interactions are logged for audit purposes
- RBAC controls ensure data access follows your defined policies
- Data retention policies can be configured to meet your compliance needs
- Export capabilities support compliance reporting requirements

For detailed information about Port's security standards, certifications, and compliance frameworks (SOC2, GDPR, ISO 27001, etc.), see [Port's Security page](https://www.port.io/security).

## Troubleshooting & Support

### What if AI gives incorrect answers?

AI can make mistakes. If you receive incorrect answers:
1. Review the AI invocation details to see which tools were used
2. Check if the AI used incorrect field names or properties
3. Try rephrasing your question or breaking it into smaller queries
4. Provide feedback through the AI invocation record
5. Contact support if problems persist

Remember that AI features are continuously improving, but they are not infallible.

### How can I provide feedback on AI responses?

For feedback on AI responses or to report issues, contact our support team directly.

### Who should I contact for AI-related security concerns?

For any security-related questions or concerns about AI features, contact our support team directly. We take security concerns seriously and will respond promptly to address any issues.
