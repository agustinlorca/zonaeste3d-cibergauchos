import { Link } from "react-router-dom";
import { Table, Badge } from "react-bootstrap";

const statusConfig = {
  pendiente: { label: "Pendiente", variant: "secondary" },
  pagado: { label: "Pagado", variant: "primary" },
  preparando: { label: "Preparando", variant: "info" },
  enviado: { label: "Enviado", variant: "warning" },
  entregado: { label: "Completado", variant: "success" },
  cancelado: { label: "Cancelado", variant: "danger" },
};

const paymentConfig = {
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
    return date.toLocaleDateString();
  }

  const parsed = new Date(value);
  if (Number.isNaN(parsed.getTime())) {
    return "-";
  }

  return parsed.toLocaleDateString();
};

const getShippingLabel = (shipping) => {
  if (!shipping) {
    return "A coordinar";
  }

  if (shipping.method === "delivery") {
    return "Envio a domicilio";
  }

  return "Retiro en sucursal";
};

const Order = ({ order }) => {
  const fulfillmentStatus =
    (order.fulfillmentStatus ?? "pendiente").toLowerCase();
  const paymentStatus = (order.estado ?? "pendiente").toLowerCase();

  const fulfillmentInfo =
    statusConfig[fulfillmentStatus] ?? statusConfig.pendiente;
  const paymentInfo =
    paymentConfig[paymentStatus] ?? paymentConfig.pendiente;

  return (
    <Table bordered hover responsive>
      <thead>
        <tr className="head-table">
          <th>Pedido N°</th>
          <th>Fecha</th>
          <th>Estado</th>
          <th>Pago</th>
          <th>Entrega</th>
          <th>Total</th>
          <th>Detalle</th>
        </tr>
      </thead>
      <tbody className="text-center">
        <tr>
          <td style={{ width: "260px" }}>{order.id}</td>
          <td>{formatDate(order.fecha)}</td>
          <td>
            <Badge bg={fulfillmentInfo.variant} className="fs-6">
              {fulfillmentInfo.label}
            </Badge>
          </td>
          <td>
            <Badge bg={paymentInfo.variant} className="fs-6">
              {paymentInfo.label}
            </Badge>
          </td>
          <td>{getShippingLabel(order.shipping)}</td>
          <td className="text-primary" style={{ width: "180px" }}>
            $ {Number(order.total).toLocaleString("es-ES")}
          </td>
          <td>
            <Link className="text-decoration-none" to={`/order/${order.id}`}>
              <Badge bg="secondary" className="fs-6">
                Ver
              </Badge>
            </Link>
          </td>
        </tr>
      </tbody>
    </Table>
  );
};

export default Order;
