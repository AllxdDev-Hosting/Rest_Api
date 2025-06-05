const axios = require("axios")

async function shortUrl(links) {
return new Promise(async (resolve, reject) => {
try {
var res = await axios.get('https://tinyurl.com/api-create.php?url='+encodeURIComponent(links))
resolve(res.data.toString())
} catch (error) {
reject(error)
}
})
}

module.exports = function(app) {
app.get('/tools/tinyurl', async (req, res) => {
       const { apikey, url } = req.query
       if (!global.apikey.includes(apikey)) return res.json({ status: false, error: 'Apikey invalid' })
       if (!url) return res.json({ status: false, error: 'Url is required' });
        try {
            let anu = await shortUrl(url)
            res.status(200).json({
                status: true,
                result: anu
            });
        } catch (error) {
            res.status(500).send(`Error: ${error.message}`);
        }
});
}