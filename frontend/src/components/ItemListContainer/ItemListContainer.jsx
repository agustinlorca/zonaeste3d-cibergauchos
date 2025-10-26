import React, { useState, useEffect, useContext } from "react";
import { useParams } from "react-router-dom";

import { db } from "../../firebase/credentials";
import { collection, getDocs, query, where } from "firebase/firestore";

import { CartStateContext } from "../../context/CartContext";

import "./itemListContainer.css";
import ItemList from "../ItemList/ItemList";
import SpinnerLoader from "../SpinnerLoader/SpinnerLoader";
import SearchBar from './../SearchBar/SearchBar';
import Container from "react-bootstrap/Container";

const ItemListContainer = () => {
  const [allProducts, setAllProducts] = useState([]);
  const { listItems, setListItems } = useContext(CartStateContext);
  const [searchTerm, setSearchTerm] = useState('');
  const [hasResults, setHasResults] = useState(true);
  const [isLoading, setIsLoading] = useState(true);
  const { idCategory } = useParams();

  const getProducts = async() => {
    const collectionName = "products";
    //Referencia a la coleccion 'products'
    const productsRef = collection(db, collectionName); 

    //Nos traemos los productos de las categorías por las que naveguemos
    const categoryQuery = idCategory ? query(productsRef, where("categoria", "==", idCategory)) : productsRef;

    //Obtenemos los docs de todos los productos y formateamos para trabajarlo más comodo
    const allDocs = await getDocs(productsRef);
    const allproductListFormat = allDocs.docs.map((product) => ({id: product.id,...product.data(),}));

    //Obtenemos los docs de los productos dependiendo de la categoría y formateamos para trabajarlo más comodo
    const categoryDocs = await getDocs(categoryQuery); 
    const productListFormat = categoryDocs.docs.map((product) => ({id: product.id,...product.data(),}));

    setAllProducts(allproductListFormat); //Acá siempre vamos a tener todos los productos
    setListItems(productListFormat); //Acá vamos a tener el listado de productos dependiendo de las busquedas o categorías
    setIsLoading(false);

    setHasResults(productListFormat.length > 0);
  }
  
  const handleSearch = (e) => {
    const term = e.target.value;
    if (term.length === 0) {
      setListItems(allProducts);
      setHasResults(allProducts.length > 0);
    }
    setSearchTerm(term);
  }
  const handleSubmit = () => {
    if (searchTerm) {
      const filteredProducts = allProducts.filter((product) =>
        product.nombre.toLowerCase().includes(searchTerm.toLowerCase())
      );
      setListItems(filteredProducts);
      setHasResults(filteredProducts.length > 0);
    } else {
      setListItems(allProducts);
      setHasResults(allProducts.length > 0);
    }
  }
  useEffect(() => {
    getProducts()
    setIsLoading(true);
  },[idCategory])

  
  return (
    <Container className="container" style={{ marginTop: idCategory ? "6rem" : "2rem", marginBottom: "2rem" }}>
       <nav aria-label="breadcrumb" className="bg-nav rounded mb-4">
        <h2 className="text-white fw-bold text-center p-3" aria-current="page">
          NUESTROS PRODUCTOS PARA VOS
        </h2>
      </nav>
      
      <SearchBar
        title="Buscar productos"
        handleSearch={handleSearch} 
        handleSubmit={handleSubmit}
        msg="Buscar productos, marcas y más..." 
      />
    
      {isLoading ? (
        <SpinnerLoader />
      ) : hasResults ? (
        <ItemList items={listItems} />
      ) : (
        <div className="alert alert-info text-center mt-4" role="alert">
          Ups, parece que no encontramos productos para esta categoria.
        </div>
      )}
    </Container>
  );
};
export default ItemListContainer;
