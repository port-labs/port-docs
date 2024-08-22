import { useColorMode } from '@docusaurus/theme-common';

export const GetImageLight = (imgName) => {
    const imgPathLight = "/img/guides/icons/" + imgName.replace(/ /g, '') + ".svg";
    return imgPathLight;
}

export const GetImage = (imgName) => {
    const { isDarkTheme } = useColorMode();
    const imgPathDark = "/img/guides/icons/dark/" + imgName.replace(/ /g, '') + ".svg";

    if (!isDarkTheme) {
        return GetImageLight(imgName);
    }

    return imgPathDark;
}