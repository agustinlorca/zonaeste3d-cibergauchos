import { useState,createContext } from "react";

export const CartStateContext = createContext();

const CartContext = ({ children }) => {
  
    const [listItems, setListItems] = useState([])
    const [cartList, setCartList] = useState(JSON.parse(localStorage.getItem('products')) || [])

    //Función para añadir un producto al carrito
    const addToCart = (product, quantity) =>{
      const productInCart = cartList.find((cartItem) => cartItem.id === product.id);

      if (productInCart){
        const updatedCartList = cartList.map((cartItem) =>
        cartItem.id === product.id
        ? { ...cartItem, qty: cartItem.qty + quantity}
        : cartItem);
        setCartList(updatedCartList);
        localStorage.setItem('products', JSON.stringify(updatedCartList))
      }else {
        const addNewProduct = [...cartList,{...product, qty: (quantity <= product.stock) ? quantity : product.stock}];
        setCartList(addNewProduct)
        localStorage.setItem('products', JSON.stringify(addNewProduct));
      }
    }

    //Función para eliminar un producto del carrito mediante su id
    const deleteCartItem = (idProduct) => {
      const filteredProducts = cartList.filter(cartItem => cartItem.id !== idProduct);
      setCartList(filteredProducts);
      localStorage.setItem('products', JSON.stringify(filteredProducts));
    }
  
    //Función para limpiar todo el carrito
    const removeCartList = () => {
      localStorage.setItem('products', JSON.stringify([]));
      setCartList([]);
    }

    //Funcion para obtener la cantidad actual que hay de un producto en el carrito
    const getCurrentQuantity = (idProduct) => {
      const productInCart = cartList.find(cartItem => cartItem.id === idProduct);
      return productInCart ? productInCart.qty : 0;
    };

    //Funcion para calcular el monto de un producto en el carrito
    const subTotal = (idProduct) => {
      const productInCart = cartList.find(cartItem => cartItem.id === idProduct);
      return productInCart ? productInCart.qty*productInCart.precio : 0;
    };

    //Función para calcular la cantidad total de productos que tenemos en el carrito
    const calcTotalQuantity = () =>  cartList.reduce((total, cartItem) => total + cartItem.qty, 0);
    
    //Función para calcular el monto total que tenemos en el carrito
    const calcTotalPrice = () => cartList.reduce((total, cartItem) => total + cartItem.precio * cartItem.qty, 0);
    

    const contextData = {
      listItems,
      setListItems,
      cartList,
      addToCart,
      deleteCartItem,
      removeCartList,
      calcTotalQuantity,
      calcTotalPrice,
      getCurrentQuantity,
      subTotal
    }
  return (
    <CartStateContext.Provider value={contextData}>
      {children}
    </CartStateContext.Provider>);
};
export default CartContext;
