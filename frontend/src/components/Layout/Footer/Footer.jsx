import { Facebook, Instagram, Tiktok, Whatsapp, Youtube } from "react-bootstrap-icons";

const Footer = () => {
  return (
    <footer className=" bg-light text-center text-white" id='footer'>
      <div className="container p-4 pb-0">
        <div className="text-muted mb-4">
          <h3>Conectate con nosotros</h3>
        </div>
        <div className="d-flex justify-content-center mb-4">
          <a href="https://www.facebook.com/zonaeste3d" target="_blank" className="me-3">
            <Facebook size={30} color="royalblue"/>
          </a>
          <a href="https://www.instagram.com/zonaeste3d" target="_blank" className="me-3">
            <Instagram size={30} color="red"/>
          </a>
          <a href="https://www.tiktok.com/@zonaeste3d" target="_blank" className="me-3">
            <Tiktok size={30} color="black"/>
          </a>
          <a href="https://wa.me/message/C2LTSWXKD6LPP1" target="_blank" className="me-3">
            <Whatsapp size={30} color="green"/>
          </a>
          <a href="https://www.youtube.com/@zonaeste3d" target="_blank">
            <Youtube size={30} color="red"/>
          </a>
        </div>
      </div>
      <div className="text-center p-3" style={{backgroundColor: "#2c5871"}}>
        © 2023 Copyright: Zona Este 3D
      </div>
    </footer>
  );
};

export default Footer;
