import React, { useState } from "react";
import GuideLabel from "/src/components/guides-section/GuideLabel/GuideLabel.jsx";
import "/src/components/guides-section/styles.css";
import { Typography } from "@mui/material";
import { useHistory } from "react-router-dom";
import Tags from "/src/components/guides-section/Tags/Tags.jsx";
import SearchBar from "/src/components/guides-section/SearchBar/SearchBar.jsx";
import GuideCard from "/src/components/guides-section/GuideCard/GuideCard.jsx";

const availableGuides = [
    {
        title: "title",
        description: "description",
        tags: ["AWS", "Actions"],
        logos: ["AWS", "Github"],
        category: "Getting started",
    },
    {
        title: "title",
        description: "description",
        tags: ["AWS", "Actions"],
        logos: ["AWS", "Github"],
        category: "Getting started",
    }
]
function GuidePage(props = { tags: [], logos: [] }) {
  const history = useHistory();
  const [searchText, setSearchText] = useState('');
  const [selectedLabels, setSelectedLabels] = useState([]);

  const allTags = [...new Set(availableGuides.flatMap(guide => guide.tags))];
    
  return (
    <>
      <div className="guide-tags-and-search-container">
        <Tags tags={allTags} />
        <SearchBar />
      </div>
      {/* <GuideCards /> */}
      <div className="guide-cards-container">
        <GuideCard
          tags={["AWS", "Actions"]}
          logos={["AWS"]}
          title="Create cloud resources using IaC"
          description="blah blah blah"
        />
        <GuideCard tags={["AWS", "Actions"]} logos={["Github", "AWS"]} />
        <GuideCard tags={["AWS", "Actions"]} logos={["Github", "AWS"]} />
        <GuideCard tags={["AWS", "Actions"]} logos={["Github", "AWS"]} />
      </div>
    </>
  );
}

export default GuidePage;
