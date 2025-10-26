---
sidebar_position: 2
title: Build Your Integration
description: Interactive guide to configure and install your integration
---

import PortApiRegionTip from "/docs/generalTemplates/_port_api_available_regions.md"
import { IntegrationBuilderProvider, Step1ApiConfig, Step2DataMapping, Step3Installation } from '@site/src/components/GenericHttp';

# Build Your Integration

This interactive guide will help you generate everything you need to connect your API to Port.

**How it works:**
1. Configure your API connection settings
2. Choose an endpoint and select which fields to sync
3. Get your installation commands, blueprint, and mapping configuration

<IntegrationBuilderProvider>

---

## Step 1: Configure Your API

Set up the connection details for your API:

<Step1ApiConfig />

---

## Step 2: Choose What Data to Sync

Select an endpoint and configure which fields to ingest into Port:

<Step2DataMapping />

---

## Step 3: Install and Create in Port

Use the commands and configurations generated from your selections above.


<Step3Installation />

:::info Port credentials needed
Get your `PORT_CLIENT_ID` and `PORT_CLIENT_SECRET` from [Port Settings → Credentials](https://app.getport.io/settings).
:::

</IntegrationBuilderProvider>
