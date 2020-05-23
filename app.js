const express = require('express');
const vision = require('@google-cloud/vision');
const axios = require('axios');

const app = express();
const client = new vision.ImageAnnotatorClient();
app.use(express.json());

app.get('/', (req, res) => {
	res.send("It works");
});

const RUN_LINK = "https://api.hackerearth.com/v3/code/run/";

app.post('/run', async (req, res) => {
	let options = {
		"client_secret": process.env.HACKEREARTH_SECRET,
		"source": req.body.code,
		"lang": "JAVASCRIPT"
	};
  try {
    const response = await axios.post(RUN_LINK, options);
    const {message, errors, run_status: {output}} = response;
		const result = {"output": output, "message": message, "errors": errors};
		console.log(result);
    res.send(result);
  } catch (error) {
		const result = {"error": error};
		console.log(result);
    res.send(result);
  }
});

app.post('/scan', async (req, res) => {
	const [result] = await client.documentTextDetection(req.body.image);
	const fullTextAnnotation = result.fullTextAnnotation;
	
	res.send(fullTextAnnotation.text);
});

app.listen(process.env.PORT || 3000, _ => console.log("App started"));
