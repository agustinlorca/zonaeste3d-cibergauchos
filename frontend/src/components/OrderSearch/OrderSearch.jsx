import { useState} from "react";

import { doc, getDoc } from "firebase/firestore";
import { db } from "../../firebase/credentials";

import Order from "../Order/Order";
import SpinnerLoader from "../SpinnerLoader/SpinnerLoader";

import {Container} from "react-bootstrap";

import SearchBar from "../SearchBar/SearchBar";

const OrderSearch = () => {
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');
  const [orderID, setOrderID] = useState('');
  const [order, setOrder] = useState({});

  const handleSearch = (e) => {
    const input = e.target.value;
    setOrderID(input);
  };
  const getOrder = async () => {
    try {
      const collectionName = 'orders';
      const orderRef = doc(db, collectionName, orderID);
      const response = await getDoc(orderRef);
      if (response.exists()) {
        const orderFormat = { id: response.id, ...response.data() };
        setOrder(orderFormat);
        setIsLoading(false);
      } else {
        setError('El n° de orden que ingresaste no se encuentra en nuestra base de datos. Por favor, verifica de nuevo.');
        setIsLoading(false);
      }

    } catch (error) {
      setError('Ocurrió un error al buscar el pedido. Por favor, inténtelo de nuevo más tarde.');
      setIsLoading(false);
    }
  };

  const handleSubmit = () => {
    setError('');
    setOrder({})
    if (orderID.trim() === '') {
      setError('Por favor, ingrese un número de pedido');
    } else if (orderID.length !== 20){
      setError('El n° de orden debe contener 20 caracteres');
    } else {
      setIsLoading(true);
      getOrder();
    }
  };

  return (
    <Container style={{ marginTop: '8rem'}}>
      <SearchBar
      title="Buscar pedidos" 
      handleSearch={handleSearch} 
      handleSubmit={handleSubmit} 
      msg="Ingresa el n° de orden que recibiste en tu compra" 
      error={error}
      />

      { 
      (isLoading ? (<SpinnerLoader/>) : <Order id={order.id} total={order.total}/>)
      }
    </Container>
  );
};

export default OrderSearch;
