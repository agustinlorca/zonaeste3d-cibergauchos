import "./App.css";
import CartContext from "./context/CartContext";
import Navigation from "./routes/Navigation";
import { ToastContainer} from 'react-toastify';
import AuthContext from "./context/AuthContext";
function App() {
  return (
    <AuthContext>
      <CartContext>
        
        <Navigation />
        <ToastContainer />
      </CartContext>
    </AuthContext>
    
  );
}

export default App;
