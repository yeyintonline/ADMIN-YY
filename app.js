// app.js (State Persistence ပါဝင်သော version)

document.addEventListener('DOMContentLoaded', () => {
    const sites = [
      { name: 'Agent', url: 'https://ag.bet555mix.com/' },
      { name: 'Master', url: 'https://ms.bet555mix.com/' }
    ];

    const topBar = document.querySelector('.top-bar');  
    const webView = document.getElementById('web-view');
    const loader = document.getElementById('loader');
    let currentActiveTab = null;

    webView.addEventListener('load', () => {
        loader.classList.remove('show');
    });

    function activateTab(tabElement, site) {
        document.title = site.name;
        loader.classList.add('show');
        webView.src = site.url;

        if (currentActiveTab) {
            currentActiveTab.classList.remove('active');
        }
        tabElement.classList.add('active');
        currentActiveTab = tabElement;

        // အရေးကြီး: နောက်ဆုံးသုံးခဲ့တဲ့ URL ကို localStorage မှာ မှတ်ထားပါ
        localStorage.setItem('lastActiveUrl', site.url);
    }

    if (!sites || sites.length === 0) {
        topBar.textContent = 'No sites configured.';
        return;
    }

    // --- Page Load Logic အသစ် ---
    // 1. localStorage ကနေ နောက်ဆုံးသုံးခဲ့တဲ့ URL ကို ပြန်ရှာမယ်
    const lastUrl = localStorage.getItem('lastActiveUrl');

    // 2. Active လုပ်ရမယ့် site ကို ရှာမယ်။
    //    - မှတ်ထားတဲ့ URL ရှိရင် အဲ့ဒီ URL နဲ့တူတဲ့ site ကိုရှာမယ်။
    //    - မရှိရင် default အဖြစ် ပထမဆုံး site ကို ယူမယ်။
    let siteToLoad = sites.find(site => site.url === lastUrl) || sites[0];

    // Tab တွေကို တည်ဆောက်မယ်
    sites.forEach((site, index) => {
        const tabDiv = document.createElement('div');
        tabDiv.className = 'tab-item';
        tabDiv.textContent = site.name;
        
        tabDiv.addEventListener('click', () => {
            activateTab(tabDiv, site);
        });

        topBar.appendChild(tabDiv);

        // 3. Page စဖွင့်ချိန်မှာ active လုပ်ရမယ့် tab ကို activate လုပ်ပေးမယ်
        if (site.url === siteToLoad.url) {
            activateTab(tabDiv, site);
        }
    });
});