import { Typography } from '@mui/material';

function Tag({ tag, toggleTag, className, isSelected }) {
    return <button className={(isSelected ? "label-button-pressed" : "label-button") + " " + className} onClick={() => toggleTag(tag) }>
        <img src={"/img/guides/icons/" + tag.replace(/ /g, '') + ".svg"} width='16px' className='not-zoom' />
        <Typography fontFamily={"DM Sans"} fontSize={14} fontWeight={400} lineHeight={"normal"} fontStyle={"normal"}>{tag}</Typography>
    </button>;
}

export default Tag;