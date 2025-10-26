import { useState, useContext } from "react";
import { CartStateContext } from "../../context/CartContext";
import './ItemCount.css'
import Swal from 'sweetalert2';
import {toast} from 'react-toastify';

const ItemCount = ({product}) => {
    const {addToCart, getCurrentQuantity} = useContext(CartStateContext);
    const [quantity, setQuantity] = useState(1);
    const currentQuantity = getCurrentQuantity(product.id)

    const handleIncrease = () => {
        const newQuantity = quantity + currentQuantity;
        const maxAvailable = product.stock - currentQuantity;

        if(newQuantity < product.stock){
            setQuantity(quantity + 1)
           
        }else{
            currentQuantity === 0
            ?
            Swal.fire({
                title: 'Alerta de Stock',
                html:`Por el momento solo contamos con <strong>${product.stock} unidades</strong> de este producto.`,
                icon: 'warning',
                confirmButtonText: 'Intentar nuevamente'
              })
            :
            Swal.fire({
                title: 'Cantidad no disponible',
                html:`Ya tenías <strong>${currentQuantity} unidades</strong> de este producto. Sólo puedes añadir <strong>${maxAvailable} unidades</strong> más.`,
                icon: 'warning',
                confirmButtonText: 'Intentar nuevamente'
              })
            setQuantity(maxAvailable);
        }
        
    };
    const handleDecrease = () => {
        if (quantity > 1) {
            setQuantity(quantity - 1);
        }
    };
    const handleAddToCart = () => {
        addToCart(product, quantity)
        setQuantity(1);
        toast.success(`Producto añadido exitosamente`, {
            position: "top-right",
            autoClose: 3000,
            hideProgressBar: false,
            closeOnClick: true,
            pauseOnHover: true,
            draggable: true,
            progress: undefined,
            theme: "light",
        });
    }
    
    if(currentQuantity === product.stock){
        return(
        <div className="container mb-4 text-center count">
            <h6 className="text-muted ">Ya has agregado el máximo de unidades disponibles para este producto</h6>
        </div>)
    }
    return (
        <div className="container mb-4 count">
            <div className="row mb-4">
                <div className="col-4">
                    <button className="btn btn-outline-danger w-100" onClick={handleDecrease}>-</button>
                </div>
                <div className="col-4">
                    
                    <p className="form-control text-center">{quantity}</p>
                </div>
                <div className="col-4">
                    <button className="btn btn-outline-success w-100" onClick={handleIncrease}>+</button>
                </div>
            </div>
            <div className="row mb-4">
                <div className="col">
                    <button className="btn btn-outline-primary w-100" onClick={handleAddToCart}>
                        Añadir al carrito
                    </button>
                </div>
            </div>
           
        </div>
    );
}

export default ItemCount;
