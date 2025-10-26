import { useContext } from "react";

import cartIcon from "../../Assets/img/cart.svg";
import Badge from "react-bootstrap/Badge";

import { CartStateContext } from "../../context/CartContext";


const CartWidget = () => {

  const {calcTotalQuantity} = useContext(CartStateContext)
  
  return (
    <div className="position-relative mt-2">
      <img src={cartIcon} width="30" height="30" alt="Cart Icon" />
      {
        calcTotalQuantity() === 0 
        ? (<></>)
        :(
        <Badge bg="danger" className="position-absolute translate-middle">
          {calcTotalQuantity()}
        </Badge>
        )
      }
      
    </div>
  );
};
export default CartWidget;