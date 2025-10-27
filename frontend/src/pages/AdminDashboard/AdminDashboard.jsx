import { useEffect, useMemo, useState } from "react";
import {
  addDoc,
  collection,
  deleteDoc,
  doc,
  onSnapshot,
  orderBy,
  query,
  updateDoc,
} from "firebase/firestore";
import { Container, Row, Col, Form, Button, Table, Badge, ButtonGroup } from "react-bootstrap";
import { PencilSquare, Trash3 } from "react-bootstrap-icons";
import { toast } from "react-toastify";

import { db } from "../../firebase/credentials";
import SpinnerLoader from "../../components/SpinnerLoader/SpinnerLoader";
import Layout from "../../components/Layout/Layout";
import AdminOrdersPanel from "../../components/AdminOrdersPanel/AdminOrdersPanel";

const PRODUCTS_COLLECTION = "products";

const initialFormState = {
  nombre: "",
  descripcion: "",
  categoria: "",
  precio: "",
  stock: "",
  imgUrl: "",
  sku: "",
  marca: "",
  tipo: "",
};

const CATEGORY_OPTIONS = ["makers", "filamentos", "impresoras"];

const AdminDashboard = () => {
  const [products, setProducts] = useState([]);
  const [form, setForm] = useState(initialFormState);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [editingId, setEditingId] = useState(null);
  const [selectedCategory, setSelectedCategory] = useState("all");
  const [searchTerm, setSearchTerm] = useState("");
  const [activeSection, setActiveSection] = useState("products");

  const formCategoryOptions = useMemo(() => {
    const options = new Set(CATEGORY_OPTIONS);
    if (form.categoria) {
      options.add(form.categoria);
    }
    return Array.from(options);
  }, [form.categoria]);

  useEffect(() => {
    const productsRef = collection(db, PRODUCTS_COLLECTION);
    const q = query(productsRef, orderBy("nombre", "asc"));
    const unsubscribe = onSnapshot(
      q,
      (snapshot) => {
        const docs = snapshot.docs.map((item) => ({
          id: item.id,
          ...item.data(),
        }));
        setProducts(docs);
        setIsLoading(false);
      },
      (error) => {
        console.error("Error cargando productos:", error);
        toast.error("No pudimos cargar los productos. Intenta mas tarde.");
        setIsLoading(false);
      }
    );

    return () => unsubscribe();
  }, []);

  const categories = useMemo(() => {
    const unique = new Set(products.map((product) => product.categoria ?? "sin-categoria"));
    return Array.from(unique).sort((a, b) => a.localeCompare(b));
  }, [products]);

  const brands = useMemo(() => {
    const unique = new Set(products.map((product) => product.marca ?? ""));
    return Array.from(unique)
      .filter(Boolean)
      .sort((a, b) => a.localeCompare(b));
  }, [products]);

  const types = useMemo(() => {
    const unique = new Set(products.map((product) => product.tipo ?? ""));
    return Array.from(unique)
      .filter(Boolean)
      .sort((a, b) => a.localeCompare(b));
  }, [products]);

  const filteredProducts = useMemo(() => {
    return products
      .filter((product) => {
        const matchesCategory =
          selectedCategory === "all" || product.categoria === selectedCategory;
        const normalizedSearch = searchTerm.toLowerCase();
        const matchesSearch =
          product.nombre?.toLowerCase().includes(normalizedSearch) ||
          product.marca?.toLowerCase().includes(normalizedSearch) ||
          product.tipo?.toLowerCase().includes(normalizedSearch);
        return matchesCategory && matchesSearch;
      })
      .sort((a, b) => a.nombre.localeCompare(b.nombre));
  }, [products, selectedCategory, searchTerm]);

  const handleChange = (event) => {
    const { name, value } = event.target;
    setForm((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const resetForm = () => {
    setForm(initialFormState);
    setEditingId(null);
  };

  const validateForm = () => {
    const requiredFields = ["nombre", "precio", "stock", "categoria", "imgUrl"];
    for (const field of requiredFields) {
      if (!form[field] || form[field].toString().trim() === "") {
        toast.warning("Completa todos los campos obligatorios.");
        return false;
      }
    }

    if (Number.isNaN(Number(form.precio)) || Number(form.precio) < 0) {
      toast.warning("Ingresa un precio valido.");
      return false;
    }

    if (!Number.isInteger(Number(form.stock)) || Number(form.stock) < 0) {
      toast.warning("Ingresa un stock valido.");
      return false;
    }

    return true;
  };

  const buildPayload = () => ({
    nombre: form.nombre.trim(),
    descripcion: form.descripcion.trim(),
    categoria: form.categoria.trim().toLowerCase(),
    marca: form.marca.trim(),
    tipo: form.tipo.trim(),
    precio: Number(form.precio),
    stock: Number(form.stock),
    imgUrl: form.imgUrl.trim(),
    sku: form.sku.trim(),
    updatedAt: Date.now(),
  });

  const handleSubmit = async (event) => {
    event.preventDefault();
    if (!validateForm()) {
      return;
    }

    try {
      setIsSubmitting(true);
      const payload = buildPayload();
      if (editingId) {
        const productRef = doc(db, PRODUCTS_COLLECTION, editingId);
        await updateDoc(productRef, payload);
        toast.success("Producto actualizado");
      } else {
        await addDoc(collection(db, PRODUCTS_COLLECTION), {
          ...payload,
          createdAt: Date.now(),
        });
        toast.success("Producto creado");
      }
      resetForm();
    } catch (error) {
      console.error("Error guardando producto:", error);
      toast.error("No pudimos guardar el producto. Intenta mas tarde.");
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleEdit = (product) => {
    setEditingId(product.id);
    setForm({
      nombre: product.nombre ?? "",
      descripcion: product.descripcion ?? "",
      categoria: product.categoria ?? "",
      marca: product.marca ?? "",
      tipo: product.tipo ?? "",
      precio: product.precio ?? "",
      stock: product.stock ?? "",
      imgUrl: product.imgUrl ?? "",
      sku: product.sku ?? "",
    });
  };

  const handleDelete = async (productId) => {
    const confirmed = window.confirm("¿Seguro que deseas eliminar este producto?");
    if (!confirmed) {
      return;
    }

    try {
      await deleteDoc(doc(db, PRODUCTS_COLLECTION, productId));
      toast.success("Producto eliminado");
      if (editingId === productId) {
        resetForm();
      }
    } catch (error) {
      console.error("Error eliminando producto:", error);
      toast.error("No pudimos eliminar el producto. Intenta mas tarde.");
    }
  };

  if (activeSection === "orders") {
    return (
      <Layout>
        <Container style={{ marginTop: "6rem", marginBottom: "3rem" }}>
          <div className="d-flex flex-column flex-md-row align-items-md-center justify-content-between mb-4">
            <h1 className="fw-bold mb-0 text-primary">Panel de administracion</h1>
            <ButtonGroup>
              <Button
                variant={activeSection === "products" ? "primary" : "outline-primary"}
                onClick={() => setActiveSection("products")}
              >
                Gestionar productos
              </Button>
              <Button
                variant={activeSection === "orders" ? "primary" : "outline-primary"}
                onClick={() => setActiveSection("orders")}
              >
                Gestionar ordenes
              </Button>
            </ButtonGroup>
          </div>
          <AdminOrdersPanel />
        </Container>
      </Layout>
    );
  }

  return (
    <Layout>
      <Container style={{ marginTop: "6rem", marginBottom: "3rem" }}>
        <div className="d-flex flex-column flex-md-row align-items-md-center justify-content-between mb-4">
          <h1 className="fw-bold mb-0 text-primary">Panel de administracion</h1>
          <ButtonGroup>
            <Button
              variant={activeSection === "products" ? "primary" : "outline-primary"}
              onClick={() => setActiveSection("products")}
            >
              Gestionar productos
            </Button>
            <Button
              variant={activeSection === "orders" ? "primary" : "outline-primary"}
              onClick={() => setActiveSection("orders")}
            >
              Gestionar ordenes
            </Button>
          </ButtonGroup>
      </div>
      <Row className="g-4">
        <Col lg={5}>
          <div className="card shadow-sm p-4">
            <h2 className="h5 fw-bold mb-3">
              {editingId ? "Editar producto" : "Nuevo producto"}
            </h2>
            <Form onSubmit={handleSubmit}>
              <Form.Group className="mb-3">
                <Form.Label>Nombre *</Form.Label>
                <Form.Control
                  type="text"
                  name="nombre"
                  value={form.nombre}
                  onChange={handleChange}
                  placeholder="Ej: Impresora 3D Ender"
                  required
                />
              </Form.Group>
              <Form.Group className="mb-3">
                <Form.Label>Descripcion</Form.Label>
                <Form.Control
                  as="textarea"
                  rows={3}
                  name="descripcion"
                  value={form.descripcion}
                  onChange={handleChange}
                  placeholder="Detalles breves del producto"
                />
              </Form.Group>
              <Row className="g-3">
                <Col md={4}>
                  <Form.Group>
                    <Form.Label>Categoria *</Form.Label>
                    <Form.Select
                      name="categoria"
                      value={form.categoria}
                      onChange={handleChange}
                      required
                    >
                      <option value="" disabled hidden>
                        Selecciona una categoria
                      </option>
                      {formCategoryOptions.map((category) => (
                        <option value={category} key={category}>
                          {category.charAt(0).toUpperCase() + category.slice(1)}
                        </option>
                      ))}
                    </Form.Select>
                  </Form.Group>
                </Col>
                <Col md={4}>
                  <Form.Group>
                    <Form.Label>Marca</Form.Label>
                    <Form.Control
                      type="text"
                      name="marca"
                      value={form.marca}
                      onChange={handleChange}
                      placeholder="Ej: Creality"
                      list="brands"
                    />
                    <datalist id="brands">
                      {brands.map((brand) => (
                        <option value={brand} key={brand} />
                      ))}
                    </datalist>
                  </Form.Group>
                </Col>
                <Col md={4}>
                  <Form.Group>
                    <Form.Label>Tipo</Form.Label>
                    <Form.Control
                      type="text"
                      name="tipo"
                      value={form.tipo}
                      onChange={handleChange}
                      placeholder="Ej: PLA, accesorios"
                      list="types"
                    />
                    <datalist id="types">
                      {types.map((type) => (
                        <option value={type} key={type} />
                      ))}
                    </datalist>
                  </Form.Group>
                </Col>
              </Row>
              <Row className="g-3 mt-1">
                <Col md={6}>
                  <Form.Group>
                    <Form.Label>Precio *</Form.Label>
                    <Form.Control
                      type="number"
                      name="precio"
                      value={form.precio}
                      min="0"
                      step="0.01"
                      onChange={handleChange}
                      placeholder="0.00"
                      required
                    />
                  </Form.Group>
                </Col>
                <Col md={6}>
                  <Form.Group>
                    <Form.Label>Stock *</Form.Label>
                    <Form.Control
                      type="number"
                      name="stock"
                      value={form.stock}
                      min="0"
                      step="1"
                      onChange={handleChange}
                      placeholder="0"
                      required
                    />
                  </Form.Group>
                </Col>
              </Row>
              <Form.Group className="mt-3">
                <Form.Label>Imagen (URL) *</Form.Label>
                <Form.Control
                  type="url"
                  name="imgUrl"
                  value={form.imgUrl}
                  onChange={handleChange}
                  placeholder="https://..."
                  required
                />
              </Form.Group>
              <Form.Group className="mt-3">
                <Form.Label>SKU / ID interno</Form.Label>
                <Form.Control
                  type="text"
                  name="sku"
                  value={form.sku}
                  onChange={handleChange}
                  placeholder="Opcional"
                />
              </Form.Group>
              <div className="d-flex gap-2 mt-4">
                <Button type="submit" variant="success" disabled={isSubmitting}>
                  {editingId ? "Guardar cambios" : "Crear producto"}
                </Button>
                <Button
                  type="button"
                  variant="outline-secondary"
                  onClick={resetForm}
                  disabled={isSubmitting}
                >
                  Cancelar
                </Button>
              </div>
            </Form>
          </div>
        </Col>
        <Col lg={7}>
          <div className="card shadow-sm p-4">
            <div className="d-flex flex-column flex-md-row gap-3 mb-3">
              <Form.Select
                value={selectedCategory}
                onChange={(event) => setSelectedCategory(event.target.value)}
              >
                <option value="all">Todas las categorias</option>
                {categories.map((category) => (
                  <option value={category} key={category}>
                    {category}
                  </option>
                ))}
              </Form.Select>
              <Form.Control
                type="search"
                placeholder="Buscar por nombre"
                value={searchTerm}
                onChange={(event) => setSearchTerm(event.target.value)}
              />
            </div>
            {isLoading ? (
              <SpinnerLoader />
            ) : filteredProducts.length === 0 ? (
              <div className="alert alert-info text-center mb-0">
                No encontramos productos para estos filtros.
              </div>
            ) : (
              <div className="table-responsive">
                <Table striped hover responsive>
                  <thead>
                    <tr>
                      <th>Producto</th>
                      <th>Categoria</th>
                      <th>Marca</th>
                      <th>Tipo</th>
                      <th>Precio</th>
                      <th>Stock</th>
                      <th>SKU</th>
                      <th />
                    </tr>
                  </thead>
                  <tbody>
                    {filteredProducts.map((product) => (
                      <tr key={product.id}>
                        <td>
                          <div className="d-flex flex-column">
                            <span className="fw-bold">{product.nombre}</span>
                            <small className="text-muted text-truncate" style={{ maxWidth: 260 }}>
                              {product.descripcion || "Sin descripcion"}
                            </small>
                          </div>
                        </td>
                        <td>
                          <Badge bg="secondary" className="text-uppercase">
                            {product.categoria || "sin categoria"}
                          </Badge>
                        </td>
                        <td>
                          {product.marca ? (
                            <Badge bg="info" className="text-uppercase">
                              {product.marca}
                            </Badge>
                          ) : (
                            "-"
                          )}
                        </td>
                        <td>
                          {product.tipo ? (
                            <Badge bg="dark" className="text-uppercase">
                              {product.tipo}
                            </Badge>
                          ) : (
                            "-"
                          )}
                        </td>
                        <td>${Number(product.precio || 0).toLocaleString("es-AR")}</td>
                        <td>{product.stock ?? 0}</td>
                        <td>{product.sku || "-"}</td>
                        <td className="text-nowrap">
                          <Button
                            size="sm"
                            variant="outline-primary"
                            className="me-2"
                            onClick={() => handleEdit(product)}
                          >
                            <PencilSquare />
                          </Button>
                          <Button
                            size="sm"
                            variant="outline-danger"
                            onClick={() => handleDelete(product.id)}
                          >
                            <Trash3 />
                          </Button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </Table>
              </div>
            )}
          </div>
        </Col>
      </Row>
    </Container>
    </Layout>
  );
};

export default AdminDashboard;
