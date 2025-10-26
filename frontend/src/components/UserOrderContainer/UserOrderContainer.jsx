import { useState, useEffect, useContext } from "react";
import { Link } from "react-router-dom";

import { db } from "../../firebase/credentials";
import { collection, getDocs, query, where } from "firebase/firestore";

import { AuthCtxt } from '../../context/AuthContext';

import SpinnerLoader from "../SpinnerLoader/SpinnerLoader";
import UserOrderList from '../UserOrderList/UserOrderList';

import { Clipboard2Check} from "react-bootstrap-icons";

const UserOrderContainer = () => {
    const [orders,setOrders] = useState([])
    const {user} = useContext(AuthCtxt)

    const [isLoading, setIsLoading] = useState(true);

    const getOrders = async() => {
        const collectionName = "orders";
        const ordersRef = collection(db, collectionName);
        const orderQuery = user ? query(ordersRef, where("buyer.email", "==", user.email)) : ordersRef;
        const response = await getDocs(orderQuery);
        const orderListFormat = response.docs.map((order) => (
          {id: order.id,...order.data(),}
        ));
    setOrders(orderListFormat);
    setIsLoading(false);
  }
  useEffect(() => {
    getOrders()
  },[])
  
  return (
    <div style={{ marginTop: "8rem", marginBottom: "5rem" }}>
      <h2 className="text-center fw-bold mb-4 tracking-in-expand">Mis pedidos</h2>
      {isLoading ? (
        <SpinnerLoader />
      ) : orders.length ? (
        <UserOrderList orders={orders} />
      ) : (
        <div className="container">
          <div className="row">
            <div className="col-lg-12 d-flex justify-content-center align-items-center">
              <div className="col-lg-6 card border">
                <div className="border-top pt-4 mb-4 text-center">
                  <p className="fs-4 text-primary">Aquí vas a ver el registro de todos tus pedidos</p>
                  <Clipboard2Check size={60} color="green" className="mb-2" />
                  <p className="text-muted fs-5">¿Todavía no empezaste tu carrito de compras?</p>
                  <Link to="/">
                    <button className="btn btn-primary">Descubrir productos</button>
                  </Link>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

export default UserOrderContainer;
