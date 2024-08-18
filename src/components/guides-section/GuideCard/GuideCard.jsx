import React from 'react';
import GuideLabel from '/src/components/guides-section/GuideLabel/GuideLabel.jsx'
import "/src/components/guides-section/styles.css";
import { Typography } from '@mui/material';
import { useHistory } from 'react-router-dom';

function GuideCard(props = {tags: [], logos: []}) {
    const history = useHistory();
    return <div className="guide-card" onClick={()=> history.push("/guides/prod/guides/create-cloud-resource-using-iac")}>
        <div className='guide-card-header'>
            <div className='guide-card-header-left'>
                {props.logos.map(logo => 
                    <div className='guide-card-header-img-box'>
                    <img src={"/img/guides/icons/" + logo + ".svg"} width='32px' className='not-zoom'/>
                    </div>)
                }
            </div>
            <div className='guide-card-header-category'>
                    <Typography className='guide-card-category-text'>{props.category || "Getting started"}</Typography>
            </div>
        </div>
        <div className='guide-card-body'>
            <Typography className='guide-card-title'>{props.title || "Create Slack channel for incident management"}</Typography>
            <Typography className='guide-card-description'>{props.description || "Create a Jira bug ticket. For more information, refer to the guide: Report a bug action."}</Typography>
        </div>
        <div className='guide-card-tags'>
            {props.tags.map(tag => <GuideLabel className="unclickable-label" label={tag}/>)}
        </div>
    </div>;
}

export default GuideCard;