---
title: "Day 2 - Resource Lifecycle"
sidebar_position: 2
---

# Day 2 - Manage the Full Resource Lifecycle

Managing the lifecycle of cloud resources is a critical aspect of platform engineering, often referred to as "Day 2 operations." After resources are provisioned—whether they're databases, compute instances, storage buckets, or Kubernetes namespaces—they require ongoing management to ensure reliability, security, and cost-effectiveness.

<img src="/img/guides/autoscalingDashboard1.png" alt="Autoscaling Dashboard Example" width="100%" style={{border: "1px solid #ddd", borderRadius: "4px", marginBottom: "1.5rem"}} />

Day 2 management includes tasks such as:
- **Scaling resources** up or down based on demand
    - [View ECS tasks and scale on-demand](/guides/all/manage-and-visualize-ecs-tasks)
    - [Scale Autoscaling Groups](/guides/all/manage-and-visualize-aws-autoscaling-groups)
    - [Start an EC2 Instance](/guides/all/visualize-and-manage-aws-ec2-instances#start-an-ec2-instance)
    - [Start a GCP Compute Engine Instance](/guides/all/manage-and-visualize-gcp-compute-engine-instances#start-a-compute-engine-instance)
    - [Stop a GCP Compute Engine Instance](/guides/all/manage-and-visualize-gcp-compute-engine-instances#stop-a-compute-engine-instance)
    - [Start Azure Webapp](/guides/all/manage-and-visualize-azure-web-apps#start-an-azure-web-app)
    - [Stop Azure Webapp](/guides/all/manage-and-visualize-azure-web-apps#stop-an-azure-web-app)
    - [Start an Azure Virtual Machine](/guides/all/manage-and-visualize-azure-virtual-machines#start-an-azure-virtual-machine)
    - [Deallocate an Azure Virtual Machine](/guides/all/manage-and-visualize-azure-virtual-machines#deallocate-an-azure-virtual-machine)

- **Patching and updating** software or configurations
    - [Toggle a Feature Flag](/guides/all/manage-and-visualize-your-launchdarkly-feature-flags#toggle-a-feature-flag)
    - [Archive a Feature Flag](/guides/all/manage-and-visualize-your-launchdarkly-feature-flags#archive-a-feature-flag)
    - [Add Tags to an EKS Cluster](/guides/all/manage-your-eks-clusters#add-tags-to-an-eks-cluster)

- **Restarting or Resyncing** to resolve issues
    - [Manage Kubernetes deployments](/guides/all/manage-your-kubernetes-deployment/)
    - [Reboot an EC2 Instance](/guides/all/visualize-and-manage-aws-ec2-instances#reboot-an-ec2-instance)
    - [Reboot RDS instances](/guides/all/visualize-your-aws-storage-configuration#reboot-an-rds-instance)
    - [Restart Azure Webapp](/guides/all/manage-and-visualize-azure-web-apps#restart-an-azure-web-app)
    - [Restart an Azure Virtual Machine](/guides/all/manage-and-visualize-azure-virtual-machines#restart-an-azure-virtual-machine)

- **Decommissioning or archiving** resources when they're no longer needed
    - [Terminate an EC2 Instance](/guides/all/visualize-and-manage-aws-ec2-instances#terminate-an-ec2-instance)
    - [Delete an RDS instance](/guides/all/visualize-your-aws-storage-configuration#delete-an-rds-instance)
    - [Delete a Kubernetes namespace](/guides/all/manage-kubernetes-namespaces)
    - [Delete an SQS queue](/guides/all/manage-and-visualize-aws-sqs-queues#delete-an-sqs-queue)
    - [Delete an EKS Cluster](/guides/all/manage-your-eks-clusters#delete-an-eks-cluster)

- **Monitoring usage and health** to detect issues early
    - [Monitor and Purge SQS queues](/guides/all/manage-and-visualize-aws-sqs-queues#purge-an-sqs-queue)
    - [Redrive messages from a DLQ](/guides/all/manage-and-visualize-aws-sqs-queues#redrive-messages-from-dlq)

- **Rotating secrets and credentials** to mitigate risks
    - [Renew an ACM Certificate](/guides/all/manage-and-visualize-acm-certificates#renew-an-acm-certificate)

By automating these processes and providing self-service capabilities for Day 2 operations, platform teams empower developers to manage their own resources safely, while maintaining governance and compliance. Port enables you to define self-service actions for common Day 2 tasks, set up approval workflows, and enforce policies—ensuring that your cloud resources remain well-managed throughout their lifecycle.
