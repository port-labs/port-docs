# Fill catalog images with Snyk data

Snyk API provides information about scanned container images stored in container registries. This section aims to assist users in populating their software catalog using data obtained from the Snyk API. Follow the steps below to fill your catalog entities with images scanned by Snyk.

## Prerequisites
- Ensure you have the [Snyk ocean integration](/build-your-software-catalog/sync-data-to-catalog/code-quality-security/snyk/) installed

## Steps

1. Create an  `Image` blueprint using this JSON schema:
<details>

<summary> <b> Image blueprint (click to expand)</b></summary>

```json showLineNumbers
{
  "identifier": "image",
  "description": "This blueprint represents an image",
  "title": "Image",
  "icon": "AWS",
  "schema": {
    "properties": {
      "origin": {
        "type": "string",
        "title": "Registry Origin",
        "description": "The origin of the registry",
        "icon": "DefaultProperty"
      },
      "digest": {
        "type": "string",
        "title": "Image Digest",
        "description": "SHA256 digest of image manifest",
        "icon": "DefaultProperty"
      },
      "tags": {
        "type": "array",
        "title": "Image Tags",
        "description": "List of tags for the image",
        "icon": "DefaultProperty"
      },
      "pushedAt": {
        "type": "string",
        "title": "Pushed At",
        "description": "Date and time the image was pushed to the repository",
        "format": "date-time",
        "icon": "DefaultProperty"
      },
      "lastRecordedPullTime": {
        "type": "string",
        "title": "Last Recorded Pull Time",
        "description": "Date and time the image was last pulled",
        "format": "date-time",
        "icon": "DefaultProperty"
      },
      "triggeredBy": {
        "type": "string",
        "icon": "TwoUsers",
        "title": "Triggered By",
        "description": "The user who triggered the run"
      }
    },
    "required": []
  },
  "mirrorProperties": {},
  "calculationProperties": {
  },
  "aggregationProperties": {},
  "relations": {
    "snykProject": {
      "title": "Snyk Project",
      "target": "snykProject",
      "required": false,
      "many": false
    }
  }
}
```
</details>

2. Update the Snyk integration config mapping to fill the `Images` blueprint with data from Snyk project. For this guide, we filter the integration to ingest images from AWS Container Registry (ECR), Docker Hub, Google Container Registry, GitHub Container Registry and GitLab Registry. In addition, we will filter images that are created using these package managers: deb, apk, rpm:

<details>

<summary> <b> Integration configuration (click to expand)</b></summary>
:::tip JQ Explanation
The JQ filters all scanned projects from these origins `[ecr, gcr, docker-hub, github-cr, gitlab-cr]` and use these package managers `[deb, apk, rpm]`
:::

```yaml showLineNumbers
- kind: project
  selector:
    query: .attributes as $attr | ["ecr", "gcr", "docker-hub", "github-cr", "gitlab-cr"] | contains([$attr.origin]) as $origin_check | ["deb", "apk", "rpm"] | contains([$attr.type]) as $type_check | $origin_check and $type_check
  port:
    entity:
      mappings:
        identifier: .attributes.name
        title: .attributes.name
        blueprint: '"image"'
        properties:
          origin: .attributes.origin
          pushedAt: .attributes.created
          triggeredBy: .__importer.email
          tags: .attributes.tags
        relations:
          snykProject: .id
```
</details>

Read more about [supported container registry in Snyk](https://docs.snyk.io/snyk-admin/snyk-projects#origin-or-source) and [supported package managers](https://docs.snyk.io/getting-started/supported-languages-frameworks-and-feature-availability-overview)

3. Resync the integration and you will see your catalog images filled with data from Snyk:
  <img src="/img/build-your-software-catalog/sync-data-to-catalog/ImagesFromSnyk.png" width="80%" border="1px" />
