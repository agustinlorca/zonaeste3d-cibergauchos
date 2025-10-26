import {FormControl,InputGroup,Row,Col,Button} from "react-bootstrap";
import { Search } from "react-bootstrap-icons";

const SearchBar = ({title,handleSearch,handleSubmit,msg,error}) => {
  return (
    <Row className="justify-content-center mt-4 mb-4">
      <Col xs={10} md={6}>
        <h2 className="text-center fw-bold mb-4 tracking-in-expand">{title}</h2>
        <InputGroup>
          <FormControl type="search" placeholder={msg} onChange={handleSearch} />
          <Button onClick={handleSubmit}>
            <Search />
          </Button>
        </InputGroup>
        <div className="mt-3 text-center">
          {error && <p className="mt-3 text-center text-danger">{error}</p>}
        </div>
      </Col>
    </Row>
  )
}

export default SearchBar
