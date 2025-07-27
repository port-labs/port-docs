---
title: "Manager"
sidebar_position: 4
---

# Manager experience

Provide engineering managers with visibility and control over their team's resource consumption and costs.

## User stories

### As an engineering manager...

### 💰 I want to view real-time cloud costs and usage trends so that I can manage my team's budget effectively

**Implementation guides:**
- [Cost tracking dashboard](/customize-pages-dashboards-and-plugins/page/dashboard-page)
- [AWS cost integration](/build-your-software-catalog/sync-data-to-catalog/cloud-providers/aws/aws-cost-intelligence)
- [Number widget for cost metrics](/customize-pages-dashboards-and-plugins/page/dashboard-page#number-widget)

---

### ✅ I want to review and approve high-cost resource requests so that I can control team spending and ensure proper resource allocation

**Implementation guides:**
- [Approval workflows](/actions-and-automations/create-self-service-experiences/set-self-service-actions-rbac/#configure-manual-approval-for-self-service-actions)
- [Conditional approvals](/actions-and-automations/create-self-service-experiences/set-self-service-actions-rbac/#configure-conditional-approval)

---

### 📈 I want to view dashboards showing resource efficiency so that I can optimize capacity planning and identify waste

**Implementation guides:**
- [Resource utilization dashboard](/customize-pages-dashboards-and-plugins/page/dashboard-page)
- [Table widget for resource metrics](/customize-pages-dashboards-and-plugins/page/dashboard-page#table-widget)
- [Chart widget for trends](/customize-pages-dashboards-and-plugins/page/dashboard-page#pie-chart-widget)

---

### 🎯 I want to set spending limits and receive alerts so that I can prevent budget overruns and control costs

**Implementation guides:**
- [Budget tracking scorecards](/promote-scorecards/create-scorecard)
- [Automated budget alerts](/actions-and-automations/define-automations/)
- [Webhook notifications](/actions-and-automations/setup-backend/webhook/)

---

### 🔍 I want to see a history of all resource requests and their outcomes so that I can ensure compliance and optimize resource usage

**Implementation guides:**
- [Audit logs dashboard](/customize-pages-dashboards-and-plugins/page/dashboard-page)
- [Action run history](/actions-and-automations/reflect-action-progress/)
- [Changelog tracking](/build-your-software-catalog/setup-catalog-data-model/define-your-data-model/setup-blueprint/properties/calculation-property)

---

### 🚨 I want immediate alerts when team members violate policies so that I can quickly address compliance issues

**Implementation guides:**
- [Policy violation alerts](/actions-and-automations/define-automations/)
- [Slack notifications](/actions-and-automations/setup-backend/slack/)
- [Email notifications](/actions-and-automations/setup-backend/email/)

## Next steps

Once you've configured the manager experience:

1. Set up [developer experience](./developer.md) for self-service capabilities
2. Configure [platform engineer experience](./platform-engineer.md) for governance
3. Review the complete [solution overview](./overview.md) 