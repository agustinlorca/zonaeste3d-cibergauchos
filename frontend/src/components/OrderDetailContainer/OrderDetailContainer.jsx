import { useContext, useEffect, useMemo, useState } from "react";
import { useParams, useNavigate, useLocation } from "react-router-dom";

import { doc, onSnapshot } from "firebase/firestore";
import { db } from "../../firebase/credentials";

import SpinnerLoader from "../SpinnerLoader/SpinnerLoader";
import OrderDetail from "../OrderDetail/OrderDetail";

import { Alert, Container } from "react-bootstrap";
import { AuthCtxt } from "../../context/AuthContext";

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || "/api";

const OrderDetailContainer = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { user } = useContext(AuthCtxt);
  const [isLoading, setIsLoading] = useState(true);
  const [order, setOrder] = useState({});
  const [paymentStatus, setPaymentStatus] = useState(null);
  const [isConfirming, setIsConfirming] = useState(false);
  const { orderID } = useParams();

  useEffect(() => {
    const collectionName = "orders";
    const orderRef = doc(db, collectionName, orderID);

    setIsLoading(true);

    const unsubscribe = onSnapshot(
      orderRef,
      (snapshot) => {
        if (!snapshot.exists()) {
          setIsLoading(false);
          navigate("/not-found", { replace: true });
          return;
        }

        setOrder({ id: snapshot.id, ...snapshot.data() });
        setIsLoading(false);
      },
      (error) => {
        // eslint-disable-next-line no-console
        console.error("Error obteniendo la orden:", error);
        setIsLoading(false);
      }
    );

    return () => {
      unsubscribe();
    };
  }, [navigate, orderID]);

  useEffect(() => {
    const params = new URLSearchParams(location.search);
    const status = params.get("status");
    if (status) {
      setPaymentStatus(status);
    }
  }, [location.search]);

  const allowAnonymousAccess = useMemo(() => {
    const lastOrderId = sessionStorage.getItem("zonaeste3d:lastOrderId");
    return lastOrderId && lastOrderId === orderID;
  }, [orderID]);

  useEffect(() => {
    if (!user && !allowAnonymousAccess) {
      navigate("/login", { replace: true });
    }
  }, [allowAnonymousAccess, navigate, user]);

  useEffect(() => {
    if (!order?.buyer?.email || !user) {
      return;
    }

    if (order.buyer.email !== user.email) {
      navigate("/not-found", { replace: true });
    }
  }, [navigate, order?.buyer?.email, user]);

  useEffect(() => {
    if (isLoading) {
      return;
    }

    if (paymentStatus !== "approved") {
      return;
    }

    if (!order?.id || order.paymentConfirmed) {
      return;
    }

    if (!API_BASE_URL || isConfirming) {
      return;
    }

    let isCancelled = false;

    const confirmOrder = async () => {
      try {
        setIsConfirming(true);
        const response = await fetch(`${API_BASE_URL}/orders/${orderID}/confirm`, {
          method: "POST",
        });

        if (!response.ok) {
          // eslint-disable-next-line no-console
          console.error("No se pudo confirmar la orden:", response.status);
          if (!isCancelled) {
            setIsConfirming(false);
          }
          return;
        }
      } catch (error) {
        // eslint-disable-next-line no-console
        console.error("Error confirmando la orden:", error);
        if (!isCancelled) {
          setIsConfirming(false);
        }
      } finally {
        if (isCancelled) {
          setIsConfirming(false);
        }
      }
    };

    confirmOrder();

    return () => {
      isCancelled = true;
    };
  }, [
    isConfirming,
    isLoading,
    order?.id,
    order.paymentConfirmed,
    orderID,
    paymentStatus,
  ]);

  useEffect(() => {
    if (!isConfirming) {
      return;
    }

    if (order.paymentConfirmed) {
      setIsConfirming(false);
    }
  }, [isConfirming, order.paymentConfirmed]);

  const renderStatusAlert = () => {
    if (!paymentStatus) {
      return null;
    }

    const statusMap = {
      approved: {
        variant: "success",
        title: "Pago aprobado",
        body:
          "Confirmamos tu pago. En breve vas a recibir un correo con los detalles de tu pedido.",
      },
      pending: {
        variant: "warning",
        title: "Pago pendiente",
        body:
          "Estamos esperando la confirmacion de Mercado Pago. Puedes revisar el estado mas tarde desde tu historial de pedidos.",
      },
      failure: {
        variant: "danger",
        title: "Pago rechazado",
        body:
          "El pago no se completo. Revisa los datos o intenta con otro medio de pago.",
      },
    };

    const info = statusMap[paymentStatus] ?? {
      variant: "info",
      title: "Estado desconocido",
      body:
        "No pudimos identificar el estado de Mercado Pago. Si el dinero fue debitado, se va a acreditar automaticamente.",
    };

    return (
      <Alert variant={info.variant} className="mb-4">
        <Alert.Heading>{info.title}</Alert.Heading>
        <p className="mb-0">{info.body}</p>
      </Alert>
    );
  };

  return (
    <Container style={{ marginTop: "8rem", marginBottom: "3rem" }}>
      {renderStatusAlert()}
      {isLoading ? <SpinnerLoader /> : <OrderDetail order={order} />}
    </Container>
  );
};

export default OrderDetailContainer;
