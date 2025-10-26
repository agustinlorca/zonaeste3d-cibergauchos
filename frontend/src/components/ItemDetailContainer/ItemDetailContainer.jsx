import { useState, useEffect } from "react";
import { useParams, useNavigate} from "react-router-dom";

import { doc, getDoc } from "firebase/firestore";
import { db } from "../../firebase/credentials";

import ItemDetail from "../ItemDetail/ItemDetail";
import SpinnerLoader from "../SpinnerLoader/SpinnerLoader";

const ItemDetailContainer = () => {
  const navigate = useNavigate();
  const [isLoading, setIsLoading] = useState(true);
  const [product, setProduct] = useState({});
  const { idItem } = useParams();

  const getProduct = async() => {
    const collectionName = "products";
    const productRef = doc(db,collectionName,idItem)
    const response = await getDoc(productRef);
    
    if(response.exists()) {
      const productFormat = {id: response.id, ...response.data()}
      setProduct(productFormat)
      setIsLoading(false)
    }else{
      navigate('/not-found')
    }
  }

  useEffect(() => {
    window.scrollTo(0, 0);
    getProduct()
  }, [idItem]);

 
  return (
    <div className="container" style={{ marginTop: "6rem", marginBottom: "5rem" }}>
      {isLoading ? <SpinnerLoader /> : <ItemDetail item={product} />}
    </div>
  );
};

export default ItemDetailContainer;
