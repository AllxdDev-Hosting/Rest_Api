const yt = require("yt-search")

module.exports = function (app) {
app.get('/search/youtube', async (req, res) => {
        try {
            const { apikey } = req.query;
            if (!global.apikey.includes(apikey)) return res.json({ status: false, error: 'Apikey invalid' })
            const { q } = req.query;
            if (!q) {
            return res.json({ status: false, error: 'Query is required' });
            }
            const results = await yt(q);
            res.status(200).json({
                status: true,
                result: results.all
            });
        } catch (error) {
            res.status(500).send(`Error: ${error.message}`);
        }
});
}