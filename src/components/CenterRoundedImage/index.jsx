const CenterRoundedImage = ({ imgSrc, ...imgProps }) => {
  return (
    <>
      <center>
        <img
          src={imgSrc}
          style={{
            width: '50%',
            border: '1px',
            borderRadius: '15px'
          }}
          {...(imgProps || {})}
        />
      </center>
    </>
  );
};

export default CenterRoundedImage;
