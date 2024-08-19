import React from 'react';
import "/src/components/guides-section/styles.css";

function SearchBar({ searchText, setSearchText }) {
  return <div className="search-bar-wrapper">
    <img src="/img/guides/icons/Search.svg" width="24px" className="not-zoom" />
    <input className="guides-search-bar" placeholder="Search by title, technology (AWS, Jira, etc...), or Port offering (Actions, scorecards, etc...)" value={searchText} onChange={(e) => setSearchText(e.target.value)}/>
  </div>;
}

export default SearchBar;