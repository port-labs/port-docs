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
- [Lock service deployment](/guides-and-tutorials/service-lock-github-workflow)
- [Nudge PR reviewers](/create-self-service-experiences/setup-backend/github-workflow/examples/nudge-pr-reviewers)
- [Promote to production](/create-self-service-experiences/setup-backend/github-workflow/examples/promote-to-production)
- [Self-service action to lock and unlock a service](http://localhost:4000/create-self-service-experiences/setup-backend/github-workflow/examples/lock-and_unlock-service-in-port)


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
- [Create and managed Kubernetes cluster](/create-self-service-experiences/setup-backend/github-workflow/examples/kubernetes/manage-clusters)
- [Change deployment replica count](/create-self-service-experiences/setup-backend/github-workflow/examples/kubernetes/change-replica-count)

## ArgoCD

- [ArgoCD exporter and webhook integration](/build-your-software-catalog/sync-data-to-catalog/argocd/)
- [ArgoCD events](/build-your-software-catalog/sync-data-to-catalog/argocd/argocd.md#argocd-events)
- [Connect ArgoCD deployment to image](/build-your-software-catalog/sync-data-to-catalog/argocd/examples/connect-argocd-deployment-to-image)
- [Rollback ArgoCD deployment](/create-self-service-experiences/setup-backend/github-workflow/examples/argocd/rollback-argocd-deployment)
- [Self-service action to synchronize ArgoCD application](/create-self-service-experiences/setup-backend/github-workflow/examples/argocd/sync-argocd-app)

## Infrastructure as Code (IaC)

### Terraform

- [Terraform provider](/build-your-software-catalog/custom-integration/iac/terraform/terraform.md)
- [Terraform managed blueprint](/build-your-software-catalog/customize-integrations/configure-data-model/Iac/terraform-managed-blueprint.md)
- [Create cloud resources using IaC](/guides-and-tutorials/create-cloud-resource-using-iac.md)
- [Terraform manage S3 buckets lifecycle](/build-your-software-catalog/custom-integration/iac/terraform/examples/s3-bucket.md)
- [Terraform manage developer environment](/build-your-software-catalog/custom-integration/iac/terraform/examples/create-dev-env.md)
- [Terraform no-code resource provisioning using self-service actions](/create-self-service-experiences/setup-backend/webhook/examples/terraform-no-code-resource-provisioning.md)
- [Import Terraform state using webhook](/build-your-software-catalog/custom-integration/webhook/examples/packages/terraform.md)

### Terraform Cloud

- [Terraform cloud](/build-your-software-catalog/sync-data-to-catalog/terraform-cloud)
- [Terraform cloud actions](/create-self-service-experiences/setup-backend/terraform-cloud)

### Pulumi

- [Pulumi provider](/build-your-software-catalog/custom-integration/iac/pulumi/pulumi.md)
- [Pulumi managed blueprint](/build-your-software-catalog/customize-integrations/configure-data-model/Iac/pulumi-managed-blueprint.md)

## Cloud providers

### AWS

- [AWS exporter](/build-your-software-catalog/sync-data-to-catalog/cloud-providers/aws/aws.md)
- [Map ECS, EC2, RDS, API GW, Cloudfront and more](docs/build-your-software-catalog/sync-data-to-catalog/cloud-providers/aws/examples/examples.md)
- [AWS Cost](/build-your-software-catalog/sync-data-to-catalog/cloud-cost/aws-cost.md)
- [Deploy AWS resources using AWS CloudFormation](/create-self-service-experiences/setup-backend/github-workflow/examples/AWS/deploy-cloudformation-template.md)
- [Terraform manage S3 buckets lifecycle](/build-your-software-catalog/custom-integration/iac/terraform/examples/s3-bucket.md)
- [Terraform manage developer environment](/build-your-software-catalog/custom-integration/iac/terraform/examples/create-dev-env.md)
- [Connect ECR repository to Service](/build-your-software-catalog/sync-data-to-catalog/cloud-providers/aws/examples/connect-ecr-repo-to-service-using-tags.md)
- [Script to ingest ECR Images and Repositories](https://github.com/port-labs/example-ecr-images)
- [Self-service action to create EC2 instance](/create-self-service-experiences/setup-backend/github-workflow/examples/AWS/create-an-ec2-instance)
- [Provision AWS cloud resource using Terraform Plan and Apply](/create-self-service-experiences/setup-backend/github-workflow/examples/AWS/terraform-plan-and-apply-aws-resource)
- [Add tags to ECR repository](/create-self-service-experiences/setup-backend/github-workflow/examples/AWS/add-tags-to-ecr-repository)
- [Generate ECR image with tags](/create-self-service-experiences/setup-backend/github-workflow/examples/AWS/push-image-to-ecr)


### Azure

- [Azure exporter](/build-your-software-catalog/sync-data-to-catalog/cloud-providers/azure/azure.md)
- [Azure Active Directory (AD) SSO](/sso-rbac/sso-providers/azure-ad.md)
- [Map resource groups, storage groups, compute resources database resources and more](/build-your-software-catalog/sync-data-to-catalog/cloud-providers/azure/examples.md)
- [Add tags to Azure resources](/create-self-service-experiences/setup-backend/github-workflow/examples/Azure/tag-azure-resource)


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
- [Broadcast message to API consumers](/create-self-service-experiences/setup-backend/github-workflow/examples/broadcast-api-consumers-message)

## SonarQube / SonarCloud

- [SonarQube/SonarCloud integration](/build-your-software-catalog/sync-data-to-catalog/code-quality-security/sonarqube/sonarqube.md)
- [SonarCloud webhook](/build-your-software-catalog/sync-data-to-catalog/code-quality-security/sonarqube#alternative-installation-via-webhook)
- [Connect GitHub PR to SonarQube analysis](/build-your-software-catalog/sync-data-to-catalog/code-quality-security/sonarqube/guides/connect-github-pr-with-sonar-analysis)
- [Connect SonarQube project to service](/build-your-software-catalog/sync-data-to-catalog/code-quality-security/sonarqube/guides/connect-sonar-project-to-service)

## Snyk

- [Snyk integration and webhook](/build-your-software-catalog/sync-data-to-catalog/code-quality-security/snyk)
- [Fill catalog with container images using Snyk data](/build-your-software-catalog/sync-data-to-catalog/code-quality-security/snyk/guides/connect-snyk-to-image)
- [Visualize image vulnerabilities using Snyk data](/build-your-software-catalog/sync-data-to-catalog/code-quality-security/snyk/guides/visualize-image-vulnerability)

## Wiz

- [Wiz integration](/build-your-software-catalog/sync-data-to-catalog/code-quality-security/wiz.md)

## ServiceNow

- [ServiceNow integration](/build-your-software-catalog/sync-data-to-catalog/incident-management/servicenow)
- [Self-service action to trigger ServiceNow incident](/create-self-service-experiences/setup-backend/github-workflow/examples/ServiceNow/trigger-servicenow-incident)


## PagerDuty

- [PagerDuty integration and webhook](/build-your-software-catalog/sync-data-to-catalog/incident-management/pagerduty.md)
- [Ensure production readiness](/guides-and-tutorials/ensure-production-readiness.md)
- [Self service for a new PagerDuty incident using GitHub workflows](https://github.com/port-labs/self-service-actions-examples/tree/main/github-workflows/pagerduty)
- [Self-service action to escalate a PagerDuty incident](https://docs.getport.io/create-self-service-experiences/setup-backend/github-workflow/examples/PagerDuty/escalate-an-incident)
- [Self-service action to trigger a PagerDuty incident](https://docs.getport.io/create-self-service-experiences/setup-backend/github-workflow/examples/PagerDuty/trigger-pagerduty-incident)
- [Self-service action to change a PagerDuty incident owner](https://docs.getport.io/create-self-service-experiences/setup-backend/github-workflow/examples/PagerDuty/change-pagerduty-incident-owner)
- [Self-service action to create a PagerDuty service from Port](https://docs.getport.io/create-self-service-experiences/setup-backend/github-workflow/examples/PagerDuty/create-pagerduty-service)
- [Self-service action to acknowledge a PagerDuty incident](https://docs.getport.io/create-self-service-experiences/setup-backend/github-workflow/examples/PagerDuty/acknowledge-incident)
- [Self-service action to change a PagerDuty oncall](https://docs.getport.io/create-self-service-experiences/setup-backend/github-workflow/examples/PagerDuty/change-on-call-user)
- [Self-service action to resolve a PagerDuty incident](https://docs.getport.io/create-self-service-experiences/setup-backend/github-workflow/examples/PagerDuty/resolve-incident)


## Jira

- [Jira integration](/build-your-software-catalog/sync-data-to-catalog/jira/jira.md)
- [Jira webhook](/build-your-software-catalog/sync-data-to-catalog/jira/#alternative-installation-via-webhook)
- [Initiate scorecards handling with Jira issues](/promote-scorecards/manage-using-3rd-party-apps/jira)
- [Self service for a new Jira bug using GitHub workflows](https://github.com/port-labs/self-service-actions-examples/tree/main/github-workflows/jira)
- [Jira Server](/build-your-software-catalog/custom-integration/webhook/examples/jira-server.md)
- [Connect Jira issue to a service](/build-your-software-catalog/sync-data-to-catalog/jira/guides/connect-jira-issue-to-service)


## Sentry

- [Sentry integration and webhook](/build-your-software-catalog/sync-data-to-catalog/apm-alerting/sentry.md)

## New Relic

- [New Relic integration](/build-your-software-catalog/sync-data-to-catalog/apm-alerting/newrelic.md)
- [Embed dashboards from New Relic](/build-your-software-catalog/customize-integrations/configure-data-model/setup-blueprint/properties/embedded-url/#new-relic-chart)

## OpsGenie

- [OpsGenie integration and webhook](/build-your-software-catalog/sync-data-to-catalog/incident-management/opsgenie.md)
- [Self-service action to trigger an OpsGenie incident](https://docs.getport.io/create-self-service-experiences/setup-backend/github-workflow/examples/Opsgenie/trigger-an-incident)

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
- [Self-service action to trigger Datadog incident](/create-self-service-experiences/setup-backend/github-workflow/examples/Datadog/trigger-datadog-incident)

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
