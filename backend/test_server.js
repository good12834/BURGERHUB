const express = require('express');
const cors = require('cors');
const app = express();
app.use(cors());
app.use(express.json());
app.use((req, res, next) => {
  console.log(`TEST: [${new Date().toISOString()}] ${req.method} ${req.url}`);
  next();
});
const orderRoutes = require('./routes/order.routes');
app.use('/api/orders', orderRoutes);
app.listen(8001, () => console.log('Test server on 8001'));