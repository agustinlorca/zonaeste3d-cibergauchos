import { Link } from "react-router-dom";

import "./ItemDetail.css";
import ItemCount from "../ItemCount/ItemCount";


const ItemDetail = ({ item }) => {
  return (
    <div className="container mt-5 px-xl-5">
      <nav aria-label="breadcrumb" className="bg-light rounded mb-4">
        <ol className="breadcrumb p-3">
          <li className="breadcrumb-item">
            <Link
              className="text-decoration-none link-primary"
              to={`/category/${item.categoria}`}
            >
              {item.categoria.toUpperCase()}
            </Link>
          </li>
          <li className="breadcrumb-item active" aria-current="page">
            {item.nombre}
          </li>
        </ol>
      </nav>

      <div className="row mb-4">
        <div className="col-lg-6">
          <div className="row">
            <div className="col-12 mb-4">
              <img
                className="border rounded ratio ratio-1x1"
                alt=""
                src={item.imgUrl}
              />
            </div>
          </div>
        </div>
        <div className="col-lg-5">
          <div className="d-flex flex-column h-100">
            <p className="title">{item.nombre}</p>
            <p className="price">$ {item.precio.toLocaleString("es-ES")}</p>

            <ItemCount product={item} />
            
            <h4 className="mb-0">Detalles</h4>
            <hr />
            <dl className="row">
              {item.tipo === undefined ? (
                <div></div>
              ) : (
                <div className="row">
                  <dt className="col-sm-4">Tipo</dt>
                  <dd className="col-sm-8 mb-3">{item.tipo}</dd>
                </div>
              )}

              {item.marca === undefined ? (
                <div></div>
              ) : (
                <div className="row">
                  <dt className="col-sm-4">Marca</dt>
                  <dd className="col-sm-8 mb-3">{item.marca}</dd>
                </div>
              )}
              {item.material === undefined ? (
                <div></div>
              ) : (
                <div className="row">
                  <dt className="col-sm-4">Material</dt>
                  <dd className="col-sm-8 mb-3">{item.material}</dd>
                </div>
              )}
              {item.color === undefined ? (
                <div></div>
              ) : (
                <div className="row">
                  <dt className="col-sm-4">Color</dt>
                  <dd className="col-sm-8 mb-3">{item.color}</dd>
                </div>
              )}
              <section className="row">
                <dt className="col-sm-4">Stock</dt>
                <dd className="col-sm-8 mb-3">{item.stock}</dd>
              </section>
            </dl>
            <h4 className="mb-0">Descripción</h4>
            <hr />
            <p className="lead flex-shrink-0">
              <small>{item.descripcion}</small>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ItemDetail;
