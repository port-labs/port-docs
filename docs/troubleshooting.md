---
sidebar_position: 13
title: Troubleshooting
sidebar_label: Troubleshooting
sidebar_class_name: hidden
---

# Troubleshooting

This page contains answers to common questions and issues that users encounter when using Port, organized by topic.

## General

#### Do I need an expert to set up an internal developer portal with Port?

<details>
<summary><b>Answer (click to expand)</b></summary>

Port was designed to let you set up a developer portal in minutes, quickly defining your data model and then ingesting data about software and resources into it.

We believe in "bring your own data model" since each organization differs in how it wants to set up Port and model its software. Our documentation and [other resources](/resources) can help you get started. 

If you're trying to find out if Port is right for you, you can reach out to us by scheduling an [in-person demo](https://www.getport.io/demo-request), and we’ll be happy to escort you through the process of building a portal that's right for you.

</details>

---

#### Why not backstage?

<details>
<summary><b>Answer (click to expand)</b></summary>

Spotify’s backstage is spot-on in recognizing the need for a streamlined end-to-end development environment. It is also flexible, which lets you build your software catalog according to your data model.  
However, it requires coding, personnel to implement it, and domain expertise. You also need to invest in deployment, configuration and updates. You can read a detailed comparison of Port and Backstage [here](https://www.getport.io/compare/backstage-vs-port).

</details>

---

#### Is Port really free?

<details>
<summary><b>Answer (click to expand)</b></summary>

Port is free up to 15 users, you can check our [pricing page](https://www.getport.io/pricing) for more information. Using the free version of Port you can set up a modern, fully functioning internal developer portal.

The free version includes all of the features in Port, except for SSO and a certain limitation on the number of software catalog entities (up to 10,000), for reasons of fair use.  

In case you're evaluating Port, it provides you with everything you need, and if you need SSO for a given period, contact us.

</details>

---

#### Can I self-host Port?

<details>
<summary><b>Answer (click to expand)</b></summary>

Port is a multi-tenant SaaS product. While there is no option to fully self-host Port, specific elements of Port such as integrations and the Port Agent (which is used to trigger self-service actions and automations) can be self-hosted on your premises.  

For enterprises with specific needs due to security, governance and regulation - it is possible to receive a single tenant deployment of Port. To learn more about the single tenant offering, please contact your sales representative.

While not as robust as a self-hosted option, Port does offer security-oriented features such as support for AWS Private Link. To learn more about our Private Link support, click [here](/api-reference/security/#aws-privatelink).

</details>

---

#### Does Port's web application have session timeouts?

<details>
<summary><b>Answer (click to expand)</b></summary>

There is an inactivity timeout period of 3 days, and an absolute auto sign-in period of 7 days.

If you are inactive for 2 days and 23:59 hours, then perform any action, you will stay logged in.

In any case, after 7 days you will need to login again.

</details>

---

## Organization

#### How can I set up SSO for my organization?

<details>
<summary><b>Answer (click to expand)</b></summary>

1. Set up the application in your SSO dashboard by following the [manage your SSO connection](/sso-rbac/sso-and-scim/self-serve-sso) documentation.
2. Reach out to us with the required credentials in order to complete the set up.
3. After completing the set up, Port will provide you with the `CONNECTION_NAME`. Head back to the documentation and replace it where needed.

</details>

---

#### How can I troubleshoot my SSO connection?

<details>
<summary><b>Answer (click to expand)</b></summary>

1. Make sure the user has permissions to use the application.
2. Look at the URL of the error, sometimes they are embedded with the error. For example, look at the following URL:
```
https://app.getport.io/?error=access_denied&error_description=access_denied%20(User%20is%20not%20assigned%20to%20the%20client%20application.)&state=*********
```
After the `error_description`, you can see `User%20is%20not%20assigned%20to%20the%20client%20application`. In this case, the user is not assigned to the SSO application, and therefore cannot access Port through it.

3. Make sure you are using the correct `CONNECTION_NAME`     provided to you by Port, and that the application is set up correctly according to our setup docs.

</details>

---

#### Why can't I invite another member to my portal?

<details>
<summary><b>Answer (click to expand)</b></summary>

When using the free tier, Port allows you to be connected to a single organization. If your colleague is in another organization, you will not be able to invite him/her.  
Reach out to us using chat/Slack/support site at [support.port.io](http://support.port.io/), and we will help you resolve the issue.

</details>

---

#### How do I delete my organization?

<details>
<summary><b>Answer (click to expand)</b></summary>

To delete your organization, reach out to Port's support team by submitting a request in the [support center](https://support.port.io/hc/en-us/requests/new).

</details>

---

## Ocean integrations

#### Why is my Ocean integration not working?

<details>
<summary><b>Answer (click to expand)</b></summary>

If you are facing issues after installing an Ocean integration, follow these steps:

1. Make sure all of the parameters you provided in the installation command are correct.
2. Go to the [audit log](https://app.getport.io/settings/AuditLog) in your Port application and check for any errors in the creation of your `blueprints` and/or `entities`.
3. In your [builder](https://app.getport.io/settings/data-model) page, make sure that the new `blueprints` were created with the correct properties/relations.
4. If you tried to install a `self-hosted` integration, check the integration's documentation to ensure you included the necessary parameters.
5. When running self-hosted integrations over TLS, make sure the PEM you mount contains the full certificate chain (service certificate, intermediate certificate(s), and the issuing root) in leaf-to-root order. Missing intermediates cause `CERTIFICATE_VERIFY_FAILED` errors inside the Ocean container even if local curl commands succeed.
    
    :::tip How to create a PEM bundle
    Combine the service (leaf) certificate + intermediate CA certificate(s) + root CA certificate into a single PEM bundle and ensure your endpoints present the chain in order. This avoids `unknown authority` errors and hostname-mismatch headaches. 
    :::

If you are still facing issues, reach out to us using chat/Slack/mail to [support.port.io](http://support.port.io/), and we will help you resolve the issue.

</details>

---

#### Does my Ocean integration mapping change when I upgrade to a newer version?

<details>
<summary><b>Answer (click to expand)</b></summary>

No, when you upgrade an Ocean integration to a newer version, your existing mapping configuration is preserved and not automatically changed.

The integration will continue using your custom mapping configuration after the upgrade. If you want to adopt new default mappings from the upgraded version, you need to manually update the mapping configuration.

</details>

---

#### Why am I getting validation errors when starting my Ocean integration?

<details>
<summary><b>Answer (click to expand)</b></summary>

Validation errors occur when required configuration parameters are missing or incorrectly formatted. You will typically see errors like this in your logs:

```
pydantic.error_wrappers.ValidationError: 3 validation errors for Config
jira_host
  field required (type=value_error.missing)
atlassian_user_email
  field required (type=value_error.missing)
```

To resolve this:

1. Check the integration's documentation for all required parameters.
2. Verify that all required environment variables or configuration values are provided.
3. Ensure credentials like `PORT_CLIENT_ID`, `PORT_CLIENT_SECRET`, and integration-specific API tokens are correct.
4. For complex parameters (like GitLab's `tokenMapping`), ensure the value is properly formatted as valid JSON or follows the expected structure.

**Example of a common formatting error:**

```
pydantic.error_wrappers.ValidationError: 1 validation error for Config
token_mapping
  value is not a valid dict (type=type_error.dict)
```

This indicates the `tokenMapping` parameter is not properly formatted. Refer to the [GitLab token mapping docs](/build-your-software-catalog/sync-data-to-catalog/git/gitlab/installation#tokenmapping) for the correct format.

</details>

---

#### Why is my CI/CD-based Ocean integration failing?

<details>
<summary><b>Answer (click to expand)</b></summary>

When running Ocean integrations via CI/CD pipelines (GitHub Actions, GitLab CI, etc.), common issues include:

1. **Secrets not configured**: Ensure all required secrets (`PORT_CLIENT_ID`, `PORT_CLIENT_SECRET`, integration tokens) are properly configured in your CI/CD platform and passed to the workflow step.

2. **Workflow syntax errors**: Verify your workflow file syntax is correct and the integration step is properly configured.

3. **Parameter escaping issues**: Some parameters require specific formatting. For example, JSON objects may need to be escaped differently depending on your CI/CD platform.

4. **Network restrictions**: Some CI/CD runners have restricted network access. Ensure outbound connections to Port's API (`api.getport.io`) are allowed.

To debug, check the workflow logs for specific error messages and refer to the integration's installation documentation for CI/CD-specific examples.

</details>

---

#### Why are my entities not being created or mapped correctly?

<details>
<summary><b>Answer (click to expand)</b></summary>

If your integration is running but entities are not appearing in your catalog as expected, the issue is likely in your mapping configuration.

**Common causes:**

1. **JQ syntax errors**: The mapping uses JQ expressions to extract data. Verify your JQ syntax is correct using a [JQ playground](https://jqplay.org/).

2. **Missing or null identifiers**: Each entity requires a unique identifier. If the identifier mapping returns null or empty, the entity will not be created. Check your logs for messages like:
   ```
   X transformations of batch failed due to empty, null or missing values
   ```

3. **Incorrect property paths**: Ensure the JQ paths in your mapping match the actual structure of the source data. If a path doesn't exist, you will see:
   ```
   Unable to find valid data for: {foo:.bar} (null, missing, or misconfigured)
   ```

4. **Unknown `kind`**: Make sure you're using a valid `kind` that the integration supports. Check the integration's documentation for available kinds.

**How to debug:**

- Go to your [Data sources](https://app.getport.io/settings/data-sources) page in Port.
- Select the relevant integration.
- Click on the **Event log** tab to view detailed logs from the integration, including any mapping errors or warnings.

For help with mapping syntax, see the [mapping configuration guide](/build-your-software-catalog/customize-integrations/configure-mapping).

</details>

---

#### Why can't my Ocean integration connect to Port?

<details>
<summary><b>Answer (click to expand)</b></summary>

If your integration starts but cannot communicate with Port, it's typically a network configuration issue in your environment.

**Common causes:**

1. **Firewall restrictions**: Ensure your network allows outbound HTTPS connections to `api.getport.io` (Port US) or `api.eu.getport.io` (Port EU).

2. **Proxy configuration**: If your environment uses a proxy, configure the integration to use it via the appropriate environment variables (`HTTP_PROXY`, `HTTPS_PROXY`).

3. **DNS resolution**: Verify that your environment can resolve Port's API hostname.

4. **TLS/SSL issues**: If you're using a corporate proxy or custom certificates, ensure the integration trusts the certificate chain. See the TLS troubleshooting tip above for creating a proper PEM bundle.

These are internal network issues that need to be resolved in your environment. Port's support team cannot directly troubleshoot internal network configurations, but can help verify there are no issues on Port's side.

</details>

---

## Actions

#### After triggering an Action in Port, why is it stuck "in progress" and nothing happens in the Git provider?

<details>
<summary><b>Answer (click to expand)</b></summary>

Please make sure that:

1. The action backend is set up correctly. This includes the Organization/Group name, repository and workflow file name.
2. For Gitlab, make sure the [Port execution agent](https://docs.port.io/actions-and-automations/setup-backend/gitlab-pipeline/self-hosted#installing-the-agent) is installed properly. When triggering the action, you can view the logs of the agent to see what URL was triggered. 

</details>

---

## Catalog

#### How can I export my catalog data?

<details>
<summary><b>Answer (click to expand)</b></summary>

Port allows you to easily export any catalog data in one of the following formats:

- JSON
- Gitops (.yml)
- HCL (.tf)

To export your data:

1. Click on the `...` button in the top right corner of your Port application, and choose `Export Data`:
    <img src='/img/troubleshooting/exportDataButton.png' width='40%' border='1px' />

2. Choose one or more blueprints, choose a format and click `Export`.

This will download a file with all **entities** of the selected blueprints in the chosen format.

</details>

#### One of my catalog pages is not displaying all entities, or some data is missing, why is that?

<details>
<summary><b>Answer (click to expand)</b></summary>

1. Check for table filters in the top right. Make sure no filter is applied, or no property is hidden.
2. Sometimes users apply [initial filters](https://docs.port.io/customize-pages-dashboards-and-plugins/page/catalog-page/#initial-filters) to increase the loading speed of the catalog page. Make sure your missing entity is not being filtered out.

</details>

#### What can I embed in the iframe widget?

<details>
<summary><b>Answer (click to expand)</b></summary>

Iframe is a more limited web environment than a dedicated full-fledged browser tab, and they are a less secure option in general, so not all services support them. For example, Grafana Cloud does not allow iframe embedding of the content, while Grafana self-hosted does support iframe.

To understand if you can embed your desired content, the first step will be to check with the service provider if cross site embedding is supported. After confirming you can embed the relevant content, here are two different approaches for embedding sensitive data:

1. Public page behind a VPN: If the host of the content is self hosted and accessible when users are logged in to your VPN, you can make it publicly accessible to users that are logged in to your VPN. This means that the embedded resource is still secure, because access to your VPN (and therefore, to the resource) is limited only to users with access to the VPN, but it also makes it possible to view the embedded resource in Port, since there is no need for a dedicated authentication flow (again, assuming the user is logged in to the VPN).

    For example, with Grafana self-hosted that accessible from your VPN, you can simply make a dashboard public and embed it, and users who have logged in to your VPN will be able to see it embedded in Port correctly.

2. PKCE: Port supports [PKCE](https://docs.port.io/build-your-software-catalog/customize-integrations/configure-data-model/setup-blueprint/properties/embedded-url/authentication) authentication flow to authenticate the logged in user with an OIDC application against your IdP to gain access. This requires the end service you are trying to embed (for example, a dashboard from self-hosted Grafana) to support OIDC, in order to use the SSO application. In order to set it up, follow the documentation and make sure you do the following:

    - Create a new application in your IdP and configure the widget to use the correct application ID.
    - Configure the end service with the application credentials, in order to receive the authentication requests.
    - Make sure the application is able to get a JWT from the token URL. This is how the application authenticates the user.
</details>

---

## Security

#### What security does Port have in place?

<details>
<summary><b>Answer (click to expand)</b></summary>

We put a lot of thought into Port’s design to make it secure. Consequently, it doesn’t store secrets or credentials, and doesn't require whitelisting of IPs. 

Port uses industry-standard encryption protocols, data is encrypted both at rest and in transit, with complete isolation between clients and data access logging and auditing.  
Port is SOC2 and ISO/IEC 27001:2022 compliant, and undergoes regular pentests, product security and compliance reviews.

You can find the complete coverage of the **security policy** in the [security page](https://www.getport.io/security).

</details>

---

## API

To troubleshoot requests to Port's API, refer to the [API troubleshooting](/docs/api-reference/port-api.info.mdx#troubleshooting) section.