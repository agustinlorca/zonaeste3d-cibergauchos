import { Row, Col, Table, Card, Badge } from "react-bootstrap";
import "./OrderDetail.css";

const statusLabels = {
  pendiente: { label: "Pendiente", variant: "secondary" },
  pagado: { label: "Pagado", variant: "primary" },
  preparando: { label: "Preparando", variant: "info" },
  enviado: { label: "Enviado", variant: "warning" },
  entregado: { label: "Completado", variant: "success" },
  cancelado: { label: "Cancelado", variant: "danger" },
};

const paymentLabels = {
  aprobado: { label: "Aprobado", variant: "success" },
  pendiente: { label: "Pendiente", variant: "warning" },
  rechazado: { label: "Rechazado", variant: "danger" },
  cancelado: { label: "Cancelado", variant: "secondary" },
  "en proceso": { label: "En proceso", variant: "info" },
};

const formatDate = (value) => {
  if (!value) {
    return "-";
  }

  if (typeof value.toDate === "function") {
    const date = value.toDate();
    return `${date.toLocaleDateString()} ${date.toLocaleTimeString()}`;
  }

  const parsed = new Date(value);
  if (Number.isNaN(parsed.getTime())) {
    return "-";
  }

  return `${parsed.toLocaleDateString()} ${parsed.toLocaleTimeString()}`;
};

const getShippingDescription = (shipping) => {
  if (!shipping) {
    return {
      methodLabel: "A coordinar con el vendedor",
      details: null,
    };
  }

  if (shipping.method === "delivery" && shipping.address) {
    const { street, number, city, province, postalCode, notes } =
      shipping.address;
    return {
      methodLabel: "Envio a domicilio",
      details: [
        `${street} ${number}`,
        `${city}, ${province}`,
        `CP ${postalCode}`,
        notes ? `Notas: ${notes}` : null,
      ].filter(Boolean),
    };
  }

  return {
    methodLabel: "Retiro en sucursal",
    details: [
      "Te vamos a contactar para coordinar la entrega.",
      shipping.notes ? `Notas: ${shipping.notes}` : null,
    ].filter(Boolean),
  };
};

const OrderDetail = ({ order }) => {
  const fulfillmentStatus = (order.fulfillmentStatus ?? "pendiente").toLowerCase();
  const paymentStatus = (order.estado ?? "pendiente").toLowerCase();
  const fulfillmentInfo = statusLabels[fulfillmentStatus] ?? statusLabels.pendiente;
  const paymentInfo =
    paymentLabels[paymentStatus] ?? paymentLabels.pendiente;

  const shippingInfo = getShippingDescription(order.shipping);
  const orderDate = formatDate(order.fecha);

  return (
    <Row>
      <h2 className="text-center fw-bold mb-4 tracking-in-expand">
        Pedido N° {order.id}
      </h2>
      <Col sm={4}>
        <Card className="card-info">
          <Card.Header className="second-header">
            <h5>Datos del pedido</h5>
          </Card.Header>
          <Card.Body>
            <p className="fw-bold">
              <span className="primary-text">N° de orden: </span>
              {order.id}
            </p>
            <p className="fw-bold">
              <span className="primary-text">Fecha/hora:</span> {orderDate}
            </p>
            <p className="fw-bold d-flex align-items-center gap-2 flex-wrap">
              <span className="primary-text">Estado del pedido:</span>
              <Badge bg={fulfillmentInfo.variant} className="text-capitalize px-3 py-2">
                {fulfillmentInfo.label}
              </Badge>
            </p>
            <p className="fw-bold d-flex align-items-center gap-2 flex-wrap">
              <span className="primary-text">Estado de pago:</span>
              <Badge bg={paymentInfo.variant} className="text-capitalize px-3 py-2">
                {paymentInfo.label}
              </Badge>
            </p>
            <p className="fw-bold mb-1">
              <span className="primary-text">Forma de entrega:</span>{" "}
              {shippingInfo.methodLabel}
            </p>
            {shippingInfo.details?.length ? (
              <ul className="mb-0 ps-3">
                {shippingInfo.details.map((line, index) => (
                  <li key={index} className="text-muted">
                    {line}
                  </li>
                ))}
              </ul>
            ) : null}
          </Card.Body>
        </Card>
        {order.buyer ? (
          <Card className="card-info mt-3">
            <Card.Header className="second-header">
              <h5>Contacto</h5>
            </Card.Header>
            <Card.Body>
              <p className="mb-1">
                <span className="primary-text">Nombre:</span>{" "}
                {order.buyer.nombre || "-"}
              </p>
              <p className="mb-1">
                <span className="primary-text">Telefono:</span>{" "}
                {order.buyer.telefono || "-"}
              </p>
              <p className="mb-0 text-break">
                <span className="primary-text">Email:</span>{" "}
                {order.buyer.email || "-"}
              </p>
            </Card.Body>
          </Card>
        ) : null}
      </Col>
      <Col sm={8}>
        <Table bordered hover responsive>
          <thead>
            <tr className="head-table">
              <th>Producto</th>
              <th>Cantidad</th>
              <th>Precio U</th>
              <th>Subtotal</th>
            </tr>
          </thead>
          <tbody className="text-center">
            {(order.items ?? []).map((item) => (
              <tr key={item.id}>
                <td className="text-muted">{item.nombre}</td>
                <td className="fw-bold text-muted">{item.cantidad}</td>
                <td>$ {Number(item.precio).toLocaleString("es-ES")}</td>
                <td className="fw-bold">
                  $ {Number(item.subtotal).toLocaleString("es-ES")}
                </td>
              </tr>
            ))}
            <tr>
              <td colSpan="4" className="spacer-row"></td>
            </tr>
            <tr>
              <td colSpan={3} className="td-total">
                Total
              </td>
              <td className="text-success fw-bold">
                $ {Number(order.total).toLocaleString("es-ES")}
              </td>
            </tr>
          </tbody>
        </Table>
      </Col>
    </Row>
  );
};

export default OrderDetail;
