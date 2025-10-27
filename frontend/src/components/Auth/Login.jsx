import { useState, useContext } from "react";
import { Link, useNavigate } from "react-router-dom";
import { Google, EyeFill, EyeSlashFill } from "react-bootstrap-icons";
import Swal from "sweetalert2";
import { toast } from "react-toastify";

import Layout from "../Layout/Layout";
import { AuthCtxt } from "../../context/AuthContext";
import "./Forms.css";

const Login = () => {
  const { login, loginWithGoogle, resetPassword } = useContext(AuthCtxt);
  const navigate = useNavigate();
  const [user, setUser] = useState({ email: "", password: "" });
  const [error, setError] = useState("");
  const [showPassword, setShowPassword] = useState(false);

  const handleChange = ({ target: { name, value } }) => {
    setError("");
    setUser((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (event) => {
    event.preventDefault();
    const { email, password } = user;

    if (!email.trim() || !password.trim()) {
      setError("Debe completar todos los campos.");
      return;
    }

    try {
      await login(email, password);
      toast.success("Inicio de sesion exitoso", {
        position: "top-center",
        autoClose: 1500,
        hideProgressBar: true,
        closeOnClick: false,
        pauseOnHover: true,
      });
      navigate("/");
    } catch (err) {
      if (err.code === "auth/invalid-login-credentials") {
        setError("Los datos ingresados son incorrectos. Intente nuevamente.");
      } else if (err.code === "auth/too-many-requests") {
        setError(
          "Cuenta temporalmente bloqueada por intentos fallidos. Restablecé tu contraseña o intenta más tarde."
        );
      } else {
        setError("No pudimos iniciar sesión. Intentalo más tarde.");
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
          "Error al iniciar sesion con Google. Selecciona una cuenta antes de cerrar la ventana."
        );
      }
    }
  };

  const handleResetPassword = async () => {
    const { value: email } = await Swal.fire({
      title: "Restablecer contrasena",
      input: "email",
      inputLabel: "Ingresa tu correo electronico",
      showCancelButton: true,
      confirmButtonText: "Enviar",
      cancelButtonText: "Cancelar",
      inputValidator: (value) => {
        if (!value) {
          return "Ingresa un email valido";
        }
        return null;
      },
    });

    if (!email) {
      return;
    }

    try {
      await resetPassword(email);
      Swal.fire("Listo", "Te enviamos un enlace para recuperar tu contraseña", "success");
    } catch (err) {
      Swal.fire("Error", err.message, "error");
    }
  };

  const handleShowPassword = () => {
    setShowPassword((prev) => !prev);
  };

  return (
    <Layout>
      <section className="auth-wrapper">
        <div className="auth-card">
          <header className="auth-card__header">
            <h1 className="auth-card__title">Bienvenido nuevamente</h1>
            <p className="auth-card__subtitle">
              Inicia sesión para seguir tus pedidos y finalizar tus compras
            </p>
          </header>

          {error && <div className="auth-error">{error}</div>}

          <form className="auth-form" onSubmit={handleSubmit}>
            <div className="auth-form__group">
              <label className="auth-label" htmlFor="email">Email</label>
              <input
                id="email"
                name="email"
                type="email"
                className="auth-input"
                placeholder="tu@email.com"
                value={user.email}
                onChange={handleChange}
              />
            </div>

            <div className="auth-form__group">
              <label className="auth-label" htmlFor="password">Contraseña</label>
              <div className="auth-input-wrapper">
                <input
                  id="password"
                  name="password"
                  type={showPassword ? "text" : "password"}
                  className="auth-input"
                  placeholder="Tu contrasena"
                  value={user.password}
                  onChange={handleChange}
                />
                <span className="auth-toggle" onClick={handleShowPassword}>
                  {showPassword ? <EyeSlashFill /> : <EyeFill />}
                </span>
              </div>
            </div>

            <div className="auth-secondary-action">
              <button type="button" className="auth-ghost-button" onClick={handleResetPassword}>
                Olvidé mi contraseña
              </button>
            </div>

            <div className="auth-actions">
              <button type="submit" className="auth-primary-button">
                Ingresar
              </button>
              <button
                type="button"
                className="auth-google-button"
                onClick={handleGoogleLogin}
              >
                <Google size={20} color="red" /> Iniciar sesión con Google
              </button>
            </div>
          </form>

          <footer className="auth-footer">
            ¿Todavía no tienes una cuenta? <Link to="/register">Regístrate</Link>
          </footer>
        </div>
      </section>
    </Layout>
  );
};

export default Login;
