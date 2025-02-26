---
displayed_sidebar: null
description: Learn how to ingest cloud resources using Dynatrace in Port, enhancing visibility and performance monitoring.
---

# Ingest cloud resources with Dynatrace

This guide aims to show you how to ingest cloud resources using Dynatrace to have a good grasp of the cloud resources/entities you have from your cloud provider.


## Common use cases
- Map your monitored resources from cloud providers in Dynatrace

## Prerequisites
This guide assumes the following:
- You have a Port account and that you have finished the [onboarding process](/getting-started/overview).
- You have [installed and setup Port's Dynatrace integration](/build-your-software-catalog/sync-data-to-catalog/apm-alerting/dynatrace/dynatrace.md)
- You have entities from cloud providers configured on Dynatrace. See [Dynatrace documentation](https://docs.dynatrace.com/managed#deploy-on) for this.


## Ingesting cloud resources into Port
We will be making use of the `entity` kind in Port's Dynatrace integration which provides information on entities being monitored in Dynatrace. Entities however are ingested based on their respective entity types. To ingest cloud resources, we have to ingest only entities of certain types such as the following:

<details>
<summary><b>Some cloud resources entity types</b></summary>

- `cloud:gcp:k8s_cluster`
- `cloud:gcp:pubsub_subscription`
- `cloud:gcp:pubsub_topic`
- `cloud:gcp:gcs_bucket`
- `cloud:gcp:gae_app`
- `cloud:aws:acmprivateca`
- `cloud:aws:api_gateway`
- `cloud:aws:app_runner`
- `cloud:aws:appstream`
- `cloud:aws:appsync`
- `cloud:azure:apimanagement:service`
- `cloud:azure:app:containerapps`
- `cloud:azure:app:managedenvironments`
- `cloud:azure:appconfiguration:configurationstores`
- `cloud:azure:appplatform:spring`

</details>

### Creating the mapping configuration
After installing the Dynatrace integration, create the following blueprint configuration:

<details>
<summary><b>Dynatrace `dynatraceEntityCloudResource` blueprint configuration</b></summary>

```json showLineNumbers
{
  "identifier": "dynatraceEntityCloudResource",
  "description": "This blueprint represents a Dynatrace Entity",
  "title": "Dynatrace Cloud Resource",
  "icon": "Dynatrace",
  "schema": {
    "properties": {
      "firstSeen": {
        "type": "string",
        "title": "First Seen",
        "description": "The timestamp at which the entity was first seen, in UTC milliseconds.",
        "format": "date-time"
      },
      "lastSeen": {
        "type": "string",
        "title": "Last Seen",
        "description": "The timestamp at which the entity was last seen, in UTC milliseconds.",
        "format": "date-time"
      },
      "type": {
        "type": "string",
        "title": "Type",
        "description": "The type of the entity."
      },
      "tags": {
        "type": "array",
        "title": "Tags",
        "description": "A list of tags of the entity.",
        "items": {
          "type": "string"
        }
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

Next, locate the Dynatrace integration in the [Data Sources page](https://app.getport.io/settings/data-sources) and add the following mapping for the cloud resources:


<details>
<summary><b>Dynatrace `entity` blueprint configuration</b></summary>

```yaml showLineNumbers

deleteDependentEntities: true
createMissingRelatedEntities: true
enableMergeEntity: true
resources:
  - kind: entity
    selector:
      query: 'true'
      entityTypes:
        - `cloud:gcp:k8s_cluster`
        - `cloud:gcp:pubsub_subscription`
        - `cloud:gcp:pubsub_topic`
        - `cloud:gcp:gcs_bucket`
        - `cloud:gcp:gae_app`
        - `cloud:aws:acmprivateca`
        - `cloud:aws:api_gateway`
        - `cloud:aws:app_runner`
        - `cloud:aws:appstream`
        - `cloud:aws:appsync`
        - `cloud:azure:apimanagement:service`
        - `cloud:azure:app:containerapps`
        - `cloud:azure:app:managedenvironments`
        - `cloud:azure:appconfiguration:configurationstores`
        - `cloud:azure:appplatform:spring`
        # see below section for more entity types
    port:
      entity:
        mappings:
          identifier: .displayName | gsub(" "; "-")
          title: .displayName
          blueprint: '"dynatraceEntityCloudResource"'
          properties:
            firstSeen: .firstSeenTms / 1000 | todate
            lastSeen: .lastSeenTms / 1000 | todate
            type: .type
            tags: .tags[].stringRepresentation

```

</details>

Next, click on resync and watch your cloud resources from Dynatrace being ingested:

<img src='/img/build-your-software-catalog/sync-data-to-catalog/apm-alerting/dynatrace/guides/dynatraceCloudResourcesResults.png' border='1px' />

### Cloud entity types
The `entityTypes` selector in the mapping above are entity types that corresponds to possible cloud resources in your Dynatrace environment. However, these are not the only types that are cloud resources. You can get the list of entity types, by making a GET request to `https://<your dynatrace environment ID>.live.dynatrace.com/api/v2/entityTypes`. Below is an exhaustive list of entity types you can use in the `entityTypes` selector:

<details>
<summary><b>Cloud resources entity types</b></summary>

- `cloud:aws:acmprivateca`
- `cloud:aws:api_gateway`
- `cloud:aws:app_runner`
- `cloud:aws:appstream`
- `cloud:aws:appsync`
- `cloud:aws:athena`
- `cloud:aws:aurora`
- `cloud:aws:autoscaling`
- `cloud:aws:billing`
- `cloud:aws:cassandra`
- `cloud:aws:chatbot`
- `cloud:aws:cloud_front`
- `cloud:aws:cloudhsm`
- `cloud:aws:cloudsearch`
- `cloud:aws:codebuild`
- `cloud:aws:cognito`
- `cloud:aws:connect`
- `cloud:aws:datasync`
- `cloud:aws:dax`
- `cloud:aws:dms`
- `cloud:aws:documentdb`
- `cloud:aws:dxcon`
- `cloud:aws:dynamodb`
- `cloud:aws:ebs`
- `cloud:aws:ec2_spot`
- `cloud:aws:ec2api`
- `cloud:aws:ecs`
- `cloud:aws:ecs:cluster`
- `cloud:aws:efs`
- `cloud:aws:eks:cluster`
- `cloud:aws:elasticache`
- `cloud:aws:elasticbeanstalk`
- `cloud:aws:elasticinference`
- `cloud:aws:elastictranscoder`
- `cloud:aws:emr`
- `cloud:aws:es`
- `cloud:aws:events`
- `cloud:aws:fsx`
- `cloud:aws:gamelift`
- `cloud:aws:glue`
- `cloud:aws:inspector`
- `cloud:aws:iot`
- `cloud:aws:iot_things_graph`
- `cloud:aws:iotanalytics`
- `cloud:aws:kafka`
- `cloud:aws:kinesis:data_analytics`
- `cloud:aws:kinesis:data_firehose`
- `cloud:aws:kinesis:data_stream`
- `cloud:aws:kinesis:video_stream`
- `cloud:aws:lambda`
- `cloud:aws:lex`
- `cloud:aws:logs`
- `cloud:aws:media_tailor`
- `cloud:aws:mediaconnect`
- `cloud:aws:mediaconvert`
- `cloud:aws:mediapackagelive`
- `cloud:aws:mediapackagevod`
- `cloud:aws:mq`
- `cloud:aws:nat_gateway`
- `cloud:aws:neptune`
- `cloud:aws:opsworks`
- `cloud:aws:polly`
- `cloud:aws:qldb`
- `cloud:aws:rds`
- `cloud:aws:redshift`
- `cloud:aws:rekognition`
- `cloud:aws:robomaker`
- `cloud:aws:route53`
- `cloud:aws:route53resolver`
- `cloud:aws:s3`
- `cloud:aws:sage_maker:batch_transform_job`
- `cloud:aws:sage_maker:endpoint`
- `cloud:aws:sage_maker:endpoint_instance`
- `cloud:aws:sage_maker:ground_truth`
- `cloud:aws:sage_maker:processing_job`
- `cloud:aws:sage_maker:training_job`
- `cloud:aws:servicecatalog`
- `cloud:aws:ses`
- `cloud:aws:sns`
- `cloud:aws:sqs`
- `cloud:aws:ssm-runcommand`
- `cloud:aws:states`
- `cloud:aws:storagegateway`
- `cloud:aws:swf`
- `cloud:aws:textract`
- `cloud:aws:transfer`
- `cloud:aws:transitgateway`
- `cloud:aws:translate`
- `cloud:aws:trustedadvisor`
- `cloud:aws:usage`
- `cloud:aws:vpn`
- `cloud:aws:waf`
- `cloud:aws:wafv2`
- `cloud:aws:workmail`
- `cloud:aws:workspaces`
- `cloud:azure:apimanagement:service`
- `cloud:azure:app:containerapps`
- `cloud:azure:app:managedenvironments`
- `cloud:azure:appconfiguration:configurationstores`
- `cloud:azure:appplatform:spring`
- `cloud:azure:automation:automationaccounts`
- `cloud:azure:batch:account`
- `cloud:azure:blockchain:blockchainmembers`
- `cloud:azure:cache:redis`
- `cloud:azure:cdn:cdnwebapplicationfirewallpolicies`
- `cloud:azure:cdn:profiles`
- `cloud:azure:classic_storage_account`
- `cloud:azure:classic_storage_account:blob`
- `cloud:azure:classic_storage_account:file`
- `cloud:azure:classic_storage_account:queue`
- `cloud:azure:classic_storage_account:table`
- `cloud:azure:classic_virtual_machine`
- `cloud:azure:cognitiveservices:allinone`
- `cloud:azure:cognitiveservices:anomalydetector`
- `cloud:azure:cognitiveservices:bingautosuggest`
- `cloud:azure:cognitiveservices:bingcustomsearch`
- `cloud:azure:cognitiveservices:bingentitysearch`
- `cloud:azure:cognitiveservices:bingsearch`
- `cloud:azure:cognitiveservices:bingspellcheck`
- `cloud:azure:cognitiveservices:computervision`
- `cloud:azure:cognitiveservices:contentmoderator`
- `cloud:azure:cognitiveservices:customvisionprediction`
- `cloud:azure:cognitiveservices:customvisiontraining`
- `cloud:azure:cognitiveservices:face`
- `cloud:azure:cognitiveservices:immersivereader`
- `cloud:azure:cognitiveservices:inkrecognizer`
- `cloud:azure:cognitiveservices:luis`
- `cloud:azure:cognitiveservices:luisauthoring`
- `cloud:azure:cognitiveservices:openai`
- `cloud:azure:cognitiveservices:personalizer`
- `cloud:azure:cognitiveservices:qnamaker`
- `cloud:azure:cognitiveservices:speech`
- `cloud:azure:cognitiveservices:textanalytics`
- `cloud:azure:cognitiveservices:translator`
- `cloud:azure:containerinstance:containergroup`
- `cloud:azure:containerregistry:registries`
- `cloud:azure:containerservice:managedcluster`
- `cloud:azure:datafactory:v1`
- `cloud:azure:datafactory:v2`
- `cloud:azure:datalakeanalytics:accounts`
- `cloud:azure:datalakestore:accounts`
- `cloud:azure:datashare:accounts`
- `cloud:azure:devices:iothubs`
- `cloud:azure:devices:provisioningservices`
- `cloud:azure:documentdb:databaseaccounts:global`
- `cloud:azure:documentdb:databaseaccounts:mongo`
- `cloud:azure:eventgrid:domains`
- `cloud:azure:eventgrid:systemtopics`
- `cloud:azure:eventgrid:topics`
- `cloud:azure:eventhub:clusters`
- `cloud:azure:frontdoor`
- `cloud:azure:hdinsight:cluster`
- `cloud:azure:hybridcompute:machines`
- `cloud:azure:insights:components`
- `cloud:azure:iotcentral:iotapps`
- `cloud:azure:keyvault:vaults`
- `cloud:azure:kusto:clusters`
- `cloud:azure:logic:integrationserviceenvironments`
- `cloud:azure:logic:workflows`
- `cloud:azure:machinelearningservices:workspaces`
- `cloud:azure:maps:accounts`
- `cloud:azure:mariadb:server`
- `cloud:azure:media:mediaservices`
- `cloud:azure:media:mediaservices:streamingendpoints`
- `cloud:azure:mysql:flexibleservers`
- `cloud:azure:mysql:server`
- `cloud:azure:netapp:netappaccounts:capacitypools`
- `cloud:azure:netapp:netappaccounts:capacitypools:volumes`
- `cloud:azure:network:applicationgateways`
- `cloud:azure:network:azurefirewalls`
- `cloud:azure:network:dnszones`
- `cloud:azure:network:expressroutecircuits`
- `cloud:azure:network:loadbalancers:basic`
- `cloud:azure:network:loadbalancers:gateway`
- `cloud:azure:network:loadbalancers:standard`
- `cloud:azure:network:networkinterfaces`
- `cloud:azure:network:networkwatchers:connectionmonitors`
- `cloud:azure:network:networkwatchers:connectionmonitors:preview`
- `cloud:azure:network:privatednszones`
- `cloud:azure:network:publicipaddresses`
- `cloud:azure:notificationhubs:namespaces:notificationhubs`
- `cloud:azure:postgresql:flexibleservers`
- `cloud:azure:postgresql:server`
- `cloud:azure:postgresql:serverv2`
- `cloud:azure:powerbidedicated:capacities`
- `cloud:azure:recoveryservices:vaults`
- `cloud:azure:relay:namespaces`
- `cloud:azure:search:searchservices`
- `cloud:azure:servicefabricmesh:applications`
- `cloud:azure:signalrservice:signalr`
- `cloud:azure:sql:managed`
- `cloud:azure:sql:servers`
- `cloud:azure:sql:servers:databases:datawarehouse`
- `cloud:azure:sql:servers:databases:dtu`
- `cloud:azure:sql:servers:databases:hyperscale`
- `cloud:azure:sql:servers:databases:vcore`
- `cloud:azure:sql:servers:elasticpools:dtu`
- `cloud:azure:sql:servers:elasticpools:vcore`
- `cloud:azure:storage:storageaccounts`
- `cloud:azure:storage:storageaccounts:blob`
- `cloud:azure:storage:storageaccounts:file`
- `cloud:azure:storage:storageaccounts:queue`
- `cloud:azure:storage:storageaccounts:table`
- `cloud:azure:storagesync:storagesyncservices`
- `cloud:azure:streamanalytics:streamingjobs`
- `cloud:azure:synapse:workspaces`
- `cloud:azure:synapse:workspaces:bigdatapools`
- `cloud:azure:synapse:workspaces:sqlpools`
- `cloud:azure:timeseriesinsights:environments`
- `cloud:azure:timeseriesinsights:eventsources`
- `cloud:azure:traffic_manager_profile`
- `cloud:azure:virtual_network_gateway`
- `cloud:azure:web:appslots`
- `cloud:azure:web:functionslots`
- `cloud:azure:web:hostingenvironments:v2`
- `cloud:azure:web:serverfarms`
- `cloud:gcp:autoscaler`
- `cloud:gcp:bigquery_biengine_model`
- `cloud:gcp:cloud_function`
- `cloud:gcp:cloud_run_revision`
- `cloud:gcp:cloudsql_database`
- `cloud:gcp:filestore_instance`
- `cloud:gcp:gae_app`
- `cloud:gcp:gce_instance`
- `cloud:gcp:gcs_bucket`
- `cloud:gcp:https_lb`
- `cloud:gcp:instance_group`
- `cloud:gcp:internal_http_lb_rule`
- `cloud:gcp:internal_network_lb_rule`
- `cloud:gcp:k8s_cluster`
- `cloud:gcp:k8s_container`
- `cloud:gcp:k8s_node`
- `cloud:gcp:k8s_pod`
- `cloud:gcp:network_lb_rule`
- `cloud:gcp:project`
- `cloud:gcp:pubsub_snapshot`
- `cloud:gcp:pubsub_subscription`
- `cloud:gcp:pubsub_topic`
- `cloud:gcp:pubsublite_subscription_partition`
- `cloud:gcp:pubsublite_topic_partition`
- `cloud:gcp:tcp_ssl_proxy_rule`
- `cloud:gcp:tpu_worker`
- `S3BUCKET`
</details>