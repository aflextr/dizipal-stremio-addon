const Axios = require('axios');
const { setupCache } = require("axios-cache-interceptor");

const instance = Axios.create();
const axios = setupCache(instance);

async function fetchWithUrl() {
    try {
        if (process.env.URLGETSTATUS === "true") {
            var response = await axios.get("https://raw.githubusercontent.com/dizipaltv/api/refs/heads/main/dizipal.json");
            if (response.status == 200) {
                response.data.currentSiteURL = String(response.data.currentSiteURL).replace(".com", "");
                process.env.PROXY_URL = "https://" + new URL(response.data.currentSiteURL).hostname + process.env.PROXYTEMPLATEURL;
                return process.env.PROXY_URL;
            }
        }
        else{
            return undefined;
        }
    } catch (error) {
        console.error('Error fetching the URL:', error);
    }
}

module.exports = { fetchWithUrl };