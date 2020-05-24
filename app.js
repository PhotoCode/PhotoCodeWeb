const express = require("express");
const multer = require("multer");
const vision = require("@google-cloud/vision");
const axios = require("axios");
const path = require("path");
const qs = require("querystring");

const app = express();
const client = new vision.ImageAnnotatorClient();
const HACKEREARTH_RUN = "https://api.hackerearth.com/v3/code/run/";
const HACKEREARTH_SECRET = process.env.HACKEREARTH_SECRET;

const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, "uploads");
  },
  filename: function (req, file, cb) {
    cb(null, file.fieldname + "-" + Date.now());
  }
});

const upload = multer({ storage: storage });

app.use(express.json());
app.use(express.static("public"));

app.get("/", (req, res) => {
  res.sendFile(path.join(__dirname, "index.html"));
});

app.post("/run", async (req, res) => {
  console.log("Code:", req.body.code);
  const stringifiedData = qs.stringify({
    client_secret: HACKEREARTH_SECRET,
    source: req.body.code,
    lang: "JAVASCRIPT_NODE"
  });

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
    console.log("Error:", error.message);
    if (error.response) return res.json(error.response.data);
    return res.json(error);
  }
});

app.post("/scan", upload.single("image"), (req, res) => {
  res.json({
    data: `
function add(a, b) {
	return a+b;
}
console.log(add(1, 2));
`
  });
  /*
  client
    .documentTextDetection(path.join(__dirname, req.file.path))
    .then(result => {
      res.json({ result });
    })
    .catch(err => console.log(err));
    */
});

app.listen(process.env.PORT || 3000, _ => console.log("App started"));
