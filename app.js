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
		if (response.message == "OK")
			result.output = response.run_status.output;
		res.json(result);
	} catch (error) {
		if (error.response)
			res.json(error.response.data);
		console.log("Error", error.message);
		res.json(error);
	}
});

app.post('/scan', upload.single('image'), async (req, res) => {
	client.documentTextDetection(req.file)
		.then( result => {
			res.json({text: result.fullTextAnnotation.text});
		}) .catch(err => console.log(err));
});

app.listen(process.env.PORT || 3000, _ => console.log("App started"));
