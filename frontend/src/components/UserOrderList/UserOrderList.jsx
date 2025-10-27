import Order from "../Order/Order";

import { Container } from "react-bootstrap";

const UserOrderList = ({ orders }) => {
  return (
    <Container>
      {orders.map((order) => (
        <Order key={order.id} order={order} />
      ))}
    </Container>
  );
};

export default UserOrderList;
