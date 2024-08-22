import React from 'react';
import "/src/components/guides-section/styles.css";
import SearchIcon from "/static/img/guides/icons/Search.svg";

function SearchBar({ searchText, setSearchText }) {
  return <div className="search-bar-wrapper">
    {/* <img src="/img/guides/icons/Search.svg" width="24px" className="not-zoom" /> */}
    <SearchIcon className="search-icon" />
    <input className="guides-search-bar" placeholder="Search by title or description" value={searchText} onChange={(e) => setSearchText(e.target.value)}/>
  </div>;
}

export default SearchBar;