# 🍔 BURGERHUB - Burger Delivery Website

A full-stack burger delivery web application with React frontend and Node.js/Express backend.

## 🏗️ Tech Stack

### Backend
- **Runtime:** Node.js
- **Framework:** Express.js
- **Database:** SQLite (can be switched to MySQL)
- **Authentication:** JWT (JSON Web Tokens)
- **Payments:** Stripe

### Frontend
- **Framework:** React
- **Styling:** Tailwind CSS
- **State Management:** React Context API
- **HTTP Client:** Axios

## 📁 Project Structure

```
burger-delivery/
├── backend/
│   ├── config/          # Database configuration
│   ├── controllers/     # Route controllers
│   ├── middleware/      # Auth middleware
│   ├── models/          # Database models
│   ├── routes/          # API routes
│   ├── utils/           # Utility functions
│   ├── server.js        # Main server file
│   └── .env.example     # Environment variables template
├── frontend/
│   ├── public/          # Static public files
│   ├── src/
│   │   ├── components/  # React components
│   │   ├── context/     # React contexts
│   │   ├── pages/       # Page components
│   │   └── App.jsx      # Main app component
│   └── .env.example     # Environment variables template
└── .gitignore           # Git ignore rules
```

## 🚀 Getting Started

### Prerequisites
- Node.js (v14 or higher)
- npm or yarn

### Installation

1. **Clone the repository:**
```bash
git clone https://github.com/good12834/BURGERHUB.git
cd BURGERHUB
```

2. **Install backend dependencies:**
```bash
cd backend
npm install
```

3. **Install frontend dependencies:**
```bash
cd frontend
npm install
```

4. **Configure environment variables:**

   Copy the example files and fill in your values:
   ```bash
   cp backend/.env.example backend/.env
   cp frontend/.env.example frontend/.env
   ```

5. **Start the development servers:**

   Backend (runs on port 3001):
   ```bash
   cd backend
   npm start
   ```

   Frontend (runs on port 3000):
   ```bash
   cd frontend
   npm start
   ```

## 📝 Features

### Customer Features
- 🍔 Browse menu with categories
- 🔍 Search products
- ❤️ Add to favorites
- 🛒 Shopping cart
- 💳 Secure checkout with Stripe
- 📦 Order tracking
- 👤 User profile management

### Admin Features
- 📊 Dashboard with analytics
- 🍔 Product management
- 📋 Order management
- 👥 Customer management
- 💰 Deals management

## 🔧 Environment Variables

### Backend (.env)
| Variable | Description |
|----------|-------------|
| PORT | Server port (default: 3001) |
| NODE_ENV | Environment (development/production) |
| DB_HOST | Database host |
| DB_USER | Database username |
| DB_PASSWORD | Database password |
| DB_NAME | Database name |
| JWT_SECRET | JWT secret key |
| STRIPE_SECRET_KEY | Stripe secret key |
| STRIPE_WEBHOOK_SECRET | Stripe webhook secret |

### Frontend (.env)
| Variable | Description |
|----------|-------------|
| REACT_APP_API_URL | Backend API URL |
| REACT_APP_STRIPE_PUBLISHABLE_KEY | Stripe publishable key |

## 📄 API Endpoints

### Authentication
- `POST /api/auth/register` - Register new user
- `POST /api/auth/login` - Login user
- `GET /api/auth/profile` - Get user profile

### Products
- `GET /api/products` - Get all products
- `GET /api/products/:id` - Get product by ID
- `GET /api/products/category/:category` - Get products by category

### Orders
- `POST /api/orders` - Create new order
- `GET /api/orders` - Get user orders
- `GET /api/orders/:id` - Get order by ID
- `PUT /api/orders/:id/status` - Update order status

### Favorites
- `GET /api/favorites` - Get user favorites
- `POST /api/favorites` - Add to favorites
- `DELETE /api/favorites/:productId` - Remove from favorites

## 🤝 Contributing

1. Fork the repository
2. Create your feature branch (`git checkout -b feature/AmazingFeature`)
3. Commit your changes (`git commit -m 'Add some AmazingFeature'`)
4. Push to the branch (`git push origin feature/AmazingFeature`)
5. Open a Pull Request

## 📝 License

This project is for educational purposes.

## 👏 Acknowledgments

- Stripe for payment processing
- React team for the amazing framework
