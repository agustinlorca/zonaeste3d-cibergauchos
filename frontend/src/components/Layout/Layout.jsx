import NavbarComp from "./Navbar/NavbarComp";
import Footer from "./Footer/Footer";

const Layout = ({ children }) => {
  return (
    <>
      <NavbarComp/>
        <div className="body">{children}</div>
      <Footer/>
    </>
  );
};
export default Layout;
