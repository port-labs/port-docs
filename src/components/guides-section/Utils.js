export const getTagImage = (tag, isDarkTheme) => {
    if (isDarkTheme) {
        return "/img/guides/icons/dark/" + tag.replace(/ /g, '') + ".svg";
    }
    return "/img/guides/icons/" + tag.replace(/ /g, '') + ".svg";
}