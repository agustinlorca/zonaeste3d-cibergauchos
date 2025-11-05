# Zona Este 3D - E-commerce (Proyecto Final UTN San Rafael)

Proyecto integrador del grupo **Cibergauchos**. Se trata de un e-commerce de insumos y servicios de impresion 3D que cubre autenticacion de usuarios, catalogo dinamico, carrito de compras con checkout via Mercado Pago y panel de administracion con gestion de productos y ordenes en tiempo real sobre Firebase.

## Integrantes

- González Micaela Cecilia
- Huanca Leonela Jael
- Lorca Marcelo Agustín
- Marquez Luciano
- Molino Nahuel
- Pietropaolo Franco Danilo
- Sánchez Ulises Santiago

## Tabla de contenidos

1. [Descripcion general](#descripcion-general)
2. [Funcionalidades](#funcionalidades)
3. [Tecnologias utilizadas](#tecnologias-utilizadas)
4. [Arquitectura y flujo](#arquitectura-y-flujo)
5. [Requisitos previos](#requisitos-previos)
6. [Configuracion del entorno](#configuracion-del-entorno)
7. [Ejecucion local](#ejecucion-local)
8. [Manual de uso](#manual-de-uso)
9. [Credenciales de prueba y Mercado Pago](#credenciales-de-prueba-y-mercado-pago)
10. [API del backend](#api-del-backend)
11. [Estructura de carpetas](#estructura-de-carpetas)


## Descripcion general

Zona Este 3D permite a clientes descubrir productos de impresion 3D, gestionar un carrito persistente y completar compras a traves de Mercado Pago. Los usuarios autenticados acceden a su historial de pedidos y administran sus datos personales. Los perfiles administradores cuentan con un panel para alta/baja/modificacion de productos, monitoreo de ordenes y actualizacion de estados logisticos, integrados con Firestore para sincronizacion en tiempo real y con webhooks para reflejar el estado del pago.

## Funcionalidades

- **Navegacion de catalogo** por categorias (Makers, Filamentos, Impresoras), busqueda y fichas detalladas con stock y especificaciones.
- **Carrito de compras persistente** (localStorage) con controles de cantidad, subtotal y total.
- **Autenticacion de usuarios** (registro con nombre, apellido, DNI, telefono, email y password; login; recuperacion de password).
- **Checkout guiado** con pre-carga de datos del perfil, seleccion de envio a domicilio o retiro en sucursal, validaciones y redireccion a Mercado Pago.
- **Confirmacion post-compra** con detalle de orden, estados de pago y seguimiento desde la seccion Mis pedidos.
- **Panel administrador** con:
  - Formulario para crear, editar y eliminar productos.
  - Filtros y busqueda por categoria, marca y tipo.
  - Gestion de ordenes con filtros por estado/fecha/texto y actualizacion de estados logisticos que impacta en clientes.
- **Integracion Mercado Pago** (preferencias de pago, webhooks y confirmacion manual para ajuste de stock).
- **Sincronizacion Firestore** para catalogo, usuarios y ordenes.

## Tecnologias utilizadas

### Frontend

- React 18 con Vite.
- React Router DOM para el enrutamiento del cliente.
- React Context API para gestion de autenticacion (`frontend/src/context/AuthContext.jsx`) y carrito (`frontend/src/context/CartContext.jsx`).
- Bootstrap 5, React Bootstrap, Bootstrap Icons para la UI responsiva.
- React Toastify y SweetAlert2 para feedback al usuario.

### Backend

- Node.js + Express (servidor REST).
- Firebase Admin SDK para Firestore (persistencia de usuarios y ordenes).
- Mercado Pago SDK oficial.
- Zod para validar payloads de checkout.


### Infraestructura y despliegue

- Variables de entorno administradas via `.env`.
- Deploy frontend en Vercel
- Deploy backend en Render
- Integracion de Webhooks de Mercado Pago apuntando a `/api/mercadopago/webhook`.

## Arquitectura y flujo

1. **Cliente** consume la SPA de React; toda la UI se estructura bajo `Navigation.jsx` que define rutas publicas, protegidas y de administrador.
2. **Carrito** y **perfil** se gestionan en el navegador mediante contextos, sincronizando datos relevantes con Firestore.
3. **Checkout** genera orden preliminar en Firestore y crea una preferencia de pago en Mercado Pago. Se guarda `preferenceId`, `initPoint` y datos de envio.
4. **Mercado Pago** redirige al usuario al checkout oficial y notifica al backend mediante webhook sobre cada cambio de estado.
5. **Webhook** actualiza la orden con estados de pago, datos del pagador y detalle de transaccion.
6. **Confirmacion**: al volver de Mercado Pago el frontend consulta la orden; si el pago esta aprobado se llama a `/orders/:id/confirm` para marcar pago confirmado y descontar stock.
7. **Panel Admin** escucha cambios en Firestore (productos) y consulta la API de ordenes para reportes y actualizaciones.

## Requisitos previos

- Node.js 18 o superior.
- NPM 9 o superior.
- Una cuenta de Firebase con un proyecto configurado y credenciales de servicio (Firebase Admin SDK).
- Credenciales de prueba de Mercado Pago (Access Token y Public Key).

## Configuracion del entorno

Clonar el repositorio:

```bash
git clone <url-del-repo>
cd cibergauchos-PI-ecommerce-cuarto-semestre
```

### 1. Backend (`/backend`)

1. Copiar el archivo `.env.example` a `.env`.
2. Completar las variables:

| Variable | Descripcion |
| --- | --- |
| `PORT` | Puerto del servidor Express (por defecto 3000). |
| `FRONTEND_URL` | URL desde la que se sirve el frontend (p.ej. http://localhost:5173). Acepta multiples valores separados por coma para CORS. |
| `BACKEND_URL` | URL publica del backend usada para generar URLs absolutas (p.ej. http://localhost:3000). |
| `MP_ACCESS_TOKEN` | Access Token de Mercado Pago en modo prueba. |
| `FIREBASE_PROJECT_ID` | ID del proyecto de Firebase. |
| `FIREBASE_CLIENT_EMAIL` | Email del servicio (Firebase Admin SDK). |
| `FIREBASE_PRIVATE_KEY` | Clave privada del servicio.|

### 2. Frontend (`/frontend`)

1. Copiar `.env.example` a `.env`.
2. Completar:

| Variable | Descripcion |
| --- | --- |
| `VITE_API_BASE_URL` | URL base del backend (p.ej. http://localhost:3000/api). |
| `VITE_MP_PUBLIC_KEY` | Public Key de Mercado Pago (modo prueba) usada en el frontend si se necesita integrar el Checkout Bricks. |

> Nota: el archivo `frontend/src/firebase/credentials.js` contiene la configuracion del SDK de Firebase del lado cliente. Reemplazar los valores por los del proyecto correspondiente.

### 3. Instalar dependencias

```bash
cd backend
npm install
cd ../frontend
npm install
```

## Ejecucion local

Abrir dos terminales:

**Terminal 1 – Backend**

```bash
cd backend
npm run dev
```

**Terminal 2 – Frontend**

```bash
cd frontend
npm run dev
```

El frontend queda disponible en `http://localhost:5173` (puerto configurado por Vite) y el backend responde en `http://localhost:3000`.

Probar conectividad accediendo a `http://localhost:3000/health` para verificar el estado del backend.

## Manual de uso

### Flujo de cliente

1. Ingresar a la home y navegar el catalogo por categorias o busqueda.
2. Abrir la ficha de un producto para revisar descripcion y stock; ajustar cantidad y agregar al carrito.
3. Revisar el carrito (`/cart`), eliminar productos o limpiar el listado.
4. Iniciar sesion o registrarse cuando la aplicacion lo solicite al intentar comprar.
5. Completar el checkout, elegir metodo de entrega (envio con direccion o retiro).
6. Confirmar con el boton **Pagar con Mercado Pago** y usar credenciales de usuarios de prueba. Tras el pago la aplicacion redirige al detalle de la orden.
7. Revisar el estado de la orden y seguirla en **Mis pedidos**. En la seccion **Mi perfil** pueden editarse nombre, apellido y telefono.

### Flujo de administrador

1. Iniciar sesion con un usuario cuyo `role` sea `admin` (configurado en la coleccion `users` de Firebase).
2. Acceder al panel `/admin`:
   - **Gestionar productos**: crear nuevos productos, editar existentes y eliminar. El listado se actualiza en vivo gracias a Firestore.
   - **Gestionar ordenes**: aplicar filtros por estado, fechas o email; actualizar el estado logístico de cada pedido (pendiente, pagado, preparando, enviado, entregado, cancelado).
3. Cada cambio de estado se refleja en la vista de los clientes y ayuda a seguir la compra.

## Credenciales de prueba y Mercado Pago

- Crear usuarios de prueba desde el dashboard de Mercado Pago (seccion *Credenciales de prueba*).
- Usar Access Token y Public Key de modo *test*.
- Para compras exitosas, usar tarjetas de prueba con nombre **APRO** y el resto de datos segun la documentacion oficial (p.ej. tarjeta visa 4509 9535 6623 3704, vencimiento 11/30, CVV 123, DNI 12345678).
- Configurar el Webhook en Mercado Pago apuntando a `https://<url-backend>/api/mercadopago/webhook`.

## API del backend

| Metodo | Endpoint | Descripcion |
| --- | --- | --- |
| `GET` | `/health` | Verifica estado del servidor. |
| `POST` | `/api/checkout` | Crea una orden preliminar y genera preferencia de pago en Mercado Pago. |
| `GET` | `/api/orders` | Lista ordenes con filtros opcionales `status`, `from`, `to`, `search`. |
| `GET` | `/api/orders/:orderId` | Obtiene detalle de una orden en Firestore. |
| `PATCH` | `/api/orders/:orderId` | Actualiza el estado logistico (`fulfillmentStatus`). |
| `POST` | `/api/orders/:orderId/confirm` | Confirma pago, actualiza estados y descuenta stock. |
| `POST` | `/api/mercadopago/webhook` | Recibe notificaciones de pago y sincroniza estado con Firestore. |

> Todas las rutas devuelven JSON y manejan codigos de error descriptivos. Los payloads de checkout se validan con Zod (`backend/src/schemas/checkout.schema.js`).

## Estructura de carpetas

```
PROYECTO/
├─ backend/
│  ├─ src/
│  │  ├─ app.js
│  │  ├─ index.js
│  │  ├─ config/
│  │  ├─ controllers/
│  │  ├─ routes/
│  │  ├─ schemas/
│  │  └─ services/
│  └─ package.json
├─ frontend/
│  ├─ src/
│  │  ├─ components/
│  │  ├─ context/
│  │  ├─ firebase/
│  │  ├─ pages/
│  │  └─ routes/
│  └─ package.json
└─ README.md
```
