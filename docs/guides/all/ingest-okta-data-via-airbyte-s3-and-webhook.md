---
title: Ingest Okta data into Port via Airbyte, S3 and Webhook
displayed_sidebar: null
---

import Tabs from "@theme/Tabs"
import TabItem from "@theme/TabItem"
import PortTooltip from "/src/components/tooltip/tooltip.jsx"

# Ingest Okta data into Port via Airbyte, S3 and Webhook

This guide will demonstrate how to ingest Okta data into Port using Airbyte, S3 and Webhook integration.

## Prerequisites

- Ensure you have a Port account and have completed the [onboarding process](https://docs.port.io/quickstart).
- Ensure you have access to Port S3 integrations (contact us to gain access), and have S3 Access & Secret Keys, and Bucket name.
- Access to available Airbyte app (can be cloud or self-hosted)
- You have generated Okta Personal API Token to retrieve data


<br/>

## Data model setup


### Add Blueprints 
Add the `Okta User` blueprint:

1. **Go to the [Builder](https://app.getport.io/settings/data-model)** in your Port portal.
2. **Click on "+ Blueprint"**.
3. **Click on the `{...}` button** in the top right corner, and choose "Edit JSON".
4. **Add this JSON schema**:

<details>
<summary><b>Okta User (Click to expand)</b></summary>

```json showLineNumbers
{
  "identifier": "okta_user",
  "description": "Represents an Okta user.",
  "title": "Okta User",
  "icon": "Okta",
  "schema": {
    "properties": {
      "id": {
        "type": "string",
        "description": "Unique identifier for the user."
      },
      "status": {
        "type": "string",
        "description": "Status of the user (e.g., ACTIVE)."
      },
      "created": {
        "type": "string",
        "format": "date-time",
        "description": "Creation timestamp of the user."
      },
      "activated": {
        "type": "string",
        "format": "date-time",
        "description": "Activation timestamp of the user."
      },
      "statusChanged": {
        "type": "string",
        "format": "date-time",
        "description": "Timestamp when the user's status last changed."
      },
      "lastLogin": {
        "type": "string",
        "format": "date-time",
        "description": "Timestamp of the user's last login."
      },
      "lastUpdated": {
        "type": "string",
        "format": "date-time",
        "description": "Last updated timestamp of the user."
      },
      "passwordChanged": {
        "type": "string",
        "format": "date-time",
        "description": "Timestamp when the user's password was last changed."
      },
      "type": {
        "type": "object",
        "description": "Type information for the user.",
        "properties": {
          "id": {
            "type": "string",
            "description": "ID of the user type."
          }
        }
      },
      "profile": {
        "type": "object",
        "description": "User profile information.",
        "properties": {
          "firstName": {
            "type": "string",
            "description": "User's first name."
          },
          "lastName": {
            "type": "string",
            "description": "User's last name."
          },
          "mobilePhone": {
            "type": [
              "string",
              "null"
            ],
            "description": "User's mobile phone number (can be null)."
          },
          "secondEmail": {
            "type": [
              "string",
              "null"
            ],
            "description": "User's second email address (can be null)."
          },
          "login": {
            "type": "string",
            "description": "User's login username."
          },
          "email": {
            "type": "string",
            "description": "User's email address."
          }
        }
      },
      "credentials": {
        "type": "object",
        "description": "User's credentials information.",
        "properties": {
          "password": {
            "type": "object",
            "description": "Password details (currently empty)."
          },
          "emails": {
            "type": "array",
            "description": "Array of user email addresses.",
            "items": {
              "type": "object",
              "properties": {
                "value": {
                  "type": "string",
                  "description": "Email address value."
                },
                "status": {
                  "type": "string",
                  "description": "Status of the email (e.g., VERIFIED)."
                },
                "type": {
                  "type": "string",
                  "description": "Type of email (e.g., PRIMARY)."
                }
              }
            }
          },
          "provider": {
            "type": "object",
            "description": "Authentication provider information.",
            "properties": {
              "type": {
                "type": "string",
                "description": "Type of provider (e.g., OKTA)."
              },
              "name": {
                "type": "string",
                "description": "Name of the provider (e.g., OKTA)."
              }
            }
          }
        }
      },
      "_links": {
        "type": "object",
        "description": "Links related to the user.",
        "properties": {
          "self": {
            "type": "object",
            "properties": {
              "href": {
                "type": "string",
                "format": "url",
                "description": "Link to the user itself."
              }
            }
          }
        }
      }
    },
    "required": [
      "id",
      "status",
      "created",
      "activated",
      "statusChanged",
      "lastUpdated",
      "type",
      "profile",
      "credentials"
    ]
  },
  "mirrorProperties": {},
  "calculationProperties": {},
  "aggregationProperties": {},
  "relations": {
    "role_assignments": {
      "title": "Role Assignments",
      "target": "okta_role_assignment",
      "required": false,
      "many": true
    }
  }
}
```

</details>


Add the `Okta Role Assignment` blueprint:

1. **Go to the [Builder](https://app.getport.io/settings/data-model)** in your Port portal.
2. **Click on "+ Blueprint"**.
3. **Click on the `{...}` button** in the top right corner, and choose "Edit JSON".
4. **Add this JSON schema**:

<details>
<summary><b>Okta Role Assignment (Click to expand)</b></summary>

```json showLineNumbers
{
  "identifier": "okta_role_assignment",
  "description": "Represents an assignment of a role to a user in Okta.",
  "title": "Okta Role Assignment",
  "icon": "Okta",
  "schema": {
    "properties": {
      "id": {
        "type": "string",
        "description": "Unique identifier for the role assignment."
      },
      "label": {
        "type": "string",
        "description": "Label of the role."
      },
      "type": {
        "type": "string",
        "description": "Type of role (e.g., SUPER_ADMIN)."
      },
      "status": {
        "type": "string",
        "description": "Status of the role assignment (e.g., ACTIVE)."
      },
      "created": {
        "type": "string",
        "format": "date-time",
        "description": "Creation timestamp of the role assignment."
      },
      "lastUpdated": {
        "type": "string",
        "format": "date-time",
        "description": "Last updated timestamp of the role assignment."
      },
      "assignmentType": {
        "type": "string",
        "description": "Type of assignment (e.g., USER)."
      },
      "_links": {
        "type": "object",
        "description": "Links related to the role assignment.",
        "properties": {
          "assignee": {
            "type": "object",
            "properties": {
              "href": {
                "type": "string",
                "format": "url",
                "description": "Link to the assigned user."
              }
            }
          }
        }
      },
      "userId": {
        "type": "string",
        "description": "ID of the assigned user."
      }
    },
    "required": [
      "id",
      "label",
      "type",
      "status",
      "created",
      "lastUpdated",
      "assignmentType",
      "userId"
    ]
  },
  "mirrorProperties": {},
  "calculationProperties": {},
  "aggregationProperties": {},
  "relations": {}
}
```

</details>


Add the `Okta Event` blueprint:

1. **Go to the [Builder](https://app.getport.io/settings/data-model)** in your Port portal.
2. **Click on "+ Blueprint"**.
3. **Click on the `{...}` button** in the top right corner, and choose "Edit JSON".
4. **Add this JSON schema**:

<details>
<summary><b>Okta Event (Click to expand)</b></summary>

```json showLineNumbers
{
  "identifier": "okta_event",
  "description": "Represents an Okta event, such as a policy evaluation.",
  "title": "Okta Event",
  "icon": "Okta",
  "schema": {
    "properties": {
      "actor": {
        "type": "object",
        "properties": {
          "id": {
            "type": "string"
          },
          "type": {
            "type": "string"
          },
          "alternateId": {
            "type": "string"
          },
          "displayName": {
            "type": "string"
          },
          "detailEntry": {
            "type": [
              "string",
              "null"
            ]
          }
        }
      },
      "client": {
        "type": "object",
        "properties": {
          "userAgent": {
            "type": "object",
            "properties": {
              "rawUserAgent": {
                "type": "string"
              },
              "os": {
                "type": "string"
              },
              "browser": {
                "type": "string"
              }
            }
          },
          "zone": {
            "type": [
              "string",
              "null"
            ]
          },
          "device": {
            "type": "string"
          },
          "id": {
            "type": [
              "string",
              "null"
            ]
          },
          "ipAddress": {
            "type": "string"
          },
          "geographicalContext": {
            "type": "object",
            "properties": {
              "city": {
                "type": "string"
              },
              "state": {
                "type": "string"
              },
              "country": {
                "type": "string"
              },
              "postalCode": {
                "type": [
                  "string",
                  "null"
                ]
              },
              "geolocation": {
                "type": "object",
                "properties": {
                  "lat": {
                    "type": "number"
                  },
                  "lon": {
                    "type": "number"
                  }
                }
              }
            }
          }
        }
      },
      "device": {
        "type": "string"
      },
      "authenticationContext": {
        "type": "object",
        "properties": {
          "authenticationProvider": {
            "type": [
              "string",
              "null"
            ]
          },
          "credentialProvider": {
            "type": [
              "string",
              "null"
            ]
          },
          "credentialType": {
            "type": [
              "string",
              "null"
            ]
          },
          "issuer": {
            "type": [
              "string",
              "null"
            ]
          },
          "interface": {
            "type": [
              "string",
              "null"
            ]
          },
          "authenticationStep": {
            "type": "integer"
          },
          "rootSessionId": {
            "type": "string"
          },
          "externalSessionId": {
            "type": "string"
          }
        }
      },
      "displayMessage": {
        "type": "string"
      },
      "eventType": {
        "type": "string"
      },
      "outcome": {
        "type": "object",
        "properties": {
          "result": {
            "type": "string"
          },
          "reason": {
            "type": "string"
          }
        }
      },
      "published": {
        "type": "string",
        "format": "date-time"
      },
      "securityContext": {
        "type": "object",
        "properties": {
          "asNumber": {
            "type": "integer"
          },
          "asOrg": {
            "type": "string"
          },
          "isp": {
            "type": "string"
          },
          "domain": {
            "type": "string"
          },
          "isProxy": {
            "type": "boolean"
          }
        }
      },
      "severity": {
        "type": "string"
      },
      "debugContext": {
        "type": "object",
        "properties": {
          "debugData": {
            "type": "object",
            "properties": {
              "authnRequestId": {
                "type": "string"
              },
              "deviceFingerprint": {
                "type": "string"
              },
              "oktaUserAgentExtended": {
                "type": "string"
              },
              "requestId": {
                "type": "string"
              },
              "dtHash": {
                "type": "string"
              },
              "requestUri": {
                "type": "string"
              },
              "threatSuspected": {
                "type": "boolean"
              },
              "url": {
                "type": "string"
              }
            }
          }
        }
      },
      "legacyEventType": {
        "type": "string"
      },
      "transaction": {
        "type": "object",
        "properties": {
          "type": {
            "type": "string"
          },
          "id": {
            "type": "string"
          },
          "detail": {
            "type": "object"
          }
        }
      },
      "uuid": {
        "type": "string"
      },
      "version": {
        "type": "string"
      },
      "request": {
        "type": "object",
        "properties": {
          "ipChain": {
            "type": "array",
            "items": {
              "type": "object",
              "properties": {
                "ip": {
                  "type": "string"
                },
                "geographicalContext": {
                  "type": "object",
                  "properties": {
                    "city": {
                      "type": "string"
                    },
                    "state": {
                      "type": "string"
                    },
                    "country": {
                      "type": "string"
                    },
                    "postalCode": {
                      "type": [
                        "string",
                        "null"
                      ]
                    },
                    "geolocation": {
                      "type": "object",
                      "properties": {
                        "lat": {
                          "type": "number"
                        },
                        "lon": {
                          "type": "number"
                        }
                      }
                    }
                  }
                },
                "version": {
                  "type": "string"
                },
                "source": {
                  "type": [
                    "string",
                    "null"
                  ]
                }
              }
            }
          }
        }
      },
      "target": {
        "type": "array",
        "items": {
          "type": "object",
          "properties": {
            "id": {
              "type": "string"
            },
            "type": {
              "type": "string"
            },
            "alternateId": {
              "type": "string"
            },
            "displayName": {
              "type": "string"
            },
            "detailEntry": {
              "type": "object",
              "properties": {
                "policyType": {
                  "type": "string"
                }
              }
            }
          }
        }
      }
    },
    "required": [
      "actor",
      "client",
      "authenticationContext",
      "displayMessage",
      "eventType",
      "outcome",
      "published",
      "securityContext",
      "severity",
      "debugContext",
      "transaction",
      "uuid",
      "version",
      "request",
      "target"
    ]
  },
  "mirrorProperties": {},
  "calculationProperties": {},
  "aggregationProperties": {},
  "relations": {
    "OktaUser": {
      "title": "Actor",
      "target": "okta_user",
      "required": true,
      "many": false
    }
  }
}
```

</details>

Add the `Okta Role` blueprint:

1. **Go to the [Builder](https://app.getport.io/settings/data-model)** in your Port portal.
2. **Click on "+ Blueprint"**.
3. **Click on the `{...}` button** in the top right corner, and choose "Edit JSON".
4. **Add this JSON schema**:

<details>
<summary><b>Okta Role (Click to expand)</b></summary>

```json showLineNumbers
{
  "identifier": "okta_role",
  "description": "Represents an Okta role.",
  "title": "Okta Role",
  "icon": "Okta",
  "schema": {
    "properties": {
      "id": {
        "type": "string",
        "description": "Unique identifier for the role."
      },
      "label": {
        "type": "string",
        "description": "Label of the role."
      },
      "description": {
        "type": "string",
        "description": "Description of the role."
      },
      "created": {
        "type": "string",
        "format": "date-time",
        "description": "Creation timestamp of the role."
      },
      "lastUpdated": {
        "type": "string",
        "format": "date-time",
        "description": "Last updated timestamp of the role."
      },
      "_links": {
        "type": "object",
        "description": "Links related to the role.",
        "properties": {
          "permissions": {
            "type": "object",
            "properties": {
              "href": {
                "type": "string",
                "format": "url",
                "description": "Link to the role's permissions."
              }
            }
          },
          "self": {
            "type": "object",
            "properties": {
              "href": {
                "type": "string",
                "format": "url",
                "description": "Link to the role itself."
              }
            }
          }
        }
      }
    },
    "required": [
      "id",
      "label",
      "created",
      "lastUpdated"
    ]
  },
  "mirrorProperties": {},
  "calculationProperties": {},
  "aggregationProperties": {},
  "relations": {
    "permissions": {
      "title": "Permissions",
      "target": "okta_permission",
      "required": false,
      "many": true
    }
  }
}
```

</details>

Add the `Okta Permission` blueprint:

1. **Go to the [Builder](https://app.getport.io/settings/data-model)** in your Port portal.
2. **Click on "+ Blueprint"**.
3. **Click on the `{...}` button** in the top right corner, and choose "Edit JSON".
4. **Add this JSON schema**:

<details>
<summary><b>Okta Permission (Click to expand)</b></summary>

```json showLineNumbers
{
  "identifier": "okta_permission",
  "description": "Represents an Okta permission.",
  "title": "Okta Permission",
  "icon": "Okta",
  "schema": {
    "properties": {
      "label": {
        "type": "string",
        "description": "Label of the permission."
      },
      "created": {
        "type": "string",
        "format": "date-time",
        "description": "Creation timestamp of the permission."
      },
      "lastUpdated": {
        "type": "string",
        "format": "date-time",
        "description": "Last updated timestamp of the permission."
      },
      "conditions": {
        "type": "object",
        "description": "Conditions associated with the permission (can be null)."
      },
      "_links": {
        "type": "object",
        "description": "Links related to the permission.",
        "properties": {
          "role": {
            "type": "object",
            "properties": {
              "href": {
                "type": "string",
                "format": "url",
                "description": "Link to the associated role."
              }
            }
          },
          "self": {
            "type": "object",
            "properties": {
              "href": {
                "type": "string",
                "format": "url",
                "description": "Link to the permission itself."
              }
            }
          }
        }
      }
    },
    "required": [
      "label",
      "created",
      "lastUpdated"
    ]
  },
  "mirrorProperties": {},
  "calculationProperties": {},
  "aggregationProperties": {},
  "relations": {}
}
```

</details>

<br/>

### Create Webhook Integration

Create Webhook integration to ingest the data into Port:

1. **Go to the [Data-Sources](https://app.getport.io/settings/data-sources)** page in your Port portal.
2. **Click on "+ Data source"**.
3. In the top selection bar, **click on Webhook** and then **Custom Integration**.
4. Enter a **name for your Integration** (for example: "Okta Integration"), a description (optional), and **Click on Next**
5. **Copy the Webhook URL** that was generated and include it when you **contact us** to set up the integration.
6. Scroll down to the **3rd Section - Map the data from the external system into Port** and **Paste** the following mapping:


<details>
<summary><b>Okta Webhook Mapping (Click to expand)</b></summary>

```json showLineNumbers
[
  {
    "blueprint": "okta_role",
    "operation": "create",
    "filter": "(.body | has(\"id\")) and (.body.id | startswith(\"cr\"))",
    "entity": {
      "identifier": ".body.id",
      "title": ".body.label",
      "properties": {
        "id": ".body.id",
        "label": ".body.label",
        "description": ".body.description",
        "created": ".body.created",
        "lastUpdated": ".body.lastUpdated",
        "_links": ".body._links"
      }
    }
  },
  {
    "blueprint": "okta_permission",
    "operation": "create",
    "filter": "(.body | has(\"label\")) and (.body.label | startswith(\"okta.\"))",
    "entity": {
      "identifier": ".body._links.self.href",
      "title": ".body.label",
      "properties": {
        "label": ".body.label",
        "created": ".body.created",
        "lastUpdated": ".body.lastUpdated",
        "conditions": ".body.conditions",
        "_links": ".body._links"
      }
    }
  },
  {
    "blueprint": "okta_role_assignment",
    "operation": "create",
    "filter": "(.body | has(\"id\")) and (.body.id | startswith(\"ra\"))",
    "entity": {
      "identifier": ".body.id",
      "title": ".body.label",
      "properties": {
        "id": ".body.id",
        "label": ".body.label",
        "type": ".body.type",
        "status": ".body.status",
        "created": ".body.created",
        "lastUpdated": ".body.lastUpdated",
        "assignmentType": ".body.assignmentType",
        "_links": ".body._links",
        "userId": ".body.userId"
      }
    }
  },
  {
    "blueprint": "okta_user",
    "operation": "create",
    "filter": "(.body | has(\"id\")) and (.body.id | startswith(\"00u\"))",
    "entity": {
      "identifier": ".body.id",
      "title": ".body.profile.login",
      "properties": {
        "id": ".body.id",
        "status": ".body.status",
        "created": ".body.created",
        "activated": ".body.activated",
        "statusChanged": ".body.statusChanged",
        "lastLogin": ".body.lastLogin",
        "lastUpdated": ".body.lastUpdated",
        "passwordChanged": ".body.passwordChanged",
        "type": ".body.type",
        "profile": ".body.profile",
        "credentials": ".body.credentials",
        "_links": ".body._links"
      }
    }
  },
  {
    "blueprint": "okta_event",
    "operation": "create",
    "filter": ".body | has(\"eventType\")",
    "entity": {
      "identifier": ".body.uuid",
      "title": ".body.eventType",
      "properties": {
        "actor": ".body.actor",
        "client": ".body.client",
        "device": ".body.device",
        "authenticationContext": ".body.authenticationContext",
        "displayMessage": ".body.displayMessage",
        "eventType": ".body.eventType",
        "outcome": ".body.outcome",
        "published": ".body.published",
        "securityContext": ".body.securityContext",
        "severity": ".body.severity",
        "debugContext": ".body.debugContext",
        "legacyEventType": ".body.legacyEventType",
        "transaction": ".body.transaction",
        "uuid": ".body.uuid",
        "version": ".body.version",
        "request": ".body.request",
        "target": ".body.target"
      },
      "relations": {
        "OktaUser": ".body.actor.id"
      }
    }
  }
]
```

</details>

<br/>

## Airbyte Setup

### Set up S3 Destination

If you haven't already set up S3 Destination for Port S3, follow these steps:

<Tabs groupId="S3 Destination" queryString values={
[{label: "User Interface", value: "ui"},{label: "Terraform", value: "terraform"}]
}>

<TabItem value="ui" label="User Interface">

1. **Login** to your Airbyte application (cloud or self-hosted)
2. In the left-side pane, **Click on Destinations**
3. **Click on "+ New Destination"**.
4. Input S3 Credentials that were provided by port: (contact us)
   1. Under **S3 Key ID** enter your S3 Access Key ID
   2. Under **S3 Access Key** enter your S3 Access Key Secret
   3. Under **S3 Bucket Name** enter the bucket name (example: "org-xxx")
   4. Under **S3 Bucket Path** enter "/data"
   5. Under **S3 Bucket Region** enter the appropriate region
   6. For output format, **choose "JSON Lines: Newline-delimited JSON"**
   7. For compression, **choose "GZIP"**
   8. Under Optional Fields, **enter the following in S3 Path Format**: `${NAMESPACE}/${STREAM_NAME}/year=${YEAR}/month=${MONTH}/${DAY}_$${EPOCH}_`
5. **Click Test and save** and wait for Airbyte to confirm the Destination is set up correctly.


</TabItem>

<TabItem value="terraform" label="Terraform">

```code showLineNumbers
terraform {
  required_providers {
    airbyte = {
      source = "airbytehq/airbyte"
      version = "0.6.5"
    }
  }
}

provider "airbyte" {
  username = "<AIRBYTE_USERNAME>"
  password = "<AIRBYTE_PASSWORD>"
  server_url = "<AIRBYTE_API_URL>"
}

resource "airbyte_destination_s3" "puddle-s3" {
  configuration = {
    access_key_id     = "<S3_ACCESS_KEY>"
    secret_access_key = "<S3_SECRET_KEY>"
    s3_bucket_region  = "<S3_REGION>"
    s3_bucket_name    = "<S3_BUCKET>"
    s3_bucket_path    = "data/"
    format = {
      json_lines_newline_delimited_json = {
        compression = { gzip = {} }
        format_type = "JSONL"
      }
    }
    s3_path_format    = `$${NAMESPACE}/$${STREAM_NAME}/year=$${YEAR}/month=$${MONTH}/$${DAY}_$${EPOCH}_`
    destination_type = "s3"
  }
  name          = "port-s3-destination"
  workspace_id  = var.workspace_id
}

variable "workspace_id" {
  default     = "<AIRBYTE_WORKSPACE_ID>"
}
```

</TabItem>

</Tabs>


### Set up Okta Connection

1. Follow Airbyte's guide to set up [Okta connector](https://docs.airbyte.com/integrations/sources/okta)
2. After the Source is set up, Proceed to Create a "+ New Connection"
3. For Source, choose the Okta source you have set up
4. For Destination, choose the S3 Destination you have set up
5. In the **Select Streams** step, make sure only "channel_members", "channels" and "users" are marked for synchronization
6. In the **Configuration** step, under "Destination Namespace", choose "Custom Format" and enter the value "okta"
7. **Click on Finish & Sync** to apply and start the Integration process!

::: 
  If for any reason you have entered different values than the ones specific listed in this guide,
  make sure to inform your Port account manager about any of these changes to ensure the integration will run smoothly.
::: 

By following these steps, you have effectively created and executed a continuous integration of Okta data into Port 🎉.


