import React, { useCallback, useMemo, useState } from "react";
import { Typography } from "@mui/material";
import "/src/components/guides-section/styles.css";
import Tags from "/src/components/guides-section/Tag/Tags.jsx";
import SearchBar from "/src/components/guides-section/SearchBar/SearchBar.jsx";
import GuideCards from "/src/components/guides-section/GuideCard/GuideCards.jsx";
import { availableGuides } from "../consts.js";
import ResetIcon from "/static/img/guides/icons/Reset.svg";
import FilterIcon from "/static/img/guides/icons/Filter.svg";
import { useHistory, useLocation } from "react-router-dom";

function GuidePage() {
  const history = useHistory();
  const location = useLocation();

  const [searchText, setSearchText] = useState('');
  const paramsTags = new URLSearchParams(location.search).getAll("tags");
  const [selectedTags, setSelectedTags] = useState(paramsTags);

  const toggleTag = useCallback((tag) => {
    setSelectedTags((prev) => {
      const newTags = prev.includes(tag)
        ? prev.filter((l) => l !== tag)
        : [...prev, tag];
      
      const params = new URLSearchParams(location.search);
      params.delete("tags");
      newTags.forEach(tag => params.append("tags", tag));
      history.replace({ search: params.toString() });

      return newTags;
    });
  }, [history. location.search]);

  const filteredGuides = useMemo(() => availableGuides.filter((guide) => {
    const matchesTag = selectedTags.length === 0 || selectedTags.every((tag) => guide.tags.includes(tag) || guide.logos.includes(tag) || guide.additionalTags && guide.additionalTags.includes(tag));
    const matchesSearch = guide.title.toLowerCase().includes(searchText.toLowerCase()) || guide.description.toLowerCase().includes(searchText.toLowerCase()) ;
    return matchesTag && matchesSearch;
  }), [selectedTags, searchText]);

  return (
    <>
      <div className="guide-tags-and-search-container">
        <div className="guide-tags-and-search-title-container">
          <Typography className="guide-tags-and-search-title"><FilterIcon className="filter-icon" /> Filters</Typography>
          <div className="guide-tags-reset-button" onClick={() => { setSelectedTags([]); setSearchText(''); history.replace({ search: "" })}}>
            <ResetIcon className="reset-icon" />
            <Typography className="guide-tags-reset-button-text">Clear filters</Typography>
          </div>
        </div>
        <Tags toggleTag={toggleTag} selectedTags={selectedTags} />
        <SearchBar searchText={searchText} setSearchText={setSearchText} />
      </div>
      <GuideCards guides={filteredGuides} />
    </>
  );
}

export default GuidePage;
