document.addEventListener('DOMContentLoaded', () => {
    const urlInput = document.getElementById('url-input');
    const proxyBtn = document.getElementById('proxy-btn');
    const proxyContent = document.getElementById('proxy-content');
    const serverStatus = document.getElementById('server-status');

    // サーバー状態チェック
    const checkServer = async () => {
        try {
            const response = await fetch('https://api.allorigins.win/raw?url=https://www.google.com');
            if (response.ok) {
                serverStatus.textContent = 'サーバー接続済み';
                serverStatus.style.color = 'green';
            }
        } catch {
            serverStatus.textContent = '接続エラー';
            serverStatus.style.color = 'red';
        }
    };

    // プロキシサービスのリスト
    const proxyServices = [
        {
            name: 'allorigins',
            url: (target) => `https://api.allorigins.win/raw?url=${encodeURIComponent(target)}`,
            contentType: 'raw'
        },
        {
            name: 'corsProxy',
            url: (target) => `https://corsproxy.io/?${encodeURIComponent(target)}`,
            contentType: 'raw'
        }
    ];

    // URLをチェックして整形
    const formatUrl = (input) => {
        if (!input) return null;
        input = input.trim();
        
        if (input.includes(' ') || !input.includes('.')) {
            return `https://www.google.com/search?q=${encodeURIComponent(input)}`;
        }
        
        return input.match(/^https?:\/\//i) ? input : `https://${input}`;
    };

    // プロキシアクセス処理
    const accessProxy = async (url) => {
        proxyContent.innerHTML = '<div style="text-align:center;padding:20px;">読み込み中...</div>';

        for (const service of proxyServices) {
            try {
                const proxyUrl = service.url(url);
                const iframe = document.createElement('iframe');
                iframe.style.width = '100%';
                iframe.style.height = '800px';
                iframe.style.border = 'none';
                iframe.setAttribute('sandbox', 'allow-forms allow-scripts allow-same-origin');
                iframe.src = proxyUrl;

                const loadPromise = new Promise((resolve, reject) => {
                    iframe.onload = resolve;
                    iframe.onerror = reject;
                    setTimeout(reject, 10000); // 10秒タイムアウト
                });

                proxyContent.innerHTML = '';
                proxyContent.appendChild(iframe);
                await loadPromise;
                return; // 成功したら終了

            } catch (error) {
                console.warn(`${service.name} failed:`, error);
                continue; // 次のサービスを試す
            }
        }

        // すべて失敗した場合は直接リンク
        const directLink = `
            <div style="text-align:center;padding:20px;">
                <p>プロキシでのアクセスに失敗しました。</p>
                <a href="${url}" target="_blank" rel="noopener noreferrer">
                    直接アクセスする（新しいタブで開きます）
                </a>
            </div>`;
        proxyContent.innerHTML = directLink;
    };

    proxyBtn.addEventListener('click', async () => {
        try {
            const url = formatUrl(urlInput.value);
            if (!url) throw new Error('URLを入力してください');
            await accessProxy(url);
        } catch (error) {
            console.error('Error:', error);
            proxyContent.innerHTML = `
                <div class="proxy-error">
                    <p>${error.message}</p>
                </div>`;
        }
    });

    urlInput.addEventListener('keypress', (e) => {
        if (e.key === 'Enter') {
            e.preventDefault();
            proxyBtn.click();
        }
    });

    // 初期チェック実行
    checkServer();
});
