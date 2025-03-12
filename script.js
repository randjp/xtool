document.addEventListener('DOMContentLoaded', () => {
    // スムーズスクロール
    document.querySelectorAll('a[href^="#"]').forEach(anchor => {
        anchor.addEventListener('click', function (e) {
            e.preventDefault();
            const target = document.querySelector(this.getAttribute('href'));
            target.scrollIntoView({
                behavior: 'smooth'
            });
        });
    });

    // ナビゲーションバーのスクロール効果
    let lastScroll = 0;
    window.addEventListener('scroll', () => {
        const nav = document.querySelector('nav');
        const currentScroll = window.pageYOffset;
        
        if (currentScroll > lastScroll) {
            nav.style.transform = 'translateY(-100%)';
        } else {
            nav.style.transform = 'translateY(0)';
        }
        lastScroll = currentScroll;
    });

    // カードのアニメーション追加
    const cards = document.querySelectorAll('.card');
    const animateCards = () => {
        cards.forEach(card => {
            const cardTop = card.getBoundingClientRect().top;
            const triggerBottom = window.innerHeight * 0.8;
            
            if (cardTop < triggerBottom) {
                card.classList.add('visible');
            } else {
                card.classList.remove('visible');
            }
        });
    };

    window.addEventListener('scroll', animateCards);
    window.addEventListener('load', animateCards);

    // スクロール時に要素を表示
    const hiddenElements = document.querySelectorAll('.hidden');
    const revealElements = () => {
        hiddenElements.forEach(element => {
            const elementTop = element.getBoundingClientRect().top;
            const triggerBottom = window.innerHeight * 0.8;
            
            if (elementTop < triggerBottom) {
                element.classList.add('visible');
            } else {
                element.classList.remove('visible');
            }
        });
    };

    window.addEventListener('scroll', revealElements);
    window.addEventListener('load', revealElements);

    // テーマ切替機能
    const themeToggle = document.getElementById('theme-toggle');
    const prefersDarkScheme = window.matchMedia('(prefers-color-scheme: dark)');
    
    // システムのカラーモード設定を反映
    const currentTheme = localStorage.getItem('theme');
    if (currentTheme) {
        document.documentElement.setAttribute('data-theme', currentTheme);
    } else if (prefersDarkScheme.matches) {
        document.documentElement.setAttribute('data-theme', 'dark');
    }

    themeToggle.addEventListener('click', () => {
        let theme = document.documentElement.getAttribute('data-theme');
        let newTheme = theme === 'dark' ? 'light' : 'dark';
        
        document.documentElement.setAttribute('data-theme', newTheme);
        localStorage.setItem('theme', newTheme);
    });
});
