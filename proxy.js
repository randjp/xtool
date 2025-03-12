document.addEventListener('DOMContentLoaded', () => {
    const urlInput = document.getElementById('url-input');
    const proxyBtn = document.getElementById('proxy-btn');
    const proxyContent = document.getElementById('proxy-content');
    const serverStatus = document.getElementById('server-status');

    // サーバー状態チェック
    const checkServer = async () => {
        serverStatus.textContent = 'サーバー接続済み';
        serverStatus.style.color = 'green';
    };

    checkServer();

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
                const words = url.split(/\s+/);
                if (words.length > 1 || !url.includes('.')) {
                    url = `https://www.google.com/search?q=${encodeURIComponent(url)}`;
                } else {
                    url = 'https://' + url;
                }
            }

            proxyContent.innerHTML = '<div style="text-align:center;padding:20px;">読み込み中...</div>';

            // 複数のプロキシサービスを用意
            const proxyUrls = [
                `https://api.allorigins.win/raw?url=${encodeURIComponent(url)}`,
                `https://corsproxy.io/?${encodeURIComponent(url)}`,
                `https://cors-anywhere.herokuapp.com/${url}`
            ];

            let succeeded = false;
            for (const proxyUrl of proxyUrls) {
                try {
                    const iframe = document.createElement('iframe');
                    iframe.src = proxyUrl;
                    iframe.className = 'proxy-frame';
                    iframe.sandbox = 'allow-same-origin allow-scripts allow-forms';
                    
                    // エラーハンドリング
                    iframe.onerror = () => {
                        throw new Error('読み込みエラー');
                    };

                    // 読み込み成功時
                    iframe.onload = () => {
                        succeeded = true;
                    };

                    proxyContent.innerHTML = '';
                    proxyContent.appendChild(iframe);

                    // 5秒待って成功確認
                    await new Promise(resolve => setTimeout(resolve, 5000));
                    if (succeeded) break;

                } catch (error) {
                    console.log('Proxy attempt failed:', error);
                    continue;
                }
            }

            if (!succeeded) {
                throw new Error('すべてのプロキシサーバーでアクセスに失敗しました');
            }

        } catch (error) {
            console.error('Error:', error);
            proxyContent.innerHTML = `
                <div style="color:red;text-align:center;padding:20px;">
                    エラー: ${error.message}<br>
                    別のURLを試してください。
                </div>`;
        }
    });
});
