require("dotenv").config()
const manifest = {
    id: 'org.dizipal-stremio-addon',
    version: '1.0.2',
    name: 'Dizipal',
    description: "Dizipal'den dizi ve filmleri stremionuza getirir.  Proxy Kullandığımız için eklenti yavaş çalışabilir.",
    contactEmail: "eyup.elitass@gmail.com",
    logo: `${process.env.HOSTING_URL}/images/dizipal.png`,
    background: `${process.env.HOSTING_URL}/images/background.jpg`,
    behaviorHints: {
        configurable: false,
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
