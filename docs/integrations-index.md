---
title: Integrations index
sidebar_label: Integrations index
sidebar_position: 11
slug: /integrations-index/
sidebar_class_name: custom-sidebar-item sidebar-menu-integrations-index
---

# Integrations index

This page contains a list of Port's available integrations, organized by the platform/product.

## Git

### GitHub

- [GitHub app](/build-your-software-catalog/sync-data-to-catalog/git/github/github.md)
- [GitHub self-hosted app](/build-your-software-catalog/sync-data-to-catalog/git/github/self-hosted-installation.md)
- [GitHub GitOps](/build-your-software-catalog/sync-data-to-catalog/git/github/gitops/gitops.md)
- [GitHub action for GitHub workflow](/build-your-software-catalog/custom-integration/api/ci-cd/github-workflow/github-workflow.md)
- [GitHub workflow self-service actions](/actions-and-automations/setup-backend/github-workflow/github-workflow.md)
- [Sync repositories, file contents, pull-requests, workflows, teams and more](/build-your-software-catalog/sync-data-to-catalog/git/github/examples/examples.md)
- [Sync Dependabot](/build-your-software-catalog/sync-data-to-catalog/git/github/examples/examples.md#mapping-repositories-and-dependabot-alerts)
- [GitHub scaffolder using GitHub workflows](/guides/all/scaffold-a-new-service.md?git-provider=github)
- [GitHub scaffolder using Jenkins pipelines](/guides/all/scaffold-github-using-cookiecutter.md)
- [GitHub scaffolder using FastAPI backend](/actions-and-automations/setup-backend/webhook/examples/software-templates.md)
- [Deploy AWS resources using AWS CloudFormation](/guides/all/deploy-cloudformation-template.md)
- [Deploy Azure resources using Terraform](/guides/all/create-azure-resource.md)
- [Create GitHub secret using GitHub workflows](/guides/all/create-github-secret.md)
- [Script to ingest GitHub packages](https://github.com/port-labs/example-github-packages)
- [Lock service deployment](/guides/all/service-lock-github-workflow)
- [Nudge PR reviewers](/guides/all/nudge-pr-reviewers)
- [Promote to production](/guides/all/promote-to-production)
- [Self-service action to lock and unlock a service](/guides/all/lock-and-unlock-service-in-port)
- [Connect GitHub Codeowners with Service, Team and User](/guides/all/connect-github-codeowners-with-service-team-and-user)
- [Ingest Javascript packages into your catalog using GitHub file ingesting feature](/guides/all/ingest-javascript-packages-into-your-catalog)

### GitLab

- [GitLab app](/build-your-software-catalog/sync-data-to-catalog/git/gitlab/gitlab.md)
- [GitLab GitOps](/build-your-software-catalog/sync-data-to-catalog/git/gitlab/gitops/gitops.md)
- [GitLab advanced file search and search checks](/build-your-software-catalog/sync-data-to-catalog/git/gitlab/mapping_extensions.md)
- [Sync GitLab pipelines](/build-your-software-catalog/custom-integration/api/ci-cd/gitlab-pipelines/gitlab-pipelines.md)
- [GitLab pipeline self-service actions](/actions-and-automations/setup-backend/gitlab-pipeline/gitlab-pipeline.md)
- [GitLab scaffolder](/guides/all/scaffold-a-new-service.md?git-provider=gitlab)
- [Sync projects, file contents, merge-requests and more](/build-your-software-catalog/sync-data-to-catalog/git/gitlab/examples.md)

### Bitbucket

- [Bitbucket app](/build-your-software-catalog/sync-data-to-catalog/git/bitbucket/bitbucket.md)
- [BitBucket GitOps](/build-your-software-catalog/sync-data-to-catalog/git/bitbucket/gitops/gitops.md)
- [Sync repositories, file contents, pull-requests, monorepos and more](/build-your-software-catalog/sync-data-to-catalog/git/bitbucket/examples.md)
- [Bitbucket scaffolder](/guides/all/scaffold-bitbucket-using-cookiecutter.md)
- [Webhook integration between Bitbucket (self-hosted) server and Port](/build-your-software-catalog/custom-integration/webhook/examples/bitbucket-server/bitbucket-server.md)

### Azure DevOps

- [Sync Azure pipelines](/build-your-software-catalog/custom-integration/api/ci-cd/azure-pipelines/azure-pipelines.md)
- [Azure pipelines self-service actions](/actions-and-automations/setup-backend/azure-pipeline/azure-pipeline.md)
- [Cookiecutter Azure DevOps scaffolder using Azure DevOps pipelines](/guides/all/scaffold-repositories-using-cookiecutter.md)

### GitOps using Port CRDs

- [Mapping resources using Port CRDs](/build-your-software-catalog/sync-data-to-catalog/git/gitops-using-port-crd.md)

## Kubernetes

- [K8s exporter](/build-your-software-catalog/sync-data-to-catalog/kubernetes-stack/kubernetes/kubernetes.md)
- [Map Istio](/build-your-software-catalog/sync-data-to-catalog/kubernetes-stack/kubernetes/templates/istio.md)
- [Map Knative](/build-your-software-catalog/sync-data-to-catalog/kubernetes-stack/kubernetes/templates/knative.md)
- [Map Red Hat Openshift](/build-your-software-catalog/sync-data-to-catalog/kubernetes-stack/kubernetes/templates/openshift.md)
- [Map Trivy](/build-your-software-catalog/sync-data-to-catalog/kubernetes-stack/kubernetes/templates/trivy.md)
- [Ingest Trivy vulnerabilities into your catalog using GitHub file ingesting feature](/guides/all/ingest-trivy-vulnerabilities-into-your-catalog)
- [Map Kyverno](/build-your-software-catalog/sync-data-to-catalog/kubernetes-stack/kubernetes/templates/kyverno.md)
- [Map FluxCD](/build-your-software-catalog/sync-data-to-catalog/kubernetes-stack/kubernetes/templates/fluxcd.md)
- [Map CRDs](/build-your-software-catalog/sync-data-to-catalog/kubernetes-stack/kubernetes/custom-crds.md)
- [Port entity CRD](/build-your-software-catalog/sync-data-to-catalog/kubernetes-stack/kubernetes/port-crd.md)
- [Create and managed Kubernetes cluster](/guides/all/manage-clusters)
- [Change deployment replica count](/guides/all/change-replica-count)

## ArgoCD

- [ArgoCD exporter and webhook integration](/build-your-software-catalog/sync-data-to-catalog/argocd/)
- [ArgoCD events](/build-your-software-catalog/sync-data-to-catalog/argocd/argocd.md#argocd-events)
- [Rollback ArgoCD deployment](/guides/all/rollback-argocd-deployment)
- [Self-service action to synchronize ArgoCD application](/guides/all/sync-argocd-app)

## Infrastructure as Code (IaC)

### Terraform

- [Terraform provider](/build-your-software-catalog/custom-integration/iac/terraform/terraform.md)
- [Terraform managed blueprint](/build-your-software-catalog/customize-integrations/configure-data-model/Iac/terraform-managed-blueprint.md)
- [Create cloud resources using IaC](/guides/all/create-cloud-resource-using-iac.md)
- [Terraform manage S3 buckets lifecycle](/guides/all/s3-bucket.md)
- [Terraform manage developer environment](/guides/all/create-dev-env.md)
- [Terraform no-code resource provisioning using self-service actions](/actions-and-automations/setup-backend/webhook/examples/terraform-no-code-resource-provisioning.md)
- [Import Terraform state using webhook](/build-your-software-catalog/custom-integration/webhook/examples/packages/terraform.md)

### Terraform Cloud

- [Terraform cloud](/build-your-software-catalog/sync-data-to-catalog/terraform-cloud)
- [Terraform cloud actions](/actions-and-automations/setup-backend/webhook/terraform-cloud)

### Pulumi

- [Pulumi provider](/build-your-software-catalog/custom-integration/iac/pulumi/pulumi.md)
- [Pulumi managed blueprint](/build-your-software-catalog/customize-integrations/configure-data-model/Iac/pulumi-managed-blueprint.md)

## Cloud providers

### AWS

- [AWS integration](/build-your-software-catalog/sync-data-to-catalog/cloud-providers/aws/aws.md)
- [Map AWS Resources to your integration](docs/build-your-software-catalog/sync-data-to-catalog/cloud-providers/aws/examples/examples.md)
- [Deploy AWS resources using AWS CloudFormation](/guides/all/deploy-cloudformation-template.md)
- [Terraform manage S3 buckets lifecycle](/guides/all/s3-bucket.md)
- [Terraform manage developer environment](/guides/all/create-dev-env.md)
- [Connect ECR repository to Service](/build-your-software-catalog/sync-data-to-catalog/cloud-providers/aws/aws-exporter/examples/connect-ecr-repo-to-service-using-tags.md)
- [Script to ingest ECR Images and Repositories](https://github.com/port-labs/example-ecr-images)
- [Self-service action to create EC2 instance](/guides/all/create-an-ec2-instance)
- [Provision AWS cloud resource using Terraform Plan and Apply](/guides/all/terraform-plan-and-apply-aws-resource)
- [Add tags to ECR repository](/guides/all/add-tags-to-ecr-repository)
- [Generate ECR image with tags](/guides/all/push-image-to-ecr)

### Azure

- [Azure exporter](/build-your-software-catalog/sync-data-to-catalog/cloud-providers/azure/azure.md)
- [Azure Active Directory (AD) SSO](/sso-rbac/sso-providers/oidc/azure-ad.md)
- [Map resource groups, storage groups, compute resources database resources and more](/build-your-software-catalog/sync-data-to-catalog/cloud-providers/azure/resource_templates/resource_templates.md)
- [Add tags to Azure resources](/guides/all/tag-azure-resource)

### GCP

- [GCP integration](/build-your-software-catalog/sync-data-to-catalog/cloud-providers/gcp/gcp.md)
- [Sync Projects, buckets, service accounts, compute instances and more](/build-your-software-catalog/sync-data-to-catalog/cloud-providers/gcp/examples/mapping_extra_resources.md)

#### Google cloud build

- [Cloud build self-service action](/actions-and-automations/setup-backend/webhook/cloudbuild-pipeline/cloudbuild-pipeline.md)

## Cookiecutter

- [Cookiecutter GitHub scaffolder using GitHub workflows](/guides/all/scaffold-a-new-service.md?git-provider=github)
- [Cookiecutter GitHub scaffolder using Jenkins pipelines](/guides/all/scaffold-github-using-cookiecutter.md)
- [Cookiecutter GitHub scaffolder using FastAPI backend](/actions-and-automations/setup-backend/webhook/examples/software-templates.md)
- [Cookiecutter GitLab scaffolder using GitLab pipelines](/guides/all/scaffold-a-new-service.md?git-provider=gitlab)
- [Cookiecutter Bitbucket scaffolder using Jenkins pipelines](/guides/all/scaffold-bitbucket-using-cookiecutter.md)
- [Cookiecutter Azure DevOps scaffolder using Azure DevOps pipelines](/guides/all/scaffold-repositories-using-cookiecutter.md)

## Slack

- [Manual approval for self-service actions](/actions-and-automations/create-self-service-experiences/set-self-service-actions-rbac/#slack)
- [Scorecard notifications](/promote-scorecards/manage-using-3rd-party-apps/slack)
- [Broadcast message to API consumers](/guides/all/broadcast-api-consumers-message)

## SonarQube / SonarCloud

- [SonarQube/SonarCloud integration](/build-your-software-catalog/sync-data-to-catalog/code-quality-security/sonarqube/sonarqube.md)
- [SonarCloud webhook](/build-your-software-catalog/sync-data-to-catalog/code-quality-security/sonarqube#alternative-installation-via-webhook)
- [Connect GitHub PR to SonarQube analysis](/guides/all/connect-github-pr-with-sonar-analysis)
<!-- - [Connect SonarQube project to service](/guides/all/connect-sonar-project-to-service) -->

## Snyk

- [Snyk integration and webhook](/build-your-software-catalog/sync-data-to-catalog/code-quality-security/snyk)

## Wiz

- [Wiz integration](/build-your-software-catalog/sync-data-to-catalog/code-quality-security/wiz.md)

## ServiceNow

- [ServiceNow integration](/build-your-software-catalog/sync-data-to-catalog/incident-management/servicenow)
- [Self-service action to trigger ServiceNow incident](/guides/all/trigger-servicenow-incident)

## Statuspage

- [Statuspage integration](/build-your-software-catalog/sync-data-to-catalog/incident-management/statuspage)
- [Self-service action to create and manage Statuspage Incidents](/guides/all/manage-statuspage-incident)

## PagerDuty

- [PagerDuty integration and webhook](/build-your-software-catalog/sync-data-to-catalog/incident-management/pagerduty/pagerduty.md)
- [Ensure production readiness](/guides/all/ensure-production-readiness.md)
- [Self service for a new PagerDuty incident using GitHub workflows](https://github.com/port-labs/self-service-actions-examples/tree/main/github-workflows/pagerduty)
- [Self-service action to escalate a PagerDuty incident](https://docs.port.io/actions-and-automations/setup-backend/github-workflow/examples/PagerDuty/escalate-an-incident)
- [Self-service action to trigger a PagerDuty incident](https://docs.port.io/actions-and-automations/setup-backend/github-workflow/examples/PagerDuty/trigger-pagerduty-incident)
- [Self-service action to change a PagerDuty incident owner](https://docs.port.io/actions-and-automations/setup-backend/github-workflow/examples/PagerDuty/change-pagerduty-incident-owner)
- [Self-service action to create a PagerDuty service from Port](https://docs.port.io/actions-and-automations/setup-backend/github-workflow/examples/PagerDuty/create-pagerduty-service)
- [Self-service action to acknowledge a PagerDuty incident](https://docs.port.io/actions-and-automations/setup-backend/github-workflow/examples/PagerDuty/acknowledge-incident)
- [Self-service action to change a PagerDuty oncall](https://docs.port.io/actions-and-automations/setup-backend/github-workflow/examples/PagerDuty/change-on-call-user)
- [Self-service action to resolve a PagerDuty incident](https://docs.port.io/actions-and-automations/setup-backend/github-workflow/examples/PagerDuty/resolve-incident)
- PagerDuty Incident Management
    - [Automation to handle PagerDuty incidents](https://docs.port.io/guides/all/create-slack-channel-for-reported-incident)
    - [Self-service action to resolve Pagerduty incidents](https://docs.port.io/guides-and-tutorials/resolve-pagerduty-incident) - including Slack channel notification and closing GitHub issue.

## Jira

- [Jira integration](/build-your-software-catalog/sync-data-to-catalog/project-management/jira/jira.md)
- [Jira webhook](/build-your-software-catalog/sync-data-to-catalog/project-management/jira/#alternative-installation-via-webhook)
- [Initiate scorecards handling with Jira issues](/promote-scorecards/manage-using-3rd-party-apps/jira)
- [Self service for a new Jira bug using GitHub workflows](https://github.com/port-labs/self-service-actions-examples/tree/main/github-workflows/jira)
- [Jira Server](/build-your-software-catalog/custom-integration/webhook/examples/jira-server.md)
<!-- - [Connect Jira issue to a service](/guides/all/connect-jira-issue-to-service) -->

## LeanIX

- [Script that synchronizes data from LeanIX into Port](https://github.com/port-labs/LeanIX-Sync)

## Linear

- [Linear integration](/build-your-software-catalog/sync-data-to-catalog/project-management/linear/linear.md)
- [Linear webhook](/build-your-software-catalog/sync-data-to-catalog/project-management/linear/linear.md#alternative-installation-via-webhook)

## Sentry

- [Sentry integration and webhook](/build-your-software-catalog/sync-data-to-catalog/apm-alerting/sentry.md)

## New Relic

- [New Relic integration](/build-your-software-catalog/sync-data-to-catalog/apm-alerting/newrelic.md)
- [Embed dashboards from New Relic](/build-your-software-catalog/customize-integrations/configure-data-model/setup-blueprint/properties/embedded-url/#new-relic-chart)

## OpsGenie

- [OpsGenie integration and webhook](/build-your-software-catalog/sync-data-to-catalog/incident-management/opsgenie/opsgenie.md)
- [Self-service action to trigger an OpsGenie incident](https://docs.port.io/guides/all/create-an-opsgenie-incident)

## Incident IO
- [Sync Port Services to Incident IO](/guides/all/sync-service-entities-to-incident-io)

## FireHydrant

- [FireHydrant integration](/build-your-software-catalog/sync-data-to-catalog/incident-management/firehydrant.md)
- [Self-service action to trigger a FireHydrant incident](https://docs.port.io/guides/all/create-firehydrant-incident)

## KubeCost

- [KubeCost integration](/build-your-software-catalog/sync-data-to-catalog/cloud-cost/kubecost/kubecost.md)

## OpenCost

- [OpenCost integration](/build-your-software-catalog/sync-data-to-catalog/cloud-cost/opencost.md)

## Dynatrace

- [Dynatrace integration](/build-your-software-catalog/sync-data-to-catalog/apm-alerting/dynatrace)

## Datadog

- [Datadog integration](/build-your-software-catalog/sync-data-to-catalog/apm-alerting/datadog)
- [Embed dashboards from Datadog](/build-your-software-catalog/customize-integrations/configure-data-model/setup-blueprint/properties/embedded-url/#datadog-dashboard)
- [Self-service action to trigger Datadog incident](/guides/all/trigger-datadog-incident)

## Prometheus

- [Prometheus webhook](/build-your-software-catalog/custom-integration/webhook/examples/prometheus.md)

## Kafka

- [Kafka integration](/build-your-software-catalog/sync-data-to-catalog/event-processing/kafka.md)
- [Kafka queue for self-service actions](/actions-and-automations/setup-backend/webhook/kafka/kafka.md)

## Split

- [Split webhook](/build-your-software-catalog/custom-integration/webhook/examples/split.md)

## Grafana

- [Embed dashboards from Grafana](/build-your-software-catalog/customize-integrations/configure-data-model/setup-blueprint/properties/embedded-url/authentication.md#examples)
- [Grafana webhook](/build-your-software-catalog/custom-integration/webhook/examples/grafana.md)

## StackHawk

- [StackHawk webhook](/build-your-software-catalog/custom-integration/webhook/examples/stackhawk.md)

## Jenkins

- [Jenkins Integration](/build-your-software-catalog/sync-data-to-catalog/cicd/jenkins)
- [Sync Jenkins pipelines via API](/build-your-software-catalog/custom-integration/api/ci-cd/jenkins-deployment/jenkins-deployment.md)
- [Jenkins pipeline self-service actions](/actions-and-automations/setup-backend/jenkins-pipeline/jenkins-pipeline.md)
- [GitHub scaffolder using Jenkins](/guides/all/scaffold-github-using-cookiecutter.md)
- [Bitbucket scaffolder using Jenkins](/guides/all/scaffold-bitbucket-using-cookiecutter.md)
- [Create Github pull request](/guides/all/create-github-pull-request)

## Octopus Deploy

- [Octopus Deploy integration](/build-your-software-catalog/sync-data-to-catalog/cicd/octopus-deploy)

## CodeFresh

- [CodeFresh workflow template](/build-your-software-catalog/custom-integration/api/ci-cd/codefresh-workflow-template/codefresh-workflow-template.md)

## CircleCI

- [Sync CircleCI workflows](/build-your-software-catalog/custom-integration/api/ci-cd/circleci-workflow/circleci-workflow.md)
- [CircleCI actions](/actions-and-automations/setup-backend/webhook/circle-ci)

<!-- ## Backstage

- [Import catalog from Backstage](/guides-and-tutorials/import-backstage-resources.md) -->

## JFrog

- [Sync JFrog Artifacts, Docker tags, and build entities](/build-your-software-catalog/custom-integration/webhook/examples/jfrog)
- [Script to ingest JFrog X-ray alerts, repositories and artifacts](https://github.com/port-labs/example-jfrog-xray-alerts)
- [Script to ingest JFrog container image builds and repositories](https://github.com/port-labs/example-jfrog-container-images)

## Codecov

- [Codecov coverage script and webhook](/build-your-software-catalog/custom-integration/webhook/examples/codecov.md)

## Webhook

- [Create generic webhook for 3rd-party](/build-your-software-catalog/custom-integration/webhook/webhook.md)

## SSO

- [Okta SSO](/sso-rbac/sso-providers/oidc/okta.md)
- [OneLogin SSO](/sso-rbac/sso-providers/oidc/onelogin.md)
- [JumpCloud SSO](/sso-rbac/sso-providers/saml/jumpcloud.md)
- [Google workspace SSO](/sso-rbac/sso-providers/saml/google-workspace.md)
- [Azure Active Directory (AD) SSO OIDC](/sso-rbac/sso-providers/oidc/azure-ad.md)
- [Azure Active Directory (AD) SSO SAML](/sso-rbac/sso-providers/saml/azure-ad.md)

## Checkmarx
- [Ingest Checkmarx KICS scan into your catalog](/guides/all/ingest-checkmarx-kics-scan-into-your-catalog)

## SBOM
- [Ingest software bill of material (SBOM) into your catalog](/guides/all/ingest-software-bill-of-materials-sbom-into-your-catalog)

## Swagger
- [Ingest Swagger paths into your catalog](/guides/all/ingest-swagger-paths-into-your-catalog)

## Kratix (by Syntasso)
- [Combine Kratix and Port](https://www.syntasso.io/solutions/port-and-kratix)
- [Combine Kratix and Port (demo video)](https://www.youtube.com/watch?v=7nKx4CnEvoY)

## AI Agents

### GitHub Copilot
- [Ingest Copilot usage metrics into your catalog](/build-your-software-catalog/sync-data-to-catalog/ai-agents/github-copilot/github-copilot.md)
