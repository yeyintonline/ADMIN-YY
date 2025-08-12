// ==============================================
// === app.js - V3.0 Final Production Version ===
// ==============================================

document.addEventListener('DOMContentLoaded', () => {

    // === Core Data & State ===
    const sites = [
        { name: '556', url: 'https://ag.moung556.com/' },
        { name: 'Agent', url: 'https://ag.bet555mix.com/' },
        { name: 'Master', url: 'https://ms.bet555mix.com/' },
        { name: 'Match', url: 'https://yyscore.netlify.app/' }
    ];
    const STORAGE_KEY = 'yy_admin_shortcuts';
    let currentActiveButton = null;
    let isDrawerOpen = false;

    // === Element Selectors ===
    const webView = document.getElementById('web-view');
    const loader = document.getElementById('loader');
    const bottomBar = document.getElementById('bottom-bar');
    const coreButtonsContainer = document.getElementById('core-buttons-container');
    const shortcutButtonsContainer = document.getElementById('shortcut-buttons-container');
    const toggleDrawerBtn = document.getElementById('toggle-drawer-btn');
    const manageShortcutsBtn = document.getElementById('manage-shortcuts-btn');
    const shortcutModal = document.getElementById('shortcut-modal');
    const closeModalBtn = document.getElementById('close-modal-btn');
    const shortcutsList = document.getElementById('shortcuts-list');
    const formTitle = document.getElementById('form-title');
    const shortcutIdInput = document.getElementById('shortcut-id');
    const shortcutNameInput = document.getElementById('shortcut-name');
    const shortcutUrlInput = document.getElementById('shortcut-url');
    const saveShortcutBtn = document.getElementById('save-shortcut-btn');

    // === Core App & UI Logic ===

    // This function now contains the robust, one-time listener fix.
    function activateButton(buttonElement, site) {
        if (webView.src === site.url) {
            return; // Do nothing if the URL is already active.
        }
        document.title = site.name;
        loader.classList.add('show');

        const onPageLoad = () => {
            loader.classList.remove('show');
            webView.removeEventListener('load', onPageLoad);
        };
        webView.addEventListener('load', onPageLoad);
        
        webView.src = site.url;

        if (currentActiveButton) {
            currentActiveButton.classList.remove('active');
        }
        buttonElement.classList.add('active');
        currentActiveButton = buttonElement;
        localStorage.setItem('lastActiveUrl', site.url);
    }

function toggleDrawer() {
    isDrawerOpen = !isDrawerOpen; // Flip the state
    bottomBar.classList.toggle('is-open', isDrawerOpen);
    
    // [NEW] Add or remove the 'active' class on the toggle button itself
    // based on the drawer's open/closed state.
    toggleDrawerBtn.classList.toggle('active', isDrawerOpen);
}

    // === UI Rendering Functions ===

/**
 * Creates a button element for the bottom bar.
 * Assigns a shared base class (.tab-item) and a specific modifier class 
 * (.core-button or .shortcut-button).
 * @param {object} site - The site or shortcut object.
 * @param {boolean} isShortcut - If true, applies the shortcut-specific class.
 * @returns {HTMLButtonElement}
 */
function createTabButton(site, isShortcut = false) {
    const button = document.createElement('button');
    
    // 1. Add the shared 'base' class to ALL buttons
    button.className = 'tab-item'; 
    
    // 2. Add the specific 'modifier' class based on the button type
    if (isShortcut) {
        button.classList.add('shortcut-button');
    } else {
        button.classList.add('core-button');
    }
    
    button.textContent = site.name;
    button.title = site.name;
    button.addEventListener('click', () => {
        activateButton(button, site);
        if (isDrawerOpen) {
            toggleDrawer();
        }
    });
    return button;
}

/**
 * Clears and re-renders all buttons in the bottom bar, separating core sites
 * from user-added shortcuts.
 */
function populateBottomBar() {
    coreButtonsContainer.innerHTML = '';
    shortcutButtonsContainer.innerHTML = '';

    // Populate core site buttons (always visible)
    sites.forEach(site => {
        // [MODIFIED] Call createTabButton with 'false' for core sites
        const button = createTabButton(site, false);
        coreButtonsContainer.appendChild(button);
    });

    // Populate user-added shortcuts into the expandable drawer
    const shortcuts = getShortcuts();
    shortcuts.forEach(shortcut => {
        // [MODIFIED] Call createTabButton with 'true' for user shortcuts
        const button = createTabButton(shortcut, true);
        shortcutButtonsContainer.appendChild(button);
    });
}

    // === Data Handling & Modal Logic ===

    function getShortcuts() {
        const shortcutsJSON = localStorage.getItem(STORAGE_KEY);
        return shortcutsJSON ? JSON.parse(shortcutsJSON) : [];
    }

    function saveShortcuts(shortcutsArray) {
        localStorage.setItem(STORAGE_KEY, JSON.stringify(shortcutsArray));
        populateBottomBar();
        renderManagementList();
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

    function handleSaveShortcut() {
        const id = shortcutIdInput.value;
        const name = shortcutNameInput.value.trim();
        let url = shortcutUrlInput.value.trim();
        if (!name || !url) {
            alert('Shortcut Name and URL cannot be empty.');
            return;
        }
        if (!/^(https?:\/\/|ftp:\/\/)/i.test(url)) {
            url = 'https://' + url;
        }
        try {
            new URL(url);
        } catch (error) {
            alert('The URL seems to be invalid, even after attempting to add "https://". Please check the format.');
            return;
        }
        let shortcuts = getShortcuts();
        if (id) {
            const shortcutToUpdate = shortcuts.find(s => String(s.id) === String(id));
            if (shortcutToUpdate) {
                shortcutToUpdate.name = name;
                shortcutToUpdate.url = url;
            }
        } else {
            shortcuts.push({ id: crypto.randomUUID(), name: name, url: url });
        }
        saveShortcuts(shortcuts);
        closeModal();
    }

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
    
    // === Event Listeners ===

    toggleDrawerBtn.addEventListener('click', toggleDrawer);
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
            const shortcutToEdit = shortcuts.find(s => String(s.id) === String(id));
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
                const updatedShortcuts = shortcuts.filter(s => String(s.id) !== String(id));
                saveShortcuts(updatedShortcuts);
            }
        }
    });

    // === Initial Application Setup ===

    function initializeApp() {
        populateBottomBar();
        
        const allPossibleSites = [...sites, ...getShortcuts()];
        const lastUrl = localStorage.getItem('lastActiveUrl');
        let siteToLoad = allPossibleSites.find(site => site.url === lastUrl) || allPossibleSites[0];

        if (siteToLoad) {
            setTimeout(() => {
                const allButtons = document.querySelectorAll('.bottom-bar .tab-item');
                const buttonToActivate = Array.from(allButtons).find(btn => btn.title === siteToLoad.name);
                
                if (buttonToActivate) {
                    activateButton(buttonToActivate, siteToLoad);
                } else if (allButtons.length > 0) {
                    // Fallback if last active site was deleted
                    activateButton(allButtons[0], allPossibleSites[0]);
                }
            }, 0);
        }
    }

    // Run the app
    initializeApp();
});