import React, { useMemo } from "react";
import GuideLabel from "/src/components/guides-section/GuideLabel/GuideLabel.jsx";
import "/src/components/guides-section/styles.css";
import { Typography } from "@mui/material";

const tagsCategoryMap = {
  Technologies: [
    "Slack",
    "Terraform",
    "Jira",
    "SonarQube",
    "Cluster",
    "Argo",
    "AWS",
    "Azure",
    "AzureDevops",
    "BitBucket",
    "Github",
    "GitLab",
    "GCP",
    "Jenkins",
    "Kubecost",
    "Launchdarkly",
    "Linear",
    "Opencost",
    "PagerDuty",
    "Snyk",
  ],
  "Port pillars": ["Actions", "Automations", "Widgets", "Scorecards", "RBAC"],
  Experiences: ["Actions", "Automations", "Widgets", "Scorecards", "RBAC"],
};

function Tags(props) {
  const groupedTags = useMemo(
    () =>
      Object.entries(tagsCategoryMap).map(([category, tags]) => {
        return (
          <div className="guide-tags-category">
            <Typography className="guide-tags-title">{category}</Typography>
            <div className="guide-tags-category-content">
              {tags.map((tag) => (
                <GuideLabel label={tag} />
              ))}
            </div>
          </div>
        );
      }),
    []
  );
  return <div className="guide-tags-container">{groupedTags}</div>;
  // props.tags.map((tag) => <GuideLabel label={tag}/>);
  // return <div className="guide-tags-container">
  //     <div className="guide-tags-category">
  //     <Typography className='guide-tags-title'>Technologies</Typography>
  //         <div className="guide-tags-category-content">
  //         <GuideLabel label="Slack"/>
  //         <GuideLabel label="Terraform"/>
  //         <GuideLabel label="Jira"/>
  //         <GuideLabel label="SonarQube"/>
  //         <GuideLabel label="Cluster"/>
  //         <GuideLabel label="Argo"/>
  //         <GuideLabel label="AWS"/>
  //         <GuideLabel label="Azure"/>
  //         <GuideLabel label="AzureDevops"/>
  //         <GuideLabel label="BitBucket"/>
  //         <GuideLabel label="Github"/>
  //         <GuideLabel label="GitLab"/>
  //         <GuideLabel label="GCP"/>
  //         <GuideLabel label="Jenkins"/>
  //         <GuideLabel label="Kubecost"/>
  //         <GuideLabel label="Launchdarkly"/>
  //         <GuideLabel label="Linear"/>
  //         <GuideLabel label="Opencost"/>
  //         <GuideLabel label="PagerDuty"/>
  //         <GuideLabel label="Snyk"/>
  //         </div>
  //     </div>
  //     <div className="guide-tags-category">
  //     <Typography className='guide-tags-title'>Port pillars</Typography>
  //         <div className="guide-tags-category-content">
  //         <GuideLabel label="Actions"/><GuideLabel label="Automations"/><GuideLabel label="Widgets"/><GuideLabel label="Scorecards"/><GuideLabel label="RBAC"/>
  //         </div>
  //     </div>
  //     <div className="guide-tags-category">
  //     <Typography className='guide-tags-title'>Experiences</Typography>
  //         <div className="guide-tags-category-content">
  //         <GuideLabel label="Actions"/><GuideLabel label="Automations"/><GuideLabel label="Widgets"/><GuideLabel label="Scorecards"/><GuideLabel label="RBAC"/>
  //         </div>
  //     </div>
  // </div>;
}

export default Tags;
