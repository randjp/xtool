const express = require('express');
const fetch = require('node-fetch');
const cors = require('cors');
const path = require('path');

const app = express();
app.use(cors());
app.use(express.json());

// 静的ファイルの提供
app.use(express.static(path.join(__dirname)));

// プロキシエンドポイント
app.post('/proxy', async (req, res) => {
    try {
        let { url } = req.body;
        if (!url) return res.status(400).send('URLが必要です');

        console.log('Accessing:', url);

        const response = await fetch(url, {
            method: 'GET',
            headers: {
                'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64; rv:102.0) Gecko/20100101 Firefox/102.0',
                'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,image/webp,*/*;q=0.8',
                'Accept-Language': 'ja,en-US;q=0.9,en;q=0.8',
                'Cache-Control': 'no-cache',
                'Upgrade-Insecure-Requests': '1',
                'Referer': 'https://www.google.com/',
                'Origin': 'https://www.google.com/'
            },
            redirect: 'follow',
            follow: 10
        });

        // レスポンスヘッダーの処理
        for (const [key, value] of response.headers.entries()) {
            if (!['content-encoding', 'content-length', 'transfer-encoding'].includes(key.toLowerCase())) {
                res.set(key, value);
            }
        }

        const contentType = response.headers.get('content-type') || '';
        const data = await (contentType.includes('image') ? response.buffer() : response.text());
        res.send(data);

    } catch (error) {
        console.error('Proxy error:', error);
        res.status(500).send('エラー: ' + error.message);
    }
});

app.listen(3000, '0.0.0.0', () => console.log('Server ready on port 3000'));
