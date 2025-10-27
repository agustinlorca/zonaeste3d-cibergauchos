import { useCallback, useEffect, useMemo, useState } from "react";
import {
  Badge,
  Button,
  Col,
  Form,
  InputGroup,
  Row,
  Table,
} from "react-bootstrap";
import SpinnerLoader from "../SpinnerLoader/SpinnerLoader";

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || "/api";

const ORDER_STATUS_OPTIONS = [
  { value: "todos", label: "Todos los estados" },
  { value: "pendiente", label: "Pendiente" },
  { value: "pagado", label: "Pagado" },
  { value: "preparando", label: "Preparando" },
  { value: "enviado", label: "Enviado" },
  { value: "entregado", label: "Completado" },
  { value: "cancelado", label: "Cancelado" },
];

const STATUS_BADGES = {
  pendiente: "secondary",
  pagado: "primary",
  preparando: "info",
  enviado: "warning",
  entregado: "success",
  cancelado: "danger",
};

const PAYMENT_BADGES = {
  aprobado: "success",
  pendiente: "warning",
  rechazado: "danger",
  cancelado: "secondary",
  "en proceso": "info",
};

const PAYMENT_LABELS = {
  aprobado: "Aprobado",
  pendiente: "Pendiente",
  rechazado: "Rechazado",
  cancelado: "Cancelado",
  "en proceso": "En proceso",
};

const formatDateTime = (isoString) => {
  if (!isoString) {
    return "-";
  }

  const date = new Date(isoString);
  if (Number.isNaN(date.getTime())) {
    return "-";
  }

  return `${date.toLocaleDateString()} ${date.toLocaleTimeString()}`;
};

const getShippingSummary = (shipping) => {
  if (!shipping) {
    return "A coordinar";
  }

  if (shipping.method === "delivery" && shipping.address) {
    const { street, number, city } = shipping.address;
    return `Envio: ${street} ${number}, ${city}`;
  }

  return "Retiro en sucursal";
};

const AdminOrdersPanel = () => {
  const [orders, setOrders] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isUpdating, setIsUpdating] = useState(null);
  const [appliedFilters, setAppliedFilters] = useState({
    status: "todos",
    from: "",
    to: "",
    search: "",
  });
  const [filters, setFilters] = useState(appliedFilters);

  const fetchOrders = useCallback(async () => {
    setIsLoading(true);

    if (!API_BASE_URL) {
      setOrders([]);
      setIsLoading(false);
      return;
    }
    try {
      const params = new URLSearchParams();
      if (
        appliedFilters.status &&
        appliedFilters.status !== "todos" &&
        appliedFilters.status !== "all"
      ) {
        params.set("status", appliedFilters.status);
      }
      if (appliedFilters.from) {
        params.set("from", appliedFilters.from);
      }
      if (appliedFilters.to) {
        params.set("to", appliedFilters.to);
      }
      if (appliedFilters.search) {
        params.set("search", appliedFilters.search);
      }

      const queryString = params.toString();
      const response = await fetch(
        `${API_BASE_URL}/orders${queryString ? `?${queryString}` : ""}`
      );

      if (!response.ok) {
        const errorBody = await response.json().catch(() => ({}));
        throw new Error(errorBody.message || "No se pudieron obtener las ordenes.");
      }

      const data = await response.json();
      setOrders(data.orders ?? []);
    } catch (error) {
      // eslint-disable-next-line no-console
      console.error("Error obteniendo ordenes:", error);
      setOrders([]);
    } finally {
      setIsLoading(false);
    }
  }, [appliedFilters]);

  useEffect(() => {
    fetchOrders();
  }, [fetchOrders]);

  const handleFilterChange = (event) => {
    const { name, value } = event.target;
    setFilters((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleFilterSubmit = (event) => {
    event.preventDefault();
    setAppliedFilters(filters);
  };

  const handleResetFilters = () => {
    const defaultFilters = {
      status: "todos",
      from: "",
      to: "",
      search: "",
    };
    setFilters(defaultFilters);
    setAppliedFilters(defaultFilters);
  };

  const handleStatusUpdate = async (orderId, newStatus) => {
    if (!orderId || !newStatus || !API_BASE_URL) {
      return;
    }

    setIsUpdating(orderId);
    try {
      const response = await fetch(`${API_BASE_URL}/orders/${orderId}`, {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ fulfillmentStatus: newStatus }),
      });

      if (!response.ok) {
        const errorBody = await response.json().catch(() => ({}));
        throw new Error(errorBody.message || "No se pudo actualizar la orden.");
      }

      const updatedOrder = await response.json();
      setOrders((prev) =>
        prev.map((order) =>
          order.id === orderId ? { ...order, ...updatedOrder } : order
        )
      );
    } catch (error) {
      // eslint-disable-next-line no-console
      console.error("Error actualizando la orden:", error);
    } finally {
      setIsUpdating(null);
    }
  };

  const statusOptions = useMemo(
    () => ORDER_STATUS_OPTIONS.map((option) => (
        <option value={option.value} key={option.value}>
          {option.label}
        </option>
      )),
    []
  );

  return (
    <div className="mt-4">
      <h2 className="mb-4">Gestion de ordenes</h2>
      <Form onSubmit={handleFilterSubmit} className="mb-4">
        <Row className="g-3">
          <Col md={3}>
            <Form.Label htmlFor="status">Estado</Form.Label>
            <Form.Select
              id="status"
              name="status"
              value={filters.status}
              onChange={handleFilterChange}
            >
              {statusOptions}
            </Form.Select>
          </Col>
          <Col md={3}>
            <Form.Label htmlFor="from">Desde</Form.Label>
            <Form.Control
              type="date"
              id="from"
              name="from"
              value={filters.from}
              onChange={handleFilterChange}
            />
          </Col>
          <Col md={3}>
            <Form.Label htmlFor="to">Hasta</Form.Label>
            <Form.Control
              type="date"
              id="to"
              name="to"
              value={filters.to}
              onChange={handleFilterChange}
            />
          </Col>
          <Col md={3}>
            <Form.Label htmlFor="search">Buscar</Form.Label>
            <InputGroup>
              <Form.Control
                type="search"
                id="search"
                name="search"
                placeholder="Numero de orden o email"
                value={filters.search}
                onChange={handleFilterChange}
              />
            </InputGroup>
          </Col>
          <Col xs={12} className="d-flex gap-2">
            <Button type="submit" variant="primary">
              Aplicar filtros
            </Button>
            <Button type="button" variant="outline-secondary" onClick={handleResetFilters}>
              Limpiar
            </Button>
            <Button type="button" variant="outline-primary" onClick={fetchOrders}>
              Actualizar
            </Button>
          </Col>
        </Row>
      </Form>

      {isLoading ? (
        <SpinnerLoader />
      ) : orders.length === 0 ? (
        <div className="alert alert-info mb-0">
          No encontramos ordenes con los filtros seleccionados.
        </div>
      ) : (
        <div className="table-responsive">
          <Table bordered hover responsive>
            <thead>
              <tr>
                <th>Fecha</th>
                <th>Pedido</th>
                <th>Cliente</th>
                <th>Estado</th>
                <th>Pago</th>
                <th>Entrega</th>
                <th>Total</th>
              </tr>
            </thead>
            <tbody>
              {orders.map((order) => {
                const status = (order.fulfillmentStatus ?? "pendiente").toLowerCase();
                const payment = (order.estado ?? "pendiente").toLowerCase();
                const statusVariant = STATUS_BADGES[status] ?? "secondary";
                const paymentVariant = PAYMENT_BADGES[payment] ?? "warning";
                const statusLabel =
                  ORDER_STATUS_OPTIONS.find((option) => option.value === status)?.label ??
                  status;
                const paymentLabel = PAYMENT_LABELS[payment] ?? payment;

                return (
                  <tr key={order.id}>
                    <td>{formatDateTime(order.fecha)}</td>
                    <td>
                      <div className="d-flex flex-column">
                        <span className="fw-bold">{order.id}</span>
                        <small className="text-muted">
                          {order.cantidadProductos} producto(s)
                        </small>
                      </div>
                    </td>
                    <td>
                      <div className="d-flex flex-column">
                        <span className="fw-bold">
                          {order.buyer?.nombre || "Sin nombre"}
                        </span>
                        <small className="text-muted">{order.buyer?.email || "-"}</small>
                        <small className="text-muted">{order.buyer?.telefono || "-"}</small>
                      </div>
                    </td>
                    <td style={{ minWidth: 220 }}>
                      <Form.Select
                        value={status}
                        onChange={(event) =>
                          handleStatusUpdate(order.id, event.target.value)
                        }
                        disabled={isUpdating === order.id}
                      >
                        {ORDER_STATUS_OPTIONS.filter(
                          (option) => option.value !== "todos" && option.value !== "all"
                        ).map((option) => (
                          <option key={option.value} value={option.value}>
                            {option.label}
                          </option>
                        ))}
                      </Form.Select>
                      <div className="mt-2">
                        <Badge bg={statusVariant}>{statusLabel}</Badge>
                      </div>
                    </td>
                    <td>
                      <Badge bg={paymentVariant}>{paymentLabel}</Badge>
                    </td>
                    <td>{getShippingSummary(order.shipping)}</td>
                    <td className="fw-bold">
                      $ {Number(order.total).toLocaleString("es-ES")}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </Table>
        </div>
      )}
    </div>
  );
};

export default AdminOrdersPanel;
