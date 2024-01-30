import React, { useEffect, useState } from "react";
import Faq from "react-faq-component";

const data = {
    title: "Frequently asked questions",
    rows: [
        {
            title: "How can I set up SSO for my organization",
            content:
                <span>
                    1. Set up the Application in your SSO dashboard. You can find the documentation for each supported provider <a href="https://docs.getport.io/sso-rbac/sso-providers/" target="_blank" rel="noopener noreferrer">here</a>.
                    <br></br>
                    2. Reach out to us with the required credentials in order to complete the set up.
                    <br></br>
                    3. After completing the set up, Port will provide you with the CONNECTION_NAME. Head back to the documentation and replace it where noted.
                </span>,
        },
        {
            title: "How can I troubleshoot my SSO connection?",
            content:
                <span>
                    1. Make sure the user has permissions to use the application.
                    <br></br>
                    2. Look at the URL of the error, sometimes they are embedded with the error. For example, the following URL in the error page:
                    <br></br>
                    <code>https://app.getport.io/?error=access_denied&error_description=access_denied%20(User%20is%20not%20assigned%20to%20the%20client%20application.)&state=*********</code>
                    <br></br>
                    After the <code>error_description</code>, you can see <code>User%20is%20not%20assigned%20to%20the%20client%20application</code>. In this case, the user is not assigned to the SSO application, therefor he cannot access Port through it.
                    <br></br>
                    3. Make sure you are using the correct <code>CONNECTION_NAME</code> provided to you by Port, and that the application is set up correctly according to our setup docs.
                </span>
            ,
        },
        {
            title: "Why I cannot invite another member?",
            content:
                <span>
                    At the free tier, Port allows you to be connected to a single organization. If your colleague is in another organization, you will not be able to invite him.
                    <br></br>
                    Reach out to us in Slack or the Intercom, and we will help you resolve the issue.
                </span>,
        },
        {
            title: "After triggering an action in Port, why is the action status stuck in progress and nothing happens in the backend?",
            content:
                <span>
                    Make sure of the following:
                    <br></br>
                    1. The action backend is set up correctly. This includes the Organization/Group name, repository and workflow file name.
                    <br></br>
                    2. For Gitlab, make sure the <a href="https://docs.getport.io/create-self-service-experiences/setup-backend/gitlab-pipeline/Installation#installing-the-agent" target="_blank" rel="noopener noreferrer">Port execution agent</a> is installed properly. When triggering the action, you can view the logs of the agent to see what URL was attempted to trigger.
                </span>
        },
        {
            title: "Why is the catalog page not displaying all entities?",
            content:
                <span>
                    1. Check for table filters in the top right. Make sure no filter is applied, or no property is hidden.
                    <br></br>
                    2. Sometimes users apply <a href="https://docs.getport.io/customize-pages-dashboards-and-plugins/page/catalog-page/#initial-filters" target="_blank" rel="noopener noreferrer">initial filters</a> to increase the loading speed of the catalog page.
                    <br></br>
                    Make sure your missing entity is not being filtered out.
                </span>
        }
    ],
};

const styles = {
    // bgColor: 'white',
    titleTextColor: "blue",
    rowTitleColor: "blue",
    // rowContentColor: 'grey',
    // arrowColor: "red",
};

const config = {
    // animate: true,
    // arrowIcon: "V",
    // tabFocus: true
};

export default function App() {
    return (
        <div>
            <Faq
                data={data}
                styles={styles}
                config={config}
            />
        </div>
    );
}