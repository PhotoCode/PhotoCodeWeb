const express = require('express');

const app = express();
app.use(express.json());

app.get('/', (req, res) => {
	res.send("It works");
});

app.post('/run', (req, res) => {
	res.send(req.body.code);
});

app.listen(process.env.PORT || 3000);
