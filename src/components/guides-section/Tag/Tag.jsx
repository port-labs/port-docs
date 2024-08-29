import { Typography } from '@mui/material';
import { getDarkImage } from '/src/components/guides-section/Utils.js';
import ThemedImage from '@theme/ThemedImage';
import useBaseUrl from '@docusaurus/useBaseUrl';

function Tag({ tag, toggleTag, className, isSelected }) {
    const imgPath = '/img/guides/icons/' + tag.replace(/ /g, '') + '.svg';

    return (
        <button 
            className={(isSelected ? "label-button-pressed" : "label-button") + " " + className} 
            onClick={() => toggleTag(tag)}
        >
            <ThemedImage
                width='16px'
                className='not-zoom'
                sources={{
                    light: useBaseUrl(imgPath),
                    dark: useBaseUrl(getDarkImage(tag)),
                }}
            />
            <Typography className="label-button-text">{tag}</Typography>
        </button>
    );
}

export default Tag;