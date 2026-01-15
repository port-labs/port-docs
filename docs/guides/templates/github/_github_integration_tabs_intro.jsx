import React from "react";

export default function IntegrationTabsIntro({ tabs = [], title = "Overview" }) {
  const tabsText = tabs.filter(Boolean).join(" and ");

  return (
    <div
      style={{
        marginTop: "16px",
        marginBottom: "16px",
      }}
    >
      <div style={{ fontWeight: 600, marginBottom: "6px" }}>{title}</div>
      <div style={{ lineHeight: 1.5 }}>
        This guide covers <strong>{tabsText}</strong>, which have slightly
        different setup steps and mapping fields. Use the tabs below to switch
        between integrations and follow the instructions that match what you’ve
        installed. If you see tabbed sections later in the guide, treat them as
        integration-specific details while the rest of the steps stay the same.
      </div>
    </div>
  );
}

