import { Link} from "react-router-dom";
import {Table, Badge } from "react-bootstrap";

const Order = ({id,total}) => {
  
  return (
    <Table bordered hover responsive>
      <thead>
        <tr className="head-table">
          <th>Pedido N°</th>
          <th>Estado</th>
          <th>Total</th>
          <th>Detalle</th>
        </tr>
      </thead>
      <tbody className="text-center">
        {id 
        ? (
        <tr>
          <td style={{width: '400px'}}>
            {id}
          </td>
          <td><Badge bg="primary" className="fs-6">Pendiente</Badge></td>
          <td className="text-primary" style={{width: '300px'}}>$ {total.toLocaleString("es-ES")}</td>
          <td>
            <Link className="text-decoration-none" to={`/order/${id}`}>
              <Badge bg="secondary" className="fs-6">Ver</Badge>
            </Link>
          </td>
        </tr>)
        :
        (<tr>
          <td colSpan={4}>...</td>
        </tr>)
        }
        
      </tbody>
    </Table>
  );
};

export default Order;
