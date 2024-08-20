import React from "react";
import Button from "@mui/material/Button";
import Tag from "/src/components/guides-section/Tag/Tag.jsx";
import "/src/components/guides-section/styles.css";
import { Typography } from "@mui/material";
import { tagsCategoryMap } from "../consts.js";

function Tags({ toggleTag }) {
  return (
    <div className="guide-tags-container">
      {Object.entries(tagsCategoryMap).map(([category, tags]) => (
        <div key={category} className="guide-tags-category">
          <Typography className="guide-tags-title">{category}</Typography>
          <div className="guide-tags-category-content">
            {tags.map((tag) => (
              <Tag key={tag} tag={tag} toggleTag={toggleTag} />
            ))}
          </div>
        </div>
      ))}
    </div>
  );
}

export default Tags;