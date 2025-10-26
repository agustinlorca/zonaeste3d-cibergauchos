import { useContext } from "react";
import { Link, useNavigate } from "react-router-dom";

import Container from "react-bootstrap/Container";
import Nav from "react-bootstrap/Nav";
import Navbar from "react-bootstrap/Navbar";
import NavDropdown from "react-bootstrap/NavDropdown";
import {PersonFill} from "react-bootstrap-icons";
import logoZE3D from "../../../Assets/img/logoZE3D.png";
import "./Navbar.css";
import CartWidget from "../../CartWidget/CartWidget";
import {toast} from 'react-toastify';
import { AuthCtxt } from "../../../context/AuthContext";


const NavbarComp = () => {
  const navigate = useNavigate();
  const {user,logout,isAuthReady,isAdmin} = useContext(AuthCtxt);
  
  const handleLogout = async () =>{
    await logout();
    toast.success(`Cierre de sesión exitoso`, {
      position: "top-center",
      autoClose: 1500,
      hideProgressBar: true,
      closeOnClick: false,
      pauseOnHover: true,
      draggable: true,
      progress: undefined,
      theme: "light",
    });
    navigate("/login");
  }
  return (
    <Navbar expand="lg" fixed="top" className="navbar">
      <Container>
        <Link to="/" className="text-decoration-none">
          <Navbar.Brand className="fw-bold title-brand">
            <img
              alt=""
              src={logoZE3D}
              width="40"
              height="45"
              className="img-navbar"
            />{" "}
            Zona Este 3D
          </Navbar.Brand>
        </Link>

        <Navbar.Toggle aria-controls="basic-navbar-nav" />
        <Navbar.Collapse id="basic-navbar-nav">
          <Nav className="me-auto ">
            <Link to="/" className="nav-link">
              Inicio
            </Link>
            <Link to="/category/makers" className="nav-link" >
              Makers
            </Link>
            <Link to="/category/filamentos" className="nav-link">
              Filamentos
            </Link>
            <Link to="/category/impresoras" className="nav-link">
              Impresoras
            </Link>
            <Link to="/search-order" className="nav-link">
              Ordenes
            </Link>
            {isAdmin && (
              <Link to="/admin" className="nav-link">
                Admin
              </Link>
            )}
            <Nav.Link className="nav-link" href="#footer">
              Contacto
            </Nav.Link>
            <Link to="/cart">
              <CartWidget className="nav-cart"></CartWidget>
            </Link>
          </Nav>
          {isAuthReady &&(
          user 
          ? (
          <Nav className="ml-auto" >
            <NavDropdown title={<PersonFill color="#1f5570" size={30}/>}>
              <NavDropdown.Item as={Link} to="/my-orders" className="text-decoration-none text-black">
                Mis pedidos
              </NavDropdown.Item>
              {isAdmin && (
                <NavDropdown.Item as={Link} to="/admin" className="text-decoration-none text-black">
                  Panel administrador
                </NavDropdown.Item>
              )}
              <NavDropdown.Divider />
              <NavDropdown.Item onClick={handleLogout} className="text-danger">Cerrar sesión</NavDropdown.Item>
          </NavDropdown>
          </Nav>)
          : (
          <div className="d-flex">
            <Link to="/login">
              <button className="login-button">
                Iniciar sesión
              </button>
            </Link>
            <Link to="/register">
              <button className="register-button mx-2">
                Registrarse
              </button>
            </Link>
            
          </div>))
        }
        </Navbar.Collapse>
      </Container>
    </Navbar>
  );
};

export default NavbarComp;
