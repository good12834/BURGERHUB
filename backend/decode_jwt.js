const jwt = require('jsonwebtoken');
const token = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpZCI6NywiaWF0IjoxNzcyODk2NDgwLCJleHAiOjE3NzU0ODg0ODB9._TT3xwK2G3LO63gTx8NVdY7Er8ZNW8BYB37TPT-CtrE';
console.log('Decoded JWT Token:', jwt.decode(token));
