# AWS Lambda

import LambdaFunctionBlueprint from './aws-lambda-function/_lambda_function_blueprint.mdx'
import LambdaFunctionConfig from './aws-lambda-function/_lambda_function_port_app_config.mdx'



## AWS::Lambda::Function

The following example demonstrates how to ingest your AWS Lambda functions to Port.

#### Lambda Function Supported Actions

The table below summarizes the available actions for ingesting AWS Lambda Function resources in Port:

| Action                    | Description                                                                                               | Type     | Required AWS Permission |
|---------------------------|-----------------------------------------------------------------------------------------------------------|----------|-------------------------|
| **ListFunctionsAction**   | Discover all Lambda functions across your AWS account. [Reference](https://docs.aws.amazon.com/lambda/latest/APIReference/API_ListFunctions.html)       | Default  | `lambda:ListFunctions`  |
| **ListTagsAction**        | Retrieve tags for each function. [Reference](https://docs.aws.amazon.com/lambda/latest/APIReference/API_ListTags.html)                                  | Optional | `lambda:ListTags`       |

::::info Optional Properties Note
Properties of optional actions will not appear in the response unless you explicitly include the action that provides them in your configuration.
::::

You can use the following Port blueprint definitions and integration configuration:

<LambdaFunctionBlueprint/>

<LambdaFunctionConfig/>

For more details about Lambda function properties, refer to the [AWS Lambda API documentation](https://docs.aws.amazon.com/lambda/latest/APIReference/Welcome.html).
