import { useContext} from "react";
import { CartStateContext } from "../../context/CartContext";

import Layout from "./../../components/Layout/Layout";
import Cart from "../../components/Cart/Cart";
import EmptyCart from "../../components/Cart/EmptyCart";

const CartView = () => {
  const {cartList} = useContext(CartStateContext);
  return (
    <Layout>
      {
      !cartList.length
      ?<EmptyCart/>
      :<Cart/>
      }
    </Layout>
  );
};
export default CartView;
