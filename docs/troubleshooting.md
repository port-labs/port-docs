---
sidebar_position: 14
title: Troubleshooting
sidebar_label: Troubleshooting
sidebar_class_name: custom-sidebar-item sidebar-menu-troubleshooting
---

# Troubleshooting

This page contains answers to common questions and issues that users encounter when using Port, organized by topic.

## General

#### Do I need an expert to set up an Internal Developer Portal with Port?

<details>
<summary><b>Answer (click to expand)</b></summary>

Port was designed to let you set up a developer portal in minutes, quickly defining your data model and then ingesting data about software and resources into it.

We believe in “bring your own data model” since each organization differs in how it wants to set up Port and model its software. Our documentation and [other resources](/resources) can help you get started. 

If you're trying to find out if Port is right for you, you can reach out to us by scheduling an [in-person demo](https://www.getport.io/demo-request), and we’ll be happy to escort you through the process of building a portal that's right for you.

</details>

---

#### Why not backstage?

<details>
<summary><b>Answer (click to expand)</b></summary>

Spotify’s backstage is spot-on in recognizing the need for a streamlined end-to-end development environment. It is also flexible, which lets you build your software catalog according to your data model. However, it requires coding, personnel to implement it, and domain expertise. You also need to invest in deployment, configuration and updates. You can read a detailed comparison of Port and Backstage [here](https://www.getport.io/compare/backstage-vs-port).

</details>

---

#### Is Port really free?

<details>
<summary><b>Answer (click to expand)</b></summary>

Port is free up to 15 users, you can check our [pricing page](https://www.getport.io/pricing) for more information. Using the free version of Port you can set up an advanced, fully functioning, internal developer portal.

The free version includes all of the features in Port, except for SSO and a certain limitation on the number of software catalog entities (up to 10,000), for reasons of fair use.  

In case you're evaluating Port, it provides you with everything you need, and if you need SSO for a given period, contact us.

</details>

---

## Organization

#### How can I set up SSO for my organization?

<details>
<summary><b>Answer (click to expand)</b></summary>

1. Set up the Application in your SSO dashboard. You can find the documentation for each supported provider [here](https://docs.getport.io/sso-rbac/sso-providers/).
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
Reach out to us via [Slack](https://www.getport.io/community) or Intercom, and we will help you resolve the issue.

</details>

---

## Actions

#### After triggering an Action in Port, why is it stuck "in progress" and nothing happens in the Git provider?

<details>
<summary><b>Answer (click to expand)</b></summary>

Please make sure that:

1. The action backend is set up correctly. This includes the Organization/Group name, repository and workflow file name.
2. For Gitlab, make sure the [Port execution agent](https://docs.getport.io/create-self-service-experiences/setup-backend/gitlab-pipeline/Installation#installing-the-agent) is installed properly. When triggering the action, you can view the logs of the agent to see what URL was triggered. 

</details>

---

## Catalog

#### One of my catalog pages is not displaying all entities, or some data is missing, why is that?

<details>
<summary><b>Answer (click to expand)</b></summary>

1. Check for table filters in the top right. Make sure no filter is applied, or no property is hidden.
2. Sometimes users apply [initial filters](https://docs.getport.io/customize-pages-dashboards-and-plugins/page/catalog-page/#initial-filters) to increase the loading speed of the catalog page. Make sure your missing entity is not being filtered out.

</details>

---

## Security

#### What security does Port have in place?

<details>
<summary><b>Answer (click to expand)</b></summary>

We put a lot of thought into Port’s design to make it secure. Consequently, it doesn’t store secrets or credentials, and doesn't require whitelisting of IPs. 

You can take a look at our secure, push-only architecture [here](https://docs.getport.io/build-your-software-catalog/sync-data-to-catalog).

Security and privacy are a top priority at Port. We use industry-standard encryption protocols, data is encrypted both at rest and in transit, with complete isolation between clients and data access logging and auditing. Port is SOC2 and ISO/IEC 27001:2022 compliant, and undergoes regular pentests, product security and compliance reviews.

You can find the complete coverage of Port's **security policy** in our security [page](https://www.getport.io/security).

</details>

---