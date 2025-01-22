const axios = require('axios');
const tough = require('tough-cookie');
const { wrapper } = require('axios-cookiejar-support');

const cookieJar = new tough.CookieJar();
const client = wrapper(axios.create({ jar: cookieJar }));

async function fetchWithCookies(url) {
  try {
    await client.get(url);
    
    var cookies = cookieJar.getCookiesSync(url);
    cookies = cookies.map(cookie => cookie.cookieString()).join('; ');
    return cookies
  } catch (error) {
    console.error('Error fetching the URL:', error);
  }
}

module.exports = {fetchWithCookies};
