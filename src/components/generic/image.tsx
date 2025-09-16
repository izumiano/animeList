import missingImage from "../../assets/missingImage.png";

interface ImageParams {
  src: string | null;
}

const Image = ({ src }: ImageParams) => {
  if (src === "") {
    src = null;
  }

  return (
    <img
      src={src ?? missingImage}
      className="animeImage"
      style={{ backgroundImage: `url('${missingImage}') no-repeat` }}
    ></img>
  );
};

export default Image;
