import { createBrowserRouter, RouterProvider } from "react-router-dom";
import {
  Home,
  CategoryView,
  ItemDetailView,
  CartView,
  UserOrderView,
  OrderDetailView,
  NotFound,
  AdminDashboard,
  CheckoutView,
  ProfileView,
} from "../pages";
import Login from "../components/Auth/Login";
import Register from "../components/Auth/Register";
import AdminRoute from "./AdminRoute";

const Navigation = () => {
  const routes = createBrowserRouter([
    {
      path: "/",
      element: <Home />,
    },
    {
      path: "/category/:idCategory",
      element: <CategoryView />,
    },
    {
      path: "/item/:idItem",
      element: <ItemDetailView/>,
    },
    {
      path: "/cart",
      element: <CartView/>
    },
    {
      path: "/checkout",
      element: <CheckoutView/>
    },
    {
      path:"/login",
      element: <Login/>
    }
    ,
    {
      path:"/register",
      element: <Register/>
    }
    ,
        {
      path: "/my-orders",
      element: <UserOrderView/>
    },
        {
      path: "/profile",
      element: <ProfileView/>
    },
    {
      path: "/order/:orderID",
      element: <OrderDetailView/>
    },
    {
      path: "/admin",
      element: (
        <AdminRoute>
          <AdminDashboard />
        </AdminRoute>
      ),
    },
    {
      path: "/*",
      element: <NotFound/>,
    }
    
  ]);
  return <RouterProvider router={routes} />;
};

export default Navigation;
