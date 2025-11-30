import React from 'react';
import "/src/components/guides-section/styles.css";
import { getImagePath } from '/src/components/guides-section/Utils.js';
import ThemedImage from '@theme/ThemedImage';
import useBaseUrl from '@docusaurus/useBaseUrl';

export default function LogoImage({ logo, iconName, width, verticalAlign = 'text-top' }) {
    // Use iconName if provided, otherwise use logo name (with spaces removed)
    const iconBaseName = iconName ? iconName.replace(/ /g, '') : logo.replace(/ /g, '');
    const lightSrc = useBaseUrl("/img/guides/icons/" + iconBaseName + ".svg");
    const darkSrc = useBaseUrl(getImagePath(iconName || logo));

    return (
        <ThemedImage
            width={width}
            className='not-zoom'
            sources={{ light: lightSrc, dark: darkSrc }}
            style={{ verticalAlign: verticalAlign }}
        />
    );
}