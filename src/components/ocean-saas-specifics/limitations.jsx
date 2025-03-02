import Markdown from "@theme/Markdown";

const defaultLimitations = {
  ttl:
    '- Resync jobs have a TTL of 1 hour.  \nFor very large amounts of data where a resync operation is expected to take longer, please use a different installation method or contact support.',
};

const limitations = {

};

const OceanSaasLimitations = ({ id }) => {

  return (
    <Markdown>
      {limitations[id] || defaultLimitations["ttl"]}
    </Markdown>
  );
};

export default OceanSaasLimitations;