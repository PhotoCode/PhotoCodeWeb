const express = require('express');
const vision = require('@google-cloud/vision');

const app = express();
const client = new vision.ImageAnnotatorClient();

app.use(express.json());

app.get('/', (req, res) => {
	res.send("It works");
});

app.post('/run', (req, res) => {
	res.send(req.body.code);

});

app.post('/scan', async (req, res) => {
	const [result] = await client.documentTextDetection(req.body.image);
	const fullTextAnnotation = result.fullTextAnnotation;
	
	res.send(fullTextAnnotation.text);
});

app.listen(process.env.PORT || 3000);
