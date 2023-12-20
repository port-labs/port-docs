import Tabs from "@theme/Tabs"
import TabItem from "@theme/TabItem"

# AWS Cost

Our AWS Cost integration allows you to import your `AWS Cost` report into Port.

Each entity in Port represents the cost details for a single resource per bill.

The entities will be kept in Port for several months, according to your configuration (3 months by default).

## Installation

:::info
This is an [open-source](https://github.com/port-labs/port-aws-cost-exporter) integration.
:::

1. [AWS Setup](#aws) - Required.
2. [Port Setup](#port) - Required.
3. [Exporter Setup](#exporter) - Choose one of the options:
   - [Local](#local)
   - [Docker](#docker)
   - [GitHub Workflow](#github-workflow)

![Catalog Architecture](/img/sync-data-to-catalog/aws_cost.png)

### AWS

1. [Create an AWS S3 Bucket](https://docs.aws.amazon.com/AmazonS3/latest/userguide/create-bucket-overview.html) for hosting the cost reports (replace `<AWS_BUCKET_NAME>`, `<AWS_REGION>`).

```bash showLineNumbers
aws s3api create-bucket --bucket <AWS_BUCKET_NAME> --region <AWS_REGION>
```

2. [Create an AWS Cost and Usage Report](https://docs.aws.amazon.com/cur/latest/userguide/cur-create.html) for generating cost reports on a daily basis, that will be saved in the bucket.

```bash showLineNumbers
aws cur put-report-definition --report-definition file://report-definition.json
```

Tested with this recommended contents of `report-definition.json` (replace `<AWS_BUCKET_NAME>`, `<AWS_REGION>`):

<details>
  <summary> report-definition.json </summary>

```json showLineNumbers
{
  "ReportName": "aws-monthly-cost-report-for-port",
  "TimeUnit": "MONTHLY",
  "Format": "textORcsv",
  "Compression": "GZIP",
  "AdditionalSchemaElements": ["RESOURCES"],
  "S3Bucket": "<AWS_BUCKET_NAME>",
  "S3Prefix": "cost-reports",
  "S3Region": "<AWS_REGION>",
  "RefreshClosedReports": true,
  "ReportVersioning": "OVERWRITE_REPORT"
}
```

</details>

3. Add a [bucket policy](https://docs.aws.amazon.com/AmazonS3/latest/userguide/add-bucket-policy.html) to the bucket, to allow AWS to write the report (replace `<AWS_BUCKET_NAME>`):

```bash showLineNumbers
aws s3api put-bucket-policy --bucket <AWS_BUCKET_NAME> --policy file://policy.json
```

Where `policy.json` content [should be](https://docs.aws.amazon.com/cur/latest/userguide/cur-s3.html) (replace `<AWS_BUCKET_NAME>`, `<AWS_ACCOUNT_ID>`):

<details>
  <summary> policy.json </summary>

```json showLineNumbers
{
  "Statement": [
    {
      "Effect": "Allow",
      "Principal": {
        "Service": "billingreports.amazonaws.com"
      },
      "Action": ["s3:GetBucketAcl", "s3:GetBucketPolicy"],
      "Resource": "arn:aws:s3:::<AWS_BUCKET_NAME>",
      "Condition": {
        "StringEquals": {
          "aws:SourceArn": "arn:aws:cur:us-east-1:<AWS_ACCOUNT_ID>:definition/*",
          "aws:SourceAccount": "<AWS_ACCOUNT_ID>"
        }
      }
    },
    {
      "Sid": "Stmt1335892526596",
      "Effect": "Allow",
      "Principal": {
        "Service": "billingreports.amazonaws.com"
      },
      "Action": "s3:PutObject",
      "Resource": "arn:aws:s3:::<AWS_BUCKET_NAME>/*",
      "Condition": {
        "StringEquals": {
          "aws:SourceArn": "arn:aws:cur:us-east-1:<AWS_ACCOUNT_ID>:definition/*",
          "aws:SourceAccount": "<AWS_ACCOUNT_ID>"
        }
      }
    }
  ]
}
```

</details>

4. Wait for up to 24 hours, until the first report will be generated.

```bash showLineNumbers
aws s3 ls s3://port-aws-exporter-config/cost-reports/aws-monthly-cost-report-for-port/
```

### Port

1. Create the `awsCost` blueprint:

<details>
  <summary> AWS Cost Blueprint </summary>

```json showLineNumbers
{
  "identifier": "awsCost",
  "title": "AWS Cost",
  "icon": "AWS",
  "schema": {
    "properties": {
      "unblendedCost": {
        "title": "Unblended Cost",
        "type": "number",
        "description": "Represent your usage costs on the day they are charged to you. It’s the default option for analyzing costs."
      },
      "blendedCost": {
        "title": "Blended Cost",
        "type": "number",
        "description": "Calculated by multiplying each account’s service usage against a blended rate. This cost is not used frequently due to the way that it calculated."
      },
      "amortizedCost": {
        "title": "Amortized Cost",
        "type": "number",
        "description": "View recurring and upfront costs distributed evenly across the months, and not when they were charged. Especially useful when using AWS Reservations or Savings Plans."
      },
      "ondemandCost": {
        "title": "On-Demand Cost",
        "type": "number",
        "description": "The total cost for the line item based on public On-Demand Instance rates."
      },
      "payingAccount": {
        "title": "Paying Account",
        "type": "string"
      },
      "usageAccount": {
        "title": "Usage Account",
        "type": "string"
      },
      "product": {
        "title": "Product",
        "type": "string"
      },
      "billStartDate": {
        "title": "Bill Start Date",
        "type": "string",
        "format": "date-time"
      }
    },
    "required": []
  },
  "mirrorProperties": {},
  "calculationProperties": {
    "link": {
      "title": "Link",
      "calculation": "if (.identifier | startswith(\"arn:\")) then \"https://console.aws.amazon.com/go/view?arn=\" + (.identifier | split(\"@\")[0]) else null end",
      "type": "string",
      "format": "url"
    }
  },
  "relations": {}
}
```

</details>

### Exporter

Environment variables of the exporter for all the setup options:

| Env Var                        | Description                                                                  | Required | Default                                         |
| ------------------------------ | ---------------------------------------------------------------------------- | -------- | ----------------------------------------------- |
| PORT_CLIENT_ID                 | Your Port client id                                                          | **true** |                                                 |
| PORT_CLIENT_SECRET             | Your Port client secret                                                      | **true** |                                                 |
| PORT_BASE_URL                  | Port API base url                                                            | false    | `https://api.getport.io/v1`                     |
| PORT_BLUEPRINT                 | Port blueprint identifier to use                                             | false    | `awsCost`                                       |
| PORT_MAX_WORKERS               | Max concurrent threads that interacts with Port API (upsert/delete entities) | false    | `5`                                             |
| PORT_MONTHS_TO_KEEP            | Amount of months to keep the cost reports in Port                            | false    | `3`                                             |
| AWS_BUCKET_NAME                | Your AWS bucket name to store cost reports                                   | **true** |                                                 |
| AWS_COST_REPORT_S3_PATH_PREFIX | Your AWS cost report S3 path prefix                                          | false    | `cost-reports/aws-monthly-cost-report-for-port` |

#### Local

1. Make sure that you have Python installed (tested on python 3.11)

```bash showLineNumbers
python3 --version
```

2. Create a new virtual environment and install requirements

```bash showLineNumbers
python3 -m venv venv
source venv/bin/activate
pip3 install -r requirements.txt
```

3. Set the required environment variables and run the exporter

```bash showLineNumbers
export PORT_CLIENT_ID=<PORT_CLIENT_ID>
export PORT_CLIENT_SECRET=<PORT_CLIENT_SECRET>
export AWS_BUCKET_NAME=<AWS_BUCKET_NAME>
export AWS_ACCESS_KEY_ID=<AWS_ACCESS_KEY_ID>
export AWS_SECRET_ACCESS_KEY=<AWS_SECRET_ACCESS_KEY>
python3 main.py
```

#### Docker

1. Create `.env` file with the required environment variables

```
PORT_CLIENT_ID=<PORT_CLIENT_ID>
PORT_CLIENT_SECRET=<PORT_CLIENT_SECRET>
AWS_BUCKET_NAME=<AWS_BUCKET_NAME>
AWS_ACCESS_KEY_ID=<AWS_ACCESS_KEY_ID>
AWS_SECRET_ACCESS_KEY=<AWS_SECRET_ACCESS_KEY>
```

2. Run exporter's Docker image with `.env`

```bash showLineNumbers
docker run -d --name getport.io-port-aws-cost-exporter --env-file .env ghcr.io/port-labs/port-aws-cost-exporter:latest
```

3. View the logs of the container, to watch the progress:

```bash showLineNumbers
docker logs -f getport.io-port-aws-cost-exporter
```

#### GitHub Workflow

1. Create the following GitHub repository secrets:

Required:

- `AWS_ACCESS_KEY_ID`
- `AWS_ACCESS_KEY_ID`
- `PORT_CLIENT_ID`
- `PORT_CLIENT_SECRET`

Required for scheduling:

- `AWS_BUCKET_NAME`

2. Use this GitHub Workflow definition, to allow scheduled and manual run of the exporter:

<details>
  <summary> GitHub Workflow run.yml </summary>

```yaml showLineNumbers
name: run

on:
  schedule:
    - cron: "0 0 * * *" # At 00:00 on every day
  workflow_dispatch:
    inputs:
      AWS_BUCKET_NAME:
        description: "The AWS Bucket name of the cost reports"
        type: string
        required: true

jobs:
  run:
    runs-on: ubuntu-latest
    steps:
      - name: run
        uses: docker://ghcr.io/port-labs/port-aws-cost-exporter:latest
        env:
          AWS_ACCESS_KEY_ID: ${{ secrets.AWS_ACCESS_KEY_ID }}
          AWS_SECRET_ACCESS_KEY: ${{ secrets.AWS_SECRET_ACCESS_KEY }}
          AWS_BUCKET_NAME: ${{ inputs.AWS_BUCKET_NAME || secrets.AWS_BUCKET_NAME }}
          PORT_CLIENT_ID: ${{ secrets.PORT_CLIENT_ID }}
          PORT_CLIENT_SECRET: ${{ secrets.PORT_CLIENT_SECRET }}
```

</details>
