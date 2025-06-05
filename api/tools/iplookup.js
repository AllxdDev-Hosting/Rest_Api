module.exports = function(app) {
app.get('/tools/iplookup', async (req, res) => {
        try {
            const { apikey } = req.query;
    if (!global.apikey.includes(apikey)) return res.json({ status: false, error: 'Apikey invalid' })
    const { q } = req.query;
    if (!q) return res.json({ status: false, error: 'Query is required' });
            const results = await global.fetchJson(`https://fastrestapis.fasturl.cloud/tool/iplookup?query=${q}`);  
            res.status(200).json({
                status: true,
                result: results.result
            });
        } catch (error) {
            res.status(500).send(`Error: ${error.message}`);
        }
});

};

