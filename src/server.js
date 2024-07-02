const express = require('express');
const bodyParser = require('body-parser');
const axios = require('axios');

const app = express();
const port = 3000;

const secretKey = '6Lf1lwYqAAAAAIc6iyKYSO4xqfPi5JMm2HASc47d';

app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));

app.post('/submit', async (req, res) => {
  const recaptchaResponse = req.body.recaptchaResponse;

  const verificationUrl = `https://www.google.com/recaptcha/api/siteverify?secret=${secretKey}&response=${recaptchaResponse}`;

  try {
    const response = await axios.post(verificationUrl);
    const body = response.data;

    if (body.success !== undefined && !body.success) {
      return res.json({ responseCode: 1, responseDesc: "Failed captcha verification" });
    }

    // Process the form submission (e.g., save to database)
    res.json({ responseCode: 0, responseDesc: "Success" });
  } catch (error) {
    res.json({ responseCode: 1, responseDesc: "Failed captcha verification", error });
  }
});

app.listen(port, () => {
  console.log(`Server is running on http://localhost:${port}`);
});