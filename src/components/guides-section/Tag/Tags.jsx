import React, { useState } from "react";
import Tag from "/src/components/guides-section/Tag/Tag.jsx";
import "/src/components/guides-section/styles.css";
import { Typography } from "@mui/material";
import { tagsCategoryMap } from "../consts.js";

function Tags({ toggleTag, selectedTags}) {
  const [isTechnologiesExpanded, setIsTechnologiesExpanded] = useState(false);
  const TECHNOLOGIES_VISIBLE_COUNT = 22; // ~2 rows based on typical screen width

  const getTechnologiesDisplay = (tags) => {
    if (isTechnologiesExpanded || tags.length <= TECHNOLOGIES_VISIBLE_COUNT) {
      return tags;
    }
    return tags.slice(0, TECHNOLOGIES_VISIBLE_COUNT);
  };

  return (
    <div className="guide-tags-container">
      {Object.entries(tagsCategoryMap).map(([category, tags]) => {
        const displayTags = category === "Technologies" 
          ? getTechnologiesDisplay(tags) 
          : tags;
        const showMoreButton = category === "Technologies" 
          && tags.length > TECHNOLOGIES_VISIBLE_COUNT;

        return (
          <div key={category} className="guide-tags-category">
            <Typography className="guide-tags-title">{category}</Typography>
            <div className="guide-tags-category-content">
              {displayTags.map((tag) => (
                <Tag 
                  key={tag} 
                  tag={tag} 
                  toggleTag={toggleTag} 
                  isSelected={selectedTags.includes(tag)}
                />
              ))}
              {showMoreButton && (
                <button 
                  className="guide-tags-show-more-button"
                  onClick={() => setIsTechnologiesExpanded(!isTechnologiesExpanded)}
                >
                  <Typography className="guide-tags-show-more-text">
                    {isTechnologiesExpanded 
                      ? '▲ Show Less' 
                      : `▼ Show More`}
                  </Typography>
                </button>
              )}
            </div>
          </div>
        );
      })}
    </div>
  );
}

export default Tags;