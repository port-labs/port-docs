---
sidebar_position: 14
title: Troubleshoot
sidebar_label: ⚠️ Troubleshoot
# check how to handle the connection name share
---

import Troubleshoot from "/src/components/troubleshoot/troubleshoot.jsx"

## Organization

Question: How can I set up SSO for my account?

Answer: In order to set up your SSO, do the following:
1. Set up the Application in your SSO dashboard. You can find the documentation for each supported provider [here](https://docs.getport.io/sso-rbac/sso-providers/).
2. Reach out to us with the required credentials in order to complete the set up. 
3. After completing the set up, Port will provide you with the `CONNECTION_NAME`. Head back to the documentation and replace it where noted.


Question: How can I troubleshoot my SSO connection?

Answer: Make sure of the following:

1. Make sure the user has permissions to use the application.
2. Look at the URL of the error, sometimes they are embedded with the error. For example, the following URL in the error page:
```
https://app.getport.io/?error=access_denied&error_description=access_denied%20(User%20is%20not%20assigned%20to%20the%20client%20application.)&state=*********
```
After the `error_description`, you can see `User%20is%20not%20assigned%20to%20the%20client%20application`. In this case, the user is not assigned to the SSO application, therefor he cannot access Port through it.

3. Make sure you are using the correct `CONNECTION_NAME`     provided to you by Port, and that the application is set up correctly according to our setup docs.

Question: Why I cannot invite another member?

Answer: At the free tier, Port allows you to be connected to a single organization. If your colleague is in another organization, you will not be able to invite him. Reach out to us in Slack or the Intercom, and we will help you resolve the issue.

## Actions

Question: After triggering an Action in Port (backend GitHub or GitLab), why is the action stuck in progress and nothing happens in the Git provider?

Answer: Make sure of the following:
1. The action backend is set up correctly. This includes the Organization/Group name, repository and workflow file name.
2. For Gitlab, make sure the [Port execution agent](https://docs.getport.io/create-self-service-experiences/setup-backend/gitlab-pipeline/Installation#installing-the-agent) is installed properly. When triggering the action, you can view the logs of the agent to see what URL was attempted to trigger. 

## Catalog

Question: My Blueprint catalog page is not displaying all entities/Some data is missing, why is that?

Answer:
1. Check for table filters in the top right. Make sure no filter is applied, or no property is hidden.
2. Sometimes users apply [initial filters](https://docs.getport.io/customize-pages-dashboards-and-plugins/page/catalog-page/#initial-filters) to increase the loading speed of the catalog page. Make sure your missing entity is not being filtered out.


<Troubleshoot />