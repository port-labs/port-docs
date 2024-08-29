
const darkTags = [ "AWS", "Datadog", "GitHub", "Kafka", "Launchdarkly" ] 

export const getDarkImage = (tag) => {
    if (darkTags.includes(tag)) {
        return "/img/guides/icons/dark/" + tag.replace(/ /g, '') + ".svg";
    }
    return "/img/guides/icons/" + tag.replace(/ /g, '') + ".svg";
}
