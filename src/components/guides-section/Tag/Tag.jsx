import { useEffect } from 'react';
import { Typography } from '@mui/material';
import { useColorMode } from '@docusaurus/theme-common';
import { GetImage, GetImageLight } from '/src/components/guides-section/Utils.js';

function Tag({ tag, toggleTag, className, isSelected }) {
    // const { isDarkTheme } = useColorMode();
    // const imgPathLight = "/img/guides/icons/" + tag.replace(/ /g, '') + ".svg";
    // const imgPathDark = "/img/guides/icons/dark/" + tag.replace(/ /g, '') + ".svg";
    // let imgPath = imgPathLight;

    // if (isDarkTheme) {
    //     imgPath = imgPathDark;
    // }
     
    return <button className={(isSelected ? "label-button-pressed" : "label-button") + " " + className} onClick={() => toggleTag(tag) }>
        <img src={GetImage(tag)} onError={(e)=>{e.target.onError = null; e.target.src = GetImageLight(tag)}} width='16px' className='not-zoom' />
        <Typography className="label-button-text">{tag}</Typography>
    </button>;
}

export default Tag;