import { useContext, useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { Button, Card, Col, Form, Row } from "react-bootstrap";
import Swal from "sweetalert2";

import Layout from "../../components/Layout/Layout";
import { AuthCtxt } from "../../context/AuthContext";

const ProfileView = () => {
  const { user, isAuthReady, updateUserProfile } = useContext(AuthCtxt);
  const navigate = useNavigate();
  const [form, setForm] = useState({
    firstName: "",
    lastName: "",
    phone: "",
    email: "",
    dni: "",
  });
  const [isSaving, setIsSaving] = useState(false);

  useEffect(() => {
    if (user) {
      setForm({
        firstName: user.firstName ?? "",
        lastName: user.lastName ?? "",
        phone: user.phone ?? "",
        email: user.email ?? "",
        dni: user.dni ?? "",
      });
    }
  }, [user]);

  useEffect(() => {
    if (isAuthReady && !user) {
      navigate("/login", { replace: true });
    }
  }, [isAuthReady, user, navigate]);

  const handleChange = ({ target: { name, value } }) => {
    setForm((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (event) => {
    event.preventDefault();

    if (!form.firstName.trim() || !form.lastName.trim() || !form.phone.trim()) {
      Swal.fire({
        icon: "warning",
        title: "Datos incompletos",
        text: "Completa nombre, apellido y telefono para actualizar tu perfil.",
      });
      return;
    }

    if (!/^[0-9]+$/.test(form.phone)) {
      Swal.fire({
        icon: "warning",
        title: "Telefono invalido",
        text: "El telefono solo puede contener numeros.",
      });
      return;
    }

    try {
      setIsSaving(true);
      await updateUserProfile({
        firstName: form.firstName.trim(),
        lastName: form.lastName.trim(),
        phone: form.phone.trim(),
      });
      Swal.fire({
        icon: "success",
        title: "Perfil actualizado",
        timer: 2000,
        showConfirmButton: false,
      });
    } catch (error) {
      Swal.fire({
        icon: "error",
        title: "No pudimos actualizar",
        text: error.message || "Intentalo de nuevo mas tarde.",
      });
    } finally {
      setIsSaving(false);
    }
  };

  if (!user) {
    return null;
  }

  return (
    <Layout>
      <section className="container" style={{ marginTop: "8rem", marginBottom: "3rem" }}>
        <Row className="justify-content-center">
          <Col lg={8} xl={6}>
            <Card className="shadow-sm border-0">
              <Card.Header className="bg-primary text-white">
                <h1 className="h4 mb-0">Mi perfil</h1>
              </Card.Header>
              <Card.Body>
                <Form onSubmit={handleSubmit} className="p-1">
                  <Row className="g-3">
                    <Col md={6}>
                      <Form.Group controlId="profileFirstName">
                        <Form.Label>Nombre *</Form.Label>
                        <Form.Control
                          type="text"
                          name="firstName"
                          value={form.firstName}
                          onChange={handleChange}
                          placeholder="Tu nombre"
                        />
                      </Form.Group>
                    </Col>
                    <Col md={6}>
                      <Form.Group controlId="profileLastName">
                        <Form.Label>Apellido *</Form.Label>
                        <Form.Control
                          type="text"
                          name="lastName"
                          value={form.lastName}
                          onChange={handleChange}
                          placeholder="Tu apellido"
                        />
                      </Form.Group>
                    </Col>
                    <Col md={6}>
                      <Form.Group controlId="profilePhone">
                        <Form.Label>Telefono *</Form.Label>
                        <Form.Control
                          type="tel"
                          name="phone"
                          value={form.phone}
                          onChange={handleChange}
                          placeholder="Ej: 1122334455"
                        />
                      </Form.Group>
                    </Col>
                    <Col md={6}>
                      <Form.Group controlId="profileEmail">
                        <Form.Label>Email</Form.Label>
                        <Form.Control type="text" value={form.email} readOnly disabled />
                      </Form.Group>
                    </Col>
                    <Col md={6}>
                      <Form.Group controlId="profileDni">
                        <Form.Label>DNI</Form.Label>
                        <Form.Control type="text" value={form.dni} readOnly disabled />
                      </Form.Group>
                    </Col>
                  </Row>
                  <div className="d-flex gap-2 mt-4">
                    <Button type="submit" variant="primary" disabled={isSaving}>
                      {isSaving ? "Guardando..." : "Guardar cambios"}
                    </Button>
                    <Button
                      type="button"
                      variant="outline-secondary"
                      disabled={isSaving}
                      onClick={() => setForm({
                        firstName: user.firstName ?? "",
                        lastName: user.lastName ?? "",
                        phone: user.phone ?? "",
                        email: user.email ?? "",
                        dni: user.dni ?? "",
                      })}
                    >
                      Restablecer
                    </Button>
                  </div>
                </Form>
              </Card.Body>
            </Card>
          </Col>
        </Row>
      </section>
    </Layout>
  );
};

export default ProfileView;
