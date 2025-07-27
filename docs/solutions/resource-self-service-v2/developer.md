---
title: "Developer"
sidebar_position: 3
---

# As a Developer...


## User stories


### 🚀 I want to provision a complete development stack so that I can start building features immediately without waiting for infrastructure setup

**Implementation guides:**
- [Create self-service actions](/actions-and-automations/create-self-service-experiences/setup-the-action/)
- [Environment provisioning templates](/guides/all/self-service-environments)

---

### 📦 I want to request a database instance with proper configuration so that I can store my application data without waiting for manual provisioning

**Implementation guides:**
- [Database provisioning action](/actions-and-automations/create-self-service-experiences/setup-the-action/aws/provision-rds-instance)
- [AWS RDS integration](/build-your-software-catalog/sync-data-to-catalog/cloud-providers/aws/aws-rds)

---

### 🗂️ I want to create storage resources with proper IAM policies so that I can securely store and access my application data

**Implementation guides:**
- [S3 bucket creation action](/actions-and-automations/create-self-service-experiences/setup-the-action/aws/create-s3-bucket)
- [Azure storage provisioning](/actions-and-automations/create-self-service-experiences/setup-the-action/azure/create-storage-account)

---

### 🔧 I want to deploy my containerized application to Kubernetes so that I can run my application with proper resource limits and networking

**Implementation guides:**
- [Kubernetes deployment action](/actions-and-automations/create-self-service-experiences/setup-the-action/kubernetes/deploy-application)
- [ArgoCD application creation](/actions-and-automations/create-self-service-experiences/setup-the-action/argocd/create-application)

---

### 📊 I want to view my team's resource consumption and costs so that I can make informed decisions about resource optimization

**Implementation guides:**
- [Create cost dashboards](/customize-pages-dashboards-and-plugins/page/dashboard-page)
- [Resource usage widgets](/customize-pages-dashboards-and-plugins/page/dashboard-page#table-widget)

---

### 🔄 I want to scale, update, or decommission resources so that I can efficiently manage costs and keep my infrastructure clean

**Implementation guides:**
- [Resource lifecycle actions](/actions-and-automations/create-self-service-experiences/setup-the-action/)
- [Scheduled resource cleanup](/actions-and-automations/define-automations/automation-templates)

## Next steps

Once you've implemented the developer experience:

1. Configure [manager experience](./manager.md) for resource oversight
2. Set up [platform engineer experience](./platform-engineer.md) for governance
3. Review the complete [solution overview](./overview.md) 