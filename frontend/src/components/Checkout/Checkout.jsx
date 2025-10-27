import { useContext, useEffect, useRef, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import Swal from "sweetalert2";
import { Button, Card, Col, Form, Row } from "react-bootstrap";

import { CartStateContext } from "../../context/CartContext";
import { AuthCtxt } from "../../context/AuthContext";

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || "/api";

const initialFormState = (user) => ({
  nombre: [user?.firstName, user?.lastName].filter(Boolean).join(" "),
  telefono: user?.phone ?? "",
  email: user?.email ?? "",
  dni: user?.dni ?? "",
  shippingMethod: "pickup",
  street: "",
  number: "",
  city: "",
  province: "",
  postalCode: "",
  notes: "",
});

const Checkout = () => {
  const navigate = useNavigate();
  const { user } = useContext(AuthCtxt);
  const {
    cartList,
    calcTotalPrice,
    calcTotalQuantity,
    subTotal,
    removeCartList,
  } = useContext(CartStateContext);

  const [form, setForm] = useState(() => initialFormState(user));
  const [isSubmitting, setIsSubmitting] = useState(false);
  const isRedirectingRef = useRef(false);
  useEffect(() => {
    const combinedName = [user?.firstName, user?.lastName]
      .filter(Boolean)
      .join(" ");

    setForm((prev) => ({
      ...prev,
      email: user?.email ?? prev.email,
      nombre: combinedName || prev.nombre,
      telefono: user?.phone ?? prev.telefono,
      dni: user?.dni ?? prev.dni,
    }));
  }, [user]);


  useEffect(() => {
    if (!user) {
      navigate("/login", { replace: true });
      return;
    }

    if (cartList.length === 0) {
      if (isRedirectingRef.current) {
        return;
      }

      Swal.fire({
        icon: "info",
        title: "Tu carrito esta vacio",
        text: "Agrega productos antes de avanzar al checkout.",
        confirmButtonText: "Ir al carrito",
      }).finally(() => {
        navigate("/cart", { replace: true });
      });
    }
  }, [user, cartList, navigate]);

  const handleChange = (event) => {
    const { name, value } = event.target;
    setForm((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const isDelivery = form.shippingMethod === "delivery";


  const validateForm = () => {
    if (!form.nombre.trim() || !form.telefono.trim() || !form.email.trim() || !form.dni.trim()) {
      Swal.fire({
        icon: "warning",
        title: "Datos incompletos",
        text: "Completa tus datos personales desde Mi perfil antes de continuar.",
      });
      return false;
    }

    if (isDelivery) {
      if (
        !form.street.trim() ||
        !form.number.trim() ||
        !form.city.trim() ||
        !form.province.trim() ||
        !form.postalCode.trim()
      ) {
        Swal.fire({
          icon: "warning",
          title: "Direccion incompleta",
          text: "Ingresa todos los campos del domicilio para el envio.",
        });
        return false;
      }
    }

    if (!API_BASE_URL) {
      Swal.fire({
        icon: "error",
        title: "Configuracion faltante",
        text: "No encontramos la URL del backend. Revisa las variables de entorno.",
      });
      return false;
    }

    return true;
  };

  const handleSubmit = async (event) => {
    event.preventDefault();

    if (cartList.length === 0) {
      navigate("/cart", { replace: true });
      return;
    }

    if (!validateForm()) {
      return;
    }

    const shipping =
      form.shippingMethod === "delivery"
        ? {
            method: "delivery",
            address: {
              street: form.street.trim(),
              number: form.number.trim(),
              city: form.city.trim(),
              province: form.province.trim(),
              postalCode: form.postalCode.trim(),
              ...(form.notes.trim() ? { notes: form.notes.trim() } : {}),
            },
          }
        : { method: "pickup" };

    const buyerPayload = {
      nombre: form.nombre.trim(),
      telefono: form.telefono.trim(),
      email: form.email.trim(),
      dni: form.dni.trim(),
    };

    try {
      setIsSubmitting(true);

      const response = await fetch(`${API_BASE_URL}/checkout`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          buyer: buyerPayload,
          shipping,
          items: cartList.map((item) => ({
            id: item.id,
            nombre: item.nombre,
            precio: item.precio,
            cantidad: item.qty,
            imgUrl: item.imgUrl,
          })),
        }),
      });

      if (!response.ok) {
        const errorBody = await response.json().catch(() => ({}));
        throw new Error(errorBody.message || "No se pudo iniciar el checkout.");
      }

      const data = await response.json();
      const redirectUrl = data.initPoint || data.sandboxInitPoint;

      if (!redirectUrl) {
        throw new Error("Mercado Pago no devolvio una URL valida.");
      }

      sessionStorage.setItem("zonaeste3d:lastOrderId", data.orderId);
      sessionStorage.setItem("zonaeste3d:lastOrderStatus", "pending");

      await Swal.fire({
        icon: "success",
        title: "Ya casi listo",
        text: "Te redirigimos a Mercado Pago para completar el pago.",
        confirmButtonText: "Continuar",
      });

      isRedirectingRef.current = true;
      removeCartList();
      window.location.href = redirectUrl;
    } catch (error) {
      await Swal.fire({
        icon: "error",
        title: "No pudimos generar el pago",
        text: error.message,
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <section className="container" style={{ marginTop: "8rem", marginBottom: "3rem" }}>
      <Row className="g-4">
        <Col lg={8}>
          <Card className="shadow-sm border-0">
            <Card.Header className="bg-primary text-white">
              <h2 className="h5 mb-0">Datos para el checkout</h2>
            </Card.Header>
            <Card.Body>
              <Form onSubmit={handleSubmit} className="p-2">
                <Row className="g-3">
                  <Col md={6}>
                    <Form.Group controlId="checkoutNombre">
                      <Form.Label>Nombre y apellido</Form.Label>
                      <Form.Control
                        type="text"
                        name="nombre"
                        value={form.nombre}
                        readOnly
                      />
                    </Form.Group>
                  </Col>
                  <Col md={6}>
                    <Form.Group controlId="checkoutTelefono">
                      <Form.Label>Telefono</Form.Label>
                      <Form.Control
                        type="tel"
                        name="telefono"
                        value={form.telefono}
                        readOnly
                      />
                    </Form.Group>
                  </Col>
                  <Col md={6}>
                    <Form.Group controlId="checkoutEmail">
                      <Form.Label>Email</Form.Label>
                      <Form.Control type="email" value={form.email} readOnly />
                    </Form.Group>
                  </Col>
                  <Col md={6}>
                    <Form.Group controlId="checkoutDni">
                      <Form.Label>DNI</Form.Label>
                      <Form.Control type="text" value={form.dni} readOnly />
                    </Form.Group>
                  </Col>
                </Row>
                <div className="mt-2">
                  <small className="text-muted">
                    Necesitas actualizar tus datos? <Link to="/profile">Ir a mi perfil</Link>
                  </small>
                </div>

                <hr className="my-4" />

                <Form.Group>
                  <Form.Label className="fw-bold">Forma de entrega *</Form.Label>
                  <div className="d-flex gap-3">
                    <Form.Check
                      type="radio"
                      id="shipping-pickup"
                      label="Retiro en sucursal"
                      name="shippingMethod"
                      value="pickup"
                      checked={form.shippingMethod === "pickup"}
                      onChange={handleChange}
                    />
                    <Form.Check
                      type="radio"
                      id="shipping-delivery"
                      label="Envio a domicilio"
                      name="shippingMethod"
                      value="delivery"
                      checked={form.shippingMethod === "delivery"}
                      onChange={handleChange}
                    />
                  </div>
                </Form.Group>

                {isDelivery ? (
                  <div className="mt-3">
                    <Row className="g-3">
                      <Col md={6}>
                        <Form.Group controlId="shippingStreet">
                          <Form.Label>Calle *</Form.Label>
                          <Form.Control
                            type="text"
                            name="street"
                            value={form.street}
                            onChange={handleChange}
                            placeholder="Ej: Av. Siempre Viva"
                          />
                        </Form.Group>
                      </Col>
                      <Col md={2}>
                        <Form.Group controlId="shippingNumber">
                          <Form.Label>Numero *</Form.Label>
                          <Form.Control
                            type="text"
                            name="number"
                            value={form.number}
                            onChange={handleChange}
                            placeholder="Ej: 742"
                          />
                        </Form.Group>
                      </Col>
                      <Col md={4}>
                        <Form.Group controlId="shippingCity">
                          <Form.Label>Ciudad *</Form.Label>
                          <Form.Control
                            type="text"
                            name="city"
                            value={form.city}
                            onChange={handleChange}
                            placeholder="Ej: Buenos Aires"
                          />
                        </Form.Group>
                      </Col>
                      <Col md={4}>
                        <Form.Group controlId="shippingProvince">
                          <Form.Label>Provincia *</Form.Label>
                          <Form.Control
                            type="text"
                            name="province"
                            value={form.province}
                            onChange={handleChange}
                            placeholder="Ej: Buenos Aires"
                          />
                        </Form.Group>
                      </Col>
                      <Col md={4}>
                        <Form.Group controlId="shippingPostalCode">
                          <Form.Label>Codigo postal *</Form.Label>
                          <Form.Control
                            type="text"
                            name="postalCode"
                            value={form.postalCode}
                            onChange={handleChange}
                            placeholder="Ej: 1430"
                          />
                        </Form.Group>
                      </Col>
                      <Col md={4}>
                        <Form.Group controlId="shippingNotes">
                          <Form.Label>Notas (opcional)</Form.Label>
                          <Form.Control
                            as="textarea"
                            rows={2}
                            name="notes"
                            value={form.notes}
                            onChange={handleChange}
                            placeholder="Indicaciones para el reparto"
                          />
                        </Form.Group>
                      </Col>
                    </Row>
                  </div>
                ) : null}

                <div className="d-flex gap-2 mt-4">
                  <Button
                    type="submit"
                    variant="success"
                    className="px-4"
                    disabled={isSubmitting || cartList.length === 0}
                  >
                    {isSubmitting ? "Generando pago..." : "Pagar con Mercado Pago"}
                  </Button>
                  <Button
                    type="button"
                    variant="outline-secondary"
                    onClick={() => navigate("/cart")}
                    disabled={isSubmitting}
                  >
                    Volver al carrito
                  </Button>
                </div>
              </Form>
            </Card.Body>
          </Card>
        </Col>
        <Col lg={4}>
          <Card className="shadow-sm border-0">
            <Card.Header className="bg-light">
              <h2 className="h5 mb-0">Resumen</h2>
            </Card.Header>
            <Card.Body>
              <div className="d-flex justify-content-between mb-2">
                <span className="text-muted">Cantidad total</span>
                <span className="fw-semibold">{calcTotalQuantity()}</span>
              </div>
              <div className="mb-3">
                {cartList.map((item) => (
                  <div className="d-flex justify-content-between align-items-start mb-2" key={item.id}>
                    <div className="me-3">
                      <p className="fw-semibold mb-0">{item.nombre}</p>
                      <small className="text-muted">
                        Cantidad: {item.qty} • $ {item.precio.toLocaleString("es-ES")}
                      </small>
                    </div>
                    <span className="fw-semibold text-nowrap">
                      $ {subTotal(item.id).toLocaleString("es-ES")}
                    </span>
                  </div>
                ))}
              </div>
              <div className="d-flex justify-content-between align-items-center py-2 border-top border-bottom my-3">
                <span className="fw-bold">Total</span>
                <span className="fw-bold text-success">
                  $ {calcTotalPrice().toLocaleString("es-ES")}
                </span>
              </div>
              <p className="text-muted small mb-0">
                Revisaremos tu pedido apenas se confirme el pago y te contactaremos para coordinar la entrega.
              </p>
            </Card.Body>
          </Card>
        </Col>
      </Row>
      <div className="text-center mt-4">
        <Link to="/" className="text-decoration-none">
          <Button variant="link">Seguir explorando productos</Button>
        </Link>
      </div>
    </section>
  );
};

export default Checkout;
