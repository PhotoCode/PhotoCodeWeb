const express = require('express');
const multer  = require('multer');
const vision = require('@google-cloud/vision');
const axios = require('axios');
const qs = require("querystring");

const upload = multer();
const app = express();
const client = new vision.ImageAnnotatorClient();
const HACKEREARTH_RUN = "https://api.hackerearth.com/v3/code/run/";
const HACKEREARTH_SECRET = process.env.HACKEREARTH_SECRET;

app.use(express.json());

app.get('/', (req, res) => {
	res.send(__dirname);
});

app.post('/run', async (req, res) => {
	console.log("Code:", req.body.code);
	const data = {
		client_secret: HACKEREARTH_SECRET,
		source: req.body.code,
		lang: "JAVASCRIPT"
	};

	try {
		const stringified = qs.stringify(data);
		const response = await axios.post(HACKEREARTH_RUN, stringified);

		let message, errors;
		const result = {message, errors} = response.data;
		if (response.message == "OK")
			result.output = response.data.run_status.output;
		return res.json(result);
	}

	catch (error) {
		console.log("Error:", error.message);
		if (error.response)
			return res.json(error.response.data);
		return res.json(error);
	}
});

app.post('/scan', upload.single('image'), (req, res) => {
	const encoded = req.file.buffer.toString('base64')
	client.documentTextDetection(encoded)
		.then( result => {
			res.json({text: result.fullTextAnnotation.text});
		}) .catch(err => console.log(err));
});

app.listen(process.env.PORT || 3000, _ => console.log("App started"));
