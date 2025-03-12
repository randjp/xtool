document.addEventListener('DOMContentLoaded', () => {
    const urlInput = document.getElementById('url-input');
    const proxyBtn = document.getElementById('proxy-btn');
    const proxyContent = document.getElementById('proxy-content');
    const serverStatus = document.getElementById('server-status');

    // サーバー状態チェック
    const checkServer = async () => {
        try {
            const response = await fetch('http://localhost:3000/proxy', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ url: 'https://www.google.com' })
            });
            
            if (response.ok) {
                serverStatus.textContent = '接続済み';
                serverStatus.style.color = 'green';
            } else {
                throw new Error('Server error');
            }
        } catch (error) {
            serverStatus.textContent = '未接続';
            serverStatus.style.color = 'red';
            console.error('Server check error:', error);
        }
    };

    // 定期的にサーバー状態をチェック
    checkServer();
    setInterval(checkServer, 5000);

    // Enter キー対応
    urlInput.addEventListener('keypress', (e) => {
        if (e.key === 'Enter') {
            e.preventDefault();
            proxyBtn.click();
        }
    });

    proxyBtn.addEventListener('click', async () => {
        try {
            let url = urlInput.value.trim();
            if (!url) throw new Error('URLを入力してください');

            // URL処理の改善
            if (!url.match(/^https?:\/\//)) {
                // 検索キーワードとして処理
                const words = url.split(/\s+/);
                if (words.length > 1 || !url.includes('.')) {
                    url = `https://www.google.com/search?q=${encodeURIComponent(url)}`;
                } else {
                    url = 'https://' + url.replace(/^\/+/, '');
                }
            }

            console.log('Requesting:', url);
            proxyContent.innerHTML = '<div style="text-align:center">読み込み中...</div>';

            const response = await fetch('http://localhost:3000/proxy', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ url })
            });

            if (!response.ok) throw new Error('アクセスエラー');

            const contentType = response.headers.get('content-type') || '';
            const text = await response.text();

            const frame = document.createElement('iframe');
            frame.style.cssText = `
                width: 100%;
                min-height: 800px;
                border: none;
                background: white;
            `;
            
            proxyContent.innerHTML = '';
            proxyContent.appendChild(frame);

            const doc = frame.contentWindow.document;
            doc.open();
            doc.write(`
                <!DOCTYPE html>
                <html>
                <head>
                    <meta charset="UTF-8">
                    <meta name="viewport" content="width=device-width, initial-scale=1.0">
                    <base href="${new URL(url).origin}/">
                    <style>
                        body {
                            margin: 0;
                            padding: 16px;
                            font-family: Arial;
                            line-height: 1.6;
                        }
                        img { max-width: 100%; height: auto; }
                        a { color: #1a0dab; text-decoration: none; }
                        a:hover { text-decoration: underline; }
                        form { margin: 1rem 0; }
                        input { padding: 8px; margin: 4px; }
                    </style>
                </head>
                <body>${text}</body>
                </html>
            `);
            doc.close();

            // リンクとフォームの処理
            doc.addEventListener('click', e => {
                const link = e.target.closest('a');
                if (link) {
                    e.preventDefault();
                    let href = link.href;
                    
                    // Google検索結果のリンクを処理
                    if (href.includes('/url?') || href.includes('/search?')) {
                        const params = new URLSearchParams(href.split('?')[1]);
                        href = params.get('q') || params.get('url') || href;
                    }
                    
                    if (href && !href.startsWith('javascript:')) {
                        try {
                            const absoluteUrl = new URL(href, url).href;
                            urlInput.value = absoluteUrl;
                            proxyBtn.click();
                        } catch (error) {
                            console.warn('Invalid URL:', href);
                        }
                    }
                }
            });

            // フォーム送信の処理
            doc.addEventListener('submit', e => {
                e.preventDefault();
                const form = e.target;
                const action = new URL(form.action || url).href;
                const formData = new FormData(form);
                const params = new URLSearchParams(formData);
                urlInput.value = `${action}?${params.toString()}`;
                proxyBtn.click();
            });

        } catch (error) {
            console.error('Error:', error);
            proxyContent.innerHTML = `
                <div style="color:red;text-align:center;padding:20px;">
                    エラー: ${error.message}
                </div>`;
        }
    });
});
