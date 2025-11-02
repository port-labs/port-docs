---
sidebar_position: 2
title: Build Your Integration
description: Interactive guide to configure and install your integration
---

import PortApiRegionTip from "/docs/generalTemplates/_port_api_available_regions.md"
import { IntegrationBuilderProvider, Step1ApiConfig, Step2DataMapping, Step3Installation } from '@site/src/components/OceanCustom';

# Build Your Integration

This interactive guide will help you generate everything you need to connect your API to Port.

**How it works:**
1. Configure your API connection settings
2. Choose an endpoint and select which fields to sync
3. Get your installation commands, blueprint, and mapping configuration

<IntegrationBuilderProvider>

---

## Step 1: Configure Your API

Set up the connection details for your API. These settings apply globally to all endpoints you'll sync from this API.

**What you're configuring:**
- **Base URL**: The root URL that all endpoint paths will be appended to
- **Authentication**: How your API verifies requests (bearer token, API key, basic auth, or none)
- **Pagination** (optional): How to fetch data across multiple pages if your API uses pagination
- **Performance settings** (optional): Timeouts, concurrent requests, SSL verification

Think of this as setting up the "connection" - these settings will be used for every API call the integration makes.

<Step1ApiConfig />

---

## Step 2: Choose What Data to Sync

Now that your API connection is configured, let's define what data to sync. This step helps you map a specific API endpoint to a Port blueprint.

**What you'll do:**
1. **Specify the endpoint path** (e.g., `/api/v1/users`) that you want to sync
2. **Paste a sample API response** so we can detect the data structure
3. **Select the data path** - tell us where the array of items is in the response (e.g., `.data`, `.users`, or root array)
4. **Configure the blueprint** - give it an identifier and title
5. **Choose which fields to sync** - select the fields you want to ingest and mark which field is the unique identifier

The builder will automatically detect field types (string, number, boolean, email, date, URL) from your sample response.

<Step2DataMapping />

---

## Step 3: Install and Create in Port

You're all set! Based on your configuration, we've generated everything you need:

**What you'll get:**
- **Installation commands** (Helm or Docker) with all your settings pre-configured
- **Blueprint JSON** to create the data model in Port
- **Mapping YAML** to configure which fields to sync

Simply copy and run these in order to complete your integration setup.

<Step3Installation />

:::info Port credentials needed
Get your `PORT_CLIENT_ID` and `PORT_CLIENT_SECRET` from [Port Settings → Credentials](https://app.getport.io/settings).
:::

</IntegrationBuilderProvider>
