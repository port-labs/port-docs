import React, { useState } from "react";
import "/src/components/guides-section/styles.css";
import Tags from "/src/components/guides-section/Tag/Tags.jsx";
import SearchBar from "/src/components/guides-section/SearchBar/SearchBar.jsx";
import GuideCards from "/src/components/guides-section/GuideCard/GuideCards.jsx";
import { availableGuides } from "../consts.js";

function GuidePage() {
  const [searchText, setSearchText] = useState('');
  const [selectedTags, setSelectedTags] = useState([]);

  const toggleTag = (tag) => {
    setSelectedTags((prev) =>
      prev.includes(tag)
        ? prev.filter((l) => l !== tag)
        : [...prev, tag]
    );
  };

  const filteredGuides = availableGuides.filter((guide) => {
    const matchesTag = selectedTags.length === 0 || selectedTags.every((tag) => guide.tags.includes(tag));
    const matchesSearch = guide.title.toLowerCase().includes(searchText.toLowerCase()) || guide.description.toLowerCase().includes(searchText.toLowerCase());
    return matchesTag && matchesSearch;
  });

  return (
    <>
      <div className="guide-tags-and-search-container">
        <Tags toggleTag={toggleTag} />
        <SearchBar searchText={searchText} setSearchText={setSearchText} />
      </div>
      <GuideCards guides={filteredGuides} />
    </>
  );
}

export default GuidePage;
