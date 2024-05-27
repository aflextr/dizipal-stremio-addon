require("dotenv").config({path:"./.env"})
const manifest = {

    id: 'org.dizipal-stremio-addon',
    version: '1.0.0',

    name: 'Dizipal',
    description: "Dizipal'den dizi ve filmleri stremionuza getirir.  Proxy Kullandığımız için eklenti yavaş çalışabilir.",

    contactEmail: "eyup.elitass@gmail.com"+ "<p><a target='_blank' href='https://github.com/aflextr/dizipal-stremio-addon'>GitHub</a></p>",
    logo: `${process.env.HOSTING_URL}/images/dizipal.jpg`,
    background: `${process.env.HOSTING_URL}/images/background.jpg`,
    behaviorHints: {
        configurable: true,
        configurationRequired: true,
    },
    config: [{
        key: "dizipal",
        required: false
    }],
    catalogs: [{
        type: "series",
        id: "dizipal",
        extra: [{
            name: "search",
            isRequired: true
        }]
    },
    {
        type: "movie",
        id: "dizipal",
        extra: [{
            name: "search",
            isRequired: true
        }]
    }],
    resources: ['stream', 'meta', 'subtitles'],
    types: ["movie", 'series'],
    idPrefixes: ["/"]
}

module.exports = manifest;