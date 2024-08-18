import { Typography } from '@mui/material';
import React from 'react';

function GuideLabel(props) {
    const [isPressed, setIsPressed] = React.useState(false);
    
    return <button className={(isPressed ? "label-button-pressed" : "label-button") + " " + props.className} onClick={() => setIsPressed(!isPressed)}>
        <img src={"/img/guides/icons/" + props.label + ".svg"} width='16px' className='not-zoom'/>
        <Typography fontFamily={"DM Sans"} fontSize={14} fontWeight={400} lineHeight={"normal"} fontStyle={"normal"}>{props.label}</Typography>
    </button>;
}

export default GuideLabel;