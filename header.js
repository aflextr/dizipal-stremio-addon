require("dotenv").config();
const scrapeCookie = require("./src/scrapeProxyCookie");
const getUrlApi = require("./src/getUrlApi");


getUrlApi.fetchWithUrl().then((value1) => {
    scrapeCookie.fetchWithCookies(value1 || process.env.PROXY_URL).then((value2) => {
        if (value1) {
            if (value2.data.length > 10) {
                header.Cookie = value2.data;
                header.Origin = value1;
                header.Referer = value1;
            }
        }else{
            header.Cookie = value2.data;
            header.Origin = process.env.PROXY_URL;
            header.Referer = process.env.PROXY_URL;
        }
    })
});




const header = {
    "Accept-Language": "tr,en;q=0.9,en-GB;q=0.8,en-US;q=0.7",
    "Sec-Ch-Ua-Platform": "Windows",
    "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/119.0.0.0 Safari/537.36 Edg/119.0.0.0",
    "Cookie": "",
    "Origin": process.env.PROXY_URL,
    "Referer": process.env.PROXY_URL,
}

module.exports = header;
