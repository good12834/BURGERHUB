const fs = require('fs');
const path = require('path');

// Create a simple HTML file with JavaScript to set the token in localStorage
const htmlContent = `
<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Set Token</title>
</head>
<body>
    <h1>Setting Token in LocalStorage</h1>
    <script>
        // Set the token in localStorage
        const token = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpZCI6NywiaWF0IjoxNzcyODk2NDgwLCJleHAiOjE3NzU0ODg0ODB9._TT3xwK2G3LO63gTx8NVdY7Er8ZNW8BYB37TPT-CtrE';
        localStorage.setItem('token', token);
        
        // Set user information in localStorage
        const user = {
            id: 7,
            email: 'test@example.com',
            name: 'Test User'
        };
        localStorage.setItem('user', JSON.stringify(user));
        
        console.log('Token and user information set successfully!');
        console.log('Token:', token);
        console.log('User:', user);
        
        // Redirect to checkout page
        window.location.href = 'http://localhost:3000/checkout';
    </script>
</body>
</html>
`;

// Write the HTML file
fs.writeFileSync(path.join(__dirname, 'set_token.html'), htmlContent);
console.log('HTML file created at:', path.join(__dirname, 'set_token.html'));
console.log('Open this file in a browser to set the token and redirect to checkout.');
