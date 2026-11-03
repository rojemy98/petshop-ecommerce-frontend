# Mokka Pets – Frontend

Mokka Pets is a web-based e-commerce application for a pet store. It allows customers to browse products, filter them by category, manage their shopping cart, complete purchases, and view their invoices.

The application also provides administrative functionality for product inventory management and sales monitoring.

## 1. Technologies Used

| Technology              | Purpose                                                                                                    |
| ----------------------- | ---------------------------------------------------------------------------------------------------------- |
| HTML5                   | Semantic page structure and content.                                                                       |
| CSS3                    | Visual design, Flexbox, Grid, and responsive layouts.                                                      |
| JavaScript (ES Modules) | Application logic and DOM manipulation.                                                                    |
| Axios                   | HTTP communication with the backend.                                                                       |
| Vite                    | Development server and build tool.                                                                         |
| localStorage            | Client-side persistence of session and shopping cart information, according to the current implementation. |

### Main Dependencies

- Axios: `^1.20.0`
- Vite: `^7.0.0`

## 2. Prerequisites

Before running the project, make sure the following tools and services are available:

- Node.js (a version compatible with Vite 7).
- npm.
- Git.
- The Mokka Pets backend properly configured and running.
- PostgreSQL and Redis available for the backend.

## 3. Project Installation

Clone the frontend repository:

```bash
git clone https://github.com/rojemy98/petshop-ecommerce-frontend.git
```

Navigate to the project directory:

```bash
cd petshop-ecommerce-frontend
```

Install the project dependencies:

```bash
npm install
```

## 4. Backend Configuration

The frontend communicates with a REST API developed using Python and Flask.

**Backend repository:**

https://github.com/rojemy98/petshop-ecommerce-api

Before running the frontend, make sure the backend is installed, configured, and running.

### API URL Configuration

The application uses the `VITE_API_URL` environment variable to determine the backend API address.

Create a `.env` file in the frontend root directory:

```env
VITE_API_URL=http://127.0.0.1:5000
```

If this variable is not configured, the application automatically uses:

```text
http://127.0.0.1:5000
```

This configuration allows developers to change the backend address without modifying the application source code.

**Important:** Restart the Vite development server after modifying environment variables.

### Frontend-to-Backend Communication

All HTTP requests are handled through Axios.

The centralized HTTP client is located at:

```text
js/api/api-client.js
```

This module provides the following configuration:

- API base URL.
- `Content-Type: application/json` and `Accept: application/json` headers.
- Request timeout of 10 seconds.
- Request interceptor to automatically attach the JWT access token.
- Response interceptor to handle HTTP errors and remove invalid sessions when a `401 Unauthorized` response is received, excluding login and registration endpoints.

Authenticated requests include the following header:

```http
Authorization: Bearer <access_token>
```

The access token is retrieved from `localStorage` using the `access_token` key.

### Authentication and Authorization

The backend is responsible for authenticating users and issuing JWT access tokens.

The frontend uses these tokens when making requests to protected endpoints.

User permissions are enforced by the backend. The frontend also adapts the interface according to the authenticated user's role, displaying administrative functionality only to authorized users.

### CORS Configuration

The backend must allow requests originating from the Vite development server.

The current backend configuration includes these origins:

```text
http://localhost:5173
http://127.0.0.1:5173
```

If the frontend runs from a different origin, that origin must also be allowed in the backend CORS configuration.

## 5. Running the Application

After installing the dependencies and configuring the backend connection, start the development server:

```bash
npm run dev
```

Vite will start the development server.

Default address:

```text
http://localhost:5173
```

Open this address in your browser to access Mokka Pets.

### Available Commands

**Start the development server:**

```bash
npm run dev
```

**Generate an optimized production build:**

```bash
npm run build
```

**Preview the production build locally:**

```bash
npm run preview
```

The generated production files are stored in the `dist` directory.

## 6. Main Features

### Customer Features

- User registration and login.
- Product catalog browsing.
- Product search by name.
- Product filtering by category.
- Catalog navigation using pagination.
- Product detail visualization.
- Shopping cart management.
- Order summary before checkout.
- Purchase confirmation.
- Invoice history.
- User profile management.
- Password change functionality.
- Billing address management.

### Administrator Features

- Access to the administration panel.
- Complete inventory overview.
- Product creation.
- Product price and stock updates.
- Soft deletion of products.
- Invoice and sales overview.
- Sales summary and invoice information.

Administrative features require an authenticated session with administrator permissions.

## 7. Project Structure

The project follows a modular architecture that separates page structure, styling, API communication, and application logic.

The repository is organized as follows:

```text
petshop-ecommerce-frontend/
│
├── css/
│   ├── admin-products.css
│   ├── auth.css
│   ├── cart.css
│   ├── invoices.css
│   ├── product-detail.css
│   ├── profile.css
│   └── styles.css
│
├── js/
│   │
│   ├── api/
│   │   ├── api-client.js
│   │   ├── auth-api.js
│   │   ├── billing-addresses-api.js
│   │   ├── cart-api.js
│   │   ├── checkout-api.js
│   │   ├── invoices-api.js
│   │   └── products-api.js
│   │
│   ├── pages/
│   │   ├── admin-products.js
│   │   ├── cart.js
│   │   ├── home.js
│   │   ├── invoices.js
│   │   ├── login.js
│   │   ├── product-detail.js
│   │   ├── profile.js
│   │   └── register.js
│   │
│   └── services/
│       ├── auth-service.js
│       ├── cart-header.js
│       └── cart-service.js
│
├── admin-products.html
├── cart.html
├── index.html
├── invoices.html
├── login.html
├── product-detail.html
├── profile.html
├── register.html
│
├── .gitignore
├── package.json
├── package-lock.json
└── README.md
```

### Directory Responsibilities

**`css/` – Stylesheets**

Contains the application's visual styles, organized by page or functionality.

- `styles.css`: Shared application styles.
- `auth.css`: Authentication-related styles.
- `admin-products.css`: Administrative panel styles.
- `cart.css`: Shopping cart styles.
- `invoices.css`: Invoice page styles.
- `product-detail.css`: Product detail styles.
- `profile.css`: User profile styles.

**`js/api/` – API Communication**

Contains modules responsible for communicating with the Flask backend.

- `api-client.js`: Centralized Axios configuration, authentication headers, and response interceptors.
- `auth-api.js`: Authentication-related API requests.
- `billing-addresses-api.js`: Billing address operations.
- `cart-api.js`: Shopping cart API requests.
- `checkout-api.js`: Checkout operations.
- `invoices-api.js`: Invoice-related API requests.
- `products-api.js`: Product catalog and product management requests.

**`js/pages/` – Page Logic**

Contains JavaScript modules responsible for page-specific behavior, DOM manipulation, event handling, and integration with API and service modules.

- `home.js`: Landing page and product catalog functionality.
- `login.js`: Login form functionality.
- `register.js`: Registration form functionality.
- `product-detail.js`: Product detail and purchase interactions.
- `cart.js`: Shopping cart and checkout functionality.
- `invoices.js`: Invoice history and details.
- `profile.js`: User profile, password, and billing address management.
- `admin-products.js`: Administrative product and sales management.

**`js/services/` – Shared Application Services**

Contains reusable application logic shared across different pages.

- `auth-service.js`: Authentication and session-related operations.
- `cart-header.js`: Shopping cart information displayed in the application header.
- `cart-service.js`: Shopping cart management and related operations.

**HTML Files**

Each HTML file represents an application page:

| File                  | Description                                  |
| --------------------- | -------------------------------------------- |
| `index.html`          | Main landing page and product catalog.       |
| `login.html`          | User login.                                  |
| `register.html`       | User registration.                           |
| `product-detail.html` | Product information and purchase options.    |
| `cart.html`           | Shopping cart and checkout.                  |
| `invoices.html`       | Invoice history.                             |
| `profile.html`        | User profile and billing address management. |
| `admin-products.html` | Administrative product and sales management. |

**Root Configuration Files**

- `package.json`: Project metadata, dependencies, and npm scripts.
- `package-lock.json`: Dependency version lockfile.
- `.gitignore`: Specifies files and directories excluded from Git.
- `README.md`: Project documentation and setup instructions.

## 8. Technical Decisions and Rationale

### Modular JavaScript

JavaScript ES Modules are used to separate application responsibilities.

This approach improves maintainability, encourages code reuse, and prevents application logic from being concentrated in a single file.

Separating API communication, shared services, and page-specific logic also makes debugging and future development easier.

### Axios as the HTTP Client

Axios was selected to centralize communication with the backend.

Its interceptor configuration allows the JWT access token to be attached automatically and handles authentication-related responses from a single location.

This avoids duplicating authentication logic across individual API requests and provides a consistent approach to HTTP communication.

### Vite as the Development Tool

Vite was selected because of its fast development server and straightforward configuration.

It also supports environment variables and provides an optimized production build through the `npm run build` command.

### HTML5 and CSS3

HTML5 is used to provide a semantic page structure, while CSS3 handles the visual presentation.

Flexbox and CSS Grid are used to organize interface components and create responsive layouts that adapt to different screen sizes.

Pure CSS is maintained to avoid additional styling framework dependencies and keep the project lightweight.

### localStorage

`localStorage` is used to preserve information on the client side, including the access token and shopping cart information according to the current implementation.

This allows information to remain available across page reloads.

### JWT Authentication

The backend is responsible for authenticating users and issuing JWT access tokens.

The frontend uses these tokens when making protected API requests.

Authorization is also validated by the backend, ensuring that access restrictions do not rely solely on frontend visibility controls.

### Frontend and Backend Separation

The frontend and backend are maintained as separate applications:

- The frontend handles the user interface, user interactions, and client-side validation.
- The backend handles business rules, authentication, authorization, and database access.
- Communication takes place through REST endpoints that exchange information in JSON format.

This separation allows both applications to be developed, maintained, and deployed independently.

## 9. Important Considerations

- The backend must be available before using features that require server-side information.
- If the backend URL changes, update `VITE_API_URL`.
- Restart the Vite development server after modifying environment variables.
- Connection errors may occur if the backend is stopped, the URL is incorrect, or CORS does not allow the frontend origin.
- Administrator permissions must always be validated by the backend.
- Passwords and private keys must never be stored in the frontend.
- The use of `localStorage` for access tokens is an implementation decision for this project. For production applications, alternative storage mechanisms and associated security risks, including Cross-Site Scripting (XSS), should be evaluated.
- The `.env` file should not be committed to the repository if it contains environment-specific configuration or sensitive values.

## 10. Author

**Rojemy Emanuel Diaz**

GitHub: https://github.com/rojemy98

Frontend Repository: https://github.com/rojemy98/petshop-ecommerce-frontend

Backend Repository: https://github.com/rojemy98/petshop-ecommerce-api
