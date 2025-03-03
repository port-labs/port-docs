:::note Disclaimer
S3 integrations lack some of the features in Ocean or other integration capabilities developed by port -

The main impact is that there are is "re-conciliation" mechanism in this flow as part of re-syncing the data.

This means that when a data record that is retrieved by an initial sync, and is then deleted in the data source, 
there will not be an event that triggers that delete operation in Port - 
because this record is not retrieved in consequent syncs and as mentioned above there is no re-conciliation mechanism
in this pipeline.

If the data records themselves are marked as deleted with a field (for example, `is_deleted`: `"true/false"`), 
you could implement a triggered effect that will eventually delete such records in port using the webhook "delete" 
operation in the [webhook's mapping configuration](https://docs.port.io/build-your-software-catalog/custom-integration/webhook/#structure) 
:::