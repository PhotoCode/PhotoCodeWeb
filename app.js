const express = require('express');
const multer  = require('multer');
const upload = multer();
const vision = require('@google-cloud/vision');
const axios = require('axios');
const client = new vision.ImageAnnotatorClient();

const app = express();
app.use(express.json());

app.get('/', (req, res) => {
	res.send("It works");
});

app.post('/run', async (req, res) => {
	let options = {
		"client_secret": process.env.HACKEREARTH_SECRET,
		"source": req.body.code,
		"lang": "javascript",
		"time_limit": 5,
		"memory_limit": 2**16,
	}
  try {
    const response = await axios.post("http://api.hackerearth.com/code/run/", options);
    res.json({"output": response.run_status.output, "errors": response.errors});
  } catch (error) {
    res.json({"error": error});
  }
});

app.post('/scan', upload.single('image'), async (req, res) => {
	const [result] = await client.documentTextDetection(req.file);
	const fullTextAnnotation = result.fullTextAnnotation;

	res.send(fullTextAnnotation.text);
});

app.listen(process.env.PORT || 3000, _ => console.log("App started"));
