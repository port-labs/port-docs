# Amazon Simple Storage Service

import S3BucketBlueprint from './aws-s3-bucket/_s3_bucket_blueprint.mdx'
import S3BucketConfig from './aws-s3-bucket/_s3_bucket_port_app_config.mdx'



## AWS::S3::Bucket

The following example demonstrates how to ingest your AWS S3 buckets to Port.

#### S3 Bucket Supported Actions

The table below summarizes the available actions for ingesting Amazon S3 Bucket resources in Port:

| Action                              | Description                                                    | Type     | Required AWS Permission                                 |
|--------------------------------------|----------------------------------------------------------------|----------|---------------------------------------------------------|
| **ListBucketsAction**                | Discover all S3 buckets across your AWS account. [Reference](https://docs.aws.amazon.com/AmazonS3/latest/API/API_ListBuckets.html)              | Default  | `s3:ListAllMyBuckets`                                   |
| **GetBucketTaggingAction**           | Bring in bucket tags for catalog filtering and grouping.  [Reference](https://docs.aws.amazon.com/AmazonS3/latest/API/API_GetBucketTagging.html)        | Default  | `s3:GetBucketTagging`                                   |
| **GetBucketLocationAction**          | Retrieve the bucket's region. [Reference](https://docs.aws.amazon.com/AmazonS3/latest/API/API_GetBucketLocation.html)                                 | Optional  | `s3:GetBucketLocation`                                  |
| **GetBucketEncryptionAction**        | Retrieve server-side encryption configuration for the bucket.  [Reference](https://docs.aws.amazon.com/AmazonS3/latest/API/API_GetBucketEncryption.html)   | Optional | `s3:GetBucketEncryption`                                |
| **GetBucketPublicAccessBlockAction** | Retrieve public access block configuration.  [Reference](https://docs.aws.amazon.com/AmazonS3/latest/API/API_GetPublicAccessBlock.html)                    | Optional | `s3:GetBucketPublicAccessBlock`                         |
| **GetBucketOwnershipControlsAction** | Retrieve bucket ownership controls.   [Reference](https://docs.aws.amazon.com/AmazonS3/latest/API/API_GetBucketOwnershipControls.html)                           | Optional | `s3:GetBucketOwnershipControls`                         |

:::info Optional properties note
Properties of optional actions will not appear in the response unless you explicitly include the action that provides them in your configuration.
:::


You can use the following Port blueprint definitions and integration configuration:

<S3BucketBlueprint/>

<S3BucketConfig/>

For more details about S3 bucket properties, refer to the [AWS S3 API documentation](https://docs.aws.amazon.com/AmazonS3/latest/API/Welcome.html).
