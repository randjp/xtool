document.addEventListener('DOMContentLoaded', () => {
    const chatContainer = document.getElementById('chat-container');
    const userInput = document.getElementById('user-input');
    const sendButton = document.getElementById('send-btn');
    let isSending = false;

    // 初期メッセージを表示
    addMessage('こんにちは！私はAIアシスタントです。どのようなお手伝いができますか？', 'ai');

    // メッセージ送信処理を修正
    const sendMessage = () => {
        const message = userInput.value.trim();
        if (!message || isSending) return;

        isSending = true;

        // ユーザーメッセージを表示
        addMessage(message, 'user');
        userInput.value = ''; // 入力欄をクリア

        // AIの返答を生成
        setTimeout(() => {
            const response = generateResponse(message);
            addMessage(response, 'ai');
            isSending = false;
            userInput.focus();
        }, 500);
    };

    // AI応答生成を非同期処理に変更
    const generateAIResponse = async (input) => {
        try {
            const response = generateResponse(input);
            setTimeout(() => {
                addMessage(response, 'ai');
            }, 500);
        } catch (error) {
            console.error('Error generating response:', error);
            addMessage('申し訳ありません、エラーが発生しました。', 'ai');
        }
    };

    // メッセージを表示する関数を修正
    const addMessage = (text, type) => {
        const messageDiv = document.createElement('div');
        messageDiv.className = `message ${type}-message`;
        messageDiv.textContent = text;
        
        // 改行を保持
        messageDiv.style.whiteSpace = 'pre-wrap';
        
        chatContainer.appendChild(messageDiv);
        chatContainer.scrollTop = chatContainer.scrollHeight;
    };

    // 応答生成を改善
    const generateResponse = (input) => {
        const responses = {
            'こんにちは': 'こんにちは！何かお手伝いできることはありますか？',
            'おはよう': 'おはようございます！今日も頑張りましょう！',
            'さようなら': 'さようなら！また会いましょう！',
            'ヘルプ': '以下のことができます：\n・簡単な会話\n・計算の手伝い\n・勉強の質問への回答\n・基本的な情報提供',
            '計算': '計算機能は別ページにありますが、簡単な計算なら私でもできます！',
            '何ができる': 'お話や勉強の質問に答えることができます。\n計算や情報検索もできますよ！',
            '元気': '元気です！あなたはどうですか？',
            '疲れた': 'お疲れ様です。少し休憩を取ってはどうですか？',
            '教えて': '何について知りたいですか？できる限り説明します！',
            '勉強': '何の科目ですか？一緒に頑張りましょう！',
        };

        // 入力文字列を正規化
        const normalizedInput = input.toLowerCase();

        // キーワードマッチング
        for (const [key, value] of Object.entries(responses)) {
            if (normalizedInput.includes(key)) {
                return value;
            }
        }

        // 質問への対応
        if (normalizedInput.includes('?') || normalizedInput.includes('？')) {
            return '良い質問ですね。もう少し具体的に教えていただけますか？';
        }

        // 計算式の検出
        if (/[0-9+\-*/]/.test(normalizedInput)) {
            try {
                const result = eval(input.replace(/×/g, '*').replace(/÷/g, '/'));
                return `計算結果は ${result} です！`;
            } catch (e) {
                return '計算式が正しくないようです...';
            }
        }

        return 'なるほど、もう少し詳しく教えていただけますか？';
    };

    // イベントリスナーを修正
    sendButton.addEventListener('click', sendMessage);

    userInput.addEventListener('keydown', (e) => {
        if (e.key === 'Enter' && !e.shiftKey) {
            e.preventDefault();
            sendMessage();
        }
    });
});
