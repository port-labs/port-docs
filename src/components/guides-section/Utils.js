
const darkTags = [ "AWS", "Datadog", "GitHub", "Kafka", "Launchdarkly", "Linear", "Backstage", "Sentry", "User", "Team", "Webhook" ] 

export const getImagePath = (image) => {
    if (darkTags.includes(image)) {
        return "/img/guides/icons/dark/" + image.replace(/ /g, '') + ".svg";
    }
    return "/img/guides/icons/" + image.replace(/ /g, '') + ".svg";
}
