---
sidebar_position: 1
displayed_sidebar: null
description: Learn how to manage S3 buckets using webhooks in Port, enabling automated and efficient cloud operations.
---

# Create an S3 bucket using Self-Service Actions

In this guide, we are going to present different methods to create an S3 bucket (e.g.), using Port Self-Service Actions.

:::note
Throughout this tutorial, we will use [webhook-actions](/build-your-software-catalog/custom-integration/webhook), and a simple backend that listens to the webhook events.

You can choose to use [kafka-actions](/actions-and-automations/setup-backend/webhook/kafka/kafka.md) as well.

Each action shown in this example, creates a new Entity in Port and updates action run info in order to keep track of the action status and its outcomes.
:::

## Using Git Operations

Git Operations, such as `git commit`, can be used to trigger workflows.

Within the workflow, we can utilize infrastructure as code tools (Terraform, Pulumi, AWS CloudFormation, ...), to provision new resources.

In this [example](https://github.com/port-labs/port-action-runner-examples/tree/main/python/s3_bucket_creation/terraform_github_workflow/webhook), you will learn how to use GitHub pull-request, GitHub workflow, and Terraform to create an S3 bucket.

## Utilizing CI Job

Existing / New CI jobs can be utilized to handle Self-Service Actions.

Some CI tools (GitHub, Jenkins, etc.) have built-in integrations that easily provision new resources.

Check out this [example](https://github.com/port-labs/port-action-runner-examples/tree/main/python/s3_bucket_creation/github_action/webhook), to see how to implement S3 bucket creation, using GitHub actions from the public marketplace.

## Provision your backend

A valid option is to provision your own backend to handle Self-Service Actions' webhooks.

Using this method, you can choose any code language and library to implement your actions.

Here is an [example](https://github.com/port-labs/port-action-runner-examples/tree/main/python/s3_bucket_creation/aws_sdk/webhook), that provisions a simple backend in FastAPI (python), and uses [AWS SDK](https://aws.amazon.com/sdk-for-python/) to create a new S3 bucket.

## Summary

In this example, you were introduced to a few alternatives for creating an S3 bucket.

Needless to say, you can use webhooks to perform any action, and create any resource you require. For instance:

- Create EC2.
- Provision K8s cluster.
- Deploy new microservice version.
- Invalidate Cloudfront Cache.
