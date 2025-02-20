import Tabs from "@theme/Tabs"
import TabItem from "@theme/TabItem"

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
   8. Under Optional Fields, **enter the following in S3 Path Format**: `${NAMESPACE}/${STREAM_NAME}/year=${YEAR}/month=${MONTH}/${DAY}_${EPOCH}_`
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

resource "airbyte_destination_s3" "port-s3-destination" {
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