---
displayed_sidebar: null
description: Learn how to send TypeForm survey response to Port
---

import Tabs from '@theme/Tabs';
import TabItem from '@theme/TabItem';

# Send TypeForm survey results to Port

This guide walks you through setting up a webhook integration between [TypeForm](https://www.typeform.com/) and Port. You will learn how to ingest survey responses automatically into your Port developer portal. As an example, we will map responses from an internal AI awareness survey to a custom Port blueprint.

## Use cases
- Collect real-time feedback from your teams.
- Automate training recommendations based on survey data.


## Prerequisites

- Complete the [onboarding process](/getting-started/overview).
- A Typeform account with permission to create and edit forms.


## Set up data model

First, create a custom blueprint in Port to store the survey responses.

### Create the TypeForm blueprint

1. Go to your [Builder](https://app.getport.io/settings/data-model) page if your portal.
2. Click on `+ Blueprint`.
3. Click on the `{...}` button in the top right corner, and choose `Edit JSON`.
4. Add this JSON schema:

    <details>
    <summary><b>AI Knowledge Survey Blueprint (Click to expand)</b></summary>

    ```json showLineNumbers
    {
      "identifier": "ai_knowledge_survey",
      "description": "Survey to measure the AI knowledge and awareness of developers",
      "title": "AI Knowledge Survey",
      "icon": "AI",
      "schema": {
        "properties": {
          "developer_name": {
            "type": "string",
            "title": "Developer Name"
          },
          "department": {
            "icon": "DefaultProperty",
            "title": "Department",
            "type": "string",
            "enum": [
              "Tech",
              "Customer Support",
              "Management",
              "Product",
              "Sales and Marketing"
            ],
            "enumColors": {
              "Tech": "lightGray",
              "Customer Support": "lightGray",
              "Management": "lightGray",
              "Product": "lightGray",
              "Sales and Marketing": "lightGray"
            }
          },
          "ai_tools": {
            "icon": "DefaultProperty",
            "title": "AI Tools",
            "type": "string",
            "enum": [
              "ChatGPT",
              "Copilot",
              "Gemini",
              "DeepSeek",
              "Cursor"
            ],
            "enumColors": {
              "ChatGPT": "lightGray",
              "Copilot": "lightGray",
              "Gemini": "lightGray",
              "DeepSeek": "lightGray",
              "Cursor": "lightGray"
            }
          },
          "ai_usage": {
            "icon": "DefaultProperty",
            "title": "AI Usage",
            "type": "string",
            "enum": [
              "Daily",
              "Weekly",
              "Monthly",
              "Rarely",
              "Never"
            ],
            "enumColors": {
              "Daily": "lightGray",
              "Weekly": "lightGray",
              "Monthly": "lightGray",
              "Rarely": "lightGray",
              "Never": "lightGray"
            }
          },
          "training": {
            "type": "boolean",
            "title": "Training"
          }
        },
        "required": []
      },
      "mirrorProperties": {},
      "calculationProperties": {},
      "aggregationProperties": {},
      "relations": {}
    }
    ```
    </details>

5. Click `Save` to create the blueprint.


## Configure a webhook in Port

Create the following webhook configuration [using Port's UI](/build-your-software-catalog/custom-integration/webhook/?operation=ui#configuring-webhook-endpoints).

<details>

<summary>Survey response webhook configuration</summary>

1. **Basic details** tab - fill the following details:
   1. Title : `AI Knowledge Survey Mapper`.
   2. Identifier : `ai_knowledge_survey_mapper`.
   3. Description : `A webhook configuration to map TypeForm responses to Port entities`.
   4. Icon : `AI`.
2. **Integration configuration** tab - fill the following JQ mapping:
  ```json showLineNumbers
  [
    {
      "blueprint": "ai_knowledge_survey",
      "operation": "create",
      "filter": "true",
      "entity": {
        "identifier": ".body.event_id",
        "title": ".body.form_response.answers[0].text",
        "properties": {
          "developer_name": ".body.form_response.answers[0].text",
          "department": ".body.form_response.answers[1].choice.label",
          "ai_tools": ".body.form_response.answers[2].choice.label",
          "ai_usage": ".body.form_response.answers[3].choice.label",
          "training": ".body.form_response.answers[4].boolean"
        }
      }
    }
  ]

  ```

3. Click **Save** at the bottom of the page.

</details>


### Create a webhook in TypeForm

To send webhook events from TypeForm to an external system like Port, we must first create a survey and add webhook connector. Follow the steps below to complete the setup:

1. Go to **Forms** in your TypeForm account and **create a new form**.
2. Add the following questions:
    1. What is your name? -> _short_text_.
    2. What is your department in the organization? -> _dropdown_.
    3. Which of these AI tools have you used before? -> _multiple_choice_.
    4. How often do you use these AI tools? -> _dropdown_.
    5. Will you be interested in an AI training session? -> _yes_no_.
3. After creating the form, click **Connect** in the top nav bar.
4. Open the **Webhooks** tab and click **Add a webhook**.
5. Paste the `url` key from your Port webhook configuration into the **Endpoint** field.
6. Click **Save webhook** to create the webhook.
7. Toggle the **Webhook ON** switch to enable it.

Your setup is complete. From now on, any response submitted through your TypeForm survey will automatically trigger a webhook to Port. Port will parse the events according to the mapping and update the catalog entities accordingly.

### Let's Test It

This section includes a sample response data from TypeForm. In addition, it includes the entity created from the event based on the configuration provided in the previous section.

#### Payload

<details>
<summary><b>Webhook response data (Click to expand)</b></summary>

```json showLineNumbers
{
  "body": {
    "event_id": "01JWEMAENP1BC8TJFAHZG9QNB1",
    "event_type": "form_response",
    "form_response": {
      "form_id": "S0HZ6V5J",
      "token": "0f1rjywno369yj0f1rrb104rih4b4ja0",
      "landed_at": "2025-05-29T18:19:03Z",
      "submitted_at": "2025-05-29T18:19:25Z",
      "definition": {
        "id": "S0HZ6V5J",
        "title": "spending behavior",
        "fields": [
          {
            "id": "CUwM2iPNpvkg",
            "ref": "cc83a3ba-ac67-465c-8ba6-f637113a48dc",
            "type": "short_text",
            "title": "What is your name?",
            "properties": {}
          },
          {
            "id": "T92QC3ToyAkD",
            "ref": "6e511fb7-bf69-4beb-9026-391155266a10",
            "type": "dropdown",
            "title": "What is your department in the organization?",
            "properties": {},
            "choices": [
              {
                "id": "TJlliTe6iJLV",
                "ref": "27257742-3bd2-4e44-9c7c-64b7fa9ba3d6",
                "label": "Management"
              },
              {
                "id": "RMmL20Lfkxwb",
                "ref": "4041b1e2-3087-468d-9968-474526e37dfb",
                "label": "Tech"
              },
              {
                "id": "VQ1mhsfzomo1",
                "ref": "568613d1-f940-4d6a-8a1f-8506bd0cb09e",
                "label": "Sales and Marketing"
              },
              {
                "id": "0WA0UvTZYPCv",
                "ref": "09344f10-017a-4a68-9fef-2ff6157224c7",
                "label": "Customer Support"
              },
              {
                "id": "mHCHLkFrcey2",
                "ref": "4c9affde-de73-4590-bbc7-81d4a9f668ad",
                "label": "Product"
              }
            ]
          },
          {
            "id": "GR7BnV5pOdou",
            "ref": "053f638f-f615-4c64-a1f8-38d60f83ecf5",
            "type": "multiple_choice",
            "title": "Which of these AI tools have you used before?",
            "properties": {},
            "choices": [
              {
                "id": "PVt4x75CTV7p",
                "ref": "9e79c4dc-b434-46a5-afb4-d20378f80dfb",
                "label": "ChatGPT"
              },
              {
                "id": "Ig57SAGqnFTy",
                "ref": "20051221-1b5b-4cad-94cb-61d51ab3439a",
                "label": "Copilot"
              },
              {
                "id": "tt4TfJrjQWGI",
                "ref": "344201af-d1db-4444-b9d5-8d8d342ad6fa",
                "label": "Cursor"
              },
              {
                "id": "IQMpCX2l6Ouo",
                "ref": "5c96806c-29a9-46f4-b854-347c16e662f1",
                "label": "Gemini"
              },
              {
                "id": "XLo0G1iyMMyI",
                "ref": "b568044d-bf0a-4e9f-a3e0-d44246adf07f",
                "label": "DeepSeek"
              }
            ]
          },
          {
            "id": "ysFrGvLe7g8R",
            "ref": "7b744f3d-3497-45e9-acaa-5426e02e4f5c",
            "type": "dropdown",
            "title": "How often do you use these AI tools?",
            "properties": {},
            "choices": [
              {
                "id": "hD1CnSi8X6j2",
                "ref": "aaa1bf43-4603-4afe-abda-aedb16241cec",
                "label": "Daily"
              },
              {
                "id": "jVe9Qo7IjfVR",
                "ref": "4d3d641d-4971-4275-bf00-a526b3a599f7",
                "label": "Weekly"
              },
              {
                "id": "k0ZCQiOCvAzu",
                "ref": "2ceb25db-1072-4fb8-adb4-7095a984747d",
                "label": "Monthly"
              },
              {
                "id": "5ml4Orgqnco1",
                "ref": "0a3f312c-3fb3-4367-bda1-c3c1d189743c",
                "label": "Rarely"
              },
              {
                "id": "hVBdNeLwf1uW",
                "ref": "8c1812fd-b620-438f-8545-cc1f9f25905e",
                "label": "Never"
              }
            ]
          },
          {
            "id": "kihSoLTdGCBj",
            "ref": "f099c8b3-992a-459e-b531-c0d91b57947b",
            "type": "yes_no",
            "title": "Would you be interested in an AI training session?",
            "properties": {}
          }
        ],
        "endings": [
          {
            "id": "DefaultTyScreen",
            "ref": "default_tys",
            "title": "Thanks for completing this typeform\nNow *create your own* — it's free, easy, & beautiful",
            "type": "thankyou_screen",
            "properties": {
              "button_text": "Create a *typeform*",
              "show_button": true,
              "share_icons": false,
              "button_mode": "default_redirect"
            },
            "attachment": {
              "type": "image",
              "href": "https://images.typeform.com/images/2dpnUBBkz2VN"
            }
          }
        ],
        "settings": {
          "partial_responses_to_all_integrations": true
        }
      },
      "answers": [
        {
          "type": "text",
          "text": "John Doe",
          "field": {
            "id": "CUwM2iPNpvkg",
            "type": "short_text",
            "ref": "cc83a3ba-ac67-465c-8ba6-f637113a48dc"
          }
        },
        {
          "type": "choice",
          "choice": {
            "id": "mHCHLkFrcey2",
            "label": "Product",
            "ref": "4c9affde-de73-4590-bbc7-81d4a9f668ad"
          },
          "field": {
            "id": "T92QC3ToyAkD",
            "type": "dropdown",
            "ref": "6e511fb7-bf69-4beb-9026-391155266a10"
          }
        },
        {
          "type": "choice",
          "choice": {
            "id": "PVt4x75CTV7p",
            "label": "ChatGPT",
            "ref": "9e79c4dc-b434-46a5-afb4-d20378f80dfb"
          },
          "field": {
            "id": "GR7BnV5pOdou",
            "type": "multiple_choice",
            "ref": "053f638f-f615-4c64-a1f8-38d60f83ecf5"
          }
        },
        {
          "type": "choice",
          "choice": {
            "id": "jVe9Qo7IjfVR",
            "label": "Weekly",
            "ref": "4d3d641d-4971-4275-bf00-a526b3a599f7"
          },
          "field": {
            "id": "ysFrGvLe7g8R",
            "type": "dropdown",
            "ref": "7b744f3d-3497-45e9-acaa-5426e02e4f5c"
          }
        },
        {
          "type": "boolean",
          "boolean": true,
          "field": {
            "id": "kihSoLTdGCBj",
            "type": "yes_no",
            "ref": "f099c8b3-992a-459e-b531-c0d91b57947b"
          }
        }
      ],
      "ending": {
        "id": "DefaultTyScreen",
        "ref": "default_tys"
      }
    }
  },
  "headers": {
    "Host": "ingest.getport.io",
    "User-Agent": "Typeform Webhooks",
    "Content-Length": "3782",
    "Accept-Encoding": "gzip",
    "Content-Type": "application/json",
    "Traceparent": "00-68a952b4da8dd361b988107e109a517f-aaf1e8c61b2ce46e-01",
    "X-Forwarded-Host": "ingest.getport.io",
    "X-Forwarded-Server": "public-traefik-5649595896-njqwf",
    "X-Real-Ip": "10.0.47.100",
    "X-Replaced-Path": "/Ldjb8sHpAsmU264I",
    "host": "ingest.getport.io",
    "user-agent": "Typeform Webhooks",
    "content-length": "3782",
    "accept-encoding": "gzip",
    "content-type": "application/json",
    "traceparent": "00-68a952b4da8dd361b988107e109a517f-aaf1e8c61b2ce46e-01",
    "x-forwarded-host": "ingest.getport.io",
    "x-forwarded-server": "public-traefik-5649595896-njqwf",
    "x-real-ip": "10.0.47.100",
    "x-replaced-path": "/Ldjb8sHpAsmU264I"
  },
  "queryParams": {}
}
```

</details>

#### Mapping Result

The combination of the sample payload and the webhook configuration generates the following Port entity:

<details>
<summary><b>TypeForm response entity in Port (Click to expand)</b></summary>

```json showLineNumbers
{
  "blueprint": "ai_knowledge_survey",
  "identifier": "01JWEMAENP1BC8TJFAHZG9QNB1",
  "createdAt": "2025-05-29T18:19:26.383Z",
  "updatedBy": "ai_knowledge_survey_mapper",
  "createdBy": "ai_knowledge_survey_mapper",
  "team": [],
  "title": "John Doe",
  "relations": {},
  "properties": {
    "ai_tools": "ChatGPT",
    "developer_name": "John Doe",
    "ai_usage": "Weekly",
    "training": true,
    "department": "Product"
  },
  "updatedAt": "2025-05-29T18:19:26.383Z"
}
```
</details>
