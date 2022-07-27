---
sidebar_position: 1
sidebar_label: Subscribing to Change events in Port Catalog
---

# Tutorial: Subscribe to Change events in Port Catalog


## Overview

**What’s New?** 🚀

You will be able to subscribe to change events in Port, i.e. Change property values, Creation, Deletion, etc.

**How it works** ⚙️

Based on the Audit Log, we publish all of the events to a dedicated Kafka Topic for your organization.

# Working with Kafka

## Concept

IMAGE

| Part | Description |
| --- | --- |
| 1 | Port publishes all change events to Kafka |
| 2 | A Secured Kafka Topic holds all change events |
| 3 | Listener implementation on your side. (Could be anything, i.e. Lambda Function, Docker, etc.) |

## Port example repo (Kafka Listener)

We provide you with a code framework in Node.js to listen to and parse Kafka events.

**Link to example repo:** https://github.com/port-labs/runner-nodejs-kafka-example

:::note
💡 This repo is `Private` at the moment, so you’ll get a 404.  
Please contact us with your GitHub user for access.
:::


**File summary**

| Directory Name | What is it for |
| --- | --- |
| invocators/changeLogInvocators/ | Every file in this folder is auto loaded by the runner, each function exported by this directory will be called for each change in the catalog |



## Example use cases

### 01 - Get notifications on Catalog changes on Slack

VIDEO

## Future releases 🔔

1. Python library for Kafka event listener

    Providing a Kafka Listener Port.io library in Python.

2. Direct Integrations to popular runners

   - Jenkins
   - GitHub Action
   - Port Integrations (Slack, email, etc.)
   - etc.