const express = require('express');
const multer  = require('multer');
const upload = multer();
const vision = require('@google-cloud/vision');
const axios = require('axios');

const app = express();
const client = new vision.ImageAnnotatorClient();
const HACKEREARTH_RUN = "https://api.hackerearth.com/v3/code/run/";

app.use(express.json());

app.get('/', (req, res) => {
	res.send("It works");
});

app.post('/run', async (req, res) => {
	const config = {
		"config_secret": process.env.HACKEREARTH_SECRET,
		"source": req.body.code,
		"lang": "JAVASCRIPT"
	};
	try {
    const response = await axios.post(HACKEREARTH_RUN, config);
    const {message, errors, run_status: {output}} = response;
		const result = {"output": output, "message": message, "errors": errors};
		console.log(result);
    res.json(result);
  } catch (error) {
		const result = {"errors": {[error.message]: error}};
		console.log(result);
    res.json(result);
  }
});

app.post('/scan', async (req, res) => {
	const [result] = await client.documentTextDetection(req.body.image);
	const fullTextAnnotation = result.fullTextAnnotation;
	
	res.send(fullTextAnnotation.text);
});

app.listen(process.env.PORT || 3000, _ => console.log("App started"));
