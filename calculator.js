document.addEventListener('DOMContentLoaded', () => {
    const display = document.getElementById('result');
    const buttons = document.querySelectorAll('.calc-btn');
    let currentInput = '';
    let needReset = false;

    const handleInput = (value) => {
        // 演算子の重複チェックを厳密化
        const operators = ['+', '-', '×', '÷', '*', '/'];
        const isOperator = operators.includes(value);
        const lastChar = currentInput.slice(-1);
        const lastCharIsOperator = operators.includes(lastChar);

        // 演算子が連続で入力された場合
        if (isOperator) {
            if (currentInput === '' || lastCharIsOperator) {
                if (currentInput === '' && value === '-') {
                    // マイナスの数を入力可能にする
                    currentInput = value;
                    display.value = currentInput;
                } else if (lastCharIsOperator) {
                    // 最後の演算子を新しい演算子で置き換え
                    currentInput = currentInput.slice(0, -1) + value;
                    display.value = currentInput;
                }
                return;
            }
        }

        // 初期状態で演算子が入力された場合
        if (isOperator && currentInput === '') {
            return;
        }

        if (value === 'C') {
            currentInput = '';
            display.value = '0';
            needReset = false;
        } else if (value === '←') {
            if (needReset) {
                currentInput = '';
                needReset = false;
            } else {
                currentInput = currentInput.slice(0, -1);
            }
            display.value = currentInput || '0';
        } else if (value === '=') {
            try {
                if (currentInput) {
                    currentInput = currentInput.replace(/×/g, '*').replace(/÷/g, '/');
                    currentInput = eval(currentInput).toString();
                    display.value = formatNumber(currentInput);
                    needReset = true;
                }
            } catch (e) {
                display.value = 'Error';
                currentInput = '';
                needReset = true;
            }
        } else if (['sin', 'cos', 'tan', 'sqrt'].includes(value)) {
            try {
                const result = calculateFunction(value, currentInput);
                currentInput = result;
                display.value = formatNumber(result);
                needReset = true;
            } catch (e) {
                display.value = 'Error';
                currentInput = '';
                needReset = true;
            }
        } else {
            if (needReset && !isOperator) {
                currentInput = value;
                needReset = false;
            } else {
                currentInput += value;
            }
            display.value = currentInput;
        }
    };

    // 数値のフォーマット関数
    const formatNumber = (num) => {
        const parts = num.split('.');
        parts[0] = parts[0].replace(/\B(?=(\d{3})+(?!\d))/g, ',');
        return parts.join('.');
    };

    // キーボード入力のイベントリスナー
    document.addEventListener('keydown', (event) => {
        const key = event.key;
        
        // 数字キーの処理
        if (/[0-9]/.test(key)) {
            handleInput(key);
        }
        // 演算子の処理
        else if (['+', '-', '*', '/', '(', ')', '.'].includes(key)) {
            handleInput(key);
        }
        // Enterキーは=として処理
        else if (key === 'Enter') {
            handleInput('=');
        }
        // バックスペースとDeleteの処理
        else if (key === 'Backspace' || key === 'Delete') {
            handleInput('←');
        }
        // Escapeキーはクリアとして処理
        else if (key === 'Escape') {
            handleInput('C');
        }
        
        event.preventDefault();
    });

    const calculateFunction = (func, value) => {
        const num = parseFloat(value);
        switch(func) {
            case 'sin':
                return Math.sin(num * Math.PI / 180).toFixed(8);
            case 'cos':
                return Math.cos(num * Math.PI / 180).toFixed(8);
            case 'tan':
                return Math.tan(num * Math.PI / 180).toFixed(8);
            case 'sqrt':
                return Math.sqrt(num).toString();
            case 'log':
                return Math.log10(num).toString();
            case 'exp':
                return Math.exp(num).toString();
            default:
                return value;
        }
    };

    buttons.forEach(button => {
        button.addEventListener('click', () => {
            handleInput(button.dataset.value);
        });
    });

    display.value = '0';
});
