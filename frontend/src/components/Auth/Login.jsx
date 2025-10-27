import { useState, useContext } from "react";
import { Link, useNavigate } from "react-router-dom";
import { EyeFill, EyeSlashFill } from "react-bootstrap-icons";
import Swal from "sweetalert2";
import { toast } from "react-toastify";

import Layout from "../Layout/Layout";
import { AuthCtxt } from "../../context/AuthContext";
import "./Forms.css";

const Login = () => {
  const { login, resetPassword } = useContext(AuthCtxt);
  const navigate = useNavigate();

  const [credentials, setCredentials] = useState({ email: "", password: "" });
  const [error, setError] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleChange = ({ target: { name, value } }) => {
    setError("");
    setCredentials((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (event) => {
    event.preventDefault();

    const { email, password } = credentials;
    if (!email.trim() || !password.trim()) {
      setError("Debe completar todos los campos.");
      return;
    }

    try {
      setIsSubmitting(true);
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
          "Cuenta temporalmente bloqueada por intentos fallidos. Restablece tu contraseña o intenta mas tarde."
        );
      } else {
        setError("No pudimos iniciar sesion. Intentalo mas tarde.");
      }
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleResetPassword = async () => {
    const { value: email } = await Swal.fire({
      title: "Restablecer contraseña",
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

  const togglePasswordVisibility = () => {
    setShowPassword((prev) => !prev);
  };

  return (
    <Layout>
      <section className="auth-wrapper">
        <div className="auth-card">
          <header className="auth-card__header">
            <h1 className="auth-card__title">Bienvenido nuevamente</h1>
            <p className="auth-card__subtitle">
              Inicia sesion para seguir tus pedidos y finalizar tus compras
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
                value={credentials.email}
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
                  placeholder="Tu contraseña"
                  value={credentials.password}
                  onChange={handleChange}
                />
                <span className="auth-toggle" onClick={togglePasswordVisibility}>
                  {showPassword ? <EyeSlashFill /> : <EyeFill />}
                </span>
              </div>
            </div>

            <div className="auth-secondary-action auth-secondary-action--center">
              <button type="button" className="auth-ghost-button" onClick={handleResetPassword}>
                Olvide mi contraseña
              </button>
            </div>

            <div className="auth-actions">
              <button type="submit" className="auth-primary-button login-btn" disabled={isSubmitting}>
                {isSubmitting ? (
                  <>
                    <span className="auth-spinner auth-spinner--light" />Ingresando...
                  </>
                ) : (
                  "Ingresar"
                )}
              </button>
            </div>
          </form>

          <footer className="auth-footer">
            Todavia no tienes una cuenta? <Link to="/register">Registrate</Link>
          </footer>
        </div>
      </section>
    </Layout>
  );
};

export default Login;
