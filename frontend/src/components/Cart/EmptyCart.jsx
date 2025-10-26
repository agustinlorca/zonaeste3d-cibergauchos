import { Link } from "react-router-dom";
import { ShopWindow } from "react-bootstrap-icons";

const EmptyCart = () => {
  return (
    <div>
          <div className="container" style={{marginTop:"8rem"}}>
            <div className="row">
              <div className="col-lg-9 mb-3">
                <div className="card border shadow-0">
                  <div className="m-4">
                    <h4 className="card-title text-primary text-bold">
                      Mi carrito de compras
                    </h4>
                  </div>
                  <div className="border-top pt-4 mx-4 mb-4 text-center">
                    <p className="fs-3 fw-bold">
                      Parece que aún no has sumado productos
                    </p>
                    <ShopWindow size={70} color="royalBlue" className="mb-2" />
                    <p className="text-muted fs-5">
                      ¡Empieza un carrito de compras!
                    </p>
                    <Link to="/">
                      <button className="btn btn-primary">
                        Descubrir productos
                      </button>
                    </Link>
                  </div>
                </div>
              </div>
              <div className="col-lg-3 mb-3">
                <div className="card shadow-0 border">
                  <div className="card-body">
                    <div className="text-center">
                      <p className="mb-4 fs-5 fw-bold">Resumen de compra</p>
                    </div>
                    <hr />
                    <div className="text-center">
                      <p className="mb-2">
                        Acá vas a ver el resumen de tu compra una vez que
                        agregues productos
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
  )
}

export default EmptyCart;
