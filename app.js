const express = require('express');
const multer  = require('multer');
const vision = require('@google-cloud/vision');
const axios = require('axios');

const upload = multer();
const app = express();
const client = new vision.ImageAnnotatorClient();
const HACKEREARTH_RUN = "https://api.hackerearth.com/v3/code/run/";

app.use(express.json());

app.get('/', (req, res) => {
	res.send(__dirname);
});

app.post('/run', async (req, res) => {
	const config = {
		"client_secret": process.env.HACKEREARTH_SECRET,
		"source": req.body.code,
		"lang": "JAVASCRIPT"
	};
	try {
    const response = await axios.post(HACKEREARTH_RUN, config);
    const {message, errors, run_status: {output}} = response;
		const result = {"output": output, "message": message, "errors": errors};
    res.json(result);
  } catch (error) {
		console.log(error);
		const result = {"errors": {[response.data.message]: error}};
    res.json(result);
  }
});

app.post('/scan', upload.single('image'), async (req, res) => {
	const [result] = await client.documentTextDetection(req.file);

	const fullTextAnnotation = result.fullTextAnnotation;

	res.json({text: fullTextAnnotation.text});
});

app.listen(process.env.PORT || 3000, _ => console.log("App started"));
