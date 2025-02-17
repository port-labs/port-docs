export const tagsCategoryMap = {
    "Use-cases": ["SDLC", "K8s for devs", "Incident management", "IaC for devs", "Cloud access management", "Feature flag management", "Security", /*"Cloud cost",*/ "Dev environments", "Engineering metrics", "Dependency management", "API catalog", "Approval workflow"],
    "Port pillars": ["Actions", "Automations", "Dashboards", "Scorecards", "RBAC"],
    Technologies: [
        "GitHub",
        "GitLab",
        "BitBucket",
        "AzureDevops",
        "Azure",
        "Webhook",
        "Kafka",
        "Jenkins",
        "Jira",
        "Kubernetes",
        "ArgoCD",
        "AWS",
        "Slack",
        "PagerDuty",
        "Terraform",
        "SonarQube",
        // "GCP",
        // "Kubecost",
        "Launchdarkly",
        // "Linear",
        // "Opencost",
        // "Snyk",
        "Datadog",
        "Dynatrace",
        "Humanitec",
        "New Relic",
        "ServiceNow",
    ]
};

export const availableGuides = [
    {
        title: "Scaffold a new service",
        description: "Create a self-service action that scaffolds a new service",
        tags: ["SDLC", "Actions"],
        additionalTags: ["BitBucket", "GitHub", "GitLab"],
        logos: ["Git"],
        category: "Getting started",
        link: "/guides/all/scaffold-a-new-service",
    },
    {
        title: "Ensure production readiness",
        description: "Define and track metrics for your services to ensure their production readiness",
        tags: ["SDLC", "Scorecards", "PagerDuty"],
        additionalTags: ["BitBucket", "GitHub", "GitLab"],
        logos: ["PagerDuty", "Git"],
        category: "Getting started",
        link: "/guides/all/ensure-production-readiness",
    },
    {
        title: "Create cloud resources using IaC",
        description: "Create a self-service action that provisions cloud resources from a pre-defined template in your Git repository",
        tags: ["IaC for devs", "AWS", "Actions", "Cloud access management"],
        additionalTags: ["BitBucket", "GitHub", "GitLab"],
        logos: ["AWS", "Git"],
        category: "Getting started",
        link: "/guides/all/create-cloud-resource-using-iac",
    },
    {
        title: "Visualize your services' k8s runtime",
        description: "Create views to track the health, status, and other standards of your services' k8s runtime",
        tags: ["K8s for devs", "Actions", "Dashboards", "Scorecards"],
        logos: ["Kubernetes" ],
        category: "Getting started",
        link: "/guides/all/visualize-service-k8s-runtime",
    },
    {
        title: "Visualize your services' k8s runtime using ArgoCD",
        description: "Create views to track the health, status, and other standards of your services' k8s runtime using ArgoCD",
        tags: ["K8s for devs", "ArgoCD", "Actions", "Dashboards", "Scorecards"],
        logos: ["ArgoCD", "Kubernetes"],
        category: "Getting started",
        link: "/guides/all/visualize-service-argocd-runtime",
    },
    {
        title: "Enrich services using Gitops",
        description: "Empower developers to independently enrich their services using a self-service action",
        tags: ["SDLC", "Actions"],
        additionalTags: ["BitBucket", "GitHub", "GitLab"],
        logos: ["Git"],
        category: "Getting started",
        link: "/guides/all/let-developers-enrich-services-using-gitops",
    },
    {
        title: "Slack reminders for scorecards",
        description: "Send a Slack reminder for uncompleted scorecard rules using a self-service action",
        tags: ["Engineering metrics", "Actions", "Scorecards"],
        logos: ["Slack"],
        category: "Getting started",
        link: "/guides/all/setup-slack-reminders",
    },
    {
        title: "IAM permission management",
        description: "Empower developers to independently enrich their services using a self-service action",
        tags: ["Cloud access management", "Actions", "RBAC"],
        logos: ["AWS" ],
        // category: "Getting started",
        link: "/guides/all/iam-permissions-guide",
    },
    {
        title: "Lock service deployment",
        description: "Implement a service locking mechanism using Port's GitHub Action",
        tags: ["SDLC", "Actions"],
        logos: ["GitHub"],
        // category: "Getting started",
        link: "/guides/all/service-lock-github-workflow",
    },
    {
        title: "Automate Slack alerts for Overdue PRs",
        description: "Send a Slack notification for pull requests that have been open longer than a specified time using an automation",
        tags: ["SDLC", "Automations"],
        logos: ["Slack"],
        // category: "Getting started",
        link: "/guides/all/automate-slack-alert-for-overdue-prs",
    },
    {
        title: "Manage resources using Kubernetes CRDs",
        description: "Integrate Kubernetes CRDs with Port and expose them in the Port UI for developers to use",
        tags: ["K8s for devs", "Actions"],
        logos: ["Kubernetes"],
        // category: "Getting started",
        link: "/guides/all/manage-resources-using-k8s-crds",
    },
    {
        title: "Automate incident management",
        description: "Automate notifications and documentation of incidents",
        tags: ["Incident management", "Automations"],
        logos: ["PagerDuty", "GitHub"],
        // category: "Getting started",
        link: "/guides/all/create-slack-channel-for-reported-incident",
    },
    {
        title: "Resolve PagerDuty incidents",
        description: "Create a self-service action to resolve incidents and notify stakeholders",
        tags: ["Incident management", "Automations"],
        logos: ["PagerDuty", "GitHub"],
        // category: "Getting started",
        link: "/guides/all/resolve-pagerduty-incident",
    },
    {
        title: "Connect GitHub repository (service) to a SonarQube project",
        description: "Create a logical connection between your services and their corresponding SonarQube projects",
        tags: ["Security", "SonarQube", "GitHub"],
        logos: ["SonarQube", "GitHub"],
        // category: "Getting started",
        link: "/guides/all/connect-github-repository-with-sonarqube-project",
    },
    {
        title: "Connect GitHub pull request with Jira Issue",
        description: "Create a logical connection between your GitHub PRs and their corresponding Jira issues",
        tags: ["SDLC", "Jira", "GitHub"],
        logos: ["Jira", "GitHub"],
        // category: "Getting started",
        link: "/guides/all/connect-github-pr-with-jira-issue",
    },
    {
        title: "Connect Jira issue to a service",
        description: "Create a logical connection between your Jira issues and their corresponding services",
        tags: ["SDLC", "Jira"],
        logos: ["Jira", "Git"],
        // category: "Getting started",
        link: "/guides/all/connect-jira-issue-to-service",
    },
    {
        title: "Connect GitHub repository (service) to a Launchdarkly project",
        description: "Create a logical connection between your services and their corresponding Launchdarkly projects",
        tags: ["Feature flag management", "Launchdarkly", "GitHub"],
        logos: ["Launchdarkly", "GitHub"],
        // category: "Getting started",
        link: "/guides/all/connect-github-repository-with-launchdarkly-project",
    },
    {
        title: "Connect Launchdarkly feature flag to a service",
        description: "Create a logical connection between a feature flag and a service",
        tags: ["Feature flag management", "Launchdarkly"],
        logos: ["Launchdarkly", "Git"],
        // category: "Getting started",
        link: "/guides/all/connect-launchdarkly-flag-to-service",
    },
    {
        title: "Ingest cloud resources using Dynatrace",
        description: "Ingest any cloud resources from your Dynatrace environment into Port",
        tags: ["Engineering metrics", "Dynatrace"],
        logos: ["Dynatrace"],
        // category: "Getting started",
        link: "/guides/all/ingest-cloud-resources-using-dynatrace",
    },
    {
        title: "Connect GitHub pull request to SonarQube analysis",
        description: "Create a logical connection between your GitHub PRs and their corresponding SonarQube analyses",
        tags: ["Security", "SonarQube", "GitHub"],
        logos: ["SonarQube", "GitHub"],
        // category: "Getting started",
        link: "/guides/all/connect-github-pr-with-sonar-analysis",
    },
    {
        title: "Connect SonarQube project to service",
        description: "Create a logical connection between your SonarQube projects and their corresponding services",
        tags: ["Security", "SonarQube"],
        logos: ["SonarQube", "Git"],
        // category: "Getting started",
        link: "/guides/all/connect-sonar-project-to-service",
    },
    {
        title: "Humanitec Integration",
        description: "Ingest various Humanitec resources into your Port software catalog",
        tags: ["Humanitec"],
        logos: ["Humanitec"],
        // category: "Getting started",
        link: "/guides/all/humanitec-integration",
    },
    {
        title: "Pull-request metrics",
        description: "Compute pull-request metrics for a GitHub repository",
        tags: ["Engineering metrics", "GitHub"],
        logos: ["GitHub"],
        // category: "Getting started",
        link: "/guides/all/pull-request-metrics",
    },
    {
        title: "Connect CODEOWNERS with Service, Team & User",
        description: "Create a logical connection between your GitHub CODEOWNERS and their corresponding services, teams, and users",
        tags: ["RBAC", "GitHub"],
        logos: ["GitHub"],
        // category: "Getting started",
        link: "/guides/all/connect-github-codeowners-with-service-team-and-user",
    },
    {
        title: "Manage an S3 Bucket Lifecycle",
        description: "Create and manage an S3 bucket using Port & Terraform",
        tags: ["IaC for devs", "AWS", "Terraform"],
        logos: ["AWS", "Terraform"],
        // category: "Getting started",
        link: "/guides/all/s3-bucket",
    },
    {
        title: "Manage a Developer Environment Lifecycle",
        description: "Create and manage a developer environment in AWS using Port & Terraform",
        tags: ["Dev environments", "IaC for devs", "AWS", "Terraform"],
        logos: ["AWS", "Terraform"],
        // category: "Getting started",
        link: "/guides/all/create-dev-env",
    },
    {
        title: "Manage integration mapping using Terraform",
        description: "Configure integration mapping using Port & Terraform",
        tags: ["IaC for devs", "Terraform"],
        logos: ["Terraform"],
        // category: "Getting started",
        link: "/guides/all/import-and-manage-integration",
    },
    {
        title: "Set up a basic execution runner using Kafka & AWS Lambda",
        description: "Deploy an AWS Lambda function that will perform an action based on Port action invocations",
        tags: ["SDLC", "Kafka", "Actions", "AWS"],
        logos: ["Kafka", "AWS"],
        // category: "Getting started",
        link: "/guides/all/execution-basic-runner-using-aws-lambda",
    },
    {
        title: "Create an S3 bucket using Self-Service Actions",
        description: "Create an S3 bucket using a webhook backend",
        tags: ["Webhook", "AWS", "Actions"],
        logos: ["AWS", "Webhook"],
        // category: "Getting started",
        link: "/guides/all/s3-using-webhook",
    },
    {
        title: "Create a GitHub Secret",
        description: "Create a GitHub secret using a GitHub workflow backend",
        tags: ["GitHub", "Actions"],
        logos: ["GitHub"],
        // category: "Getting started",
        link: "/guides/all/create-github-secret",
    },
    {
        title: "Delete a GitHub Repository",
        description: "Create a self-service action that uses a GitHub workflow backend to delete a GitHub repository",
        tags: ["GitHub", "Actions"],
        logos: ["GitHub"],
        // category: "Getting started",
        link: "/guides/all/delete-repository",
    },
    {
        title: "Manage GitHub Pull Requests",
        description: "Create a self-service action that uses a GitHub workflow backend to close/approve/merge pull requests",
        tags: ["GitHub", "Actions"],
        logos: ["GitHub"],
        // category: "Getting started",
        link: "/guides/all/manage-pull-requests",
    },
    {
        title: "Nudge Pull Request Reviewers",
        description: "Create a self-service action that nudges reviewers of a pull request",
        tags: ["GitHub", "Actions", "Slack"],
        logos: ["GitHub", "Slack"],
        // category: "Getting started",
        link: "/guides/all/nudge-pr-reviewers",
    },
    {
        title: "Promote Deployment to Production",
        description: "Create a self-service action that promotes an image from staging to production",
        tags: ["SDLC", "Actions", "GitHub"],
        logos: ["GitHub"],
        // category: "Getting started",
        link: "/guides/all/promote-to-production",
    },
    {
        title: "Broadcast message to API consumers",
        description: "Create a self-service action that sends a Slack message to designated channels",
        tags: ["GitHub", "Actions", "Slack"],
        logos: ["GitHub", "Slack"],
        // category: "Getting started",
        link: "/guides/all/broadcast-api-consumers-message",
    },
    {
        title: "Lock and Unlock Service",
        description: "Create a self-service action that locks and unlocks a service",
        tags: ["SDLC", "Actions", "GitHub"],
        logos: ["GitHub"],
        // category: "Getting started",
        link: "/guides/all/lock-and-unlock-service-in-port",
    },
    {
        title: "Create Slack channel for Incident Management",
        description: "Create a self-service action that creates a dedicated Slack channel for a service",
        tags: ["Incident management", "Actions", "Slack"],
        logos: ["GitHub", "Slack"],
        // category: "Getting started",
        link: "/guides/all/open-slack-channel",
    },
    {
        title: "Deploy/rollback using ArgoCD",
        description: "Create a self-service action that performs a deployment/rollback using ArgoCD",
        tags: ["K8s for devs", "ArgoCD", "Actions", "GitHub"],
        logos: ["ArgoCD", "GitHub"],
        // category: "Getting started",
        link: "/guides/all/rollback-argocd-deployment",
    },
    {
        title: "Synchronize ArgoCD Application",
        description: "Create a self-service action that synchronizes an ArgoCD application",
        tags: ["K8s for devs", "ArgoCD", "Actions", "GitHub"],
        logos: ["ArgoCD", "GitHub"],
        // category: "Getting started",
        link: "/guides/all/sync-argocd-app",
    },
    {
        title: "Restart ArgoCD Application",
        description: "Create a self-service action that restarts an ArgoCD application",
        tags: ["K8s for devs", "ArgoCD", "Actions", "GitHub"],
        logos: ["ArgoCD", "GitHub"],
        // category: "Getting started",
        link: "/guides/all/restart-argocd-app",
    },
    {
        title: "Change Deployment Replica Count",
        description: "Create a self-service action that changes the replica count of a Kubernetes deployment",
        tags: ["K8s for devs", "Actions", "GitHub"],
        logos: ["Kubernetes", "GitHub"],
        // category: "Getting started",
        link: "/guides/all/change-replica-count",
    },
    {
        title: "Create and manage Kubernetes clusters",
        description: "Create Kubernetes clusters using Crossplane & ArgoCD",
        tags: ["K8s for devs", "ArgoCD", "GitHub"],
        logos: ["ArgoCD", "GitHub"],
        // category: "Getting started",
        link: "/guides/all/manage-clusters",
    },
    {
        title: "Deploy AWS resources using CloudFormation",
        description: "Create a self-service action that deploys AWS resources using an AWS CloudFormation template",
        tags: ["IaC for devs", "AWS", "Actions"],
        logos: ["AWS", "GitHub"],
        // category: "Getting started",
        link: "/guides/all/deploy-cloudformation-template",
    },
    {
        title: "Create An AWS EC2 Instance",
        description: "Create a self-service action that creates an AWS EC2 instance using a Terraform template",
        tags: ["IaC for devs", "AWS", "Terraform", "Actions", "GitHub"],
        logos: ["AWS", "Terraform", "GitHub"],
        // category: "Getting started",
        link: "/guides/all/create-an-ec2-instance",
    },
    {
        title: "Deploy S3 Bucket using Crossplane",
        description: "Create a self-service action that deploys Crossplane resources in your Kubernetes cluster",
        tags: ["K8s for devs", "AWS", "Actions"],
        logos: ["Kubernetes", "AWS"],
        // category: "Getting started",
        link: "/guides/all/deploy-s3-bucket-crossplane",
    },
    {
        title: "Manage An AWS EC2 Instance",
        description: "Create a self-service action that terminates/reboots/resizes an AWS EC2 instance",
        tags: ["AWS", "GitHub", "Actions"],
        logos: ["AWS", "GitHub"],
        // category: "Getting started",
        link: "/guides/all/manage-ec2-instances",
    },
    {
        title: "Provision Cloud Resource using Terraform",
        description: "Create a self-service action that provisions cloud resources using Terraform",
        tags: ["IaC for devs", "Approval workflow", "AWS", "Terraform", "Actions"],
        logos: ["AWS", "Terraform"],
        // category: "Getting started",
        link: "/guides/all/terraform-plan-and-apply-aws-resource",
    },
    {
        title: "Add tags to ECR repository",
        description: "Create a self-service action that adds meaningful tags to an AWS ECR repository",
        tags: ["AWS", "GitHub", "Actions"],
        logos: ["AWS", "GitHub"],
        // category: "Getting started",
        link: "/guides/all/add-tags-to-ecr-repository",
    },
    {
        title: "Add tags to S3 Bucket",
        description: "Create a self-service action that adds meaningful tags to an AWS S3 bucket",
        tags: ["AWS", "GitHub", "Actions"],
        logos: ["AWS", "GitHub"],
        // category: "Getting started",
        link: "/guides/all/add-tags-to-s3-bucket",
    },
    {
        title: "Create an EKS cluster and deploy a Node.js app",
        description: "Create a self-service action that provisions an EKS cluster and deploys a Node.js app",
        tags: ["K8s for devs", "AWS", "GitHub", "Actions"],
        logos: ["AWS", "GitHub"],
        // category: "Getting started",
        link: "/guides/all/create-eks-cluster-and-deploy-app",
    },
    {
        title: "Build an ECR image",
        description: "Create a self-service action that builds and pushes a Docker image to AWS ECR",
        tags: ["AWS", "GitHub", "Actions"],
        logos: ["AWS", "GitHub"],
        // category: "Getting started",
        link: "/guides/all/push-image-to-ecr",
    },
    {
        title: "Create and Manage Statuspage Incidents",
        description: "Create self-service actions that manage Statuspage incidents",
        tags: ["Incident management", "GitHub", "Actions"],
        logos: ["GitHub"],
        // category: "Getting started",
        link: "/guides/all/manage-statuspage-incident",
    },
    {
        title: "Deploy Azure Resource using Terraform",
        description: "Create a self-service action that deploys a storage account in Azure using Terraform",
        tags: ["IaC for devs", "Azure", "Terraform", "Actions"],
        logos: ["Azure", "Terraform"],
        // category: "Getting started",
        link: "/guides/all/create-azure-resource",
    },
    {
        title: "Add Tags to Azure Resource",
        description: "Create a self-service action that adds tags to an Azure storage account",
        tags: ["Azure", "GitHub", "Actions"],
        logos: ["Azure", "GitHub"],
        // category: "Getting started",
        link: "/guides/all/tag-azure-resource",
    },
    {
        title: "Trigger Datadog Incident",
        description: "Create a self-service action that triggers a Datadog incident",
        tags: ["Incident management", "Datadog", "Actions"],
        logos: ["Datadog", "GitHub"],
        // category: "Getting started",
        link: "/guides/all/trigger-datadog-incident",
    },
    {
        title: "Change status and assignee of Jira ticket",
        description: "Create a self-service action that changes the status and assignee of a Jira ticket",
        tags: ["Jira", "GitHub", "Actions"],
        logos: ["Jira", "GitHub"],
        // category: "Getting started",
        link: "/guides/all/change-status-and-assignee-of-jira-ticket",
    },
    {
        title: "Create Jira Issue from Dependabot Alert",
        description: "Create a self-service action that creates a Jira issue from a Dependabot alert",
        tags: ["Security", "Jira", "GitHub", "Actions"],
        logos: ["Jira", "GitHub"],
        // category: "Getting started",
        link: "/guides/all/create-jira-issue-from-dependabot",
    },
    {
        title: "Create Jira issue with automatic label",
        description: "Create a self-service action that creates a Jira issue with a label that links it to a service",
        tags: ["Jira", "GitHub", "Actions"],
        logos: ["Jira", "GitHub"],
        // category: "Getting started",
        link: "/guides/all/open-jira-issue-with-automatic-label",
    },
    {
        title: "Report a bug to Jira",
        description: "Create a self-service action that reports a bug to Jira",
        tags: ["Jira", "GitHub", "Actions"],
        logos: ["Jira", "GitHub"],
        // category: "Getting started",
        link: "/guides/all/report-a-bug",
    },
    {
        title: "Toggle LaunchDarkly Feature Flag",
        description: "Create a self-service action that toggles a LaunchDarkly feature flag",
        tags: ["Feature flag management", "Launchdarkly", "GitHub", "Actions"],
        logos: ["Launchdarkly", "GitHub"],
        // category: "Getting started",
        link: "/guides/all/toggle-launchdarkly-feature-flag",
    },
    {
        title: "Create an Opsgenie Incident",
        description: "Create a self-service action that creates an Opsgenie incident",
        tags: ["Incident management", "GitHub", "Actions"],
        logos: ["GitHub"],
        // category: "Getting started",
        link: "/guides/all/create-an-opsgenie-incident",
    },
    {
        title: "Acknowledge Incident In PagerDuty",
        description: "Create a self-service action that acknowledges an incident in PagerDuty",
        tags: ["Incident management", "PagerDuty", "GitHub", "Actions"],
        logos: ["PagerDuty", "GitHub"],
        // category: "Getting started",
        link: "/guides/all/acknowledge-incident",
    },
    {
        title: "Change the on-call In PagerDuty",
        description: "Create a self-service action that changes the on-call in PagerDuty",
        tags: ["Incident management", "PagerDuty", "GitHub", "Actions"],
        logos: ["PagerDuty", "GitHub"],
        // category: "Getting started",
        link: "/guides/all/change-on-call-user",
    },
    {
        title: "Change Incident Owner In PagerDuty",
        description: "Create a self-service action that changes the incident owner in PagerDuty",
        tags: ["Incident management", "PagerDuty", "GitHub", "Actions"],
        logos: ["PagerDuty", "GitHub"],
        // category: "Getting started",
        link: "/guides/all/change-pagerduty-incident-owner",
    },
    {
        title: "Create a PagerDuty Incident",
        description: "Create a self-service action that creates a PagerDuty incident",
        tags: ["Incident management", "PagerDuty", "GitHub", "Actions"],
        logos: ["PagerDuty", "GitHub"],
        // category: "Getting started",
        link: "/guides/all/create-pagerduty-incident",
    },
    {
        title: "Create a PagerDuty Service",
        description: "Create a self-service action that creates a PagerDuty service",
        tags: ["Incident management", "PagerDuty", "GitHub", "Actions"],
        logos: ["PagerDuty", "GitHub"],
        // category: "Getting started",
        link: "/guides/all/create-pagerduty-service",
    },
    {
        title: "Escalate incident in PagerDuty",
        description: "Create a self-service action that escalates an incident in PagerDuty",
        tags: ["Incident management", "PagerDuty", "GitHub", "Actions"],
        logos: ["PagerDuty", "GitHub"],
        // category: "Getting started",
        link: "/guides/all/escalate-an-incident",
    },
    {
        title: "Resolve incident in PagerDuty",
        description: "Create a self-service action that resolves an incident in PagerDuty",
        tags: ["Incident management", "PagerDuty", "GitHub", "Actions"],
        logos: ["PagerDuty", "GitHub"],
        // category: "Getting started",
        link: "/guides/all/resolve-incident",
    },
    {
        title: "Trigger a PagerDuty Incident Action",
        description: "Create a self-service action that triggers a PagerDuty incident",
        tags: ["Incident management", "PagerDuty", "GitHub", "Actions"],
        logos: ["PagerDuty", "GitHub"],
        // category: "Getting started",
        link: "/guides/all/trigger-pagerduty-incident",
    },
    {
        title: "Trigger a ServiceNow Incident",
        description: "Create a self-service action that triggers a ServiceNow incident",
        tags: ["Incident management", "ServiceNow", "GitHub", "Actions"],
        logos: ["ServiceNow", "GitHub"],
        // category: "Getting started",
        link: "/guides/all/trigger-servicenow-incident",
    },
    {
        title: "Add tags to a SonarQube project",
        description: "Create a self-service action that adds tags to a SonarQube project",
        tags: ["Security", "SonarQube", "GitHub", "Actions"], 
        logos: ["SonarQube", "GitHub"],
        // category: "Getting started",
        link: "/guides/all/add-tags-to-sonarqube-project",
    },
    {
        title: "Create an Application In Humanitec",
        description: "Create a self-service action that creates an application in Humanitec",
        tags: ["Humanitec", "GitHub", "Actions"],
        logos: ["Humanitec", "GitHub"],
        // category: "Getting started",
        link: "/guides/all/create-humanitec-application",
    },
    {
        title: "Create a Workload Profile In Humanitec",
        description: "Create a self-service action that creates a workload profile in Humanitec",
        tags: ["Humanitec", "GitHub", "Actions"],
        logos: ["Humanitec", "GitHub"],
        // category: "Getting started",
        link: "/guides/all/create-workload-profile",
    },
    {
        title: "Delete an Application In Humanitec",
        description: "Create a self-service action that deletes an application in Humanitec",
        tags: ["Humanitec", "GitHub", "Actions"],
        logos: ["Humanitec", "GitHub"],
        // category: "Getting started",
        link: "/guides/all/delete-humanitec-application",
    },
    {
        title: "Deploy an Application In Humanitec",
        description: "Create a self-service action that deploys an application in Humanitec",
        tags: ["Humanitec", "GitHub", "Actions"],
        logos: ["Humanitec", "GitHub"],
        // category: "Getting started",
        link: "/guides/all/deploy-humanitec-application",
    },
    {
        title: "EKS as a service (EKSaaS)",
        description: "Integrate Port and Upbound to manage EKS clusters using EKSaaS",
        tags: ["K8s for devs", "GitHub", "Actions"],
        logos: ["GitHub", "Kubernetes"],
        // category: "Getting started",
        link: "/guides/all/eks-as-a-service-action",
    },
    {
        title: "Create An AWS EC2 Instance",
        description: "Create a self-service action that creates an AWS EC2 instance using a Terraform template",
        tags: ["IaC for devs", "AWS", "Terraform", "Actions", "GitLab"],
        logos: ["AWS", "Terraform", "GitLab"],
        // category: "Getting started",
        link: "/guides/all/create-an-ec2-instance-gitlab",
    },
    {
        title: "Add a Disk to an AWS EC2 Instance",
        description: "Create a self-service action that adds a disk to an AWS EC2 instance using a Terraform template",
        tags: ["IaC for devs", "AWS", "Terraform", "Actions", "GitLab"],
        logos: ["AWS", "Terraform", "GitLab"],
        // category: "Getting started",
        link: "/guides/all/add-ec2-volume",
    },
    {
        title: "Create a Kubernetes namespace",
        description: "Create a self-service action that creates a Kubernetes namespace",
        tags: ["K8s for devs", "Actions", "GitLab"],
        logos: ["Kubernetes", "GitLab"],
        // category: "Getting started",
        link: "/guides/all/create-k8s-namespace",
    },
    {
        title: "Automate AWS Account Creation with GitLab",
        description: "Create a self-service action that creates an AWS account",
        tags: ["Cloud access management", "Actions", "GitLab", "AWS"],
        logos: ["AWS", "GitLab"],
        // category: "Getting started",
        link: "/guides/all/create-new-aws-account-gitlab",
    },
    {
        title: "Create a Jira Issue",
        description: "Create a self-service action that creates a Jira issue",
        tags: ["SDLC", "Jira", "Actions", "GitLab"],
        logos: ["Jira", "GitLab"],
        // category: "Getting started",
        link: "/guides/all/report-a-bug-gitlab",
    },
    {
        title: "Scaffold BitBucket Repositories Using Cookiecutter",
        description: "Create a self-service action that scaffolds BitBucket repositories using a Cookiecutter template",
        tags: ["SDLC", "Jenkins", "BitBucket", "Actions"],
        logos: ["Jenkins", "BitBucket"],
        // category: "Getting started",
        link: "/guides/all/scaffold-bitbucket-using-cookiecutter",
    },
    {
        title: "Scaffold GitHub Repositories Using Cookiecutter",
        description: "Create a self-service action that scaffolds GitHub repositories using a Cookiecutter template",
        tags: ["SDLC", "Jenkins", "GitHub", "Actions"],
        logos: ["Jenkins", "GitHub"],
        // category: "Getting started",
        link: "/guides/all/scaffold-github-using-cookiecutter",
    },
    {
        title: "Create Github pull request to add a Terraform resource",
        description: "Create a self-service action that adds a resource to a Terraform file and creates a pull request to add it to the repository",
        tags: ["IaC for devs", "Jenkins", "GitHub", "Actions"],
        logos: ["Jenkins", "GitHub"],
        // category: "Getting started",
        link: "/guides/all/create-github-pull-request",
    },
    {
        title: "Deploy resource in Azure Cloud with Terraform",
        description: "Create a self-service action that deploys a storage account in Azure Cloud using a Terraform template",
        tags: ["IaC for devs", "Jenkins", "Terraform", "Azure", "Actions"],
        logos: ["Jenkins", "Terraform", "Azure"],
        // category: "Getting started",
        link: "/guides/all/deploy-azure-resource",
    },
    {
        title: "Scaffold Azure DevOps Repositories Using Cookiecutter",
        description: "Create a self-service action that scaffolds Azure DevOps repositories using a Cookiecutter template",
        tags: ["SDLC", "AzureDevops", "Actions"],
        logos: ["AzureDevops"],
        // category: "Getting started",
        link: "/guides/all/scaffold-repositories-using-cookiecutter",
    },
    {
        title: "Create Azure Resource with Terraform",
        description: "Create a self-service action that creates a storage account in Azure using a Terraform template",
        tags: ["IaC for devs", "AzureDevops", "Terraform", "Actions"],
        logos: ["AzureDevops", "Terraform"],
        // category: "Getting started",
        link: "/guides/all/create-azure-resource-ado",
    },
    {
        title: "Ingest dependencies from package.json file to service",
        description: "Ingest dependencies from a package.json file and relate them to the corresponding service entities",
        tags: ["SDLC","GitHub"],
        logos: ["GitHub"],
        // category: "Getting started",
        link: "/guides/all/ingest-dependencies-from-package-json-to-service",
    },
    {
        title: "Manage Kubernetes namespaces via a Port workflow",
        description: "Chain actions and automations to automate the deletion of Kubernetes namespaces",
        tags: ["K8s for devs", "Approval workflow", "GitLab", "Actions", "Automations"],
        logos: ["Kubernetes", "GitLab"],
        // category: "Getting started",
        link: "/guides/all/manage-kubernetes-namespaces",
    },
    {
        title: "Sync Service Entities to incident.io",
        description: "Create a GitHub action that syncs service entities to your incident.io catalog",
        tags: ["Incident management","GitHub"],
        logos: ["GitHub"],
        link: "/guides/all/sync-service-entities-to-incident-io",
    },
    {
        title: "Ingest cloud resources with Datadog",
        description: "Learn how to ingest cloud resources using Datadog in Port, enhancing visibility and performance monitoring",
        tags: ["Cloud access management", "Datadog"],
        logos: ["Datadog"],
        link: "/guides/all/ingest-cloud-resources-using-datadog",
    },
    {
        title: "Track DORA Metrics",
        description: "Setup DevOps Research and Assessment (DORA) metrics within your organization in PORT",
        tags: ["Engineering metrics","GitHub","GitLab","AzureDevOps","Dashboards"],
        logos: ["Git"],
        link: "/guides/all/setup-dora-metrics",
    },
    {
        title: "Ingest a swagger.json file into your catalog",
        description: "Ingest API paths from a `swagger.json` file in a GitHub repository into Port",
        tags: ["API catalog", "GitHub"],
        logos: ["GitHub"],
        link: "/guides/all/ingest-swagger-paths-into-your-catalog",
    },
    {
        title: "Ingest Checkmarx KICS scan results into your catalog",
        description: "Ingests Checkmarx KICS scan results in your Checkmarx KICS file using Port's GitHub file ingesting feature",
        tags: ["Security", "Checkmarx", "GitHub"],
        logos: ["Checkmarx", "GitHub"],
        link: "/guides/all/ingest-checkmarx-kics-scan-into-your-catalog"
    },
    {
        title: "Ingest Javascript packages into your catalog",
        description: "Ingests all Javascript packages in `package.json` file using Port's GitHub file ingesting feature",
        tags: ["Dependency management", "GitHub"],
        logos: ["GitHub"],
        link: "/guides/all/ingest-javascript-packages-into-your-catalog"
    },
    {
        title: "Ingest software bills of materials (SBOMs) into your catalog",
        description: "Ingests software bill of material (SBOM) in your `SBOM.json` or `SBOM.xml` file using Port's GitHub file ingesting feature",
        tags: ["Security", "GitHub"],
        logos: ["GitHub"],
        link: "/guides/all/ingest-software-bill-of-materials-sbom-into-your-catalog"
    },
    {
        title: "Ingest Trivy vulnerabilities into your catalog",
        description: "Ingests Trivy vulnerabilities in your Trivy scan results file using Port's GitHub file ingesting feature",
        tags: ["Security", "Trivy", "GitHub"],
        logos: ["Trivy", "GitHub"],
        link: "/guides/all/ingest-trivy-vulnerabilities-into-your-catalog"
    },
    {
        title: "Ingest cloud resources using New Relic",
        description: "Ingest cloud resources from your New Relic environment into Port",
        tags: ["Engineering metrics", "New Relic"],
        logos: ["New Relic"],
        // category: "Getting started",
        link: "/guides/all/ingest-cloud-resources-using-newrelic",
    },
    {
        title: "Ingest vulnerability alerts from Orca Security",
        description: "Ingest vulnerability alerts from Orca Security using a custom webhook integration",
        tags: ["Security", "Webhook"],
        logos: ["Webhook"],
        link: "/guides/all/ingest-vulnerability-alerts-from-orca-security-using-a-custom-webhook-integration"
    },
    {
        title: "Measure pull request standards",
        description: "Implement working agreements and measure pr standards",
        tags: ["Engineering metrics", "GitHub", "Dashboards"],
        logos: ["GitHub"],
        link: "/guides/all/working_agreements_and_measuring_pr_standards"
       
    },
    {
        title: "Automatically approve actions using an automation",
        description: "Set up automated approvals for self service actions",
        tags: ["Cloud access management", "Actions", "Automations"],
        logos: ["Slack"],
        link: "/guides/all/automatically-approve-action-using-automation"
    },
    {
        title: "Track SLOs and SLIs for services",
        description: "Track service level objectives (SLOs) and service level indicators (SLIs) for services in Port",
        tags: ["Engineering metrics", "New Relic", "Dashboards"],
        logos: ["New Relic"],
        link: "/guides/all/track-slos-and-slis-for-services"
    },
    {
        title: "Ingest security issues from .sarif files to services",
        description: "Ingest .sarif files and relate them to the corresponding service entities",
        tags: ["Security", "GitHub"],
        logos: ["GitHub"],
        link: "/guides/all/ingest-security-issues-from-sarif-files-to-services",
    },
    {
        title: "Set up announcements in your portal",
        description: "Create components to send announcements to members in your portal",
        tags: ["Actions", "Dashboards"],
        logos: ["Actions"],
        link: "/guides/all/setup-portal-announcements",
    },
    {
        title: "Set up DORA Metrics benchmark",
        description: "Track and improve engineering performance by setting up DORA metrics benchmark",
        tags: ["Engineering metrics","Scorecards","Dashboards"],
        logos: ["Git"],
        link: "/guides/all/setup-dora-metrics-benchmark"
    },
    {
        title: "Manage service deployments using GitLab and ServiceNow", 
        description: "Create a chain of self-service actions that deploy a service using GitLab and ServiceNow",
        tags: ["Approval workflow", "ServiceNow", "GitLab", "Actions", "Automations"],
        logos: ["ServiceNow", "GitLab"],
        link: "/guides/all/approval-workflow-for-gitlab-deployment"
    },
    {
        title: "Assign teams to monitored entities", 
        description: "Configure your Dynatrace data sources to map entities to teams",
        tags: ["Engineering metrics", "Dynatrace"],
        logos: ["Dynatrace"],
        link: "/guides/all/connect-dynatrace-team-with-entities"
    },
    {
        title: "Create surveys in your portal",
        description: "Create surveys to collect feedback from your developers",
        tags: ["Engineering metrics", "Actions", "Dashboards"],
        logos: ["Engineering metrics"],
        link: "/guides/all/create-surveys",
    },
]