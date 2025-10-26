import ItemListContainer from "../../components/ItemListContainer/ItemListContainer";
import Banner from "../../components/Banner/Banner";
import Layout from "../../components/Layout/Layout";


const Home = () => {
  return (
     <Layout>
      <Banner style={{marginTop:"12rem"}}/>
      <ItemListContainer/>
     </Layout>
      
  );
};
export default Home;
