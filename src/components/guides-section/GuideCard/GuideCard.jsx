import React from 'react';
import Tag from '/src/components/guides-section/Tag/Tag.jsx'
import "/src/components/guides-section/styles.css";
import { getDarkImage } from '/src/components/guides-section/Utils.js';
import { Typography } from '@mui/material';
import { useHistory } from 'react-router-dom';
import ThemedImage from '@theme/ThemedImage';
import useBaseUrl from '@docusaurus/useBaseUrl';

function GuideCard({ title, description, tags, logos, category, link }) {
    const history = useHistory();
    
    return <div className="guide-card" onClick={()=> history.push(link)}>
        <div className='guide-card-header'>
            <div className='guide-card-header-left'>
                {logos.map(logo => 
                    <div className='guide-card-header-img-box'>
                        <ThemedImage
                            width='32px'
                            className='not-zoom'
                            sources={{
                                light: useBaseUrl("/img/guides/icons/" + logo.replace(/ /g, '') + ".svg"),
                                dark: useBaseUrl(getDarkImage(logo)),
                            }}
                        />
                    </div>)
                }
            </div>
            {category ?
            <div className='guide-card-header-category'>
                <Typography className='guide-card-category-text'>{category}</Typography>
            </div> : null}
        </div>
        <div className='guide-card-body'>
            <Typography className='guide-card-title'>{title || "Create Slack channel for incident management"}</Typography>
            <Typography className='guide-card-description'>{description || "Create a Jira bug ticket. For more information, refer to the guide: Report a bug action."}</Typography>
        </div>
        <div className='guide-card-tags'>
            {tags.map(tag => <Tag className="unclickable-label" tag={tag}/>)}
        </div>
    </div>;
}

export default GuideCard;