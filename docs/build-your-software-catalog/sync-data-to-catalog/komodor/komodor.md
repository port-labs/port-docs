# Komodor

Port's Komodor integration allows you to model Komodor resources in your software catalog and ingest data into them

## Overview

This integation allows you to:

- Map, organize, and sync your desired Komodor resources and their metadata in Port (See supported resources below)
- Sync your Komodor resources and their metadata to Port

### Supported Resources

The resources that can be ingestd into Port are listed below.
It is possible to modify the default mapping to references the fields in the API response, Dependent on your needs.

- [Services](https://api.komodor.com/api/docs/index.html#/Services/post_api_v2_services_search)
- [Availability Issues](https://api.komodor.com/api/docs/index.html#/Issues/post_api_v2_clusters_issues_search)
- [Reliability Risks](https://api.komodor.com/api/docs/index.html#/Health%20risks/getHealthRisks)

## Prerequisites

### [Generate a Komodor Api Key](https://help.komodor.com/hc/en-us/articles/22434108566674-Using-the-Komodor-API)

1. Log in to Komodor:
   - Navigate to the Komodor dashboard and log in with your account credentials.
2. Access API Key Management:
   - Click on your account profile or settings in the top-right corner of the dashboard.
   - Select API Keys from the dropdown menu.
3. Create a New Key:
   - Click the Generate Key button.
   - Provide a descriptive name for the API key to help you identify its purpose later (e.g., "CI/CD Pipeline Access").
4. Save the Key:
   - Once generated, the API key will be displayed.
   - Store the API key securely in a secrets manager or an environment variable.

### Note that your api key will inherit the permissions of the user that created it. Make sure that the user that created the key has the view permissions on the resources you wish to ingest in Port.

## Installation
### TODO: Not sure if thats how it will go once I'm merged. Didn't had the chance to test komodor installation through the catalog yet

1. In Port, navigate to data sources and click `+ Data source`
2. Choose 'komodor' from the list of available integrations, under the Kubernetes Stack category.
3. Insert the Komodor API key that has the view permissions on the resources you wish to ingest
4. Wait for the syncronization to finish and verify you can see all the resources you should

### Creating relations between komodor service and Ports k8s exporter workload

#### Prequesites 

- Have Komodor integration installed.
- Have Port's k8s exporter integration installed on your cluster
- Have komodor agent installed on your cluster

1. In port, navigate to the komodor integration, and then click on it and scroll to the Mapping section
2. Add the following mapping
```yaml title="mapping"
  - kind: komodorService
    selector:
      query: 'true'
    port:
      entity:
        mappings:
          identifier: .uid
          blueprint: '"komodorService"'
          properties: {}
          relations:
            Workload: .service + "-" + .kind + "-" + .namespace + "-" + .cluster
```
- Note! This is as another kind to the mapping, not as a replacement or addition to the existing komodorService kind.
- This will ensure that komodor service will find and create relations with the k8s workload that exists in port, while not failing to injest data from any cluster you do not have Port k8s exporter installed on.
3. Click `Save & Resync`
4. Navigate to the Data model tab (still in Ports builder section)
5. Click on the Komodor Service blueprint, and modify it so the json ends up having the following relations value: 
```json title="blueprint"
{
  "relations": {
    "Workload": {
      "title": "Workload",
      "target": "workload",
      "required": false,
      "many": false
    }
  }
}
```
- Note! This is only a change in the relations key. There is no need to change the schema or other properties, As long as you don't have another property that is called Workload.
- Disclaimer! This is assuming both your Komodor integration and k8s exporter are using the default values for keys and fields. Any modification to the mappings or blueprints in either Komodor or k8s integration may require changing this values.
