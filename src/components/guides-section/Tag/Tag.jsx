import { Typography } from '@mui/material';
import LogoImage from '../LogoImage/LogoImage';

function Tag({ tag, toggleTag, className, isSelected }) {
    const imgPath = '/img/guides/icons/' + tag.replace(/ /g, '') + '.svg';

    return (
        <button 
            className={(isSelected ? "label-button-pressed" : "label-button") + " " + className} 
            onClick={() => toggleTag(tag)}
        >
            <LogoImage logo={tag} width='16px' />
            <Typography className="label-button-text">{tag}</Typography>
        </button>
    );
}

export default Tag;