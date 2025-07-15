---
title: "Overview"
sidebar_position: 1
---

# Resource self-service

## Why enable resource self-service using a developer portal?

Resource self-service is much more than just giving developers access to cloud consoles and hoping for the best. It's a discipline that requires balancing developer velocity with governance, security, and cost control—where developers need instant access to the resources they need while platform teams maintain standards, compliance, and operational excellence. The challenge is providing this access without creating a ticket-driven bottleneck or sacrificing organizational guardrails.

Imagine you're a developer who just joined a new team and needs to spin up a development environment to work on a critical feature. It's Monday morning, and you need:
- A new database instance for your microservice
- An S3 bucket for file storage
- A Kubernetes namespace configured with the right permissions
- Secrets properly configured and stored
- Monitoring and observability set up correctly
- All of this following your organization's security and compliance standards

Without self-service, you're stuck opening tickets, waiting for approvals, and coordinating with multiple teams:
- Platform team ticket for the database (2-day SLA)
- Security team approval for the S3 bucket permissions (1-day SLA)
- DevOps team request for the Kubernetes namespace (3-day SLA)
- Another ticket for secrets management setup
- Manual coordination to ensure everything follows company standards

By the time you have everything you need, it's Friday, and you've spent a week on infrastructure instead of building features. Meanwhile, the platform team is drowning in repetitive requests, and inconsistent manual processes have created security gaps and cost overruns.

## How can Port help?

With Port, you can empower developers to provision and manage resources safely and efficiently, while maintaining the governance and standards your organization requires:

- **Golden paths for consistent provisioning**: Pre-approved templates and workflows that make the right choice the easy choice, ensuring every resource follows organizational standards from day one.
- **Intelligent approval workflows**: Automated approvals for low-risk resources, human oversight for high-impact changes, and dynamic permissions that adapt based on context, time, and user roles.
- **Self-service environments**: Enable developers to spin up development, staging, and testing environments on-demand without waiting for platform team intervention.
- **Complete resource lifecycle management**: Day 2 operations like scaling, updating, monitoring, and decommissioning resources through intuitive self-service actions.
- **Built-in governance and compliance**: RBAC, cost controls, security policies, and audit trails baked into every self-service action, ensuring compliance without sacrificing velocity.
- **Unified resource visibility**: Track all your cloud resources, their relationships, costs, and lifecycle status in a single pane of glass, making it easy to manage sprawl and optimize usage.

## What you'll learn in this solution

This solution guide covers the essential components of building effective resource self-service:

1. **[Create golden paths](/solutions/resource-self-service/create-golden-paths)**: Learn how to design standardized, opinionated workflows that guide developers toward best practices while eliminating decision fatigue. We'll cover scaffolding new services, cloud resource provisioning patterns (RESTful vs GitOps), and secure secrets management.

2. **[Day 2 - manage the full resource lifecycle](/solutions/resource-self-service/day-2-resource-lifecycle)**: Discover how to enable ongoing resource management through self-service actions—scaling, updating, monitoring, and decommissioning. We'll explore real-world examples for managing everything from EC2 instances to Kubernetes deployments.

3. **[Setup approval workflows](/solutions/resource-self-service/setup-approval-workflows)**: Master the three layers of governance—RBAC for user permissions, approval workflows for human oversight, and dynamic permissions for context-aware access control. Learn when to automate and when to require human approval.

4. **[Self-service environments](/solutions/resource-self-service/self-service-environments)**: Enable developers to provision development, staging, and testing environments on-demand. We'll cover scaffolding new applications, ephemeral cloud environments, and integrating with third-party IaC tools.

By the end of this solution, you'll have transformed your platform from a bottleneck into an enabler—allowing developers to move faster while maintaining the security, compliance, and cost control your organization requires.



