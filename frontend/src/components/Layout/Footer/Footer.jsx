import { Facebook, Tiktok, Youtube } from "react-bootstrap-icons";

const Footer = () => {
  return (
    <footer className=" bg-light text-center text-white" id='footer'>
      <div className="container p-4 pb-0">
        <div className="text-muted mb-4">
          <h3>Conectate con nosotros</h3>
        </div>
        <div className="d-flex justify-content-center mb-4">
          <a href="https://www.facebook.com/zonaeste3d" target="_blank" rel="noreferrer noopener" className="me-3">
            <Facebook size={30} color="royalblue"/>
          </a>
          <a href="https://www.tiktok.com/@zonaeste3d" target="_blank" rel="noreferrer noopener" className="me-3">
            <Tiktok size={30} color="black"/>
          </a>
          <a href="https://www.youtube.com/@zonaeste3d" target="_blank" rel="noreferrer noopener">
            <Youtube size={30} color="red"/>
          </a>
        </div>
      </div>
      <div className="text-center p-3" style={{backgroundColor: "#2c5871"}}>
        ©2025 Powered by: <span className="fw-semibold">Cibergauchos - UTN San Rafael</span>
      </div>
    </footer>
  );
};

export default Footer;
