---
displayed_sidebar: null
description: Learn how to send leaked application secrets from GitHub to Port using Gitleaks
---

import Tabs from '@theme/Tabs';
import TabItem from '@theme/TabItem';


# Track leaked GitHub secrets in Port

This guide demonstrates how to set up a webhook integration between [GitHub](https://github.com/) and Port to automatically detect and ingest leaked application secrets. You will learn how to use [Gitleaks](https://github.com/gitleaks/gitleaks) to scan your repositories for secrets and send the results to Port for centralized monitoring and management.


## Common use cases

- Automatically detect and track leaked secrets across your repositories.
- Centralize security monitoring and incident response for credential leaks.


## Prerequisites

- Complete the [onboarding process](/getting-started/overview).
- A GitHub repository with admin access to set up GitHub Actions.


## Set up data model

First, create a custom blueprint in Port to store the leaked secret information.

1. Go to the [Builder](https://app.getport.io/settings/data-model) page of your portal.

2. Click on `+ Blueprint`.

3. Click on the `{...}` button in the top right corner, and choose `Edit JSON`.

4. Add this JSON schema:

    <details>
    <summary><b>Leaked secret blueprint (Click to expand)</b></summary>

    ```json showLineNumbers
    {
      "identifier": "leaked_secret",
      "description": "Leaked secrets",
      "title": "Leaked Secret",
      "icon": "Key",
      "schema": {
        "properties": {
          "commit": {
            "type": "string",
            "title": "Commit"
          },
          "commit_msg": {
            "type": "string",
            "title": "Commit Message"
          },
          "author": {
            "type": "string",
            "title": "Author"
          },
          "files": {
            "items": {
              "type": "string"
            },
            "type": "array",
            "title": "Files"
          },
          "urls": {
            "icon": "DefaultProperty",
            "type": "array",
            "title": "URLs",
            "items": {
              "type": "string",
              "format": "url"
            }
          },
          "locations": {
            "items": {
              "type": "object"
            },
            "type": "array",
            "title": "Locations"
          }
        },
        "required": []
      },
      "mirrorProperties": {},
      "calculationProperties": {},
      "aggregationProperties": {},
      "relations": {
        "service": {
          "title": "Service",
          "target": "service",
          "required": false,
          "many": false
        },
        "user": {
          "title": "User",
          "target": "_user",
          "required": false,
          "many": false
        }
      }
    }
    ```
    </details>

5. Click `Save` to create the blueprint.


## Configure a webhook in Port

1. Go to the [Data sources](https://app.getport.io/settings/data-sources) page of your portal.

2. Click on the `+ Data source` button in the top right corner.

3. Select the `Webhook` tab.

4. Click on `Custom integration`.

5. Give your webhook a title and description, and select an icon to represent it:

    <img src="/img/guides/leakedSecretWebhookConfig.png" border="1px" width="60%" />

6. Click `Next`.

7. In the `Mapping` tab, you can see your new webhook URL.

8. Scroll down to box number 3 and add this JSON configuration to map the data received from Gitleaks to the blueprint:

    <details>
    <summary>Leaked Secret webhook configuration</summary>

      ```json showLineNumbers
      [
        {
          "blueprint": "leaked_secret",
          "operation": "create",
          "filter": "true",
          "itemsToParse": ".body.runs[0].results",
          "entity": {
            "identifier": ".item.ruleId + ':' + .item.partialFingerprints.commitSha",
            "title": ".item.message.text",
            "properties": {
              "commit": ".item.partialFingerprints.commitSha",
              "author": ".item.partialFingerprints.author",
              "commit_msg": ".item.partialFingerprints.commitMessage",
              "locations": ".item.locations",
              "files": ".item.locations[].physicalLocation.artifactLocation.uri",
              "urls": ". as $a | .item as $b | .item.locations[] | \"https://github.com/\\($a.queryParams.repo)/blob/\\($b.partialFingerprints.commitSha)/\\(.physicalLocation.artifactLocation.uri)#L\\(.physicalLocation.region.startLine)\""
            },
            "relations": {
              "user": {
                "combinator": "'and'",
                "rules": [
                  {
                    "properties": "'$identifier'",
                    "operator": "'='",
                    "value": ".item.partialFingerprints.email"
                  }
                ]
              },
              "service": ".queryParams.repo | split(\"/\") | last"
            }
          }
        }
      ]
      ```
    </details>

9. When finished, click `Save`.


## Set up GitHub Actions workflow

To automatically scan your repository for secrets and send the results to Port, you will need to create a GitHub Actions workflow.


### Add GitHub secret

In your GitHub repository, [go to **Settings > Secrets**](https://docs.github.com/en/actions/security-guides/using-secrets-in-github-actions#creating-secrets-for-a-repository) and add the following secrets:

- `PORT_WEBHOOK_URL`: The `URL` from your Port webhook configuration.


### Create GitHub Actions workflow

Create the file `.github/workflows/gitleaks.yaml` in your repository with the following configuration:

<details>
<summary><b>Gitleaks GitHub Actions workflow (Click to expand)</b></summary>

```yaml showLineNumbers
name: Gitleaks Scan

on:
  push:
    branches: [main]

jobs:
  scan:
    runs-on: ubuntu-latest
    steps:
      - name: Checkout repo
        uses: actions/checkout@v3

      - name: Run Gitleaks
        uses: gitleaks/gitleaks-action@v2

      - name: Send results to Port
        if: always()
        run: |
          echo "Sending gitleaks results to Port..."
          curl -X POST ${{ secrets.PORT_WEBHOOK_URL }}?repo=$GITHUB_REPOSITORY \
            -H "Content-Type: application/json" \
            --data "@results.sarif"
```
</details>

:::tip Workflow triggers
You can customize the workflow triggers based on your needs. For example, you might want to scan on pull requests, specific branches, or on a schedule using `schedule` trigger.
:::


## Let's Test It

To test your integration, you can create a test commit with a fake secret or use the sample data provided below. 
This section includes a sample webhook response from Gitleaks and the corresponding Port entity that would be created.


### Payload

<details>
<summary><b>Webhook response data (Click to expand)</b></summary>

```json showLineNumbers
{
  "body": {
    "$schema": "https://json.schemastore.org/sarif-2.1.0.json",
    "version": "2.1.0",
    "runs": [
      {
        "tool": {
          "driver": {
            "name": "gitleaks",
            "semanticVersion": "v8.0.0",
            "informationUri": "https://github.com/gitleaks/gitleaks",
            "rules": [
              {
                "id": "1password-service-account-token",
                "shortDescription": {
                  "text": "Uncovered a possible 1Password service account token, potentially compromising access to secrets in vaults."
                }
              },
              {
                "id": "adafruit-api-key",
                "shortDescription": {
                  "text": "Identified a potential Adafruit API Key, which could lead to unauthorized access to Adafruit services and sensitive data exposure."
                }
              },
              {
                "id": "adobe-client-id",
                "shortDescription": {
                  "text": "Detected a pattern that resembles an Adobe OAuth Web Client ID, posing a risk of compromised Adobe integrations and data breaches."
                }
              },
              {
                "id": "aws-access-token",
                "shortDescription": {
                  "text": "Identified a pattern that may indicate AWS credentials, risking unauthorized cloud resource access and data breaches on AWS platforms."
                }
              },
              {
                "id": "azure-ad-client-secret",
                "shortDescription": {
                  "text": "Azure AD Client Secret"
                }
              },
              {
                "id": "beamer-api-token",
                "shortDescription": {
                  "text": "Detected a Beamer API token, potentially compromising content management and exposing sensitive notifications and updates."
                }
              },
              {
                "id": "bitbucket-client-id",
                "shortDescription": {
                  "text": "Discovered a potential Bitbucket Client ID, risking unauthorized repository access and potential codebase exposure."
                }
              },
              {
                "id": "bitbucket-client-secret",
                "shortDescription": {
                  "text": "Discovered a potential Bitbucket Client Secret, posing a risk of compromised code repositories and unauthorized access."
                }
              },
              {
                "id": "bittrex-access-key",
                "shortDescription": {
                  "text": "Identified a Bittrex Access Key, which could lead to unauthorized access to cryptocurrency trading accounts and financial loss."
                }
              },
              {
                "id": "bittrex-secret-key",
                "shortDescription": {
                  "text": "Detected a Bittrex Secret Key, potentially compromising cryptocurrency transactions and financial security."
                }
              },
              {
                "id": "gitlab-ptt",
                "shortDescription": {
                  "text": "Found a GitLab Pipeline Trigger Token, potentially compromising continuous integration workflows and project security."
                }
              },
              {
                "id": "gitlab-rrt",
                "shortDescription": {
                  "text": "Discovered a GitLab Runner Registration Token, posing a risk to CI/CD pipeline integrity and unauthorized access."
                }
              },
              {
                "id": "gitlab-runner-authentication-token",
                "shortDescription": {
                  "text": "Discovered a GitLab Runner Authentication Token, posing a risk to CI/CD pipeline integrity and unauthorized access."
                }
              },
              {
                "id": "gitlab-runner-authentication-token-routable",
                "shortDescription": {
                  "text": "Discovered a GitLab Runner Authentication Token (Routable), posing a risk to CI/CD pipeline integrity and unauthorized access."
                }
              },
              {
                "id": "gitlab-scim-token",
                "shortDescription": {
                  "text": "Discovered a GitLab SCIM Token, posing a risk to unauthorized access for a organization or instance."
                }
              },
              {
                "id": "gitlab-session-cookie",
                "shortDescription": {
                  "text": "Discovered a GitLab Session Cookie, posing a risk to unauthorized access to a user account."
                }
              },
              {
                "id": "gitter-access-token",
                "shortDescription": {
                  "text": "Uncovered a Gitter Access Token, which may lead to unauthorized access to chat and communication services."
                }
              },
              {
                "id": "gocardless-api-token",
                "shortDescription": {
                  "text": "Detected a GoCardless API token, potentially risking unauthorized direct debit payment operations and financial data exposure."
                }
              },
              {
                "id": "grafana-api-key",
                "shortDescription": {
                  "text": "Identified a Grafana API key, which could compromise monitoring dashboards and sensitive data analytics."
                }
              },
              {
                "id": "grafana-cloud-api-token",
                "shortDescription": {
                  "text": "Found a Grafana cloud API token, risking unauthorized access to cloud-based monitoring services and data exposure."
                }
              },
              {
                "id": "grafana-service-account-token",
                "shortDescription": {
                  "text": "Discovered a Grafana service account token, posing a risk of compromised monitoring services and data integrity."
                }
              },
              {
                "id": "harness-api-key",
                "shortDescription": {
                  "text": "Identified a Harness Access Token (PAT or SAT), risking unauthorized access to a Harness account."
                }
              },
              {
                "id": "hashicorp-tf-api-token",
                "shortDescription": {
                  "text": "Uncovered a HashiCorp Terraform user/org API token, which may lead to unauthorized infrastructure management and security breaches."
                }
              },
              {
                "id": "hashicorp-tf-password",
                "shortDescription": {
                  "text": "Identified a HashiCorp Terraform password field, risking unauthorized infrastructure configuration and security breaches."
                }
              },
              {
                "id": "heroku-api-key",
                "shortDescription": {
                  "text": "Detected a Heroku API Key, potentially compromising cloud application deployments and operational security."
                }
              },
              {
                "id": "hubspot-api-key",
                "shortDescription": {
                  "text": "Found a HubSpot API Token, posing a risk to CRM data integrity and unauthorized marketing operations."
                }
              },
              {
                "id": "huggingface-access-token",
                "shortDescription": {
                  "text": "Discovered a Hugging Face Access token, which could lead to unauthorized access to AI models and sensitive data."
                }
              },
              {
                "id": "huggingface-organization-api-token",
                "shortDescription": {
                  "text": "Uncovered a Hugging Face Organization API token, potentially compromising AI organization accounts and associated data."
                }
              },
              {
                "id": "infracost-api-token",
                "shortDescription": {
                  "text": "Detected an Infracost API Token, risking unauthorized access to cloud cost estimation tools and financial data."
                }
              },
              {
                "id": "scalingo-api-token",
                "shortDescription": {
                  "text": "Found a Scalingo API token, posing a risk to cloud platform services and application deployment security."
                }
              },
              {
                "id": "sendbird-access-id",
                "shortDescription": {
                  "text": "Discovered a Sendbird Access ID, which could compromise chat and messaging platform integrations."
                }
              },
              {
                "id": "sendbird-access-token",
                "shortDescription": {
                  "text": "Uncovered a Sendbird Access Token, potentially risking unauthorized access to communication services and user data."
                }
              },
              {
                "id": "sendgrid-api-token",
                "shortDescription": {
                  "text": "Detected a SendGrid API token, posing a risk of unauthorized email service operations and data exposure."
                }
              },
              {
                "id": "sendinblue-api-token",
                "shortDescription": {
                  "text": "Identified a Sendinblue API token, which may compromise email marketing services and subscriber data privacy."
                }
              },
              {
                "id": "sentry-access-token",
                "shortDescription": {
                  "text": "Found a Sentry.io Access Token (old format), risking unauthorized access to error tracking services and sensitive application data."
                }
              },
              {
                "id": "sentry-org-token",
                "shortDescription": {
                  "text": "Found a Sentry.io Organization Token, risking unauthorized access to error tracking services and sensitive application data."
                }
              },
              {
                "id": "telegram-bot-api-token",
                "shortDescription": {
                  "text": "Detected a Telegram Bot API Token, risking unauthorized bot operations and message interception on Telegram."
                }
              },
              {
                "id": "travisci-access-token",
                "shortDescription": {
                  "text": "Identified a Travis CI Access Token, potentially compromising continuous integration services and codebase security."
                }
              },
              {
                "id": "zendesk-secret-key",
                "shortDescription": {
                  "text": "Detected a Zendesk Secret Key, risking unauthorized access to customer support services and sensitive ticketing data."
                }
              }
            ]
          }
        },
        "results": [
          {
            "message": {
              "text": "generic-api-key has detected secret for file oops.ts at commit df4331ee30d70b6c93d3a350067ba0560eef7e84."
            },
            "ruleId": "generic-api-key",
            "locations": [
              {
                "physicalLocation": {
                  "artifactLocation": {
                    "uri": "oops.ts"
                  },
                  "region": {
                    "startLine": 4,
                    "startColumn": 8,
                    "endLine": 4,
                    "endColumn": 57,
                    "snippet": {
                      "text": "REDACTED"
                    }
                  }
                }
              }
            ],
            "partialFingerprints": {
              "commitSha": "df4331ee30d70b6c93d3a350067ba0560eef7e84",
              "email": "developer@domain.com",
              "author": "John Smith",
              "date": "2025-07-03T18:36:25Z",
              "commitMessage": "update secret for twitter"
            },
            "properties": {
              "tags": []
            }
          },
          {
            "message": {
              "text": "discord-client-secret has detected secret for file oops.ts at commit df4331ee30d70b6c93d3a350067ba0560eef7e84."
            },
            "ruleId": "discord-client-secret",
            "locations": [
              {
                "physicalLocation": {
                  "artifactLocation": {
                    "uri": "oops.ts"
                  },
                  "region": {
                    "startLine": 3,
                    "startColumn": 8,
                    "endLine": 3,
                    "endColumn": 65,
                    "snippet": {
                      "text": "REDACTED"
                    }
                  }
                }
              }
            ],
            "partialFingerprints": {
              "commitSha": "df4331ee30d70b6c93d3a350067ba0560eef7e84",
              "email": "developer@domain.com",
              "author": "John Smith",
              "date": "2025-07-03T18:36:25Z",
              "commitMessage": "update secret for twitter"
            },
            "properties": {
              "tags": []
            }
          },
          {
            "message": {
              "text": "generic-api-key has detected secret for file src/oops_again.ts at commit df4331ee30d70b6c93d3a350067ba0560eef7e84."
            },
            "ruleId": "generic-api-key",
            "locations": [
              {
                "physicalLocation": {
                  "artifactLocation": {
                    "uri": "src/oops_again.ts"
                  },
                  "region": {
                    "startLine": 4,
                    "startColumn": 8,
                    "endLine": 4,
                    "endColumn": 58,
                    "snippet": {
                      "text": "REDACTED"
                    }
                  }
                }
              }
            ],
            "partialFingerprints": {
              "commitSha": "df4331ee30d70b6c93d3a350067ba0560eef7e84",
              "email": "developer@domain.com",
              "author": "John Smith",
              "date": "2025-07-03T18:36:25Z",
              "commitMessage": "update secret for twitter"
            },
            "properties": {
              "tags": []
            }
          },
          {
            "message": {
              "text": "slack-webhook-url has detected secret for file src/oops_again.ts at commit df4331ee30d70b6c93d3a350067ba0560eef7e84."
            },
            "ruleId": "slack-webhook-url",
            "locations": [
              {
                "physicalLocation": {
                  "artifactLocation": {
                    "uri": "src/oops_again.ts"
                  },
                  "region": {
                    "startLine": 5,
                    "startColumn": 27,
                    "endLine": 5,
                    "endColumn": 103,
                    "snippet": {
                      "text": "REDACTED"
                    }
                  }
                }
              }
            ],
            "partialFingerprints": {
              "commitSha": "df4331ee30d70b6c93d3a350067ba0560eef7e84",
              "email": "developer@domain.com",
              "author": "John Smith",
              "date": "2025-07-03T18:36:25Z",
              "commitMessage": "update secret for twitter"
            },
            "properties": {
              "tags": []
            }
          }
        ]
      }
    ]
  },
  "headers": {
    "Host": "ingest.getport.io",
    "User-Agent": "curl/8.5.0",
    "Content-Length": "47867",
    "Accept": "*/*",
    "Content-Type": "application/json",
    "Traceparent": "00-a9dcc35b56eae75b85fc30064d5af241-a52f664817beba5a-01",
    "X-Forwarded-Host": "ingest.getport.io",
    "X-Forwarded-Server": "public-traefik-5649595896-n2gm7",
    "X-Real-Ip": "10.0.18.65",
    "X-Replaced-Path": "/RP9JvkFCMkxCNigQ",
    "Accept-Encoding": "gzip",
    "host": "ingest.getport.io",
    "user-agent": "curl/8.5.0",
    "content-length": "47867",
    "accept": "*/*",
    "content-type": "application/json",
    "traceparent": "00-a9dcc35b56eae75b85fc30064d5af241-a52f664817beba5a-01",
    "x-forwarded-host": "ingest.getport.io",
    "x-forwarded-server": "public-traefik-5649595896-n2gm7",
    "x-real-ip": "10.0.18.65",
    "x-replaced-path": "/RP9JvkFCMkxCNigQ",
    "accept-encoding": "gzip"
  },
  "queryParams": {
    "repo": "PeyGis/gitleaks-port-demo"
  }
}
```

</details>


### Mapping Result

After the webhook is processed, you should see entities created in Port with the following structure:

<details>
<summary><b>Leaked secret response entity in Port (Click to expand)</b></summary>

```json showLineNumbers
{
  "identifier": "slack-webhook-url:444811d775394062236b36f07ea7827959b57913",
  "title": "slack-webhook-url has detected secret for file src/oops_again.ts at commit 444811d775394062236b36f07ea7827959b57913.",
  "team": [],
  "properties": {
    "commit": "444811d775394062236b36f07ea7827959b57913",
    "commit_msg": "update secret",
    "author": "Joe Smith",
    "files": [
      "src/oops_again.ts"
    ],
    "urls": [
      "https://github.com/PeyGis/gitleaks-port-demo/blob/444811d775394062236b36f07ea7827959b57913/src/oops_again.ts#L5"
    ],
    "locations": [
      {
        "physicalLocation": {
          "region": {
            "endLine": 5,
            "snippet": {
              "text": "REDACTED"
            },
            "endColumn": 103,
            "startLine": 5,
            "startColumn": 27
          },
          "artifactLocation": {
            "uri": "src/oops_again.ts"
          }
        }
      }
    ]
  },
  "relations": {
    "service": "gitleaks-port-demo"
  },
  "icon": "Key"
}
```
</details>