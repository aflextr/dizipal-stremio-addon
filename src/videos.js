require("dotenv").config();
const header = require("../header");
const sslfix = require("./sslfix");
const cheerio = require("cheerio");
const Axios = require('axios')
const axiosRetry = require("axios-retry").default;
const { setupCache } = require("axios-cache-interceptor");

const instance = Axios.create();
const axios = setupCache(instance);
axiosRetry(axios, { retries: 2 });


async function GetVideos(id) {
    try {
        var response = await axios({ ...sslfix, url: process.env.PROXY_URL + id, headers: header, method: "GET" });
        if (response && response.status == 200) {
            var $ = cheerio.load(response.data);
            var videoLink = $("#vast_new > iframe").attr("src");
            var jsFileUrl = await ScrapeVideoUrl(videoLink);
            if (jsFileUrl) return jsFileUrl;
        }
    } catch (error) {
        console.log(error);
    }

}


async function ScrapeVideoUrl(scrapeUrl) {
    try {
        var scrapeHeader = {
            "referer":process.env.PROXY_URL,
            "user-agent":"Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/130.0.0.0 Safari/537.36 Edg/130.0.0.0"
        };
        var response = await axios({ url: scrapeUrl, headers: scrapeHeader, method: "GET" });
        if (response && response.status == 200) {
            var playerFileLink = "";
            var subtitles;
            var $ = cheerio.load(response.data);
            var videoLinks = $("body > script:nth-child(2)");


            videoLinks.each((index, script) => {
                const scriptContent = $(script).html().trim();
                if (scriptContent.includes('new Playerjs')) {
                    const fileMatch = scriptContent.match(/file:"([^"]+)"/);
                    const subtitleMatch = scriptContent.match(/"subtitle":"([^"]+)"/)
                    if (fileMatch && fileMatch[1]) {
                        playerFileLink = fileMatch[1];
                    }
                    if (subtitleMatch && typeof (subtitleMatch) !== "null") {
                        subtitles = subtitleMatch[1].split(",");
                    }

                }
            });
            var video = {
                url: playerFileLink,
                subtitles: subtitles,
            }

            if (video) return video;

        }
    } catch (error) {
        console.log(error);
    }
}


module.exports = { GetVideos }