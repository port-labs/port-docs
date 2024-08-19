import { Typography } from '@mui/material';
import React from 'react';

function Tag({ tag, toggleTag, className }) {
    const [isPressed, setIsPressed] = React.useState(false);

    return <button className={(isPressed ? "label-button-pressed" : "label-button") + " " + className} onClick={() => { setIsPressed(!isPressed); toggleTag(tag); }}>
        <img src={"/img/guides/icons/" + tag.replace(/ /g, '') + ".svg"} width='16px' className='not-zoom' />
        <Typography fontFamily={"DM Sans"} fontSize={14} fontWeight={400} lineHeight={"normal"} fontStyle={"normal"}>{tag}</Typography>
    </button>;
}

export default Tag;