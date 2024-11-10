import React from "react";
import Tag from "/src/components/guides-section/Tag/Tag.jsx";
import "/src/components/guides-section/styles.css";
import { Typography } from "@mui/material";
import { tagsCategoryMap } from "../consts.js";

function Tags({ toggleTag, selectedTags}) {
  return (
    <div className="guide-tags-container">
      {Object.entries(tagsCategoryMap).map(([category, tags]) => (
        <div key={category} className="guide-tags-category">
          <Typography className="guide-tags-title">{category}</Typography>
          <div className="guide-tags-category-content">
            {tags.map((tag) => (
              <Tag 
                key={tag} 
                tag={tag} 
                toggleTag={toggleTag} 
                isSelected={selectedTags.includes(tag)}
              />
            ))}
          </div>
        </div>
      ))}
    </div>
  );
}

export default Tags;