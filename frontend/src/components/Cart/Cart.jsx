import { useContext, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { Trash3, X } from "react-bootstrap-icons";
import Swal from "sweetalert2";

import { CartStateContext } from "../../context/CartContext";
import { AuthCtxt } from "../../context/AuthContext";

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || "/api";

const Cart = () => {
  const navigate = useNavigate();
  const { user } = useContext(AuthCtxt);
  const {
    cartList,
    deleteCartItem,
    removeCartList,
    calcTotalQuantity,
    calcTotalPrice,
    subTotal,
  } = useContext(CartStateContext);
  const [isProcessing, setIsProcessing] = useState(false);

  const collectCheckoutData = async () => {
    const defaultEmail = user?.email ?? "";
    const html = `
      <div class="swal2-form">
        <input id="buyer-name" class="swal2-input" placeholder="Nombre y apellido" />
        <input id="buyer-phone" class="swal2-input" placeholder="Telefono" />
        <input id="buyer-email" class="swal2-input" placeholder="Email" value="${defaultEmail}" />
        ${user ? "" : '<input id="buyer-email-confirm" class="swal2-input" placeholder="Confirmar email" />'}
        <div class="swal2-field" style="text-align:left;">
          <label class="swal2-label" style="margin-bottom:8px; display:block;">Forma de entrega</label>
          <div class="swal2-radio" style="display:flex; flex-direction:column; gap:6px;">
            <label style="display:flex; align-items:center; gap:8px;">
              <input type="radio" name="shipping-method" value="pickup" checked />
              Retiro en sucursal
            </label>
            <label style="display:flex; align-items:center; gap:8px;">
              <input type="radio" name="shipping-method" value="delivery" />
              Envio a domicilio
            </label>
          </div>
        </div>
        <div id="delivery-fields" style="display:none">
          <input id="shipping-street" class="swal2-input" placeholder="Calle" />
          <input id="shipping-number" class="swal2-input" placeholder="Numero" />
          <input id="shipping-city" class="swal2-input" placeholder="Ciudad" />
          <input id="shipping-province" class="swal2-input" placeholder="Provincia" />
          <input id="shipping-postal" class="swal2-input" placeholder="Codigo postal" />
          <textarea id="shipping-notes" class="swal2-textarea" placeholder="Notas adicionales (opcional)"></textarea>
        </div>
      </div>
    `;

    const result = await Swal.fire({
      title: "Datos de contacto y entrega",
      html,
      showCancelButton: true,
      confirmButtonText: "Generar orden",
      cancelButtonText: "Cancelar",
      focusConfirm: false,
      didOpen: () => {
        const popup = Swal.getPopup();
        const methodInputs = popup.querySelectorAll('input[name="shipping-method"]');
        const deliveryFields = popup.querySelector("#delivery-fields");
        const toggleDeliveryFields = () => {
          const selected = popup.querySelector('input[name="shipping-method"]:checked');
          if (selected?.value === "delivery") {
            deliveryFields.style.display = "block";
          } else {
            deliveryFields.style.display = "none";
          }
        };
        methodInputs.forEach((input) => input.addEventListener("change", toggleDeliveryFields));
        toggleDeliveryFields();
      },
      preConfirm: () => {
        const popup = Swal.getPopup();
        const nombre = popup.querySelector("#buyer-name").value.trim();
        const telefono = popup.querySelector("#buyer-phone").value.trim();
        const email = popup.querySelector("#buyer-email").value.trim();
        const confirmEmailInput = popup.querySelector("#buyer-email-confirm");
        const confirmEmail = confirmEmailInput ? confirmEmailInput.value.trim() : email;
        const method =
          popup.querySelector('input[name="shipping-method"]:checked')?.value ?? "";

        if (!nombre || !telefono || !email) {
          Swal.showValidationMessage("Completa nombre, telefono y email.");
          return false;
        }

        if (email !== confirmEmail) {
          Swal.showValidationMessage("Los correos electronicos no coinciden.");
          return false;
        }

        if (!method) {
          Swal.showValidationMessage("Selecciona una forma de entrega.");
          return false;
        }

        let shipping = { method };

        if (method === "delivery") {
          const street = popup.querySelector("#shipping-street").value.trim();
          const number = popup.querySelector("#shipping-number").value.trim();
          const city = popup.querySelector("#shipping-city").value.trim();
          const province = popup.querySelector("#shipping-province").value.trim();
          const postalCode = popup.querySelector("#shipping-postal").value.trim();
          const notes = popup.querySelector("#shipping-notes").value.trim();

          if (!street || !number || !city || !province || !postalCode) {
            Swal.showValidationMessage("Completa todos los datos del domicilio.");
            return false;
          }

          shipping = {
            method: "delivery",
            address: {
              street,
              number,
              city,
              province,
              postalCode,
              ...(notes ? { notes } : {}),
            },
          };
        }

        return {
          buyer: { nombre, telefono, email },
          shipping,
        };
      },
    });

    if (!result.isConfirmed) {
      return null;
    }

    return result.value;
  };

  const sendOrder = async () => {
    if (cartList.length === 0) {
      await Swal.fire({
        icon: "info",
        title: "El carrito esta vacio",
        text: "Agrega productos antes de continuar con el pago.",
      });
      return;
    }

    if (!user) {
      const result = await Swal.fire({
        icon: "warning",
        title: "Necesitas una cuenta",
        text: "Inicia sesion o registrate para completar tu compra.",
        showDenyButton: true,
        showCancelButton: true,
        confirmButtonText: "Iniciar sesion",
        denyButtonText: "Registrarme",
        cancelButtonText: "Cancelar",
      });

      if (result.isConfirmed) {
        navigate("/login");
      } else if (result.isDenied) {
        navigate("/register");
      }

      return;
    }

    const checkoutData = await collectCheckoutData();

    if (!checkoutData) {
      return;
    }

    if (!API_BASE_URL) {
      await Swal.fire({
        title: "Configuracion faltante",
        text: "No se encontro la URL del backend. Revisa las variables de entorno.",
        icon: "error",
      });
      return;
    }

    try {
      setIsProcessing(true);

      const buyerPayload =
        checkoutData.buyer.nombre ||
        checkoutData.buyer.telefono ||
        checkoutData.buyer.email
          ? {
              ...(checkoutData.buyer.nombre
                ? { nombre: checkoutData.buyer.nombre }
                : {}),
              ...(checkoutData.buyer.telefono
                ? { telefono: checkoutData.buyer.telefono }
                : {}),
              ...(checkoutData.buyer.email
                ? { email: checkoutData.buyer.email }
                : {}),
            }
          : undefined;

      const response = await fetch(`${API_BASE_URL}/checkout`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          buyer: buyerPayload,
          shipping: checkoutData.shipping,
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
        throw new Error(errorBody.message || "No se pudo iniciar el pago.");
      }

      const data = await response.json();
      const redirectUrl = data.initPoint || data.sandboxInitPoint;

      if (!redirectUrl) {
        throw new Error("Mercado Pago no devolvio una URL de pago.");
      }

      sessionStorage.setItem("zonaeste3d:lastOrderId", data.orderId);
      sessionStorage.setItem("zonaeste3d:lastOrderStatus", "pending");

      removeCartList();

      await Swal.fire({
        title: "Redirigiendo a Mercado Pago",
        text: "Te llevaremos al checkout para completar el pago.",
        icon: "success",
        confirmButtonText: "Continuar",
      });

      window.location.href = redirectUrl;
    } catch (error) {
      await Swal.fire({
        title: "Error al procesar el pago",
        text: error.message,
        icon: "error",
      });
    } finally {
      setIsProcessing(false);
    }
  };

  return (
    <section>
      <div className="container" style={{ marginTop: "8rem", marginBottom: "2rem" }}>
        <div className="row">
          <div className="col-lg-9 mb-3">
            <div className="card border shadow-0">
              <div className="m-4">
                <h4 className="card-title text-primary text-bold">Mi carrito de compras</h4>
                {/* Productos */}
                {cartList.map((cartItem) => (
                  <div className="row gy-3 mb-2 border-top mt-4" key={cartItem.id}>
                    <div className="col-lg-5">
                      <div className="me-lg-5">
                        <div className="d-flex">
                          <img
                            src={cartItem.imgUrl}
                            className="border rounded me-3"
                            style={{ width: "96px", height: "96px" }}
                            alt={cartItem.nombre}
                          />
                          <div className="pt-3">
                            <Link to={`/item/${cartItem.id}`} className="mb-3">
                              {cartItem.nombre}
                            </Link>
                            <p className="pt-2">Stock: {cartItem.stock}</p>
                          </div>
                        </div>
                      </div>
                    </div>

                    <div className="col-lg-2 col-sm-6 col-6 d-flex flex-row flex-lg-column flex-xl-row text-nowrap">
                      <div className="pt-3">
                        <p className="h6">Cantidad: {cartItem.qty}</p>
                      </div>
                    </div>
                    <div className="col-lg-2 col-sm-6 col-8 d-flex flex-row flex-lg-column flex-xl-row text-nowrap">
                      <div className="pt-3">
                        <p className="h6">
                          Subtotal: $ {subTotal(cartItem.id).toLocaleString("es-ES")}
                        </p>
                        <small className="text-muted text-nowrap">
                          $ {cartItem.precio.toLocaleString("es-ES")} / por unidad
                        </small>
                      </div>
                    </div>

                    <div className="col-lg col-sm-6 d-flex justify-content-sm-center justify-content-md-start justify-content-lg-center justify-content-xl-end mb-2 text-center">
                      <div className="float-md-end pt-3">
                        <button
                          className="btn btn-light"
                          onClick={() => deleteCartItem(cartItem.id)}
                          disabled={isProcessing}
                        >
                          <X size="20" color="red" /> Eliminar
                        </button>
                      </div>
                    </div>
                  </div>
                ))}
                {/* Productos */}
              </div>
              <div className="border-top pt-4 mx-4 mb-4 text-center">
                <button
                  className="btn btn-light"
                  onClick={() => removeCartList()}
                  disabled={isProcessing}
                >
                  <Trash3 color="royalblue" /> Limpiar carrito
                </button>
              </div>
            </div>
          </div>

          {/* Resumen */}
          <div className="col-lg-3 mb-3">
            <div className="card shadow-0 border">
              <div className="card-body">
                <div className="text-center">
                  <p className="mb-4 fs-5 fw-bold">Resumen de compra</p>
                </div>
                <div className="d-flex justify-content-between">
                  <p className="mb-2">Cantidad total:</p>
                  <p className="mb-2 fw-bold">{calcTotalQuantity()}</p>
                </div>
                <div className="d-flex justify-content-between">
                  <p className="mb-2">Envio:</p>
                  <p className="mb-2 fw-bold">-</p>
                </div>
                <div className="d-flex justify-content-between">
                  <p className="mb-2">Desc:</p>
                  <p className="mb-2 fw-bold">-</p>
                </div>
                <hr />
                <div className="d-flex justify-content-between">
                  <p className="mb-2">Total</p>
                  <p className="mb-2 fw-bold">$ {calcTotalPrice().toLocaleString("es-ES")}</p>
                </div>

                <div className="mt-3">
                  <button
                    className="btn btn-success w-100 border mt-2"
                    onClick={sendOrder}
                    disabled={isProcessing}
                  >
                    {isProcessing ? "Generando pago..." : "Terminar mi compra"}
                  </button>
                  <Link to="/" className="btn btn-light w-100 border mt-2">
                    Seguir Comprando
                  </Link>
                </div>
              </div>
            </div>
          </div>
          {/* Resumen */}
        </div>
      </div>
    </section>
  );
};

export default Cart;
