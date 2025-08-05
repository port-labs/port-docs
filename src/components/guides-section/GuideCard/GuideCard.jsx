import React from 'react';
import Tag from '/src/components/guides-section/Tag/Tag.jsx'
import "/src/components/guides-section/styles.css";
import { Typography } from '@mui/material';
import LogoImage from '/src/components/guides-section/LogoImage/LogoImage.jsx';

function GuideCard({ title, description, tags, logos, category, link, isNew }) {
    return <a className="guide-card" href={link}>
        <div className='guide-card-header'>
            <div className='guide-card-header-left'>
                {logos.map((logo) => (
                    <div key={logo} className='guide-card-header-img-box'>
                        <LogoImage logo={logo} width='32px' />
                    </div>
                ))}
            </div>
            <div className='guide-card-header-right'>
                {isNew && 
                    <div className='guide-card-new-badge'>
                        <Typography className='guide-card-new-text'>NEW</Typography>
                    </div>
                }
                {category && 
                    <div className='guide-card-header-category'>
                        <Typography className='guide-card-category-text'>{category}</Typography>
                    </div>
                }
            </div>
        </div>
        <div className='guide-card-body'>
            <Typography className='guide-card-title'>{title || "Create Slack channel for incident management"}</Typography>
            <Typography className='guide-card-description'>{description || "Create a Jira bug ticket. For more information, refer to the guide: Report a bug action."}</Typography>
        </div>
        <div className='guide-card-tags'>
            {tags.map(tag => <Tag className="unclickable-label" tag={tag} />)}
        </div>
    </a>;
}

export default GuideCard;