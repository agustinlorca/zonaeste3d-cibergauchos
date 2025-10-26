import { useState, useContext } from "react";
import { Link, useNavigate } from "react-router-dom";
import { AuthCtxt } from "../../context/AuthContext";

import Layout from "../Layout/Layout";
import "./Forms.css";
import { Google, EyeFill, EyeSlashFill } from "react-bootstrap-icons";
import Swal from "sweetalert2";
import { toast } from "react-toastify";

const Login = () => {
  const { login, loginWithGoogle, resetPassword } = useContext(AuthCtxt);
  const navigate = useNavigate();
  const [user, setUser] = useState({ email: "", password: "" });
  const [error, setError] = useState();
  const [showPassword, setShowPassword] = useState(false);

  const handleChange = ({ target: { name, value } }) => {
    setUser({ ...user, [name]: value });
  };
  const handleSubmit = async (e) => {
    const { email, password } = user;
    setError("");
    e.preventDefault();
    if (!email.trim() || !password.trim()) {
      setError("Debe completar todos los campos.");
      return;
    }

    try {
      await login(email, password);
      toast.success(`Inicio de sesión exitoso`, {
        position: "top-center",
        autoClose: 1500,
        hideProgressBar: true,
        closeOnClick: false,
        pauseOnHover: true,
        draggable: true,
        progress: undefined,
        theme: "light",
      });
      navigate("/");
    } catch (err) {
      if (err.code === "auth/invalid-login-credentials") {
        setError("Los datos ingresados son incorrectos. Intente nuevamente.");
      }
      if (err.code === "auth/too-many-requests") {
        setError(
          "Esta cuenta ha sido temporalmente desactivada debido a que has superado la" +
            "cantidad de ingresos fallidos. Puedes restablecer tu contraseña o intenta de nuevo más tarde."
        );
      }
    }
  };
  const handleGoogleLogin = async () => {
    try {
      await loginWithGoogle();
      navigate("/");
    } catch (err) {
      if (err.code === "auth/popup-closed-by-user") {
        setError(
          "Error al iniciar sesión con google. Asegúrate de seleccionar una cuenta antes de cerrar la ventana."
        );
      }
    }
  };
  const handleResetPassword = async () => {
    const { value: email } = await Swal.fire({
      title: "Restablecer contraseña",
      input: "email",
      inputLabel: "Ingresa tu correo electrónico",
      inputPlaceholder: "email",
      showCancelButton: true,
      inputValidator: (value) => {
        if (!value) {
          return "Por favor ingresa un email";
        }
      },
    });
    if (email) {
      console.log("email proporcionado", email);
      try {
        await resetPassword(email);
        Swal.fire(
          "Éxito",
          "Se ha enviado un enlace al correo electrónico proporcionado",
          "success"
        );
      } catch (err) {
        console.error("Error al restablecer la contraseña", err);
        Swal.fire("Error", err.message, "error");
      }
      navigate("/");
    }
  };
  const handleShowPassword = () => {
    setShowPassword(!showPassword)
  }
  return (
    <Layout>
      <div className="login-container">
        <div className="form-box form-box-bg-login">
          <form className="form" onSubmit={handleSubmit}>
            <span className="title">Iniciar sesión</span>
            {error && <span className="error">{error}</span>}
            <div className="form-container">
              <input name="email" type="email" className="input" placeholder="Email" onChange={handleChange}/>
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
            <a href="#" className="forgot-password" onClick={handleResetPassword}>
              Restablecer contraseña
            </a>
            <button className="login-btn">Ingresar</button>
          </form>
          <hr />
          <button className="google-login-button" onClick={handleGoogleLogin}>
            <Google size={20} color="red" className="me-2" />
            Iniciar sesión con google
          </button>
          <div className="form-section form-section-bg-login">
            <p>
              ¿Todavía no tienes una cuenta?
              <Link to="/register"> Registrarse</Link>
            </p>
          </div>
        </div>
      </div>
    </Layout>
  );
};

export default Login;
