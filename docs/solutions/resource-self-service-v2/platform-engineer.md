---
title: "Platform engineer"
sidebar_position: 5
---

# Platform engineer experience

Empower platform engineers to maintain governance, security, and operational excellence while enabling developer self-service at scale.

## User stories

### As a platform engineer...

### 🏗️ I want to define reusable resource templates so that I can enforce security policies and organizational standards

**Implementation guides:**
- [Create self-service actions](/actions-and-automations/create-self-service-experiences/setup-the-action/)
- [Action input validation](/actions-and-automations/create-self-service-experiences/setup-the-action/#user-inputs)
- [Resource templates with Terraform](/actions-and-automations/setup-backend/terraform/)

---

### 🛡️ I want to ensure all provisioned resources follow security best practices so that I can maintain compliance automatically

**Implementation guides:**
- [Input validation rules](/actions-and-automations/create-self-service-experiences/setup-the-action/#user-inputs)
- [Policy enforcement with OPA](/actions-and-automations/setup-backend/opa/)
- [Compliance scorecards](/promote-scorecards/create-scorecard)

---

### 🎛️ I want granular control over resource provisioning permissions so that I can ensure proper access management across environments

**Implementation guides:**
- [RBAC for self-service actions](/actions-and-automations/create-self-service-experiences/set-self-service-actions-rbac/)
- [Team-based permissions](/sso-rbac/rbac/rbac/)
- [Environment-specific access](/sso-rbac/rbac/rbac-to-ports-resources/)

---

### 📊 I want comprehensive dashboards showing all resources so that I can monitor infrastructure across teams and environments

**Implementation guides:**
- [Infrastructure overview dashboard](/customize-pages-dashboards-and-plugins/page/dashboard-page)
- [Multi-cloud resource catalog](/build-your-software-catalog/sync-data-to-catalog/cloud-providers/)
- [Resource relationship mapping](/build-your-software-catalog/define-your-data-model/relate-blueprints/)

---

### 🔄 I want to automatically manage resource lifecycle so that I can optimize costs and maintain clean infrastructure

**Implementation guides:**
- [Automation rules](/actions-and-automations/define-automations/)
- [Scheduled resource cleanup](/actions-and-automations/define-automations/automation-templates)
- [Auto-scaling policies](/actions-and-automations/setup-backend/terraform/)

---

### 🚨 I want real-time monitoring and automated alerts so that I can quickly respond to infrastructure issues

**Implementation guides:**
- [Infrastructure monitoring dashboard](/customize-pages-dashboards-and-plugins/page/dashboard-page)
- [Health check automations](/actions-and-automations/define-automations/)
- [PagerDuty integration](/actions-and-automations/setup-backend/pagerduty/)

---

### 💸 I want visibility into cost patterns and automated policies so that I can prevent resource waste and optimize spending

**Implementation guides:**
- [Cost optimization dashboard](/customize-pages-dashboards-and-plugins/page/dashboard-page)
- [Unused resource detection](/promote-scorecards/create-scorecard)
- [Automated cost alerts](/actions-and-automations/define-automations/)

---

### 📝 I want detailed logs of all resource provisioning activities so that I can provide security audits and compliance reporting

**Implementation guides:**
- [Audit logging setup](/build-your-software-catalog/customize-integrations/configure-data-model/setup-catalog-data-model/properties/changelog-destination)
- [Compliance reporting dashboard](/customize-pages-dashboards-and-plugins/page/dashboard-page)
- [Export audit data](/api-reference/get-all-catalog-entities)

## Next steps

Once you've configured the platform engineer experience:

1. Enable [developer experience](./developer.md) for self-service capabilities
2. Set up [manager experience](./manager.md) for resource oversight  
3. Review the complete [solution overview](./overview.md) 