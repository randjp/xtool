const express = require('express');
const fetch = require('node-fetch');
const cors = require('cors');
const rateLimit = require('express-rate-limit');
const path = require('path');

const app = express();

// レート制限の設定
const limiter = rateLimit({
    windowMs: 15 * 60 * 1000, // 15分
    max: 100 // IPアドレスごとの最大リクエスト数
});

app.use(cors());
app.use(express.json());
app.use(limiter);

// 静的ファイルの提供
app.use(express.static(path.join(__dirname)));

// プロキシエンドポイント
app.post('/proxy', async (req, res) => {
    try {
        let { url } = req.body;
        if (!url) return res.status(400).send('URLが必要です');

        // 禁止URLのチェック
        const blockedDomains = [
            'localhost', '127.0.0.1', '0.0.0.0',
            'internal.company.com'
        ];
        
        const urlObj = new URL(url);
        if (blockedDomains.some(domain => urlObj.hostname.includes(domain))) {
            return res.status(403).send('このURLにはアクセスできません');
        }

        console.log('Accessing:', url);

        const response = await fetch(url, {
            method: 'GET',
            headers: {
                'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) Chrome/120.0.0.0',
                'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,image/webp,*/*;q=0.8',
                'Accept-Language': 'ja,en-US;q=0.9,en;q=0.8'
            },
            redirect: 'follow',
            follow: 5,
            timeout: 10000
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
        res.status(500).send('エラーが発生しました');
    }
});

// SSLとポート設定
const PORT = process.env.PORT || 3000;
app.listen(PORT, '0.0.0.0', () => {
    console.log(`Server running on port ${PORT}`);
});
