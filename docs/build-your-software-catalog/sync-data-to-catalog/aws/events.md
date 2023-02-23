---
sidebar_position: 2
---

# Events

Our AWS integration allows you to trigger a sync of your AWS resources with Port, by certain events (in addition to the scheduled sync).
As a result, your software catalog will be updated shortly after a resource is created, updated or deleted.

## How it works

Many AWS services emit events to [AWS EventBridge](https://aws.amazon.com/eventbridge/) service, to the account’s default event bus.

Furthermore, [AWS CloudTrail](https://aws.amazon.com/cloudtrail/) service automatically emit events for API calls from most of the AWS services.

A user can create an [AWS EventBridge rule](https://docs.aws.amazon.com/eventbridge/latest/userguide/eb-rules.html) to consume and transform particular events, and send them to a target, such as an [AWS SQS Queue](https://aws.amazon.com/sqs/).

The AWS exporter application creates an SQS Queue as part of the stack, and configure it as an event source of the exporter's Lambda.

What's left to do, is to set up an event rule, that consume any events from the bus and send to the AWS exporter's queue.

Moreover, each event will have to be transformed as part of the event rule, before reaching the queue, in order to suit the exporter's Lambda needs.

From that point, the events in the queue will be consumed automatically by the exporter's Lambda, that will sync the updated state of the resource to Port.

### Event rule structure

## Prerequisites

## Setup

## Example
