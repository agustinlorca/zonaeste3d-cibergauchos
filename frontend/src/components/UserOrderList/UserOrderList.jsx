import Order from "../Order/Order";

import {Container} from "react-bootstrap";


const UserOrderList = ({orders}) => {
  return (
    <Container>
      {orders.map((order) => (
        <Order key={order.id} id={order.id} total={order.total}/>
      ))
      }
      
    </Container>
  )
}

export default UserOrderList
