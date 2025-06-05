module.exports = function(app) {
    async function anim() {
        try {
            let type = ["blowjob", "neko", "trap", "waifu"]
            let rn = type[Math.floor(Math.random() * type.length)]
            const data = await fetchJson(`https://api.waifu.pics/nsfw/${rn}`)
            const response = await getBuffer(data.url)
            return response
        } catch (error) {
            throw error;
        }
    }
    app.get('/random/nsfw', async (req, res) => {
        try {
            const { apikey } = req.query;
            if (!global.apikey.includes(apikey)) return res.json({ status: false, error: 'Apikey invalid' })
            const pedo = await anim();
            res.writeHead(200, {
                'Content-Type': 'image/png',
                'Content-Length': pedo.length,
            });
            res.end(pedo);
        } catch (error) {
            res.status(500).send(`Error: ${error.message}`);
        }
    });
};
