const Axios = require('axios');
const axiosRetry = require("axios-retry").default;
const { setupCache } = require("axios-cache-interceptor");

const instance = Axios.create();
const axios = setupCache(instance);
axiosRetry(axios, { retries: 2 });

async function fetchWithCookies(url) {
  try {
    var cookieData = {
      url: url,
      token: "free"
    }
    var response = await axios.post("http://130.61.177.178:3214/api/v1/getcookie", cookieData);
    if (response.data.status == true) {
      return response.data;
    }
  } catch (error) {
    console.error('Error fetching the URL:', error);
  }
}

module.exports = { fetchWithCookies };