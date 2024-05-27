require("dotenv").config({ path: "../.env" });
const axios = require("axios");
const header = require("./header");
const sslfix = require("./sslfix");
const cheerio = require("cheerio");
const axiosRetry = require("axios-retry");

axiosRetry.default(axios, { retries: 4 });
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
        var response = await axios({ url: scrapeUrl, headers: header, method: "GET" });
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
                    if (subtitleMatch && typeof(subtitleMatch) !== "null"){ 
                        subtitles = subtitleMatch[1].split(",") ;
                    }

                }
            });

            const video = {
                videoUrl : playerFileLink,
                subtitles: subtitles,
            }

            if (video) return video;

        }
    } catch (error) {
        console.log(error);
    }
}

module.exports = { GetVideos }