document.addEventListener('DOMContentLoaded', () => {
    // === Core App Elements ===
    const sites = [
        { name: 'Agent', url: 'https://ag.bet555mix.com/' },
        { name: 'Master', url: 'https://ms.bet555mix.com/' },
        { name: 'Match', url: 'https://yyscore.netlify.app/' }
        // You can add your other core sites here
    ];
    const topBar = document.querySelector('.top-bar');
    // [KEY CHANGE] Select the new wrapper for tabs
    const scrollableTabsWrapper = document.getElementById('scrollable-tabs-wrapper');
    const webView = document.getElementById('web-view');
    const loader = document.getElementById('loader');
    let currentActiveTab = null;

    // === Shortcut Feature Elements ===
    const manageShortcutsBtn = document.getElementById('manage-shortcuts-btn');
    const shortcutModal = document.getElementById('shortcut-modal');
    const closeModalBtn = document.getElementById('close-modal-btn');
    const shortcutsList = document.getElementById('shortcuts-list');
    const formTitle = document.getElementById('form-title');
    const shortcutIdInput = document.getElementById('shortcut-id');
    const shortcutNameInput = document.getElementById('shortcut-name');
    const shortcutUrlInput = document.getElementById('shortcut-url');
    const saveShortcutBtn = document.getElementById('save-shortcut-btn');

    // === Core App Logic ===
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
        
        localStorage.setItem('lastActiveUrl', site.url);
    }

    // === Shortcut Modal Visibility Logic ===
    function resetForm() {
        formTitle.textContent = 'Add New Shortcut';
        shortcutIdInput.value = '';
        shortcutNameInput.value = '';
        shortcutUrlInput.value = '';
    }

    function openModal() {
        resetForm();
        renderManagementList();
        shortcutModal.classList.add('show');
    }

    function closeModal() {
        shortcutModal.classList.remove('show');
    }

    // === Data Handling Functions (localStorage) ===
    const STORAGE_KEY = 'yy_admin_shortcuts';

    function getShortcuts() {
        const shortcutsJSON = localStorage.getItem(STORAGE_KEY);
        return shortcutsJSON ? JSON.parse(shortcutsJSON) : [];
    }

    function saveShortcuts(shortcutsArray) {
        localStorage.setItem(STORAGE_KEY, JSON.stringify(shortcutsArray));
        renderShortcutTabs();
        renderManagementList();
    }

    // === UI Rendering Functions ===
    function renderShortcutTabs() {
        document.querySelectorAll('.shortcut-tab').forEach(tab => tab.remove());
        
        const shortcuts = getShortcuts();
        shortcuts.forEach(shortcut => {
            const tabDiv = document.createElement('div');
            tabDiv.className = 'tab-item shortcut-tab'; 
            tabDiv.textContent = shortcut.name;
            
            tabDiv.addEventListener('click', () => {
                activateTab(tabDiv, { name: shortcut.name, url: shortcut.url });
            });
            // [KEY CHANGE] Append to the new scrollable wrapper
            scrollableTabsWrapper.appendChild(tabDiv);
        });
    }

    function renderManagementList() {
        shortcutsList.innerHTML = '';
        const shortcuts = getShortcuts();

        if (shortcuts.length === 0) {
            shortcutsList.innerHTML = '<li>No shortcuts added yet.</li>';
            return;
        }

        shortcuts.forEach(shortcut => {
            const listItem = document.createElement('li');
            listItem.innerHTML = `
                <span class="shortcut-info">${shortcut.name}</span>
                <div class="shortcut-actions">
                    <button class="edit-btn" data-id="${shortcut.id}">Edit</button>
                    <button class="delete-btn" data-id="${shortcut.id}">Delete</button>
                </div>
            `;
            shortcutsList.appendChild(listItem);
        });
    }

    // === CRUD Logic ===
    function handleSaveShortcut() {
        const id = shortcutIdInput.value;
        const name = shortcutNameInput.value.trim();
        const url = shortcutUrlInput.value.trim();

        if (!name || !url) {
            alert('Shortcut Name and URL cannot be empty.');
            return;
        }
        try { new URL(url); } catch (error) {
            alert('Please enter a valid URL (e.g., https://example.com)');
            return; 
        }

        let shortcuts = getShortcuts();

        if (id) { // UPDATE
            const shortcutToUpdate = shortcuts.find(s => s.id == id);
            if (shortcutToUpdate) {
                shortcutToUpdate.name = name;
                shortcutToUpdate.url = url;
            }
        } else { // CREATE
            const newShortcut = {
                id: Date.now(),
                name: name,
                url: url
            };
            shortcuts.push(newShortcut);
        }

        saveShortcuts(shortcuts);
        
        if (!id && (sites.length + shortcuts.length) === 1) {
            setTimeout(() => {
                const newTabElement = document.querySelector('.shortcut-tab');
                if (newTabElement) {
                    activateTab(newTabElement, shortcuts[0]);
                }
            }, 0);
        }
        
        closeModal();
    }
    
    // === Event Listeners ===
    manageShortcutsBtn.addEventListener('click', openModal);
    closeModalBtn.addEventListener('click', closeModal);
    shortcutModal.addEventListener('click', (event) => {
        if (event.target === shortcutModal) {
            closeModal();
        }
    });
    saveShortcutBtn.addEventListener('click', handleSaveShortcut);
    shortcutsList.addEventListener('click', (event) => {
        const target = event.target;
        const id = target.dataset.id;
        if (!id) return;

        if (target.classList.contains('edit-btn')) {
            let shortcuts = getShortcuts();
            const shortcutToEdit = shortcuts.find(s => s.id == id);
            if (shortcutToEdit) {
                formTitle.textContent = 'Edit Shortcut';
                shortcutIdInput.value = shortcutToEdit.id;
                shortcutNameInput.value = shortcutToEdit.name;
                shortcutUrlInput.value = shortcutToEdit.url;
            }
        }

        if (target.classList.contains('delete-btn')) {
            if (confirm('Are you sure you want to delete this shortcut?')) {
                let shortcuts = getShortcuts();
                const updatedShortcuts = shortcuts.filter(s => s.id != id);
                saveShortcuts(updatedShortcuts);
            }
        }
    });

    // === Initial Application Setup ===
    function initializeApp() {
        const allPossibleTabs = [...sites, ...getShortcuts()];
        
        if (allPossibleTabs.length === 0) {
            // This logic is for the full bookmark version. It does nothing if `sites` array has items.
            // For V2.0, since `sites` has items, this part is inactive.
        }

        const lastUrl = localStorage.getItem('lastActiveUrl');
        let siteToLoad = allPossibleTabs.find(tab => tab.url === lastUrl);
        if (!siteToLoad && allPossibleTabs.length > 0) {
            siteToLoad = allPossibleTabs[0];
        }
        
        if (!siteToLoad) {
             topBar.textContent = 'No sites configured.';
             return;
        }

        // Render core tabs
        sites.forEach(site => {
            const tabDiv = document.createElement('div');
            tabDiv.className = 'tab-item';
            tabDiv.textContent = site.name;
            tabDiv.addEventListener('click', () => activateTab(tabDiv, site));
            // [KEY CHANGE] Append to the new scrollable wrapper
            scrollableTabsWrapper.appendChild(tabDiv);
        });
        
        renderShortcutTabs();
        
        if (siteToLoad) {
            setTimeout(() => {
                const allTabElements = document.querySelectorAll('.tab-item');
                let tabElementToActivate = Array.from(allTabElements).find(el => {
                    const tabName = el.textContent;
                    const correspondingTabObject = allPossibleTabs.find(t => t.name === tabName);
                    return correspondingTabObject && correspondingTabObject.url === siteToLoad.url;
                });
    
                if (tabElementToActivate) {
                    activateTab(tabElementToActivate, siteToLoad);
                }
            }, 0);
        }
    }

    initializeApp();
});