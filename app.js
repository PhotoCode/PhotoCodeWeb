const express = require('express');
const vision = require('@google-cloud/vision');
const axios = require('axios');

const app = express();
const client = new vision.ImageAnnotatorClient();
app.use(express.json());

app.get('/', (req, res) => {
	res.send("It works");
});

app.post('/run', async (req, res) => {
	let options = {
		"client_secret": process.env.HACKEREARTH_SECRET,
		"source": req.body.code,
		"lang": "JAVASCRIPT",
		"time_limit": 5,
		"memory_limit": 2**16
	};
  try {
    const response = await axios.post("http://api.hackerearth.com/code/run/", options);
    res.json({"output": response.run_status.output, "errors": response.errors});
  } catch (error) {
    res.json({"error": error});
  }
});

app.post('/scan', async (req, res) => {
	const [result] = await client.documentTextDetection(req.body.image);
	const fullTextAnnotation = result.fullTextAnnotation;
	
	res.send(fullTextAnnotation.text);
});

app.listen(process.env.PORT || 3000, _ => console.log("App started"));
