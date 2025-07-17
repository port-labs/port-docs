---
title: "Day 2 - resource lifecycle"
sidebar_position: 3
---

# Day 2 - manage resource lifecycle

Managing the lifecycle of cloud resources is a critical aspect of platform engineering, often referred to as "Day 2 operations." After resources are provisioned—whether they're databases, compute instances, storage buckets, or Kubernetes namespaces—they require ongoing management to ensure reliability, security, and cost-effectiveness.

## Day 2 tasks

Day 2 management includes tasks such as:
- [**Scaling resources**](#scaling-resources-up-or-down-based-on-demand) up or down based on demand
    - [View ECS tasks and scale on-demand](/guides/all/manage-and-visualize-ecs-tasks)
    - [Scale Autoscaling Groups](/guides/all/manage-and-visualize-aws-autoscaling-groups)
    - [Start an EC2 Instance](/guides/all/visualize-and-manage-aws-ec2-instances#start-an-ec2-instance)
    - [Start a GCP Compute Engine Instance](/guides/all/manage-and-visualize-gcp-compute-engine-instances#start-a-compute-engine-instance)
    - [Stop a GCP Compute Engine Instance](/guides/all/manage-and-visualize-gcp-compute-engine-instances#stop-a-compute-engine-instance)
    - [Start Azure Webapp](/guides/all/manage-and-visualize-azure-web-apps#start-an-azure-web-app)
    - [Stop Azure Webapp](/guides/all/manage-and-visualize-azure-web-apps#stop-an-azure-web-app)
    - [Start an Azure Virtual Machine](/guides/all/manage-and-visualize-azure-virtual-machines#start-an-azure-virtual-machine)
    - [Deallocate an Azure Virtual Machine](/guides/all/manage-and-visualize-azure-virtual-machines#deallocate-an-azure-virtual-machine)
    - [Change Kubernetes Replica Count](/guides/all/change-replica-count/) 

<img src="/img/guides/ecsTaskDashboard2.png" alt="ECS Task Example" width="100%" style={{border: "1px solid #ddd", borderRadius: "4px", marginBottom: "1.5rem"}} />

- [**Patching and updating**](#patching-and-updating-software-or-configurations) software or configurations
    - [Toggle a Feature Flag](/guides/all/manage-and-visualize-your-launchdarkly-feature-flags#toggle-a-feature-flag)
    - [Archive a Feature Flag](/guides/all/manage-and-visualize-your-launchdarkly-feature-flags#archive-a-feature-flag)
    - [Add Tags to an EKS Cluster](/guides/all/manage-your-eks-clusters#add-tags-to-an-eks-cluster)
    - [Rollback ArgoCD Deployment](/guides/all/rollback-argocd-deployment/)

<img src="/img/guides/launchDarklyDashboard2.png" alt="Launch Darkly Example" width="100%" style={{border: "1px solid #ddd", borderRadius: "4px", marginBottom: "1.5rem"}} />

- [**Restarting or Resyncing**](#restarting-or-resyncing-to-resolve-issues) to resolve issues
    - [Manage Kubernetes deployments](/guides/all/manage-your-kubernetes-deployment/)
    - [Reboot an EC2 Instance](/guides/all/visualize-and-manage-aws-ec2-instances#reboot-an-ec2-instance)
    - [Reboot RDS instances](/guides/all/visualize-your-aws-storage-configuration#reboot-an-rds-instance)
    - [Restart Azure Webapp](/guides/all/manage-and-visualize-azure-web-apps#restart-an-azure-web-app)
    - [Restart an Azure Virtual Machine](/guides/all/manage-and-visualize-azure-virtual-machines#restart-an-azure-virtual-machine)
    - [Resync ArgoCD App](/guides/all/sync-argocd-app/)
    - [Restart ArgoCD App](/guides/all/restart-argocd-app/)

<img src="/img/guides/ec2Dashboard2.png" alt="Reboot EC2 Instance Example" width="100%" style={{border: "1px solid #ddd", borderRadius: "4px", marginBottom: "1.5rem"}} />

- [**Decommissioning or archiving**](#decommissioning-or-archiving-resources-when-theyre-no-longer-needed) resources when they're no longer needed
    - [Terminate an EC2 Instance](/guides/all/visualize-and-manage-aws-ec2-instances#terminate-an-ec2-instance)
    - [Delete an RDS instance](/guides/all/visualize-your-aws-storage-configuration#delete-an-rds-instance)
    - [Delete a Kubernetes namespace](/guides/all/manage-kubernetes-namespaces)
    - [Delete an SQS queue](/guides/all/manage-and-visualize-aws-sqs-queues#delete-an-sqs-queue)
    - [Delete an EKS Cluster](/guides/all/manage-your-eks-clusters#delete-an-eks-cluster)

<img src="/img/guides/eksClusterDashboard.png" alt="Launch Darkly Example" width="100%" style={{border: "1px solid #ddd", borderRadius: "4px", marginBottom: "1.5rem"}} />

- [**Monitoring usage and health**](#monitoring-usage-and-health-to-detect-issues-early) to detect issues early
    - [Monitor and Purge SQS queues](/guides/all/manage-and-visualize-aws-sqs-queues#purge-an-sqs-queue)
    - [Redrive messages from a DLQ](/guides/all/manage-and-visualize-aws-sqs-queues#redrive-messages-from-dlq)

<img src="/img/guides/sqsQueueDashboard2.png" alt="SQS Management Example" width="100%" style={{border: "1px solid #ddd", borderRadius: "4px", marginBottom: "1.5rem"}} />

- [**Rotating secrets and credentials**](#rotating-secrets-and-credentials-to-mitigate-risks) to mitigate risks
    - [Renew an ACM Certificate](/guides/all/manage-and-visualize-acm-certificates#renew-an-acm-certificate)

<img src="/img/guides/acmDashboard2.png" alt="ACM Example" width="100%" style={{border: "1px solid #ddd", borderRadius: "4px", marginBottom: "1.5rem"}} />

- [**Identify Security Misconfigurations**](#identify-security-misconfigurations-in-your-cloud-environments) in your cloud environments
    - [Find Issues in your AWS Storage Configuration](/guides/all/visualize-your-aws-storage-configuration/)

<img src="/img/guides/awsStorageAndSecurityDashboard.png" alt="AWS Storage and Security Example" width="100%" style={{border: "1px solid #ddd", borderRadius: "4px", marginBottom: "1.5rem"}} />

By automating these processes and providing self-service capabilities for Day 2 operations, platform teams empower developers to manage their own resources safely, while maintaining governance and compliance. Port enables you to define self-service actions for common Day 2 tasks, set up approval workflows, and enforce policies—ensuring that your cloud resources remain well-managed throughout their lifecycle.

## Visualizing and tracking resources

The guides above focus on managing the lifecycle of resources, but below, we cover how to visualize those same resources, to simplify their tracking.

There are two main appraoches:

### Track resources directly from cloud vendors

    - [Track Azure Resources](/build-your-software-catalog/sync-data-to-catalog/cloud-providers/azure/)
    - [Track AWS Resources](/build-your-software-catalog/sync-data-to-catalog/cloud-providers/aws/)
    - [Track GCP Resources](/build-your-software-catalog/sync-data-to-catalog/cloud-providers/gcp/)

### Track resources through your APM tools

    - [Ingest Cloud Resources from Dynatrace](/guides/all/ingest-cloud-resources-using-dynatrace)
    - [Ingest Cloud Resources from Datadog](/guides/all/ingest-cloud-resources-using-datadog)
    - [Ingest Cloud Resources from New Relic](/guides/all/ingest-cloud-resources-using-newrelic)
