---
sidebar_position: 11
displayed_sidebar: null
---

import Tabs from "@theme/Tabs"
import TabItem from "@theme/TabItem"

# Collect developer feedback with surveys

This guide will walk you through how to install and use the surveys experience in Engineering360. You'll learn how to configure a survey, collect responses, and view feedback insights from developers to inform platform and engineering improvements.

## About This Experience

:::info
#### What's an experience?
Port provides a number of opinionated (but fully open and configurable) and easily installable solutions that help you get the most out of your Port account as quickly as possible. We call these experiences.
:::


Surveys help you gather direct, valuable feedback from developers across your organization. Port lets you run surveys and view their results from within Port.

This experience provides:
- Easy survey setup from templates
- A convenient way to publish developer surveys to Port users
- A familiar way for Port users to respond to surveys
- A response pipeline that feeds insights into a dashboard

### Before You Start
To complete this setup, you'll need:
- Permissions to install Experiences and manage self-service actions (the Admin role)

And once you've installed the survey, you'll need
- A communication channel (e.g., Slack, email) to distribute survey links
- Clarity on who should respond (teams, roles, or org-wide)

## Installing surveys
1. Navigate to your catalog
2. Click New, then New Experience

<img src='/img/guides/surveyNewExperience.png' width='60%' border='1px' />

3. Click "New Survey"

<img src='/img/guides/surveyChooseExperience.png' width='60%' border='1px' />

4. Choose a template, a name, and batch (a unique identifier that lets you run this survey multiple times)

<img src='/img/guides/surveyChooseName.png' width='60%' border='1px' />

5. Click create

6. That's it! Your survey results will appear here:

<img src='/img/guides/surveySeeSurveyDashboard.png' width='80%' border='1px' />

## What's being created
When you install a survey, Port automatically creates the following components to enable survey distribution and feedback collection:

### Blueprints
These blueprints model the survey data and are only created the first time you install a survey:

`Survey Template` — Defines the structure of a survey that can be reused multiple times

`Survey` — Represents each instance of a published survey

`Question Template` — Defines reusable question formats like text or selection 

`Question` — Contains the actual questions being asked on a particular survey

`Response` — Stores individual survey responses submitted by users

<img src='/img/guides/surveyBlueprints.png' width='100%' border='1px' />

### Self-service action
- Allows developers to respond to surveys via a public link
- Allows you to control who can access and submit the survey (through the permissions)

### Dashboard page 
Visualizes survey submissions and aggregates trends in developer sentiment

### Additional resources
To capture responses, the experience also includes a webhook data source that ingests survey responses when submitted via the self-service action.


## Collecting responses

Once you've installed a survey, all you have to do is...

### Adjust Survey Visibility
1. Go to the Self-service tab
2. Find the survey in the Self Service Hub
3. Click the three dots (⋮) → Edit
<img src='/img/guides/surveyEditPermissions.png' width='60%' border='1px' />

4. Open the Permissions tab and configure who can respond (the same as who can execute this action)

### Distribute the Survey
1. Hover over the survey response action widget to reveal the copy link button
2. Click the chain icon to copy the public survey link
<img src='/img/guides/surveyEditPermissions2.png' width='70%' border='1px' />
3. Share the link via Slack, email, or other internal channels


### Some more tips
- Responses are anonymous (unless configured otherwise)
- Multiple users and/or teams can respond simultaneously — no manual coordination required

## Viewing Results

Navigate to the survey dashboard created in the catalog. Once responses are submitted, you'll see developer sentiment and trends visualized in real time.

<img src='/img/guides/surveySeeSurveyDashboard.png' width='80%' border='1px' />

These insights help platform and engineering teams understand friction points, monitor developer experience, and inform where to invest next.

