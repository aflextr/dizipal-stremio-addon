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


async function SearchMovieAndSeries(name) {
    try {
        var values;
        var data = `query=${name}`
        await axios({ ...sslfix, url: `${process.env.PROXY_URL}/api/search-autocomplete`, headers: header, method: "POST", data: data }).then((value) => {
            if (value && value.status == 200 && value.statusText == "OK") {
                if (value && typeof (value.data) !== "undefined") {
                    values = value.data;
                }
            }
        }).catch((error)=>{
            console.log(error);
        })
    } catch (error) {
        if (error) console.log(error);
    }
    return values;
}

async function SearchMetaMovieAndSeries(id, type) {
    try {

        var response = await axios({ ...sslfix, url: process.env.PROXY_URL + id, headers: header, method: "GET" });
        if (response && response.status == 200 && response.statusText == "OK") {
            var $ = cheerio.load(response.data);
            if (type == "series") {
                var name = $("#container > div.popup-inner.auto > div.cover > h5").text().trim();
                var background = $("#container > div.popup-inner.auto > div.cover").css("background-image").trim().replace(/url\(["']?([^"']*)["']?\)/, '$1');
                var country = $("#container > div.popup-inner.auto > div.popup-summary > ul > li:nth-child(5) > div.value").text().includes("Yerli") ? "TR" : "US";
                //genres
                // var genres = [];
                // var asd = $("#container > div.popup-inner.auto > div.popup-summary > ul > li:nth-child(5) > div.value").get();
                var season = $("div.season-selectbox > select > option:last-child").attr("value").trim();
                var imdb = $("#container > div.popup-inner.auto > div.popup-summary > ul > li:nth-child(1) > div.value").text().trim();
                var releaseInfo = $("#container > div.popup-inner.auto > div.popup-summary > ul > li:nth-child(6) > div.value").text().trim();
                var description = $("#container > div.popup-inner.auto > div.popup-summary > div > p").text().trim();
            }else{
                var name = $("#pre_content > div:nth-child(4) > div > span").text().trim();
                var country = $("#container > div > div.popup-summary > ul > li:nth-child(5) > div.value").text().includes("Yerli") ? "TR" : "US";
                var imdb = $("#container > div > div.popup-summary > ul > li:nth-child(1) > div.value").text().trim();
                var releaseInfo = $("#container > div > div.popup-summary > ul > li:nth-child(4) > div.value").text().trim();
                var description = $("#container > div > div.popup-summary > div > p").text().trim();
            }
            var metaObj = {
                name: name,
                background: background || "",
                country: country || "JP",
                genres: [],
                season: season || 1,
                imdbRating: Number(imdb),
                description: description,
                releaseInfo: String(releaseInfo),
            }
            return metaObj;
        }


    } catch (error) {
        console.log(error);
    }
}

async function SearchDetailMovieAndSeries(id, type, episode) {
    try {
        if (type == "series") {
            var response = await axios({ ...sslfix, url: process.env.PROXY_URL + id, headers: header, method: "GET" });
            if (response && response.status == 200 && response.statusText == "OK") {
                var values = [{}];
                var $ = cheerio.load(response.data);
                var data = $(`div.last-episodes.all-episodes > ul:nth-child(${episode})`).find(".episode-item");
                data.each((i, element) => {
                    i++;
                    var id = $(element).find("a").attr("href");
                    var title = $(element).find(`div:nth-child(${i}) > a > div:nth-child(3) > div.name`).text().trim();
                    var thumbnail = $(element).find(`div:nth-child(${i}) > a > img`).attr("src");
                    var episode = i;
                    values.push({ id: id, title: title, thumbnail: thumbnail, episode: episode });
                })
                return values;
            }
        } else {
            var values = [{
                id: id
            }];
            return values;

        }

    } catch (error) {
        console.log(error);
    }
}

module.exports = { SearchMovieAndSeries, SearchMetaMovieAndSeries, SearchDetailMovieAndSeries };