import Col from 'react-bootstrap/Col';
import Row from 'react-bootstrap/Row';
import Item from "../Item/Item";

const ItemList = ({items}) => {
  return (
    <Row xs={1} md={3} lg="4" xl="7" className="g-4">
      {
        items.map((item) => (
          <Col key={item.id}>
            <Item
              id = {item.id}
              nombre={item.nombre}
              descripcion={item.descripcion}
              precio={item.precio}
              imgUrl={item.imgUrl}
            ></Item>
          </Col>
        ))
      }
    </Row>
  )
};
export default ItemList;
