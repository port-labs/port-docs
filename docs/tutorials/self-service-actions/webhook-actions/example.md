---
sidebar_position: 3
---

# Example

In this guide, we are going to present different ways to create S3 bucket (e.g.), through Port self-service actions.

:::note
Throughout this tutorial, we will use `webhook-actions`, and a simple backend that listens to the webhook events.

Each action that we will show, creates new entity in Port, and updates action run info, to keep track on the action status and its outcomes.
:::

## Using Git Operations

Git Operations, such as `git commit`, can be used to trigger workflows.

Within the workflow, we can utilize infrastructure as code tools (Terraform, Pulumi, AWS CloudFormation, ...), to provision new resources.

In this [example](https://github.com/port-labs/port-action-runner-examples/tree/main/python/s3_bucket_creation/terraform_github_workflow/webhook), we show how to use GitHub operations (pull-request, actions), and Terraform to create S3 bucket.

## Utilizing CI Job

Existing / New CI jobs can be utilized for handling self-service actions.

Some CI tools (GitHub, Jenkins, ...) has some built-in integrations, to easily provision new resources.

Look for this [example](https://github.com/port-labs/port-action-runner-examples/tree/main/python/s3_bucket_creation/github_action/webhook), to see how to implement S3 bucket creation, using GitHub actions from the public marketplace.

## Provision your own Backend

A valid option is to provision your own backend to handle action's webhooks.

Using this method, you can choose any code language and library, to implement your actions.

Here is an [example](https://github.com/port-labs/port-action-runner-examples/tree/main/python/s3_bucket_creation/aws_sdk/webhook), that provisioning a simple backend in FastAPI (Python), and use AWS SDK to produce new S3 bucket.
