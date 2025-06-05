module.exports = function(app) {
app.get('/tools/whoip', async (req, res) => {
        try {
            const { apikey } = req.query;
    if (!global.apikey.includes(apikey)) return res.json({ status: false, error: 'Apikey invalid' })
    const { ip } = req.query;
    if (!ip) return res.json({ status: false, error: 'Ip is required' });
            const results = await global.fetchJson(`https://fastrestapis.fasturl.cloud/tool/whoip?ip=${ip}`);  
            res.status(200).json({
                status: true,
                result: results.result
            });
        } catch (error) {
            res.status(500).send(`Error: ${error.message}`);
        }
});

};

