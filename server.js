const express = require('express');
const path = require('path');
const app = express();

// Set up middleware to serve static files from the 'public' directory
app.use(express.static('public'));

// Route for the landing page
app.get('/', (req, res) => {
  res.sendFile(path.join(__dirname, 'public', 'html', 'landing.html'));
});


const port = process.env.PORT;
app.listen(port, () => {
  console.log(`Server is running on http://localhost:${port}`);
});
