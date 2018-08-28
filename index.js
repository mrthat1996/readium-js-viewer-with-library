const express = require('express');
var serveStatic = require('serve-static');
const app = express();

const path = require('path');

// Point static path to dist
app.use(serveStatic(path.join(__dirname, './'), {'index': ['index.html', 'index.htm']}));

app.get('*', (req, res) => {
    res.sendFile(path.join(__dirname, './'));
});

const PORT = 80;
app.listen(PORT, () => {
    console.log(`Server: http://localhost:${PORT}`);
});