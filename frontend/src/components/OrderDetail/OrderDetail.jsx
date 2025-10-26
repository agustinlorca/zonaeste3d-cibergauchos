import {Row, Col, Table, Card } from "react-bootstrap";
import "./OrderDetail.css"; 

const OrderDetail = ({order}) => {
  
  const date = order.fecha.toDate();
  const formattedDate = `${date.toDateString()} ${date.toTimeString().split(' ')[0]}`;
  return (
    <Row>
      <h2 className="text-center fw-bold mb-4 tracking-in-expand">Pedido N° {order.id}</h2>
          <Col sm={4}>
            <Card className="card-info">
                <Card.Header className="first-header ">
                    <p>Pedido</p>
                    <p>{order.estado.toUpperCase()}</p>
                </Card.Header>
                <Card.Header className="second-header ">
                    <h5>Datos del pedido</h5>
                </Card.Header>
                <Card.Body >
                  <p className="fw-bold"><span className="primary-text">N° de orden: </span>{order.id}</p>
                  <p className="fw-bold"><span className="primary-text">Forma de entrega:</span> Acordar con el vendedor</p>
                  <p className="fw-bold"><span className="primary-text">Fecha/hora:</span> {formattedDate}</p>
                </Card.Body>
            </Card>
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
                {order.items.map((item) => (
                  <tr key={item.id}>
                    <td className="text-muted">{item.nombre}</td>
                    <td className="fw-bold text-muted">{item.cantidad}</td>
                    <td>$ {item.precio.toLocaleString("es-ES")}</td>
                    <td className="fw-bold">$ {item.subtotal.toLocaleString("es-ES")}</td>
                </tr>
                ))
                }
                <tr>
                  <td colSpan="4" className="spacer-row"></td>
                </tr>
                <tr>
                  <td colSpan={3} className="td-total">Total</td>
                  <td className="text-success fw-bold">$ {order.total.toLocaleString("es-ES")}</td>
                </tr>
              </tbody>
            </Table>
          </Col>
        </Row>
  )
}

export default OrderDetail
