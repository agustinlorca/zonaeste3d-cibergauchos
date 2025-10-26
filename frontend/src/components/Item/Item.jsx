import React from "react";
import "./Item.css";
import Card from "react-bootstrap/Card";
import { Link } from "react-router-dom";

const Item = ({ id, nombre, precio, imgUrl }) => {
  return (
    <Link to={`/item/${id}`} className="text-decoration-none">
      <Card className="card shadow-drop-2-center">
        <Card.Body className="body-card p-4">
          <Card.Img className="img-card" variant="top" src={imgUrl} />
          <hr/>
          <div className="card-content">
            <Card.Title className="card-name">{nombre}</Card.Title>
            <Card.Text className="card-price">$ {precio.toLocaleString("es-ES")}</Card.Text>
          </div>
        </Card.Body>
      </Card>
    </Link>
  );
};

export default Item;

