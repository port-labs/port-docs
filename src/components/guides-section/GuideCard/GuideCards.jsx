import React from 'react'
import "/src/components/guides-section/styles.css";
import GuideCard from './GuideCard';

function GuideCards({ guides }) {
  if (guides.length === 0) {
    return "No guides found";
  }

  return (
    <div className="guide-cards-container">
        {guides.map((guide) => <GuideCard tags={guide.tags} logos={guide.logos} category={guide.category} title={guide.title} description={guide.description}/>)}
    </div>
  )
}

export default GuideCards