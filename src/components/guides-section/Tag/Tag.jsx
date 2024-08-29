import { Typography } from '@mui/material';
import { useColorMode } from '@docusaurus/theme-common';
import { getTagImage } from '/src/components/guides-section/utils.js';

function Tag({ tag, toggleTag, className, isSelected }) {
    const { isDarkTheme } = useColorMode();

    const imgPath = getTagImage(tag, isDarkTheme);
    const fallbackImgPath = "/img/guides/icons/" + tag.replace(/ /g, '') + ".svg";

    return (
        <button 
            className={(isSelected ? "label-button-pressed" : "label-button") + " " + className} 
            onClick={() => toggleTag(tag)}
        >
            <img 
                src={imgPath} 
                onError={(e) => { e.target.src = fallbackImgPath; }} 
                width='16px' 
                className='not-zoom' 
            />
            <Typography className="label-button-text">{tag}</Typography>
        </button>
    );
}

export default Tag;