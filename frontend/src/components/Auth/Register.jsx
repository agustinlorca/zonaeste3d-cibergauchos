import { useState, useContext, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import { EyeFill, EyeSlashFill } from "react-bootstrap-icons";
import Swal from "sweetalert2";

import Layout from "../Layout/Layout";
import { AuthCtxt } from "../../context/AuthContext";
import SpinnerLoader from "../SpinnerLoader/SpinnerLoader";
import "./Forms.css";

const Register = () => {
  const { register, user, isAuthReady } = useContext(AuthCtxt);
  const navigate = useNavigate();

  const [formValues, setFormValues] = useState({
    firstName: "",
    lastName: "",
    phone: "",
    dni: "",
    email: "",
    password: "",
    confirmPassword: "",
  });
  const [error, setError] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleChange = ({ target: { name, value } }) => {
    setError("");
    setFormValues((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (event) => {
    event.preventDefault();

    const {
      firstName,
      lastName,
      phone,
      dni,
      email,
      password,
      confirmPassword,
    } = formValues;

    if (
      !firstName.trim() ||
      !lastName.trim() ||
      !phone.trim() ||
      !dni.trim() ||
      !email.trim() ||
      !password.trim() ||
      !confirmPassword.trim()
    ) {
      setError("Debe completar todos los campos.");
      return;
    }

    if (password.length < 6) {
      setError("La contraseña debe tener al menos 6 caracteres.");
      return;
    }

    if (password !== confirmPassword) {
      setError("Las contraseñas no coinciden.");
      return;
    }

    if (!/^[0-9]+$/.test(phone)) {
      setError("El telefono solo puede contener numeros.");
      return;
    }

    if (!/^[0-9]+$/.test(dni)) {
      setError("El DNI solo puede contener numeros.");
      return;
    }

    try {
      setIsSubmitting(true);
      const registeredUser = await register(email, password, {
        firstName: firstName.trim(),
        lastName: lastName.trim(),
        phone: phone.trim(),
        dni: dni.trim(),
      });

      Swal.fire({
        icon: "success",
        title: "Registro exitoso",
        timer: 1800,
        showConfirmButton: false,
      });

      const destination = registeredUser?.role === "admin" ? "/admin" : "/";
      navigate(destination, { replace: true });
    } catch (err) {
      if (err.code === "auth/invalid-email") {
        setError("El correo ingresado no es valido.");
      } else if (err.code === "auth/weak-password") {
        setError("La contraseña debe tener al menos 6 caracteres");
      } else if (err.code === "auth/email-already-in-use") {
        setError("El correo ingresado ya se encuentra en uso");
      } else {
        setError(
          "Ha ocurrido un error inesperado. Por favor, intentelo de nuevo mas tarde"
        );
      }
    } finally {
      setIsSubmitting(false);
    }
  };

  const togglePasswordVisibility = () => {
    setShowPassword((prev) => !prev);
  };

  useEffect(() => {
    if (!isAuthReady || !user) {
      return;
    }

    const destination = user?.role === "admin" ? "/admin" : "/";
    navigate(destination, { replace: true });
  }, [isAuthReady, navigate, user]);

  if (!isAuthReady || user) {
    return (
      <Layout>
        <SpinnerLoader />
      </Layout>
    );
  }

  return (
    <Layout>
      <section className="auth-wrapper">
        <div className="auth-card auth-card--wide">
          <header className="auth-card__header">
            <h1 className="auth-card__title">Crear cuenta</h1>
            <p className="auth-card__subtitle">
              Completa tus datos para empezar a disfrutar de la tienda
            </p>
          </header>

          {error && <div className="auth-error">{error}</div>}

          <form className="auth-form" onSubmit={handleSubmit}>
            <div className="auth-form__grid auth-form__grid--two">
              <div className="auth-form__group">
                <label className="auth-label" htmlFor="firstName">Nombre</label>
                <input
                  id="firstName"
                  name="firstName"
                  type="text"
                  className="auth-input"
                  placeholder="Nombre"
                  value={formValues.firstName}
                  onChange={handleChange}
                />
              </div>
              <div className="auth-form__group">
                <label className="auth-label" htmlFor="lastName">Apellido</label>
                <input
                  id="lastName"
                  name="lastName"
                  type="text"
                  className="auth-input"
                  placeholder="Apellido"
                  value={formValues.lastName}
                  onChange={handleChange}
                />
              </div>
              <div className="auth-form__group">
                <label className="auth-label" htmlFor="phone">Telefono</label>
                <input
                  id="phone"
                  name="phone"
                  type="tel"
                  className="auth-input"
                  placeholder="Ej: 1122334455"
                  value={formValues.phone}
                  onChange={handleChange}
                />
              </div>
              <div className="auth-form__group">
                <label className="auth-label" htmlFor="dni">DNI</label>
                <input
                  id="dni"
                  name="dni"
                  type="text"
                  className="auth-input"
                  placeholder="Ej: 12345678"
                  value={formValues.dni}
                  onChange={handleChange}
                />
              </div>
              <div className="auth-form__group auth-form__group--full">
                <label className="auth-label" htmlFor="email">Email</label>
                <input
                  id="email"
                  name="email"
                  type="email"
                  className="auth-input"
                  placeholder="tu@email.com"
                  value={formValues.email}
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
                    placeholder="Crear contraseña"
                  value={formValues.password}
                    onChange={handleChange}
                  />
                  <span className="auth-toggle" onClick={togglePasswordVisibility}>
                    {showPassword ? <EyeSlashFill /> : <EyeFill />}
                  </span>
                </div>
              </div>
              <div className="auth-form__group">
                <label className="auth-label" htmlFor="confirmPassword">Confirmar contraseña</label>
                <div className="auth-input-wrapper">
                  <input
                    id="confirmPassword"
                    name="confirmPassword"
                    type={showPassword ? "text" : "password"}
                    className="auth-input"
                    placeholder="Repetir contraseña"
                  value={formValues.confirmPassword}
                    onChange={handleChange}
                  />
                  <span className="auth-toggle" onClick={togglePasswordVisibility}>
                    {showPassword ? <EyeSlashFill /> : <EyeFill />}
                  </span>
                </div>
              </div>
            </div>

            <div className="auth-actions">
              <button type="submit" className="auth-primary-button" disabled={isSubmitting}>
                {isSubmitting ? (
                  <>
                    <span className="auth-spinner auth-spinner--light" />Creando cuenta...
                  </>
                ) : (
                  "Registrarme"
                )}
              </button>
            </div>
          </form>

          <footer className="auth-footer">
            Ya tienes una cuenta? <Link to="/login">Iniciar sesion</Link>
          </footer>
        </div>
      </section>
    </Layout>
  );
};

export default Register;
