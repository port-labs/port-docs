---
title: "Setup approval workflows"
sidebar_position: 4
---

# Set up approval workflows

Effective platform engineering requires oversight at every level—whether it's a human developer requesting a production database or an AI agent automatically scaling infrastructure. Without proper controls, self-service can quickly become a security and compliance nightmare. Port provides three complementary layers of governance: Role-Based Access Control (RBAC) for user permissions, approval workflows for human oversight, and dynamic permissions for context-aware access control.

<img src="/img/self-service-actions/setup-backend/github-workflow/approveAndApplyTerraform.png" border="1px" width="100%" />

## Role-based access control

**Role-Based Access Control (RBAC)** ensures that users can only access the resources and actions they're authorized to use. Port's RBAC system allows you to define granular permissions based on user roles, team membership, and organizational hierarchy. Whether it's restricing access to a self-service action to a specific team or limiting certain infrastructure to senior engineers, RBAC provides the foundation for secure self-service by ensuring users can only perform actions within their scope of responsibility.

- [Configure Permissions for Actions](/actions-and-automations/create-self-service-experiences/set-self-service-actions-rbac/#configure-permissions-for-actions)


## Approval workflows

**Approval Workflows** add a human oversight layer to automated processes and self-service actions. When developers request high-risk resources like production databases or expensive cloud instances, approval workflows ensure that designated approvers can review and approve requests before they're executed. This human-in-the-loop approach maintains accountability while still providing the speed and efficiency of self-service, allowing organizations to balance developer productivity with governance requirements.

- [Configure Manual Approvals for Actions](/actions-and-automations/create-self-service-experiences/set-self-service-actions-rbac/#configure-manual-approval-for-actions)

We have some guides that illustrate this capability:

- [Provision Cloud Resource using Terraform](/guides/all/terraform-plan-and-apply-aws-resource)
- [Manage Kubernetes namespaces](/guides/all/manage-kubernetes-namespaces)
- [Manage service deployments using GitLab and ServiceNow](/guides/all/approval-workflow-for-gitlab-deployment)
- [Notify users upon approval of self-service actions](/guides/all/notify-users-upon-approval-of-action)

## Dynamic permissions

**Dynamic Permissions** take access control to the next level by making permissions context-aware and automatically adjusting based on real-time conditions. For example:
- a developer might have permission to deploy to staging environments during business hours, but require additional approval for production deployments or after-hours changes.
- changes may be restricted to non-business critical applications during the Christmas holidays
- feature flags can only be toggled without approval where they relate to non-ga features, or are not active for a set of critical customers

Dynamic permissions can also consider factors like resource costs, security posture, or organizational policies to automatically escalate or restrict access when needed.

- [Dynamic Permissions for Actions](/actions-and-automations/create-self-service-experiences/set-self-service-actions-rbac/dynamic-permissions)
