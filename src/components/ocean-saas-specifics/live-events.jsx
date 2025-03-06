import Markdown from "@theme/Markdown";

const defaultLiveEvents = {
  unsupported:
    'Currently, live events are not supported for integrations hosted by Port.<br/> \
    Resyncs will be performed **periodically** (with a configurable interval), or **manually** triggered by you via Port\'s UI.<br/> \
    <br/>\
    Therefore, real-time events (including GitOps) will not be ingested into Port immediately.<br/>\
    Live events support for this integration is WIP and will be supported in the near future.',
};

const liveEvents = {
  Linear:
    'Live events are not supported for Linear.', //TODO dont forget to change this
};

const OceanSaasLiveEvents = ({ id }) => {

  return (
    <Markdown>
      {liveEvents[id] || defaultLiveEvents["unsupported"]}
    </Markdown>
  );
};

export default OceanSaasLiveEvents;