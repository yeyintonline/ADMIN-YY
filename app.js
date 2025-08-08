document.addEventListener('DOMContentLoaded', () => {
    // သင် ပေးပို့ထားသော sites array အသစ် (icon property မပါ)
    const sites = [
      { name: 'Agent', url: 'https://ag.bet555mix.com/' },
      { name: 'Master', url: 'https://ms.bet555mix.com/' },
      { name: 'M 556', url: 'https://ag.moung556.com/' }
    ];

    const topBar = document.querySelector('.top-bar'); 
    const webView = document.getElementById('web-view');
    const loader = document.getElementById('loader');
    let currentActiveTab = null;

    webView.addEventListener('load', () => {
        loader.classList.remove('show');
    });

    if (sites.length > 0) {
        document.title = sites[0].name;
        loader.classList.add('show');
        webView.src = sites[0].url;
    }

    sites.forEach((site, index) => {
        const tabDiv = document.createElement('div');
        tabDiv.className = 'tab-item';
        tabDiv.textContent = site.name; // icon အစား စာသားထည့်ပါ
        
        tabDiv.addEventListener('click', () => {
            document.title = site.name;
            loader.classList.add('show');
            webView.src = site.url;

            if (currentActiveTab) {
                currentActiveTab.classList.remove('active');
            }
            tabDiv.classList.add('active');
            currentActiveTab = tabDiv;
        });

        topBar.appendChild(tabDiv); 

        if (index === 0) {
            tabDiv.classList.add('active');
            currentActiveTab = tabDiv;
        }
    });
});