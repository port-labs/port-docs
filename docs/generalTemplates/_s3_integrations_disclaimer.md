:::info Disclaimer
S3 integrations lack some of the features (such as reconciliation) found in Ocean or other Port integration solutions.

As a result, if a record ingested during the initial sync is later deleted in the data source, there’s no automatic 
mechanism to remove it from Port. The record simply won’t appear in future syncs, but it will remain in Port indefinitely. 

If the data includes a flag for deleted records (e.g., is_deleted: "true"), you can configure a webhook delete operation 
in your [webhook’s mapping configuration](/build-your-software-catalog/custom-integration/webhook/#configuration-structure) to remove these records from Port automatically. 
:::