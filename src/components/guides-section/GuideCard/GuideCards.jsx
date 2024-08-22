import React from "react";
import { Typography } from "@mui/material";
import "/src/components/guides-section/styles.css";
import GuideCard from "./GuideCard";
import SearchIcon from "/static/img/guides/icons/Search.svg";

function GuideCards({ guides }) {
  if (guides.length === 0) {
    return (
      <div className="guides-card-empty-state">
        {/* <img src="/img/guides/icons/Search.svg" width="40px" className="not-zoom" /> */}
        <SearchIcon
          className="search-icon"
          style={{ height: "40px", width: "40px" }}
        />
        <Typography className="guides-card-empty-state-title">
          No guides found
        </Typography>
        <Typography className="guides-card-empty-state-body">
          Try using a different filter or search term
        </Typography>
      </div>
    );
  }

  return (
    <div className="guide-cards-container">
      {guides.map((guide) => (
        <GuideCard
          tags={guide.tags}
          logos={guide.logos}
          category={guide.category}
          title={guide.title}
          description={guide.description}
          link={guide.link}
        />
      ))}
    </div>
  );
}

export default GuideCards;
