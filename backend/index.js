require('dotenv').config();
const express = require('express');
const pingRoute = require('./routes/ping');
const app = express();
const PORT = process.env.PORT || 5000;

app.use('/ping', pingRoute);

app.listen(PORT, () => {
    console.log(`Server running on http://localhost:${PORT}`);
});
