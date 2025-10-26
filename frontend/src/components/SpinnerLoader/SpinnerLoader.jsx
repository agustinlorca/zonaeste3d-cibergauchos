import Spinner from "react-bootstrap/Spinner";
import "./SpinnerLoader.css";

const SpinnerLoader = () => {
  return (
    <div className="spinner-container">
      <Spinner animation="border" role="status">
        <span className="visually-hidden">Loading...</span>
      </Spinner>
    </div>
  );
};
export default SpinnerLoader;
