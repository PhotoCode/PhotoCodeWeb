require('dotenv').config();
const express = require("express");
const multer = require("multer");
const vision = require("@google-cloud/vision");
const axios = require("axios");
const path = require("path");
const qs = require("querystring");
const mongoose = require("mongoose");
const to = require("await-to-js").default;

/*
ENVIRONMENT VARIABLES
GOOGLE_SECRET: json of options (has secret key) # https://googleapis.dev/nodejs/vision/latest/v1.ImageAnnotatorClient.html#ImageAnnotatorClient
HACKEREARTH_SECRET: secret key for code api
IMGBB_SECRET: secret key for image api
*/

// initial setup
const app = express();
const upload = multer();
const snippets = [];
mongoose.connect(`mongodb+srv://paranoia:${process.env.DB_PASS}@userinexperience-maztg.mongodb.net/test`);

// google cloud setup
// const options = JSON.parse(process.env.GOOGLE_SECRET);
// const client = new vision.ImageAnnotatorClient(options);

// constants
const HACKEREARTH_RUN = "https://api.hackerearth.com/v3/code/run/";
const HACKEREARTH_SECRET = process.env.HACKEREARTH_SECRET;
const IMGBB_UPLOAD = "https://api.imgbb.com/1/upload";
const IMGBB_SECRET = process.env.IMGBB_SECRET;

// more app setup
app.set("view engine", "ejs");
app.use(express.json());
app.use(express.static("public"));

// main (temporary) page
app.get("/", (req, res) => {
  res.sendFile(path.join(__dirname, "index.html"));
});

// run specified code
// body: {code: string}
app.post("/run", async (req, res) => {
	// prepare query
  const stringifiedData = qs.stringify({
    client_secret: HACKEREARTH_SECRET,
    source: req.body.code,
    lang: "JAVASCRIPT_NODE"
  });
	// try getting result of code
  try {
    const {data} = await axios.post(HACKEREARTH_RUN, stringifiedData);
    const result = {message: data.message, errors: data.errors};
    if (data.run_status != null) {
			const {run_status} = data;
      result.output = run_status.output;
			if (run_status.status != "AC") {
				const {status, status_detail, stderr} = run_status;
				if (result.errors == null) result.errors = {};
				result.errors[`${status}: ${status_detail}`] = stderr;
			}
		}
    return res.json(result);
  } catch (error) {
		// something oofed
    console.log("Error:", error.message);
    if (error.response) return res.json(error.response.data);
    return res.json(error);
  }
});

app.get("/snippets", (req, res) => {
	res.json({data: snippets});
});

// scan, upload, add to snippets, and return image info
// file: image
app.post("/scan", upload.single("image"), async (req, res) => {
	const buffer = req.file.buffer;
	try {
		const imageURL = await uploadImage(buffer);
		const code = await scanImage(buffer);
		const pair = {imageURL, code};
		snippets.push(pair);
		return res.json(pair);
	} catch (error) {
		if (error.response) return res.json(error.response.data);
		return res.json(error);
	}
});

// pass base 64 of image
async function uploadImage(buffer) {
	const stringifiedData = qs.stringify({
		key: IMGBB_SECRET,
		image: buffer.toString("base64")
	});
	const response = await axios.post(IMGBB_UPLOAD, stringifiedData);
	return response.data.data.url;
}

// pass url of image # https://googleapis.dev/nodejs/vision/latest/v1.ImageAnnotatorClient.html#textDetection
async function scanImage(buffer) {
	// const request = {image: {content: buffer}};
  const [result] = await client.textDetection(buffer);
	return result.fullTextAnnotation.text;
}

app.get("/app/snippets", (req, res) => {
	res.render("snippets.ejs", {snippets});
});

const SnippetSchema = mongoose.Schema({
	name: String,
	code: String,
	imageURL: String,
});

const Snippet = mongoose.model('Snippet', SnippetSchema);

app.post('/snippets', async (req, res) => {
	const [err, snippet] = await to(Snippet.create(req.body));
	if (err) return res.status(400).json({ error: err });
	return res.json({ data: snippet });
});

app.get('/snippets', async (req, res) => {
	const [err, snippets] = await to(Snippet.find({}).exec());
	if (err) return res.status(400).json({error: err});
	return res.json({ data: snippets });
});

// start it up :D
app.listen(process.env.PORT || 3000, _ => console.log("App started"));
