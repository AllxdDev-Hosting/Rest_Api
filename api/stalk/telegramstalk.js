module.exports = function(app) {
app.get('/stalk/telegram', async (req, res) => {
const { apikey } = req.query;
if (!global.apikey.includes(apikey)) return res.json({ status: false, error: 'Apikey invalid' })
const { username } = req.query;
if (!username) return res.json({ status: false, error: 'Username is required' })          
        try {            
            const results = await global.fetchJson(`https://fastrestapis.fasturl.cloud/stalk/telegram?username=${username}`);  
            res.status(200).json({
                status: true,
                result: results.result
            })
        } catch (error) {
            res.status(500).send(`Error: ${error.message}`);
        }
});

};