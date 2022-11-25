const express = require('express');
const cors = require('cors');
const app = express();
app.use(cors());
const port = process.env.PORT || 9001;
const path = require('path')
app.use(express.static(path.join(__dirname, './public')))
// app.use(express.static(__dirname + './public'));
app.use('/api/v1/contact', require('./routes/contact'));

app.get('/', (req, res) => {
    res.send('API funcionando! ');
});

app.get('*', (req, res) => {
    res.send('404 ruta no encontrada en el servidor');
});

app.listen(port,() => {
    console.log(`Listening to port ${port}`);
});