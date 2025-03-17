require("dotenv").config()
const MANIFEST = require('./manifest');
const landing = require("./src/landingTemplate");
const header = require('./header');
const fs = require('fs')
const Path = require("path");
const express = require("express");
const app = express();
const searchVideo = require("./src/search");
const listVideo = require("./src/videos");
const path = require("path");
const NodeCache = require("node-cache");
const { v4: uuidv4 } = require('uuid');
const subsrt = require('subtitle-converter');
const Axios = require('axios')
const axiosRetry = require("axios-retry").default;
const { setupCache } = require("axios-cache-interceptor");


const instance = Axios.create();
const axios = setupCache(instance);
axiosRetry(axios, { retries: 2 });





const CACHE_MAX_AGE = 4 * 60 * 60; // 4 hours in seconds
const STALE_REVALIDATE_AGE = 4 * 60 * 60; // 4 hours
const STALE_ERROR_AGE = 7 * 24 * 60 * 60; // 7 days

const myCache = new NodeCache({ stdTTL: 30*60, checkperiod: 300 });

app.use(express.static(path.join(__dirname, "static")));

var respond = function (res, data) {
        res.setHeader('Access-Control-Allow-Origin', '*');
        res.setHeader('Access-Control-Allow-Headers', '*');
        res.setHeader('Content-Type', 'application/json; charset=utf-8');
        res.send(data);
};


app.get('/', function (req, res) {
        res.set('Content-Type', 'text/html');
        res.send(landing(MANIFEST));
});

app.get("/:userConf?/configure", function (req, res) {
        if (req.params.userConf !== "addon") {
            res.redirect("/addon/configure")
        } else {
            res.set('Content-Type', 'text/html');
            const newManifest = { ...MANIFEST };
            res.send(landing(newManifest));
        }
});

app.get('/manifest.json', function (req, res) {
        const newManifest = { ...MANIFEST };
        // newManifest.behaviorHints.configurationRequired = false;
        newManifest.behaviorHints.configurationRequired = true;
        return respond(res, newManifest);
});

app.get('/:userConf/manifest.json', function (req, res) {
        const newManifest = { ...MANIFEST };
        if (!((req || {}).params || {}).userConf) {
            newManifest.behaviorHints.configurationRequired = true;
           return respond(res, newManifest);
        } else {
            newManifest.behaviorHints.configurationRequired = false;
           return respond(res, newManifest);
        }
});

//CODE
app.get("/addon/catalog/:type/:id/search=:search", async (req, res, next) => {
    try {
        var { type, id, search } = req.params;
        search = search.replace(".json", "");
        if (id == "dizipal") {
            var cached = myCache.get(search + type)
            if (cached) {
                return respond(res, { metas: cached,cacheMaxAge: CACHE_MAX_AGE, staleRevalidate: STALE_REVALIDATE_AGE, staleError: STALE_ERROR_AGE });
            }
            var metaData = [];
            var video = await searchVideo.SearchMovieAndSeries(search);

            for (const element in video) {
                if (video.hasOwnProperty(element)) {
                    const item = video[element];
                    if (typeof (item.type) === "undefined") {
                        item.type = "movie";
                    }
                    if (type === item.type) {
                        var value = {
                            id: item.url,
                            type: item.type || "movie",
                            name: item.title,
                            poster: item.poster,
                            description: "",
                            genres: []
                        }
                        item.genres.split(",").forEach((data) => {
                            value.genres.push(data.trim().toString());
                        })
                        metaData.push(value);
                    }
                }
            }
            myCache.set(search + type, metaData);
            return respond(res, { metas: metaData,cacheMaxAge: CACHE_MAX_AGE, staleRevalidate: STALE_REVALIDATE_AGE, staleError: STALE_ERROR_AGE });
        }
    } catch (error) {
        console.log(error);
    }

})

app.get('/addon/meta/:type/:id/', async (req, res, next) => {
    try {
        var { type, id } = req.params;
        id = String(id).replace(".json", "");
        var metaObj = {};
        var cached = myCache.get(id);
        if (cached) {
            return respond(res, { meta: cached,cacheMaxAge: CACHE_MAX_AGE, staleRevalidate: STALE_REVALIDATE_AGE, staleError: STALE_ERROR_AGE })
        }

        var data = await searchVideo.SearchMetaMovieAndSeries(id, type);

        if (data) {

            metaObj = {
                id: id,
                type: type,
                name: data.name,
                background: data.background,
                country: data.country || "JP",
                genres: [],
                season: Number(data.season) || undefined,
                videos: [] || undefined,
                imdbRating: Number(data.imdbRating),
                description: data.description,
                releaseInfo: String(data.releaseInfo),
                poster: data.background,
                posterShape: 'poster',
            }
            //series or movie check
            if (type === "series") {
                for (let i = 1; i <= data.season; i++) {
                    var dizipalVideo = await searchVideo.SearchDetailMovieAndSeries(id, type, i);
                    if (dizipalVideo && typeof (dizipalVideo) !== "undefined") {
                        dizipalVideo.forEach(element => {
                            if (typeof (element.title) !== "undefined") {
                                metaObj.videos.push({
                                    id: element.id,
                                    title: element.title || `Bölüm ${element.episode}`,
                                    released: "2024-01-09T00:00:00.000Z",
                                    season: i,
                                    episode: element.episode,
                                    overview: element.title || "",
                                    thumbnail: element.thumbnail
                                });
                            }

                        });
                    }
                }
                myCache.set(id, metaObj);
                return respond(res, { meta: metaObj,cacheMaxAge: CACHE_MAX_AGE, staleRevalidate: STALE_REVALIDATE_AGE, staleError: STALE_ERROR_AGE })
            } else {
                myCache.set(id, metaObj);
                return respond(res, { meta: metaObj,cacheMaxAge: CACHE_MAX_AGE, staleRevalidate: STALE_REVALIDATE_AGE, staleError: STALE_ERROR_AGE })
            }

        }
    } catch (error) {
        console.log(error);
    }


})


app.get('/addon/stream/:type/:id/', async (req, res, next) => {
    try {
        var { type, id } = req.params;
        id = String(id).replace(".json", "");
        if (id) {
            var video = await listVideo.GetVideos(id);
            if (video) {
                const stream = { url: video.url };
                if (video.subtitles) {
                    myCache.set(id, video.subtitles);
                }
                return respond(res, { streams: [stream],cacheMaxAge: CACHE_MAX_AGE, staleRevalidate: STALE_REVALIDATE_AGE, staleError: STALE_ERROR_AGE })
            }
        }
    } catch (error) {
        console.log(error);
    }
})

app.get('/addon/subtitles/:type/:id/:query?.json', async (req, res, next) => {
    try {
        var { type, id } = req.params;
        id = String(id).replace(".json", "");
        var subtitles = [];
        var data = myCache.get(id)
        if (data) {
            for (const value of data) {

                if (String(value).includes("Türkçe")) {
                    var url = String(value).replace("[Türkçe]", "");
                    var newUrl = await WriteSubtitles(url, uuidv4());
                    if (newUrl) {
                        subtitles.push({ url: newUrl, lang: "tur",id:"dizipal-tur" });
                    }
                }
                if (String(value).includes("İngilizce")) {
                    var url = String(value).replace("[İngilizce]", "");
                    var newUrl = await WriteSubtitles(url, uuidv4());
                    if (newUrl) {
                        subtitles.push({ url: newUrl, lang: "eng",id:"dizipal-eng" });
                    }
                }
            }

            if (subtitles.length > 0) {
                return respond(res, { subtitles: subtitles,cacheMaxAge: CACHE_MAX_AGE, staleRevalidate: STALE_REVALIDATE_AGE, staleError: STALE_ERROR_AGE })
            }

        }
    } catch (error) {
        console.log(error);
    }
})

async function WriteSubtitles(url, name) {
    try {
        var response = await axios({ url: url, method: "GET", headers: header });
        if (response && response.status === 200) {
            CheckSubtitleFoldersAndFiles();
            const outputExtension = '.srt';
            const options = {
                removeTextFormatting: true,
            };

            var subtitle = subsrt.convert(response.data, outputExtension, options).subtitle;

            fs.writeFileSync(path.join(__dirname, "static", "subs", name + ".srt"), subtitle);
            var url = `${process.env.HOSTING_URL}/subs/${name}.srt`;
            return url;
        }
    } catch (error) {
        console.log(error);
    }
}


function CheckSubtitleFoldersAndFiles() {
    try {
        const folderPath = path.join(__dirname, "static", "subs");

        if (!fs.existsSync(folderPath)) {
            fs.mkdirSync(folderPath);
        }

        const files = fs.readdirSync(folderPath);

        if (files.length > 500) {
            files.forEach((file) => {
                const filePath = Path.join(folderPath, file);
                const fileStats = fs.statSync(filePath);

                if (fileStats.isFile()) {
                    fs.unlinkSync(filePath);
                } else if (fileStats.isDirectory()) {
                    // Dizin içinde dosya varsa onları da silmek için
                    fs.rmdirSync(filePath, { recursive: true });
                }
            });
        }
    } catch (error) {
        console.log(error);
    }

}


if (module.parent) {
    module.exports = app;
} else {
    app.listen(process.env.PORT || 7000, function (err) {
        if (err) {
           return Error("Error in server setup",err.message);
        }
        console.log(`extension running port : ${process.env.PORT}`)
    });
}

//publishToCentral(process.env.HOSTING_URL+"/manifest.json")