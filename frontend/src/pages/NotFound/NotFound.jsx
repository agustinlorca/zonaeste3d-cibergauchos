
import { Link } from "react-router-dom";
import { Container, Row, Col, Card } from "react-bootstrap";
import { PatchExclamationFill } from "react-bootstrap-icons";
import Layout from "../../components/Layout/Layout";

const NotFound = () => {
  return (
    <Layout>
      <Container className="d-flex align-items-center justify-content-center" style={{ minHeight: "80vh" }}>
        <Row className="justify-content-center w-100">
          <Col md={6}>
            <Card>
              <Card.Header className="bg-danger text-light d-flex align-items-center justify-content-center">
                <PatchExclamationFill className="me-3" size={40}/> 
                <h1>Error 404</h1>
              </Card.Header>
              <Card.Body className="text-center">
                <Card.Title className="text-center fs-3 mb-4">
                  Página no encontrada
                </Card.Title>
                <Card.Text className="mb-4">
                Lo sentimos, la página a la que intentas acceder no existe.
                </Card.Text>
                <Link to="/" className="btn btn-outline-dark">Ir al inicio</Link>
              </Card.Body>
            </Card>
          </Col>
        </Row>
      </Container>
    </Layout>
  );
};

export default NotFound;
