import React, { useMemo } from "react";
import Tag from "/src/components/guides-section/Tag/Tag.jsx";
import "/src/components/guides-section/styles.css";
import { Typography } from "@mui/material";
import { tagsCategoryMap } from "../consts.js";


function Tags({ toggleTag }) {
  const groupedTags = useMemo(
    () =>
      Object.entries(tagsCategoryMap).map(([category, tags]) => {
        return (
          <div className="guide-tags-category">
            <Typography className="guide-tags-title">{category}</Typography>
            <div className="guide-tags-category-content">
              {tags.map((tag) => (
                <Tag tag={tag} toggleTag={toggleTag} />
              ))}
            </div>
          </div>
        );
      }),
    []
  );

  return <div className="guide-tags-container">{groupedTags}</div>;
}

export default Tags;
