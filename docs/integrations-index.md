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
- [GitHub workflow self-service actions](/create-self-service-experiences/setup-backend/github-workflow/github-workflow.md)
- [Sync repositories, file contents, pull-requests, workflows, teams and more](/build-your-software-catalog/sync-data-to-catalog/git/github/examples/resource-mapping-examples.md)
- [Sync Dependabot](/build-your-software-catalog/sync-data-to-catalog/git/github/examples/resource-mapping-examples.md#mapping-repositories-and-dependabot-alerts)
- [GitHub scaffolder using GitHub workflows](/create-self-service-experiences/setup-backend/github-workflow/examples/scaffold-repositories-using-cookiecutter.md)
- [GitHub scaffolder using Jenkins pipelines](/create-self-service-experiences/setup-backend/jenkins-pipeline/examples/scaffold-github-using-cookiecutter.md)
- [GitHub scaffolder using FastAPI backend](/create-self-service-experiences/setup-backend/webhook/examples/software-templates.md)
- [Deploy AWS resources using AWS CloudFormation](/create-self-service-experiences/setup-backend/github-workflow/examples/AWS/deploy-cloudformation-template.md)
- [Deploy Azure resources using Terraform](/create-self-service-experiences/setup-backend/github-workflow/examples/Azure/create-azure-resource.md)
- [Create GitHub secret using GitHub workflows](/create-self-service-experiences/setup-backend/github-workflow/examples/create-github-secret.md)
- [Script to ingest GitHub packages](https://github.com/port-labs/example-github-packages)

### GitLab

- [GitLab app](/build-your-software-catalog/sync-data-to-catalog/git/gitlab/gitlab.md)
- [GitLab GitOps](/build-your-software-catalog/sync-data-to-catalog/git/gitlab/gitops/gitops.md)
- [GitLab advanced file search and search checks](/build-your-software-catalog/sync-data-to-catalog/git/gitlab/mapping_extensions.md)
- [Sync GitLab pipelines](/build-your-software-catalog/custom-integration/api/ci-cd/gitlab-pipelines/gitlab-pipelines.md)
- [GitLab pipeline self-service actions](/create-self-service-experiences/setup-backend/gitlab-pipeline/gitlab-pipeline.md)
- [GitLab scaffolder](/create-self-service-experiences/setup-backend/gitlab-pipeline/examples/scaffold-repositories-using-cookiecutter.md)
- [Sync projects, file contents, merge-requests and more](/build-your-software-catalog/sync-data-to-catalog/git/gitlab/examples.md)

### Bitbucket

- [Bitbucket app](/build-your-software-catalog/sync-data-to-catalog/git/bitbucket/bitbucket.md)
- [BitBucket GitOps](/build-your-software-catalog/sync-data-to-catalog/git/bitbucket/gitops/gitops.md)
- [Sync repositories, file contents, pull-requests, monorepos and more](/build-your-software-catalog/sync-data-to-catalog/git/bitbucket/examples.md)
- [Bitbucket scaffolder](/create-self-service-experiences/setup-backend/jenkins-pipeline/examples/scaffold-bitbucket-using-cookiecutter.md)
- [Webhook integration between Bitbucket (self-hosted) server and Port](/build-your-software-catalog/custom-integration/webhook/examples/bitbucket-server.md)

### Azure DevOps

- [Sync Azure pipelines](/build-your-software-catalog/custom-integration/api/ci-cd/azure-pipelines/azure-pipelines.md)
- [Azure pipelines self-service actions](/create-self-service-experiences/setup-backend/azure-pipeline/azure-pipeline.md)
- [Cookiecutter Azure DevOps scaffolder using Azure DevOps pipelines](/create-self-service-experiences/setup-backend/azure-pipeline/examples/scaffold-repositories-using-cookiecutter.md)

### GitOps using Port CRDs

- [Mapping resources using Port CRDs](/build-your-software-catalog/sync-data-to-catalog/git/gitops-using-port-crd.md)

## Kubernetes

- [K8s exporter](/build-your-software-catalog/sync-data-to-catalog/kubernetes/kubernetes.md)
- [Map Istio](/build-your-software-catalog/sync-data-to-catalog/kubernetes/templates/istio.md)
- [Map Knative](/build-your-software-catalog/sync-data-to-catalog/kubernetes/templates/knative.md)
- [Map Red Hat Openshift](/build-your-software-catalog/sync-data-to-catalog/kubernetes/templates/openshift.md)
- [Map Trivy](/build-your-software-catalog/sync-data-to-catalog/kubernetes/templates/trivy.md)
- [Map Kyverno](/build-your-software-catalog/sync-data-to-catalog/kubernetes/templates/kyverno.md)
- [Map FluxCD](/build-your-software-catalog/sync-data-to-catalog/kubernetes/templates/fluxcd.md)
- [Map CRDs](/build-your-software-catalog/sync-data-to-catalog/kubernetes/custom-crds.md)
- [Port entity CRD](/build-your-software-catalog/sync-data-to-catalog/kubernetes/port-crd.md)

## ArgoCD

- [ArgoCD exporter and webhook integration](/build-your-software-catalog/sync-data-to-catalog/kubernetes/argocd/)
- [ArgoCD events](/build-your-software-catalog/sync-data-to-catalog/kubernetes/argocd/argocd.md#argocd-events)

## Infrastructure as Code (IaC)

### Terraform

- [Terraform provider](/build-your-software-catalog/sync-data-to-catalog/iac/terraform/terraform.md)
- [Terraform managed blueprint](/build-your-software-catalog/customize-integrations/configure-data-model/Iac/terraform-managed-blueprint.md)
- [Create cloud resources using IaC](/guides-and-tutorials/create-cloud-resource-using-iac.md)
- [Terraform manage S3 buckets lifecycle](/build-your-software-catalog/sync-data-to-catalog/iac/terraform/examples/s3-bucket.md)
- [Terraform manage developer environment](/build-your-software-catalog/sync-data-to-catalog/iac/terraform/examples/create-dev-env.md)
- [Terraform no-code resource provisioning using self-service actions](/create-self-service-experiences/setup-backend/webhook/examples/terraform-no-code-resource-provisioning.md)
- [Import Terraform state using webhook](/build-your-software-catalog/custom-integration/webhook/examples/packages/terraform.md)

### Terraform Cloud

- [Terraform cloud](/build-your-software-catalog/sync-data-to-catalog/iac/terraform-cloud)
- [Terraform cloud actions](/create-self-service-experiences/setup-backend/terraform-cloud)

### Pulumi

- [Pulumi provider](/build-your-software-catalog/sync-data-to-catalog/iac/pulumi/pulumi.md)
- [Pulumi managed blueprint](/build-your-software-catalog/customize-integrations/configure-data-model/Iac/pulumi-managed-blueprint.md)

## Cloud providers

### AWS

- [AWS exporter](/build-your-software-catalog/sync-data-to-catalog/cloud-providers/aws/aws.md)
- [Map ECS, EC2, RDS, API GW, Cloudfront and more](/build-your-software-catalog/sync-data-to-catalog/cloud-providers/aws/examples.md)
- [AWS Cost](/build-your-software-catalog/sync-data-to-catalog/cloud-cost/aws-cost.md)
- [Deploy AWS resources using AWS CloudFormation](/create-self-service-experiences/setup-backend/github-workflow/examples/AWS/deploy-cloudformation-template.md)
- [AWS exporter Terraform module](/build-your-software-catalog/sync-data-to-catalog/iac/terraform/modules/aws-exporter-module.md)
- [Terraform manage S3 buckets lifecycle](/build-your-software-catalog/sync-data-to-catalog/iac/terraform/examples/s3-bucket.md)
- [Terraform manage developer environment](/build-your-software-catalog/sync-data-to-catalog/iac/terraform/examples/create-dev-env.md)
- [Script to ingest ECR Images and Repositories](https://github.com/port-labs/example-ecr-images)

### Azure

- [Azure exporter](/build-your-software-catalog/sync-data-to-catalog/cloud-providers/azure/azure.md)
- [Azure Active Directory (AD) SSO](/sso-rbac/sso-providers/azure-ad.md)
- [Map resource groups, storage groups, compute resources database resources and more](/build-your-software-catalog/sync-data-to-catalog/cloud-providers/azure/examples.md)

### GCP

- [GCP asset inventory](/build-your-software-catalog/sync-data-to-catalog/cloud-providers/gcp/examples/generic-assets.md)
- [Sync organizations, folders, projects, buckets, service accounts, compute instances and more](/build-your-software-catalog/sync-data-to-catalog/cloud-providers/gcp/examples/extended-specific-assets.md)
- [Script to ingest GCR Images and Repositories](https://github.com/port-labs/example-gcr-images)

#### Google cloud build

- [Cloud build self-service action](/create-self-service-experiences/setup-backend/cloudbuild-pipeline/cloudbuild-pipeline.md)

## Cookiecutter

- [Cookiecutter GitHub scaffolder using GitHub workflows](/create-self-service-experiences/setup-backend/github-workflow/examples/scaffold-repositories-using-cookiecutter.md)
- [Cookiecutter GitHub scaffolder using Jenkins pipelines](/create-self-service-experiences/setup-backend/jenkins-pipeline/examples/scaffold-github-using-cookiecutter.md)
- [Cookiecutter GitHub scaffolder using FastAPI backend](/create-self-service-experiences/setup-backend/webhook/examples/software-templates.md)
- [Cookiecutter GitLab scaffolder using GitLab pipelines](/create-self-service-experiences/setup-backend/gitlab-pipeline/examples/scaffold-repositories-using-cookiecutter.md)
- [Cookiecutter Bitbucket scaffolder using Jenkins pipelines](/create-self-service-experiences/setup-backend/jenkins-pipeline/examples/scaffold-bitbucket-using-cookiecutter.md)
- [Cookiecutter Azure DevOps scaffolder using Azure DevOps pipelines](/create-self-service-experiences/setup-backend/azure-pipeline/examples/scaffold-repositories-using-cookiecutter.md)

## Slack

- [Manual approval for self-service actions](/create-self-service-experiences/set-self-service-actions-rbac/#slack)
- [Scorecard notifications](/promote-scorecards/manage-using-3rd-party-apps/slack)
- [Setup a changelog listener notification](/create-self-service-experiences/setup-backend/webhook/examples/changelog-listener.md)

## SonarQube / SonarCloud

- [SonarQube/SonarCloud integration](/build-your-software-catalog/sync-data-to-catalog/code-quality-security/sonarqube.md)
- [SonarCloud webhook](/build-your-software-catalog/sync-data-to-catalog/code-quality-security/sonarqube#alternative-installation-via-webhook)

## Snyk

- [Snyk integration and webhook](/build-your-software-catalog/sync-data-to-catalog/code-quality-security/snyk.md)

## Wiz

- [Wiz integration](/build-your-software-catalog/sync-data-to-catalog/code-quality-security/wiz.md)

## PagerDuty

- [PagerDuty integration and webhook](/build-your-software-catalog/sync-data-to-catalog/incident-management/pagerduty.md)
- [Ensure production readiness](/guides-and-tutorials/ensure-production-readiness.md)
- [Self service for a new PagerDuty incident using GitHub workflows](https://github.com/port-labs/self-service-actions-examples/tree/main/github-workflows/pagerduty)

## Jira

- [Jira integration](/build-your-software-catalog/sync-data-to-catalog/jira/jira.md)
- [Jira webhook](/build-your-software-catalog/sync-data-to-catalog/jira/#alternative-installation-via-webhook)
- [Initiate scorecards handling with Jira issues](/promote-scorecards/manage-using-3rd-party-apps/jira)
- [Self service for a new Jira bug using GitHub workflows](https://github.com/port-labs/self-service-actions-examples/tree/main/github-workflows/jira)
- [Jira Server](/build-your-software-catalog/custom-integration/webhook/examples/jira-server.md)

## Sentry

- [Sentry integration and webhook](/build-your-software-catalog/sync-data-to-catalog/apm-alerting/sentry.md)

## New Relic

- [New Relic integration](/build-your-software-catalog/sync-data-to-catalog/apm-alerting/newrelic.md)
- [Embed dashboards from New Relic](/build-your-software-catalog/customize-integrations/configure-data-model/setup-blueprint/properties/embedded-url/#new-relic-chart)

## OpsGenie

- [OpsGenie integration and webhook](/build-your-software-catalog/sync-data-to-catalog/incident-management/opsgenie.md)

## FireHydrant

- [FireHydrant integration](/build-your-software-catalog/sync-data-to-catalog/incident-management/firehydrant.md)

## KubeCost

- [KubeCost integration](/build-your-software-catalog/sync-data-to-catalog/cloud-cost/kubecost.md)

## OpenCost

- [OpenCost integration](/build-your-software-catalog/sync-data-to-catalog/cloud-cost/opencost.md)

## Dynatrace

- [Dynatrace integration](/build-your-software-catalog/sync-data-to-catalog/apm-alerting/dynatrace)
- [Dynatrace webhook](/build-your-software-catalog/custom-integration/webhook/examples/dynatrace.md)

## Datadog

- [Embed dashboards from Datadog](/build-your-software-catalog/customize-integrations/configure-data-model/setup-blueprint/properties/embedded-url/#datadog-dashboard)
- [Datadog webhook](/build-your-software-catalog/custom-integration/webhook/examples/datadog.md)
- [Datadog service catalog](/build-your-software-catalog/custom-integration/webhook/examples/datadog.md#ingest-service-catalog)

## Prometheus

- [Prometheus webhook](/build-your-software-catalog/custom-integration/webhook/examples/prometheus.md)

## Kafka

- [Kafka integration](/build-your-software-catalog/sync-data-to-catalog/event-processing/kafka.md)
- [Kafka queue for self-service actions](/create-self-service-experiences/setup-backend/webhook/kafka/kafka.md)

## Split

- [Split webhook](/build-your-software-catalog/custom-integration/webhook/examples/split.md)

## Grafana

- [Embed dashboards from Grafana](/build-your-software-catalog/customize-integrations/configure-data-model/setup-blueprint/properties/embedded-url/authentication.md#examples)
- [Grafana webhook](/build-your-software-catalog/custom-integration/webhook/examples/grafana.md)

## StackHawk

- [StackHawk webhook](/build-your-software-catalog/custom-integration/webhook/examples/stackhawk.md)

## Jenkins

- [Jenkins Integration](/build-your-software-catalog/sync-data-to-catalog/ci-cd/jenkins.md)
- [Sync Jenkins pipelines via API](/build-your-software-catalog/custom-integration/api/ci-cd/jenkins-deployment/jenkins-deployment.md)
- [Jenkins webhook integration with Port](/build-your-software-catalog/custom-integration/webhook/examples/jenkins.md)
- [Jenkins pipeline self-service actions](/create-self-service-experiences/setup-backend/jenkins-pipeline/jenkins-pipeline.md)
- [GitHub scaffolder using Jenkins](/create-self-service-experiences/setup-backend/jenkins-pipeline/examples/scaffold-github-using-cookiecutter.md)
- [Bitbucket scaffolder using Jenkins](/create-self-service-experiences/setup-backend/jenkins-pipeline/examples/scaffold-bitbucket-using-cookiecutter.md)
- [Create Github pull request](/create-self-service-experiences/setup-backend/jenkins-pipeline/examples/create-github-pull-request)

## CodeFresh

- [CodeFresh workflow template](/build-your-software-catalog/custom-integration/api/ci-cd/codefresh-workflow-template/codefresh-workflow-template.md)

## CircleCI

- [Sync CircleCI workflows](/build-your-software-catalog/custom-integration/api/ci-cd/circleci-workflow/circleci-workflow.md)
- [CircleCI actions](/create-self-service-experiences/setup-backend/circle-ci)

## Backstage

- [Import catalog from Backstage](/guides-and-tutorials/import-backstage-resources.md)

## JFrog
- [Sync JFrog Artifacts, Docker tags, and build entities](/build-your-software-catalog/custom-integration/webhook/examples/jfrog)
- [Script to ingest JFrog X-ray alerts, repositories and artifacts](https://github.com/port-labs/example-jfrog-xray-alerts)
- [Script to ingest JFrog container image builds and repositories](https://github.com/port-labs/example-jfrog-container-images)

## Codecov
- [Codecov coverage script and webhook](/build-your-software-catalog/custom-integration/webhook/examples/codecov.md)

## Webhook

- [Create generic webhook for 3rd-party](/build-your-software-catalog/custom-integration/webhook/webhook.md)

## SSO

- [Okta SSO](/sso-rbac/sso-providers/okta.md)
- [OneLogin SSO](/sso-rbac/sso-providers/onelogin.md)
- [JumpCloud SSO](/sso-rbac/sso-providers/jumpcloud.md)
- [Google workspace SSO](/sso-rbac/sso-providers/google-workspace.md)
- [Azure Active Directory (AD) SSO](/sso-rbac/sso-providers/azure-ad.md)
