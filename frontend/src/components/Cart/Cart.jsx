import { useContext } from "react";
import { Link, useNavigate } from "react-router-dom";
import { Trash3, X } from "react-bootstrap-icons";
import Swal from "sweetalert2";

import { CartStateContext } from "../../context/CartContext";
import { AuthCtxt } from "../../context/AuthContext";

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

    navigate("/checkout");
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
                  >
                    Ir al checkout
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
