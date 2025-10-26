import { useState,useContext } from "react";
import { Link,useNavigate } from "react-router-dom";

import Layout from "../Layout/Layout";
import "./Forms.css";
import { Google, EyeFill, EyeSlashFill } from "react-bootstrap-icons";
import { AuthCtxt} from "../../context/AuthContext";
import Swal from 'sweetalert2';

const Register = () => {
  const {register,loginWithGoogle} = useContext(AuthCtxt);
  const navigate = useNavigate();
  const [user, setUser] = useState({email: '',password: '',})
  const [error, setError] = useState();
  const [showPassword, setShowPassword] = useState(false);

  const Toast = Swal.mixin({
    toast: true,
    position: 'top-end',
    showConfirmButton: false,
    timer: 3000,
    timerProgressBar: true,
    didOpen: (toast) => {
      toast.addEventListener('mouseenter', Swal.stopTimer)
      toast.addEventListener('mouseleave', Swal.resumeTimer)
    }
  })

  const handleChange = ({target: {name,value}}) => {
    setUser({...user,[name]: value})
  }
  const handleSubmit = async (e) => {
    const {email,password} = user;
    e.preventDefault();
    if (!email.trim() || !password.trim()) {
      setError("Debe completar todos los campos.");
      return;
    }
    if (password.length < 6) {
      setError("La contraseña debe tener al menos 6 caracteres.");
      return;
    }
    try {
      await register(email,password);
      Toast.fire({
        icon: 'success',
        title: 'Registro exitoso'
      })
      navigate("/")
    } catch (err) {
      if (err.code === "auth/invalid-email") {
        setError("El correo ingresado no es válido.");
      } else if (err.code === "auth/weak-password") {
        setError("La contraseña debe tener al menos 6 caracteres");
      } else if (err.code === "auth/email-already-in-use") {
        setError("El correo ingresado ya se encuentra en uso");
      } else {
        setError("Ha ocurrido un error inesperado. Por favor, inténtelo de nuevo más tarde");
      }
    }  
  }
  const handleGoogleLogin = async () => {
    try {
      await loginWithGoogle();
      Toast.fire({
        icon: 'success',
        title: 'Registro exitoso'
      })
      navigate("/");
    } catch (err) {
      if (err.code === "auth/popup-closed-by-user") {
        setError(
          "Error al iniciar sesión con google. Asegúrate de seleccionar una cuenta antes de cerrar la ventana."
        );
      }
    }
  };
  const handleShowPassword = () => {
    setShowPassword(!showPassword)
  }
  return (
    <Layout>
      <div className="register-container">
        <div className="form-box form-box-bg-register">
          <form className="form" onSubmit={handleSubmit}>
            <span className="title">Crear una cuenta</span>
            {error && <span className="error">{error}</span>}
            <div className="form-container">
              <input name='email' type="email" className="input" placeholder="Email" onChange={handleChange}/>
              <div className="password-input-container" >
                <input
                  name="password"
                  type={showPassword ? "text" : "password"}
                  className="input"
                  placeholder="Contraseña"
                  onChange={handleChange}
                />
                <span className="password-toggle-icon" onClick={handleShowPassword}>
                  {showPassword ? <EyeSlashFill /> : <EyeFill />}
                </span>
              </div>
            </div>
            <button className="register-btn">Registrarme</button>
          </form>
          <hr />
          <button className="google-login-button" onClick={handleGoogleLogin}>
            <Google size={20} color="red" className="me-2" />
            Continuar con google
          </button>
          <div className="form-section form-section-bg-register">
            <p>
             ¿Ya tienes una cuenta? <Link to="/login">Iniciar sesión</Link>
            </p>
          </div>
        </div>
      </div>
    </Layout>
  );
};

export default Register;
