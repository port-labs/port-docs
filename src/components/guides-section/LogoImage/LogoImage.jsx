import React from 'react';
import "/src/components/guides-section/styles.css";
import { getImagePath } from '/src/components/guides-section/Utils.js';
import ThemedImage from '@theme/ThemedImage';
import useBaseUrl from '@docusaurus/useBaseUrl';

export default function LogoImage({ logo, width, verticalAlign = 'text-top' }) {
    const lightSrc = useBaseUrl("/img/guides/icons/" + logo.replace(/ /g, '') + ".svg");
    const darkSrc = useBaseUrl(getImagePath(logo));

    return (
        <ThemedImage
            width={width}
            className='not-zoom'
            sources={{ light: lightSrc, dark: darkSrc }}
            style={{ verticalAlign: verticalAlign }}
        />
    );
}