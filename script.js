// --- Supabase Konstanty pro AUTENTIZACI ---
const SUPABASE_URL = 'https://aknjpurxdbtsxillmqbd.supabase.co';
const SUPABASE_ANON_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImFrbmpwdXJ4ZGJ0c3hpbGxtcWJkIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDgxOTEzMzAsImV4cCI6MjA2Mzc2NzMzMH0.otk-74BBM-SwC_zA0WqqcwGVab5lBfrLiyeYOmh4Xio';
const supabaseClient = supabase.createClient(SUPABASE_URL, SUPABASE_ANON_KEY);

// --- Firebase Konfigurace pro FIRESTORE DATABÁZI ---
const firebaseConfig = {
    apiKey: "AIzaSyBBep6Nyn9jEp_Q1bryULEbfuWfngMT07Y",
    authDomain: "muj-osobni-web-pokus-10.firebaseapp.com",
    projectId: "muj-osobni-web-pokus-10",
    storageBucket: "muj-osobni-web-pokus-10.firebasestorage.app",
    messagingSenderId: "546998884348",
    appId: "1:546998884348:web:c5efd177dc1144b80cc479",
    measurementId: "G-1PCS4F72KJ"
};

// Inicializujeme Firebase App a Firestore
let fbApp;
let db;

try {
    fbApp = firebase.initializeApp(firebaseConfig);
    db = fbApp.firestore();
    console.log("Firebase Firestore úspěšně inicializován.");
} catch (error) {
    console.error("Chyba při inicializaci Firebase Firestore:", error);
    document.getElementById('loading-indicator').textContent = 'Kritická chyba: Knihovna Firebase Firestore se nenačetla.';
    document.body.style.visibility = 'visible';
}

// Globální proměnná pro stav editačního módu
let isEditMode = false;
console.log("isEditMode inicializováno");

const EDIT_MODE_KEY = 'portfolio_edit_mode_active';
console.log("EDIT_MODE_KEY nastaveno");

// Identifikátor pro hlavní dokument s editovatelným obsahem stránky ve Firestore
const DOC_ID = 'websiteContent';
console.log("DOC_ID nastaveno");

// Globální proměnné pro data
let currentModalImageIndex = 0;
console.log("currentModalImageIndex inicializováno");

let editableContentData = {};
console.log("editableContentData inicializováno");

let portfolioItemsData = [];
console.log("portfolioItemsData inicializováno");

let galleryImagesData = null;
console.log("galleryImagesData inicializováno");

let savedCodesData = [];
console.log("savedCodesData inicializováno");

let externalLinksData = [];
console.log("externalLinksData inicializováno");

let currentUserId = null;
console.log("currentUserId inicializováno");

let editingPortfolioItemId = null;
console.log("editingPortfolioItemId inicializováno");

// Toto je přímo pro statické obrázky na strance, ty neslouží k úpravám a ani mazání
const initialImageUrls = [
    { id: 'initial-1', url: 'https://img.freepik.com/free-photo/futuristic-background-with-colorful-abstract-design_1340-39 futuristic-technology-background-with-neon-lights_76964-11458.jpg?w=826&t=st=1716545000~exp=1716545600~hmac=e6108f60104301f3b2886131029b0f10151707f3020142e9950b1e22704c654a', name: 'Technologie'},
    { id: 'initial-2', url: 'https://img41.rajce.idnes.cz/d4102/19/19244/19244630_db82ad174937335b1a151341387b7af2/images/image_4k18.jpg?ver=0', name: 'Srdce'},
    { id: 'initial-3', url: 'https://img.freepik.com/free-photo/glowing-spaceship-orbits-planet-starry-galaxy-generated-by-ai_188544-9655.jpg?w=1060&t=st=1716545052~exp=1716545652~hmac=c6a7d107b56da6822f221372f4476a3793075997b820160f494a887688068b14', name: 'Vesmírná loď'},
    { id: 'initial-4', url: 'https://img41.rajce.idnes.cz/d4102/19/19244/19244630_db82ad174937335b1a151341387b7af2/images/image_4k7.jpg?ver=0', name: 'Mlhovina'},
    { id: 'initial-5', url: 'https://img41.rajce.idnes.cz/d4102/19/19244/19244630_db82ad174937335b1a151341387b7af2/images/image_4k8.jpg?ver=0', name: 'Kyberpunk město'},
    { id: 'initial-6', url: 'https://img41.rajce.idnes.cz/d4102/19/19244/19244630_db82ad174937335b1a151341387b7af2/images/image_4k13.jpg?ver=0', name: 'Notebook v akci'},
    { id: 'initial-7', url: 'https://img41.rajce.idnes.cz/d4102/19/19244/19244630_db82ad174937335b1a151341387b7af2/images/image_4k14.jpg?ver=0', name: 'Galaxie'},
    { id: 'initial-8', url: 'https://img41.rajce.idnes.cz/d4102/19/19244/19244630_db82ad174937335b1a151341387b7af2/images/image_1920x10804.jpg?ver=0', name: 'Lidský mozek'},
    { id: 'initial-9', url: 'https://img41.rajce.idnes.cz/d4102/19/19244/19244630_db82ad174937335b1a151341387b7af2/images/image_15360x86402.jpg?ver=0', name: 'Vědecké laboratoře'},
    { id: 'initial-10', url: 'https://img41.rajce.idnes.cz/d4102/19/19244/19244630_db82ad174937335b1a151341387b7af2/images/misurina-sunset.jpg?ver=0', name: 'Neuronová síť'},
    { id: 'initial-11', url: 'https://img41.rajce.idnes.cz/d4102/19/19244/19244630_db82ad174937335b1a151341387b7af2/images/snowy-landscape-with-mountains-lake-with-snow-ground.jpg?ver=0', name: 'Datová mřížka'},
    { id: 'initial-12', url: 'https://img41.rajce.idnes.cz/d4102/19/19244/19244630_db82ad174937335b1a151341387b7af2/images/wet-sphere-reflective-water-abstract-beauty-generated-by-ai.jpg?ver=0', name: 'Futuristické město'},
    { id: 'initial-13', url: 'https://img41.rajce.idnes.cz/d4102/19/19244/19244630_db82ad174937335b1a151341387b7af2/images/vnon-pozadi-od-admirala-chatbota..jpg?ver=0', name: 'Světelná geometrie'},
    { id: 'initial-14', url: 'https://img41.rajce.idnes.cz/d4102/19/19244/19244630_db82ad174937335b1a151341387b7af2/images/image_1024x1792.jpg?ver=0', name: 'Digitální plameny'},
    { id: 'initial-15', url: 'https://img41.rajce.idnes.cz/d4102/19/19244/19244630_db82ad174937335b1a151341387b7af2/images/image_300x3001_2.jpg?ver=0', name: 'Exoplaneta'},
    { id: 'initial-16', url: 'https://img36.rajce.idnes.cz/d3603/10/10185/10185286_0147349ad505c43a2d9f6eb372624417/images/CIMG0039.jpg?ver=3', name: 'Kybernetická maska'},
];
 
let initialExternalLinksData = [];

document.addEventListener('DOMContentLoaded', async function() { // Zde je klíčové 'async'
    const loadingIndicatorElement = document.getElementById('loading-indicator');

    if (loadingIndicatorElement) {
        loadingIndicatorElement.textContent = "Načítání stránky a dat...";
        loadingIndicatorElement.classList.remove('hidden');
    } else {
        console.error("Loading indicator element not found!");
    }

    if (typeof supabase === 'undefined' || typeof supabase.createClient !== 'function') {
        console.error('Supabase library not loaded or createClient is not a function.');
        if (loadingIndicatorElement) {
            loadingIndicatorElement.textContent = 'Kritická chyba: Knihovna Supabase se nenačetla.';
        }
        document.body.style.visibility = 'visible';
        return;
    }
    if (typeof firebase === 'undefined' || typeof firebase.initializeApp !== 'function') {
        console.error('Firebase library not loaded or initializeApp is not a function.');
        if (loadingIndicatorElement) {
            loadingIndicatorElement.textContent = 'Kritická chyba: Knihovna Firebase se nenačetla.';
        }
        document.body.style.visibility = 'visible';
        return;
    }

    // --- Supabase autentizace (pro správu přihlášení) ---
    supabaseClient.auth.onAuthStateChange((event, session) => {
        console.log('Supabase Auth State Change:', event, session);
        if (session && session.user) {
            console.log('Uživatel je přihlášen přes Supabase:', session.user.email);
            currentUserId = session.user.id;
            document.getElementById('login-button').classList.add('hidden');
            document.getElementById('edit-mode-toggle-btn').classList.remove('hidden');

            const userIdDisplaySpan = document.getElementById('firebase-user-id');
            const userIdContainer = document.getElementById('user-id-display');
            if (currentUserId && userIdDisplaySpan && userIdContainer) {
                userIdDisplaySpan.textContent = currentUserId;
                userIdContainer.classList.remove('hidden');
            }

            if (localStorage.getItem(EDIT_MODE_KEY) === 'true') {
                enableEditMode();
                document.getElementById('edit-mode-toggle-btn').textContent = ' 💾';
            } else {
                disableEditMode();
                document.getElementById('edit-mode-toggle-btn').textContent = '🔧';
            }
        } else {
            console.log('Uživatel není přihlášen přes Supabase.');
            currentUserId = null;
            document.getElementById('login-button').classList.remove('hidden');
            document.getElementById('edit-mode-toggle-btn').classList.add('hidden');
            document.getElementById('user-id-display').classList.add('hidden');
            disableEditMode();
            localStorage.removeItem(EDIT_MODE_KEY);
        }
        initializeApp();
        if (loadingIndicatorElement) loadingIndicatorElement.classList.add('hidden');
        document.body.style.visibility = 'visible';
    });

    async function checkInitialAuthStateSupabase() {
        const { data: { session }, error } = await supabaseClient.auth.getSession();
        if (error) {
            console.error("Chyba při získávání Supabase session:", error);
        } else if (session) {
            // Stav bude zpracován v onAuthStateChange listeneru
        }
    }
    await checkInitialAuthStateSupabase(); // Voláme s await, protože je to async
});

// --- Pomocná funkce pro formátování časového otisku ---
function formatTimestamp(timestamp) {
    if (!timestamp) return 'Neznámé datum';
    if (typeof timestamp.toDate === 'function') {
        return new Date(timestamp.toDate()).toLocaleString('cs-CZ');
    }
    return new Date(timestamp).toLocaleString('cs-CZ');
}

// --- Funkce pro zobrazení/skrytí přihlašovacího modalu ---
function showAuthModal() {
    showModal(document.getElementById('auth-modal'));
    document.getElementById('auth-email').focus();
    document.getElementById('auth-error-message').textContent = '';
}

function hideAuthModal() {
    hideModal(document.getElementById('auth-modal'));
    document.getElementById('auth-email').value = '';
    document.getElementById('auth-password').value = '';
    document.getElementById('auth-error-message').textContent = '';
}

document.getElementById('cancel-auth-btn')?.addEventListener('click', hideAuthModal);

// --- Funkce pro přihlášení (pouze Supabase) ---
document.getElementById('login-auth-btn')?.addEventListener('click', async () => {
    const email = document.getElementById('auth-email').value;
    const password = document.getElementById('auth-password').value;
    const errorMessageEl = document.getElementById('auth-error-message');
    errorMessageEl.textContent = '';

    showLoading("Přihlašování přes Supabase...");

    const { error } = await supabaseClient.auth.signInWithPassword({ email, password });
    if (error) {
        console.error('Chyba při přihlašování:', error.message);
        errorMessageEl.textContent = `Chyba: ${error.message}`;
        hideLoading();
    } else {
        hideAuthModal();
        hideLoading();
    }
});

// --- Funkce pro registraci (pouze Supabase) ---
document.getElementById('signup-auth-btn')?.addEventListener('click', async () => {
    const email = document.getElementById('auth-email').value;
    const password = document.getElementById('auth-password').value;
    const errorMessageEl = document.getElementById('auth-error-message');
    errorMessageEl.textContent = '';

    showLoading("Registrace přes Supabase...");

    const { data, error } = await supabaseClient.auth.signUp({ email, password });
    if (error) {
        console.error('Chyba při registraci:', error.message);
        errorMessageEl.textContent = `Chyba: ${error.message}`;
        hideLoading();
    } else {
        if (data && data.user) {
            showAlertModal("Registrace úspěšná", "Registrace proběhla úspěšně! Nyní se můžete přihlásit.");
            hideAuthModal();
            hideLoading();
        } else {
            showAlertModal("Registrace vyžaduje potvrzení", "Zkontrolujte svůj email pro potvrzení registrace. Poté se můžete přihlásit.");
            hideAuthModal();
            hideLoading();
        }
    }
});

// --- Funkce pro odhlášení (pouze Supabase) ---
window.signOut = async function() {
    const confirmed = await (window.showConfirmModal ?
        showConfirmModal("Odhlásit se?", "Opravdu se chcete odhlásit?", { okText: 'Ano, odhlásit', cancelText: 'Zůstat přihlášen' }) :
        confirm("Opravdu se chcete odhlásit?")
    );

    if (confirmed) {
        showLoading("Odhlašování přes Supabase...");
        const { error } = await supabaseClient.auth.signOut();
        if (error) {
            console.error('Chyba při odhlašování:', error.message);
            showAlertModal("Chyba odhlášení", `Nepodařilo se odhlásit: ${error.message}`);
            hideLoading();
        } else {
            showAlertModal("Odhlášení", "Byli jste úspěšně odhlášeni. Pro úpravy se opět přihlaste.");
            hideLoading();
        }
    }
};

// --- Funkce pro ukládání ostatních dat do Firestore (mimo portfolia) ---
async function saveDataToFirestore() {
    if (!currentUserId) {
        //showAlertModal("Uložení selhalo", "Pro uložení dat se musíte přihlásit.");
        return false;
    }
    showLoading("Ukládám data do cloudu...");

    // Aktualizujeme editableContentData z DOM, ale jen pro obecné texty, ne portfolio
    document.querySelectorAll('[data-editable]').forEach(el => {
        const id = el.dataset.editable;
        // Kontrolujeme, zda ID nezačíná na 'portfolio-item-', abychom se vyhnuli staré struktuře
        if (id && !id.startsWith('portfolio-item-')) {
            if (el.tagName === 'A' && el.classList.contains('editable-link')) {
                editableContentData[id] = { url: el.href, text: el.childNodes[0] ? el.childNodes[0].nodeValue.trim() : '' };
            } else {
                editableContentData[id] = el.innerHTML;
            }
        }
    });

// NOVÝ KÓD: Ukládání URL dat ze stávajících portfolio položek
    document.querySelectorAll('#cloude-projek-test .portfolio-item').forEach(portfolioItem => {
        const itemId = portfolioItem.dataset.itemId;
        if (itemId) {
            // Najdeme odkaz v této portfolio položce
            const linkElement = portfolioItem.querySelector('a.editable-link');
            if (linkElement) {
                const linkTextSpan = linkElement.querySelector('[data-url-editable-text]');
                const linkText = linkTextSpan ? linkTextSpan.textContent.trim() : '';
                const linkUrl = linkElement.getAttribute('href') || '';
                
                // Uložíme do editableContentData
                editableContentData[`${itemId}-link-text`] = linkText;
                editableContentData[`${itemId}-link-url`] = linkUrl;
                
                console.log(`💾 Ukládám URL data pro ${itemId}:`, { linkText, linkUrl });
            }
        }
    });

    const dataToSave = {
        galleryImages: galleryImagesData,
        savedCodes: savedCodesData,
        externalLinks: externalLinksData,
        editableContent: editableContentData, // Toto jsou obecné texty
        editorUserId: currentUserId,
        lastUpdated: firebase.firestore.FieldValue.serverTimestamp(),
         
    };

    try {
        await db.collection('publicContent').doc(DOC_ID).set(dataToSave, { merge: false }); // Použijeme merge: false pro přepsání
        hideLoading();
        //showAlertModal("Uloženo do cloudu", "Všechna data (mimo portfolia) byla úspěšně uložena do Cloud Firestore.");
        return true;
    } catch (error) {
        console.error('Chyba při ukládání ostatních dat do Firestore:', error);
        hideLoading();
        showAlertModal("Chyba ukládání", `Nepodařilo se uložit data do cloudu: ${error.message}`);
        return false;
    }
}

// --- Funkce pro načítání dat z Firestore (všichni vidí) ---
async function loadDataFromFirestore() {
    showLoading("Načítám data z cloudu...");
    try {
        const docRef = db.collection('publicContent').doc(DOC_ID);
        const doc = await docRef.get();

        if (doc.exists) {
            const data = doc.data();
            editableContentData = data.editableContent || {};
            galleryImagesData = data.galleryImages || [...initialImageUrls];
            savedCodesData = data.savedCodes || [];
            externalLinksData = data.externalLinks || [...initialExternalLinksData];

            // NOVÉ: Načítáme položky portfolia z pod-kolekce
            const portfolioCollectionRef = docRef.collection('portfolioItems');
            const portfolioSnapshot = await portfolioCollectionRef.get();
            portfolioItemsData = portfolioSnapshot.docs.map(doc => ({
                id: doc.id, // Ukládáme si ID dokumentu z Firestore
                ...doc.data()
            }));

            applyEditableContent(); // Aplikuje obecné editovatelné texty
            updateGalleryDisplay();
            renderSavedCodesDisplay();
            renderExternalLinks();
            renderPortfolioItems(); // NOVÉ: Zavoláme funkci pro renderování portfolia
        } else {
            console.log("Hlavní dokument v cloudu nenalezen, používám výchozí data.");
            editableContentData = {};
            portfolioItemsData = [];
            galleryImagesData = [...initialImageUrls];
            savedCodesData = [];
            externalLinksData = [...initialExternalLinksData];
        }
        hideLoading();
    } catch (error) {
        console.error('Chyba při načítání dat z Firestore:', error);
        hideLoading();
        showAlertModal("Chyba načítání", `Nepodařilo se načíst data z cloudu: ${error.message}`);
    }
}

// --- Listener pro aktualizace v reálném čase z Firestore ---
function setupFirestoreRealtimeListener() {
    // Listener pro hlavní dokument
    db.collection('publicContent').doc(DOC_ID)
        .onSnapshot((doc) => {
            if (doc.exists) {
                const data = doc.data();
                console.log("Realtime aktualizace hlavního dokumentu z Firestore:", data);
                galleryImagesData = data.galleryImages || [...initialImageUrls];
                savedCodesData = data.savedCodes || [];
                externalLinksData = data.externalLinks || [...initialExternalLinksData];
                editableContentData = data.editableContent || {}; // Obecné texty
                applyEditableContent();
                updateGalleryDisplay();
                renderSavedCodesDisplay();
                renderExternalLinks();
                hideLoading();
                console.log("Firestore Aktualizace: Obsah stránky byl automaticky aktualizován z cloudu.");
               console.log('Realtime update - galleryImagesData po aktualizaci:', doc.data().galleryImages);
            } else {
                console.log("Hlavní dokument v Firestore neexistuje, nebo byl smazán.");
                console.log('Realtime update - galleryImagesData po aktualizaci:', doc.data().galleryImages);  
                galleryImagesData = [...initialImageUrls];
                savedCodesData = [];
                externalLinksData = [...initialExternalLinksData];
                editableContentData = {};
                applyEditableContent();
                updateGalleryDisplay();
                renderSavedCodesDisplay();
                renderExternalLinks();
            }
        }, (error) => {
            console.error("Chyba při poslouchání realtime aktualizací hlavního dokumentu:", error);
            showAlertModal("Chyba synchronizace", `Nepodařilo se synchronizovat data v reálném čase: ${error.message}`);
        });

    // NOVÉ: Listener pro pod-kolekci portfolioItems
    db.collection('publicContent').doc(DOC_ID).collection('portfolioItems')
        .onSnapshot((snapshot) => {
            console.log("Realtime aktualizace portfolia z Firestore.");
            portfolioItemsData = snapshot.docs.map(doc => ({
                id: doc.id,
                ...doc.data()
            }));
            renderPortfolioItems(); // Znovu vykreslí portfolio po změně
            hideLoading();
        }, (error) => {
            console.error("Chyba při poslouchání realtime aktualizací portfolia:", error);
            showAlertModal("Chyba synchronizace portfolia", `Nepodařilo se synchronizovat portfolio v reálném čase: ${error.message}`);
        });
}

// --- Funkce pro aplikaci editovatelného obsahu (obecné texty) ---
function applyEditableContent() {
    for (const id in editableContentData) {
        const element = document.querySelector(`[data-editable="${id}"]`);
        if (element) {
            // Zajišťujeme, že neaplikujeme na portfolio položky, ty se renderují zvlášť
            if (!id.startsWith('portfolio-item-')) {
                if (element.tagName === 'A' && element.classList.contains('editable-link')) {
                    element.href = editableContentData[id].url || '#';
                    element.innerHTML = `${editableContentData[id].text || ''}<i class="fas fa-edit edit-icon ${isEditMode ? '' : 'hidden'}"></i>`;
                } else {
                    element.innerHTML = editableContentData[id];
                }
            }
        }
    }

    // Aktualizace editovatelných elementů podle edit módu
    document.querySelectorAll('[data-editable]').forEach(el => {
        if (isEditMode) {
            el.setAttribute('contenteditable', 'true');
        } else {
            el.removeAttribute('contenteditable');
        }
    });
    document.querySelectorAll('.editable-image-wrapper .edit-icon').forEach(icon => {
        if (isEditMode) icon.classList.remove('hidden'); else icon.classList.add('hidden');
    });
    document.querySelectorAll('.editable-link .edit-icon').forEach(icon => {
        if (isEditMode) icon.classList.remove('hidden'); else icon.classList.add('hidden');
    });
}

 // NOVÝ KÓD: Aplikace URL dat na stávající portfolio položky
        document.querySelectorAll('#cloude-projek-test .portfolio-item').forEach(portfolioItem => {
            const itemId = portfolioItem.dataset.itemId;
            if (itemId) {
                // Načteme uložená URL data
                const savedLinkText = editableContentData[`${itemId}-link-text`];
                const savedLinkUrl = editableContentData[`${itemId}-link-url`];
                
                // Najdeme odkaz v této portfolio položce
                const linkElement = portfolioItem.querySelector('a.editable-link');
                if (linkElement && (savedLinkText || savedLinkUrl)) {
                    // Aktualizujeme URL
                    if (savedLinkUrl) {
                        linkElement.setAttribute('href', savedLinkUrl);
                    }
                    
                    // Aktualizujeme text odkazu
                    const linkTextSpan = linkElement.querySelector('[data-url-editable-text]');
                    if (linkTextSpan && savedLinkText) {
                        linkTextSpan.textContent = savedLinkText;
                    }
                    
                    console.log(`🔄 Aplikuji URL data pro ${itemId}:`, { 
                        text: savedLinkText, 
                        url: savedLinkUrl 
                    });
                }
            }
        });



// --- NOVÁ FUNKCE: Renderování položek portfolia ---
function renderPortfolioItems() {
    const portfolioContainer = document.getElementById('jirka-portfolio'); // ZDE JE ZMĚNA: Používáme ID 'jirka-portfolio'
    if (!portfolioContainer) {
        console.error("Kontejner pro portfolio položky (#jirka-portfolio) nebyl nalezen!");
        return;
    }

    portfolioContainer.innerHTML = ''; // Vyčistíme kontejner před opětovným vykreslením

    if (portfolioItemsData.length === 0) {
        portfolioContainer.innerHTML = '<p>Žádné položky portfolia nejsou k dispozici.</p>';
        return;
    }

    portfolioItemsData.forEach(item => {
        const videoId = getYouTubeVideoId(item.youtubeUrl || '');
        let videoEmbedHtml = '';
        if (videoId) {
            const embedSrc = `https://www.youtube.com/embed/${videoId}`;
            videoEmbedHtml = `
                <div class="portfolio-video-container">
                    <iframe
                        src="${embedSrc}"
                        frameborder="0"
                        allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                        allowfullscreen
                    ></iframe>
                </div>
            `;
        }

        const isOwner = currentUserId && item.userId === currentUserId;

        const newItemHtml = `
            <div class="portfolio-item" data-item-id="${item.id}" style="background-color: #f9f9f9; padding: 1rem; border-radius: 4px; border: 1px solid #ddd; position: relative; margin-bottom: 20px;">
                <h3 data-editable-portfolio="title">${item.title || 'Název projektu'}</h3>
                <p data-editable-portfolio="desc1">${item.desc1 || 'Popis projektu'}</p>
                ${item.desc2 ? `<p data-editable-portfolio="desc2">${item.desc2}</p>` : ''}

                ${videoEmbedHtml}

                <a href="${item.linkUrl || '#'}" class="button editable-link" target="_blank" rel="noopener noreferrer">
                    ${item.linkText || 'Zobrazit projekt →'}
                </a>
                <div class="edit-controls ${isEditMode && isOwner ? '' : 'hidden'}">
                    <button onclick="editPortfolioItem('${item.id}')">Editovat</button>
                    <button onclick="deletePortfolioItem('${item.id}')" class="button btn-danger">Smazat</button>
                </div>
            </div>
        `;
        portfolioContainer.insertAdjacentHTML('beforeend', newItemHtml);
    });

    // Aktualizujeme viditelnost editovacích tlačítek po vykreslení
    document.querySelectorAll('.portfolio-item .edit-controls').forEach(controls => {
        const itemId = controls.closest('.portfolio-item').dataset.itemId;
        const item = portfolioItemsData.find(p => p.id === itemId);
        const isOwner = currentUserId && item && item.userId === currentUserId;
        if (isEditMode && isOwner) {
            controls.classList.remove('hidden');
        } else {
            controls.classList.add('hidden');
        }
    });
}

// NOVÁ FUNKCE: Rychlé uložení URL dat
    async function saveUrlDataToFirestore(projectId, urlData) {
        if (!currentUserId) {
            console.warn("Nelze uložit URL data - uživatel není přihlášen");
            return false;
        }

        try {
            // Aktualizujeme lokální data
            editableContentData[`${projectId}-link-text`] = urlData.linkText;
            editableContentData[`${projectId}-link-url`] = urlData.linkUrl;
            
            // Uložíme do Firestore
            const dataToSave = {
                editableContent: editableContentData,
                lastUpdated: firebase.firestore.FieldValue.serverTimestamp()
            };                       

            await db.collection('publicContent').doc(DOC_ID).set(dataToSave, { merge: true });
            console.log(`✅ URL data pro ${projectId} uložena do Firestore`);
            return true;
        } catch (error) {
            console.error('Chyba při ukládání URL dat:', error);
            return false;
        }
    }


// --- Funkce pro inicializaci aplikace ---
async function initializeApp() {
        setupNavigation();
        setupHtmlEditor();
        setupGallery();
        setupDataManagement();
        
        await loadDataFromFirestore();
        setupFirestoreRealtimeListener();

        const currentYearEl = document.getElementById('currentYear');
        if (currentYearEl) currentYearEl.textContent = new Date().getFullYear();
        
        showSection(activeSection, true);
        console.log("Aplikace inicializována.");
    }
//nově jsem testoval zda se obraky zachovají v galerii [ updateGalleryDisplay(); ] 
// --- Funkce pro přepínání editačního módu ---
function toggleEditMode() {
    if (!currentUserId) {
        showAlertModal("Přístup zamítnut", "Pro úpravy stránky se musíte přihlásit.");
        showAuthModal();
        return;
    }

    if (isEditMode) {
        disableEditMode();
        
          saveDataToFirestore(); // Už se nevolá zde, ukládání je automatické přes listenery nebo specifické funkce
       console.log("%c🔄 Volám funkci updateGalleryDisplay()...", "color: #ff9900; font-weight: bold;");
         updateGalleryDisplay();
       console.log("%c✅ Funkce updateGalleryDisplay() dokončena.", "color: #ff00ff; font-weight: bold;");
       // showAlertModal("Editace ukončena", "Režim úprav byl vypnut. Změny byly uloženy.");
    } else {
        enableEditMode();
        //showAlertModal("Režim úprav", "Jste v režimu úprav. Klikněte na text pro úpravu, nebo použijte ikony pro obrázky/odkazy. Změny se ukládají automaticky, ale můžete také použít 'Uložit vše do cloudu'.");
    }
}

function enableEditMode() {
    isEditMode = true;
    document.body.classList.add('edit-mode');
    document.getElementById('login-button').classList.add('hidden');
    document.getElementById('edit-mode-toggle-btn').textContent = '💾';
    document.getElementById('edit-mode-toggle-btn').classList.remove('hidden');

    document.querySelectorAll('[data-editable]').forEach(el => {
        el.setAttribute('contenteditable', 'true');
    });

    document.querySelectorAll('.editable-image-wrapper .edit-icon').forEach(icon => {
        icon.classList.remove('hidden');
    });
    document.querySelectorAll('.editable-link .edit-icon').forEach(icon => {
        icon.classList.remove('hidden');
    });

    // Zobrazíme editovací prvky pro portfolio
    document.querySelectorAll('.portfolio-item .edit-controls').forEach(controls => {
        const itemId = controls.closest('.portfolio-item').dataset.itemId;
        const item = portfolioItemsData.find(p => p.id === itemId);
        const isOwner = currentUserId && item && item.userId === currentUserId;
        if (isOwner) { // Zobrazit jen pokud je uživatel vlastníkem
            controls.classList.remove('hidden');
        }
    });

    document.getElementById('add-portfolio-item-btn').classList.remove('hidden');
    document.getElementById('add-link-btn').classList.remove('hidden');
    document.getElementById('data-management').classList.remove('hidden');

    document.querySelectorAll('.link-edit-controls').forEach(controls => {
        controls.classList.remove('hidden');
    });

    document.querySelectorAll('#links-table .edit-mode-only').forEach(el => {
        el.style.display = 'table-cell';
    });

    localStorage.setItem(EDIT_MODE_KEY, 'true');
}

function disableEditMode() {
    isEditMode = false;
    document.body.classList.remove('edit-mode');
    document.getElementById('edit-mode-toggle-btn').textContent = '🔧';

    if (!currentUserId) {
        document.getElementById('login-button').classList.remove('hidden');
        document.getElementById('edit-mode-toggle-btn').classList.add('hidden');
    }

    document.querySelectorAll('[contenteditable="true"]').forEach(el => {
        el.removeAttribute('contenteditable');
        const id = el.dataset.editable;
        // Uložíme jen obecné editovatelné texty, ne portfolio
        if (id && !id.startsWith('portfolio-item-')) {
            if (el.tagName === 'A' && el.classList.contains('editable-link')) {
                editableContentData[id] = { url: el.href, text: el.childNodes[0] ? el.childNodes[0].nodeValue.trim() : '' };
            } else {
                editableContentData[id] = el.innerHTML;
            }
        }
    });
    console.log('disableEditMode - galleryImagesData před uložením:', galleryImagesData);
    // Voláme saveDataToFirestore() pro uložení obecných textů
   // saveDataToFirestore();

    document.querySelectorAll('.editable-image-wrapper .edit-icon').forEach(icon => {
        icon.classList.add('hidden');
    });
    document.querySelectorAll('.editable-link .edit-icon').forEach(icon => {
        icon.classList.add('hidden');
    });

    // Skryjeme editovací prvky pro portfolio
    document.querySelectorAll('.portfolio-item .edit-controls').forEach(controls => {
        controls.classList.add('hidden');
    });

    document.getElementById('add-portfolio-item-btn').classList.add('hidden');
    document.getElementById('add-link-btn').classList.add('hidden');
    document.getElementById('data-management').classList.add('hidden');

    document.querySelectorAll('.link-edit-controls').forEach(controls => {
        controls.classList.add('hidden');
    });

    document.querySelectorAll('#links-table .edit-mode-only').forEach(el => {
        el.style.display = 'none';
    });

    localStorage.removeItem(EDIT_MODE_KEY);
}

// --- Funkce pro načítání a skrývání indikátoru ---
function showLoading(message = "Načítání...") {
    const loadingIndicatorElement = document.getElementById('loading-indicator');
    if (loadingIndicatorElement) {
        loadingIndicatorElement.textContent = message;
        loadingIndicatorElement.classList.remove('hidden');
    }
}
function hideLoading() {
    const loadingIndicatorElement = document.getElementById('loading-indicator');
    if (loadingIndicatorElement) {
        loadingIndicatorElement.classList.add('hidden');
    }
}

// --- Správa dat (nyní vše do/z Firestore) ---
 function setupDataManagement() {
    const dataManagementContainer = document.getElementById('data-management');
    if (dataManagementContainer) {
        document.getElementById('save-all-data-btn')?.addEventListener('click', saveDataToFirestore);
        document.getElementById('clear-all-data-btn')?.addEventListener('click', handleClearAllData);
        document.getElementById('export-data-btn')?.addEventListener('click', exportData);
        document.getElementById('import-data-btn')?.addEventListener('click', () => {
            document.getElementById('import-file-input')?.click();
        });
        document.getElementById('import-file-input')?.addEventListener('change', handleImportData);
    }
} 

 async function handleClearAllData() {
    if (!currentUserId) {
        showAlertModal("Přístup zamítnut", "Pro vymazání dat v cloudu se musíte přihlásit.");
        return;
    }
    const confirmed = await (window.showConfirmModal ?
        showConfirmModal("Vymazat všechna data v cloudu?", "Opravdu chcete vymazat všechna uložená data v cloudu? Tato akce je nevratná! Zahrnuje i texty upravené na stránce a smaže je PRO VŠECHNY!", { okText: 'Ano, vymazat', cancelText: 'Zrušit' }) :
        confirm("Opravdu chcete vymazat všechna uložená data v cloudu? Tato akce je nevratná!")
    );

    if (confirmed) {
        showLoading("Mažu data z cloudu...");
        try {
            // Smazání hlavního dokumentu
            await db.collection('publicContent').doc(DOC_ID).delete();

            // Smazání všech dokumentů v pod-kolekci portfolioItems
            const portfolioItemsSnapshot = await db.collection('publicContent').doc(DOC_ID).collection('portfolioItems').get();
            const deletePromises = portfolioItemsSnapshot.docs.map(doc => doc.ref.delete());
            await Promise.all(deletePromises);

            // Reset lokálních dat
             galleryImagesData = [...initialImageUrls];
            savedCodesData = [];
            externalLinksData = [...initialExternalLinksData];
            editableContentData = {};
            portfolioItemsData = []; // NOVÉ: Resetujeme i portfolio data

            applyEditableContent();
            updateGalleryDisplay();
            renderSavedCodesDisplay();
            renderExternalLinks();
            renderPortfolioItems(); // NOVÉ: Znovu vykreslíme prázdné portfolio

            hideLoading();
            showAlertModal("Data vymazána", "Všechna data byla úspěšně vymazána z Cloud Firestore. Stránka se vrátila k výchozímu obsahu.");
        } catch (error) {
            console.error('Chyba při mazání z Firestore:', error);
            hideLoading();
            showAlertModal("Chyba mazání", `Nepodařilo se vymazat data z cloudu: ${error.message}`);
        }
    }
}

function exportData() {
    // Ujistíme se, že editableContentData obsahuje aktuální stav obecných textů
    document.querySelectorAll('[data-editable]').forEach(el => {
        const id = el.dataset.editable;
        if (id && !id.startsWith('portfolio-item-')) { // Exportujeme jen obecné texty
            if (el.tagName === 'A' && el.classList.contains('editable-link')) {
                editableContentData[id] = { url: el.href, text: el.childNodes[0] ? el.childNodes[0].nodeValue.trim() : '' };
            } else {
                editableContentData[id] = el.innerHTML;
            }
        }
    });

    const exportObject = {
        galleryImages: galleryImagesData,
        savedCodes: savedCodesData,
        externalLinks: externalLinksData,
        editableContent: editableContentData, // Obecné texty
        portfolioItems: portfolioItemsData, // NOVÉ: Exportujeme i portfolio
        exportDate: new Date().toISOString(),
        version: "1.3" // Aktualizovaná verze pro novou strukturu
    };

    const dataStr = JSON.stringify(exportObject, null, 2);
    const dataBlob = new Blob([dataStr], { type: 'application/json' });
    const url = URL.createObjectURL(dataBlob);

    const link = document.createElement('a');
    link.href = url;
    link.download = `portfolio-data-${new Date().toISOString().split('T')[0]}.json`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);

    showAlertModal("Export dokončen", "Data byla exportována do souboru JSON.");
}

function handleImportData(event) {
    const file = event.target.files[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = async function(e) {
        try {
            const importedData = JSON.parse(e.target.result);
            const confirmed = await (window.showConfirmModal ?
                showConfirmModal("Importovat data?", "Importování přepíše všechna současná data (včetně textů na stránce) LOKÁLNĚ! Chcete pokračovat?", { okText: 'Ano, importovat', cancelText: 'Zrušit' }) :
                confirm("Importování přepíše data. Pokračovat?")
            );

            if (confirmed) {
                if (importedData.galleryImages) galleryImagesData = importedData.galleryImages;
                if (importedData.savedCodes) savedCodesData = importedData.savedCodes;
                if (importedData.externalLinks) externalLinksData = importedData.externalLinks;
                if (importedData.editableContent) editableContentData = importedData.editableContent;
                if (importedData.portfolioItems) portfolioItemsData = importedData.portfolioItems; // NOVÉ: Importujeme i portfolio

                if (currentUserId) {
                    // Uložíme hlavní data
                    await saveDataToFirestore();
                    // NOVÉ: Uložíme portfolio položky do Firestore
                    const portfolioCollectionRef = db.collection('publicContent').doc(DOC_ID).collection('portfolioItems');
                    // Nejprve smažeme stávající, pak přidáme nové
                    const existingPortfolioSnapshot = await portfolioCollectionRef.get();
                    const deletePromises = existingPortfolioSnapshot.docs.map(doc => doc.ref.delete());
                    await Promise.all(deletePromises);

                    // Přidáme naimportované portfolio položky
                    const addPromises = portfolioItemsData.map(item => {
                        const { id, ...data } = item; // Oddělíme ID, protože ho chceme použít jako ID dokumentu
                        return portfolioCollectionRef.doc(id).set(data);
                    });
                    await Promise.all(addPromises);

                } else {
                    showAlertModal("Upozornění", "Data byla importována pouze lokálně, protože nejste přihlášeni. Pro trvalé uložení se přihlaste a uložte je do cloudu.");
                }

                applyEditableContent();
                updateGalleryDisplay();
                renderSavedCodesDisplay();
                renderExternalLinks();
                renderPortfolioItems(); // NOVÉ: Znovu vykreslíme portfolio
                showAlertModal("Import dokončen", "Data byla úspěšně naimportována a aplikována.");
            }
        } catch (error) {
            console.error('Chyba při importu:', error);
            showAlertModal("Chyba importu", "Nepodařilo se načíst data ze souboru. Zkontrolujte, zda je soubor platný JSON.");
        }
    };
    reader.readAsText(file);
    event.target.value = '';
} 

// --- Navigace a sekce (beze změny) ---
const optimizedCSS = `
    main section {
        transition: none !important;
        animation: none !important;
        opacity: 1 !important;
        transform: none !important;
    }

    main section.active {
        transition: none !important;
        animation: none !important;
    }

    .nav-container a.nav-link {
        transition: none !important;
    }
`;

function injectOptimizedCSS() {
    const style = document.createElement('style');
    style.textContent = optimizedCSS;
    document.head.appendChild(style);
}

function setupNavigation() {
    injectOptimizedCSS();

    const navLinks = document.querySelectorAll('.nav-container a.nav-link');
    navLinks.forEach(link => {
        link.addEventListener('click', (e) => {
            e.preventDefault();
            const sectionId = link.dataset.section;
            showSection(sectionId);
            navLinks.forEach(l => l.classList.remove('active'));
            link.classList.add('active');
        });
    });
    const initialActiveLink = document.querySelector(`.nav-container a.nav-link[data-section="${activeSection}"]`);
    if (initialActiveLink) initialActiveLink.classList.add('active');
}

let activeSection = 'about'; // Musí být definováno globálně nebo před prvním použitím

function showSection(id, isInitial = false) {
    if (!id) id = 'about';
    activeSection = id;

    document.querySelectorAll('main section').forEach(section => {
        section.classList.remove('active');
        section.style.display = 'none';
    });

    const sectionElement = document.getElementById(id);
    if (sectionElement) {
        sectionElement.style.display = 'block';
        sectionElement.classList.add('active');
    } else {
        console.warn(`Sekce s ID "${id}" nebyla nalezena. Zobrazuji 'about'.`);
        const aboutSection = document.getElementById('about');
        if(aboutSection) {
            aboutSection.style.display = 'block';
            aboutSection.classList.add('active');
            activeSection = 'about';
            document.querySelectorAll('.nav-container a.nav-link').forEach(l => l.classList.remove('active'));
            document.querySelector('.nav-container a.nav-link[data-section="about"]')?.classList.add('active');
        }
    }
}

// --- HTML Editor (ukládá do Firestore) ---
function setupHtmlEditor() {
    const editor = document.getElementById('html-editor');
    const preview = document.getElementById('html-preview');
    const saveBtn = document.getElementById('save-code-btn');

    if (!editor || !preview || !saveBtn) {
        console.error("HTML editor elementy nebyly nalezeny!");
        return;
    }

    editor.addEventListener('input', () => { preview.srcdoc = editor.value; });
    preview.srcdoc = editor.value;

    saveBtn.addEventListener('click', () => {
        if (!currentUserId) {
            showAlertModal("Přístup zamítnut", "Pro uložení kódu se musíte přihlásit.");
            return;
        }
        if (!editor.value.trim()) {
            showAlertModal("Prázdný kód", "Nelze uložit prázdný HTML kód.");
            return;
        }
        const saveModal = document.getElementById('save-code-modal');
        if(saveModal) showModal(saveModal);
        document.getElementById('code-title-input')?.focus();
    });
}

async function saveHtmlCodeToFirestore(title, code) {
    if (!currentUserId) {
        //showAlertModal("Uložení selhalo", "Pro uložení kódu se musíte přihlásit.");
        return;
    }
    showLoading("Ukládám HTML kód...");
    const newCode = {
        id: `html-code-${Date.now()}-${Math.random().toString(36).substr(2, 5)}`,
        title,
        code,
        createdAt: Date.now(),
        userId: currentUserId
    };
    try {
        savedCodesData.unshift(newCode); // Přidá na začátek
        await saveDataToFirestore(); // Uloží celý savedCodesData pole
        showAlertModal("Kód uložen", `Kód "${title}" byl úspěšně uložen do cloudu.`);
        hideLoading();
    } catch (error) {
        console.error('Chyba při ukládání kódu do Firestore:', error);
        showAlertModal("Chyba ukládání", `Nepodařilo se uložit kód: ${error.message}`);
        hideLoading();
    }
}

async function deleteHtmlCodeFromFirestore(idToDelete) {
    if (!currentUserId) {
        showAlertModal("Přístup zamítnut", "Pro smazání kódu se musíte přihlásit.");
        return;
    }
    const codeToDelete = savedCodesData.find(code => code.id === idToDelete);
    if (!codeToDelete || codeToDelete.userId !== currentUserId) {
        showAlertModal("Přístup zamítnut", "Nemáte oprávnění smazat tento kód. Můžete smazat pouze své vlastní kódy.");
        return;
    }

    const confirmed = await (window.showConfirmModal ?
        showConfirmModal("Smazat kód?", `Opravdu chcete smazat kód "${codeToDelete.title}"? Tato akce je nevratná!`) :
        confirm(`Smazat kód "${codeToDelete.title}"?`)
    );
    if (confirmed) {
        showLoading("Mažu HTML kód...");
        try {
            savedCodesData = savedCodesData.filter(code => code.id !== idToDelete);
            await saveDataToFirestore(); // Uloží aktualizované savedCodesData pole
            showAlertModal("Kód smazán", "Kód byl úspěšně smazán z cloudu.");
            hideLoading();
        } catch (error) {
            console.error('Chyba při mazání kódu z Firestore:', error);
            showAlertModal("Chyba mazání", `Nepodařilo se smazat kód: ${error.message}`);
            hideLoading();
        }
    }
}

function renderSavedCodesDisplay() {
    const listEl = document.getElementById('saved-codes-list');
    if(!listEl) return;
    listEl.innerHTML = savedCodesData.length === 0 ? '<p>Žádné kódy nejsou aktuálně uloženy.</p>' : '';

    savedCodesData.forEach(item => {
        const div = document.createElement('div');
        div.className = 'saved-code-item';
        const isOwner = currentUserId && item.userId === currentUserId;

        div.innerHTML = `
            <div class="item-header">
                <h3>${item.title}</h3>
                <div class="actions">
                    <button class="button btn-secondary load-code">Načíst</button>
                    <button class="button btn-danger delete-code ${isEditMode && isOwner ? '' : 'hidden'}">Smazat</button>
                </div>
            </div>
            <p>Uloženo: ${formatTimestamp(item.createdAt)}</p>
        `;
        div.querySelector('.load-code').addEventListener('click', (e) => {
            e.stopPropagation();
            document.getElementById('html-editor').value = item.code;
            document.getElementById('html-preview').srcdoc = item.code;
            showSection('editor');
            document.querySelector('.nav-container a.nav-link[data-section="editor"]')?.click();
        });
        div.querySelector('.delete-code')?.addEventListener('click', async (e) => {
            e.stopPropagation();
            deleteHtmlCodeFromFirestore(item.id);
        });
        div.addEventListener('click', () => {
            document.getElementById('html-editor').value = item.code;
            document.getElementById('html-preview').srcdoc = item.code;
            showSection('editor');
            document.querySelector('.nav-container a.nav-link[data-section="editor"]')?.click();
        });
        listEl.appendChild(div);
    });
}

 // --- Galerie (ukládá do Firestore) s podporou klávesových zkratek + CELOOBRAZOVKOVÝ REŽIM ---
// DŮLEŽITÉ: Definuj globální proměnnou na začátku skriptu
// GLOBÁLNÍ PROMĚNNÁ PRO AKTUÁLNÍ INDEX
//let currentModalImageIndex = 0; // <-- DŮLEŽITÉ: Musí být definovaná někde na začátku!

// NOVÁ GLOBÁLNÍ PROMĚNNÁ PRO CELOOBRAZOVKOVÝ REŽIM
// Tato proměnná nyní primárně odráží stav prohlížečového fullscreenu.
let isFullscreenMode = false;

// BEZPEČNÁ FUNKCE PRO ZÍSKÁNÍ PLATNÉHO INDEXU
function getSafeIndex(index) {
    if (galleryImagesData.length === 0) return -1;
    if (index < 0) return galleryImagesData.length - 1;
    if (index >= galleryImagesData.length) return 0;
    return index;
}

// HLAVNÍ FUNKCE PRO PŘEPÍNÁNÍ CELOOBRAZOVKOVÉHO REŽIMU PROHLÍŽEČE (F11 EFEKT)
// Tato funkce je nyní jediným vstupním bodem pro aktivaci/deaktivaci fullscreenu.
function toggleBrowserFullscreen() {
    const modal = document.getElementById('image-modal');
    if (!modal) {
       // console.error('❌ Celoobrazovkový režim prohlížeče: Chybí image-modal!');
        return;
    }

    if (!document.fullscreenElement) {
        // Pokud nejsme ve fullscreenu, přepneme modal do fullscreenu
        if (modal.requestFullscreen) {
            modal.requestFullscreen().then(() => {
                console.log('🖥️ Prohlížeč: Celoobrazovkový režim ZAPNUT (přes API)');
                // Styly a stav isFullscreenMode budou aktualizovány přes 'fullscreenchange' listener
            }).catch(err => {
               // console.error(`❌ Chyba při aktivaci prohlížečového fullscreenu: ${err.message}`);
                // V případě chyby se ujistíme, že naše interní proměnná je správně nastavena
                isFullscreenMode = false;
                updateFullscreenButtonIcon();
                updateAllIndicators();
            });
        } else {
            console.warn('⚠️ Váš prohlížeč nepodporuje Fullscreen API.');
            // Pokud prohlížeč nepodporuje Fullscreen API, nemůžeme nic dělat
        }
    } else {
        // Pokud jsme ve fullscreenu, ukončíme ho
        if (document.exitFullscreen) {
            document.exitFullscreen().then(() => {
                console.log('🖥️ Prohlížeč: Celoobrazovkový režim VYPNUT (přes API)');
                // Styly a stav isFullscreenMode budou aktualizovány přes 'fullscreenchange' listener
            }).catch(err => {
               // console.error(`❌ Chyba při deaktivaci prohlížečového fullscreenu: ${err.message}`);
                // V případě chyby se ujistíme, že naše interní proměnná je správně nastavena
                isFullscreenMode = true;
                updateFullscreenButtonIcon();
                updateAllIndicators();
            });
        }
    }
}

// Funkce pro aktualizaci ikony tlačítka fullscreen
function updateFullscreenButtonIcon() {
    const fullscreenBtn = document.getElementById('fullscreen-btn');
    if (fullscreenBtn) {
        // Ikona se nyní řídí pouze stavem prohlížečového fullscreenu
        if (document.fullscreenElement) {
            fullscreenBtn.innerHTML = '🗗'; // Ikona pro minimalizaci
            fullscreenBtn.title = 'Ukončit celoobrazovkový režim';
        } else {
            fullscreenBtn.innerHTML = '🗖'; // Ikona pro maximalizaci
            fullscreenBtn.title = 'Celoobrazovkový režim';
        }
    }
}

// FUNKCE PRO AUTOMATICKÉ VYPNUTÍ CELOOBRAZOVKOVÉHO REŽIMU PŘI ZAVŘENÍ MODALU
function resetFullscreenMode() {
    // Ukončíme skutečný fullscreen prohlížeče, pokud je aktivní
    if (document.fullscreenElement && document.exitFullscreen) {
        document.exitFullscreen().then(() => {
            console.log('🖥️ Prohlížeč: Fullscreen ukončen při zavření modalu');
            // Zbytek resetu (CSS třídy, isFullscreenMode) proběhne po události 'fullscreenchange'
        }).catch(err => {
            //console.error(`❌ Chyba při ukončení prohlížečového fullscreenu při zavření modalu: ${err.message}`);
        });
    }
    // Pokud nejsme ve fullscreenu prohlížeče, ale naše třídy jsou z nějakého důvodu aktivní, resetujeme je
    // (To by se nemělo stávat často, pokud 'fullscreenchange' funguje správně)
    if (!document.fullscreenElement && isFullscreenMode) {
        isFullscreenMode = false;
        const modal = document.getElementById('image-modal');
        const body = document.body;
        if (modal) modal.classList.remove('fullscreen-mode');
        if (body) body.classList.remove('fullscreen-active');
        updateFullscreenButtonIcon();
        console.log('🖥️ Celoobrazovkový režim RESETOVÁN (manuálně po zavření modalu)');
    }
}

// HLAVNÍ FUNKCE PRO OTEVŘENÍ MODALU - ZPĚT K JEDNODUCHOSTI
function openImageModal(index) {
    console.log(`🚀 openImageModal voláno s indexem: ${index}, celkem obrázků: ${galleryImagesData.length}`);

    if (galleryImagesData.length === 0) {
        console.warn('⚠️ Galerie je prázdná!');
        return;
    }

    // OPRAVA: Bezpečná kontrola a korekce indexu
    const safeIndex = getSafeIndex(index);
    if (safeIndex === -1) {
        console.error('❌ Nelze zobrazit obrázek - prázdná galerie');
        return;
    }

    // KLÍČOVÁ OPRAVA: Vždy nastav index
    currentModalImageIndex = safeIndex;
    console.log(`✅ Nastavuji currentModalImageIndex na: ${currentModalImageIndex}`);

    const modal = document.getElementById('image-modal');
    const modalImg = document.getElementById('modal-img');

    if (!modal || !modalImg) {
        console.error('❌ Modal nebo modalImg element nenalezen!');
        return;
    }

    // OVĚŘENÍ: Zkontroluj, že index je opravdu platný
    if (currentModalImageIndex < 0 || currentModalImageIndex >= galleryImagesData.length) {
        console.error(`❌ KRITICKÁ CHYBA: Index ${currentModalImageIndex} je mimo rozsah 0-${galleryImagesData.length-1}`);
        currentModalImageIndex = 0; // Fallback na první obrázek
    }

    const currentImage = galleryImagesData[currentModalImageIndex];
    console.log(`📸 Zobrazuji obrázek: "${currentImage.name}" na pozici ${currentModalImageIndex + 1}/${galleryImagesData.length}`);

    // JEDNODUCHÉ loading
    modalImg.style.transition = 'opacity 0.5s ease-out';
    modalImg.style.opacity = '0.8';

    modalImg.onload = function() {
        console.log(`✅ Obrázek načten: ${currentImage.name}`);
        modalImg.style.opacity = '0.8';
    };

    modalImg.onerror = function() {
        console.error(`❌ Chyba načítání: ${currentImage.name}`);
        modalImg.style.opacity = '0.8';
        modalImg.alt = `❌ Chyba načítání: ${currentImage.name}`;
    };

    // Nastavení URL s cache busterem
    const finalUrl = currentImage.url + (currentImage.url.includes('?') ? '&' : '?') + `t=${Date.now()}`;
    modalImg.src = finalUrl;
    modalImg.alt = `${currentImage.name} (${currentModalImageIndex + 1}/${galleryImagesData.length})`;

    // Aktualizace všech indikátorů
    updateAllIndicators();

    // Otevři modal pouze pokud není už otevřený
    if (!modal.classList.contains('show')) {
        showModal(modal);
    }

    // Debug info
    console.log(`🔍 Finální stav: index=${currentModalImageIndex}, obrázek="${currentImage.name}"`);
}

// ZACHOVÁNO: Aktualizuje všechny indikátory najednou
function updateAllIndicators() {
    updateImageIndicator(currentModalImageIndex, galleryImagesData.length);
    addPositionIndicator(currentModalImageIndex, galleryImagesData.length, galleryImagesData[currentModalImageIndex].name);
    updateNavigationButtons();
    updateFullscreenButtonIcon(); // Aktualizace ikony při každé aktualizaci
}

// ZACHOVÁNO: Aktualizace číselných indikátorů
function updateImageIndicator(currentIndex, totalImages) {
    const currentNumberElement = document.getElementById('current-image-number');
    const totalCountElement = document.getElementById('total-images-count');

    if (currentNumberElement) {
        currentNumberElement.textContent = currentIndex + 1;
        console.log(`🔢 current-image-number aktualizován na: ${currentIndex + 1}`);
    }

    if (totalCountElement) {
        totalCountElement.textContent = totalImages;
        console.log(`🔢 total-images-count aktualizován na: ${totalImages}`);
    }
}

// ZACHOVÁNO: Aktualizace stavu navigačních tlačítek
function updateNavigationButtons() {
    const prevBtn = document.getElementById('prev-image-btn');
    const nextBtn = document.getElementById('next-image-btn');

    if (galleryImagesData.length <= 1) {
        // Pokud je jen jeden nebo žádný obrázek, skryj tlačítka
        if (prevBtn) prevBtn.style.opacity = '0.3';
        if (nextBtn) nextBtn.style.opacity = '0.3';
    } else {
        // Jinak je zobraz normálně
        if (prevBtn) prevBtn.style.opacity = '1';
        if (nextBtn) nextBtn.style.opacity = '1';
    }
}

// ZACHOVÁNO: Vizuální indikátor pozice
function addPositionIndicator(index, total, name) {
    const modal = document.getElementById('image-modal');
    if (!modal) return;

    let indicator = modal.querySelector('.position-indicator');

    if (!indicator) {
        indicator = document.createElement('div');
        indicator.className = 'position-indicator';
        indicator.style.cssText = `
            position: absolute;
            top: 10px;
            left: 10px;
            color: white;
            padding: 8px 12px;
            border-radius: 6px;
            font-size: 14px;
            font-weight: bold;
            z-index: 1001;
        `;
        const modalContent = modal.querySelector('.modal-content');
        if (modalContent) {
            modalContent.appendChild(indicator);
        }
    }

    indicator.textContent = `${index + 1}/${total} - ${name}`;
    console.log(`📍 Indikátor aktualizován: ${indicator.textContent}`);
}

// JEDNODUŠE OPTIMALIZOVANÁ NAVIGACE - bez cache komplikací
let isNavigating = false; // Jen anti-spam ochrana

function navigateImageModal(direction) {
    // Zabránění spam klikání
    if (isNavigating) {
        console.log('⏳ Navigace již probíhá...');
        return;
    }

    console.log(`🧭 NAVIGACE: směr=${direction}, současný index=${currentModalImageIndex}`);
    console.log(`📊 Stav galerie: ${galleryImagesData.length} obrázků`);

    if (galleryImagesData.length === 0) {
        console.warn('⚠️ Nelze navigovat - prázdná galerie!');
        return;
    }

    if (galleryImagesData.length === 1) {
        console.log('ℹ️ Pouze jeden obrázek - zůstáváme na místě');
        updateAllIndicators();
        return;
    }

    isNavigating = true;

    // BEZPEČNÝ výpočet nového indexu - STEP BY STEP DEBUG
    const oldIndex = currentModalImageIndex;
    console.log(`🔢 PŘED: currentModalImageIndex = ${oldIndex}`);

    let rawNewIndex = currentModalImageIndex + direction;
    console.log(`🔢 RAW: ${oldIndex} + ${direction} = ${rawNewIndex}`);

    let safeNewIndex = getSafeIndex(rawNewIndex);
    console.log(`🔢 SAFE: getSafeIndex(${rawNewIndex}) = ${safeNewIndex}`);

    // KRITICKY DŮLEŽITÉ: Nastav index JEDNOZNAČNĚ
    currentModalImageIndex = safeNewIndex;
    console.log(`🔢 FINÁL: currentModalImageIndex nastaveno na ${currentModalImageIndex}`);

    // OVĚŘENÍ že se opravdu nastavilo
    if (currentModalImageIndex !== safeNewIndex) {
        console.error(`❌ FATÁLNÍ CHYBA: Index se nenastavil správně! Očekáváno: ${safeNewIndex}, Skutečnost: ${currentModalImageIndex}`);
        currentModalImageIndex = safeNewIndex; // Force fix
    }

    // OKAMŽITÁ aktualizace indikátorů
    updateAllIndicators();

    const modalImg = document.getElementById('modal-img');
    if (modalImg) {
        const currentImage = galleryImagesData[currentModalImageIndex];
        console.log(`🖼️ Zobrazuji: "${currentImage.name}" na indexu ${currentModalImageIndex}`);

        // RYCHLÁ vizuální odezva
        modalImg.style.transition = 'opacity 0.1s ease-out';
        modalImg.style.opacity = '0.8';

        modalImg.onload = function() {
            console.log(`✅ Navigace dokončena: "${currentImage.name}" na indexu ${currentModalImageIndex}`);
            modalImg.style.opacity = '0.8';
            isNavigating = false; // Uvolni navigaci
        };

        modalImg.onerror = function() {
            console.error(`❌ Chyba při navigaci: "${currentImage.name}" na indexu ${currentModalImageIndex}`);
            modalImg.style.opacity = '0.8';
            isNavigating = false; // Uvolni navigaci i při chybě
        };

        // Nastavení nového obrázku
        const finalUrl = currentImage.url + (currentImage.url.includes('?') ? '&' : '?') + `t=${Date.now()}`;
        modalImg.src = finalUrl;
        modalImg.alt = `${currentImage.name} (${currentModalImageIndex + 1}/${galleryImagesData.length})`;

        console.log(`🎯 NAVIGACE HOTOVÁ: Zobrazuji obrázek "${currentImage.name}" na pozici ${currentModalImageIndex + 1}/${galleryImagesData.length}`);
    } else {
        isNavigating = false; // Uvolni i když není modalImg
    }
}

// UPRAVENÁ FUNKCE PRO ZAVŘENÍ MODALU - S RESETEM CELOOBRAZOVKOVÉHO REŽIMU
function closeImageModal() {
    console.log('🚪 Zavírám modal');
    const modal = document.getElementById('image-modal');

    // Reset celoobrazovkového režimu před zavřením
    resetFullscreenMode();

    hideModal(modal);

    // Reset indexu není potřeba - zůstává pro příští otevření
    console.log(`💾 Index zůstává: ${currentModalImageIndex} pro příští otevření`);
}

// VYLEPŠENÉ KLÁVESOVÉ ZKRATKY - Nyní F11 a tlačítko spouští skutečný fullscreen
function setupKeyboardNavigation() {
    document.addEventListener('keydown', function(event) {
        const imageModal = document.getElementById('image-modal');

        // Krok 1: Kontrola, zda je modal viditelný
        if (!imageModal || imageModal.style.display === 'none') {
            return; // Pokud modal není viditelný, nic neděláme
        }

        // Krok 2: Klíčové vylepšení - Zkontrolovat, zda je uživatel v editačním poli
        // activeElement vrací aktuálně fokusovaný element.
        // tagName vrací název tagu ve velkých písmenech (např. 'INPUT', 'TEXTAREA').
        const activeElement = document.activeElement;
        const isEditingText = (
            activeElement.tagName === 'INPUT' ||
            activeElement.tagName === 'TEXTAREA' ||
            activeElement.hasAttribute('contenteditable') // Pro případ, že edituješ DIV s contenteditable
        );

        // Pokud uživatel edituje text A stiskl šipku nebo F11 (nebo Esc),
        // Esc by ale měl fungovat vždy pro zavření modalu.
        if (isEditingText && (event.key === 'ArrowLeft' || event.key === 'ArrowRight' || event.key === 'F11')) {
            // Logiku pro přepínání obrázku v modalu ignorujeme, necháme šipku pro textové pole
            console.log(`⌨️ Uživatel edituje text. Klávesa ${event.key} bude ignorována pro modal.`);
            return; // Důležité: Ukončíme funkci, aby se dál nezpracovávala pro modal
        }

        // Zabráníme defaultnímu chování šipek a F11 (pokud nejsme v textovém poli)
        if (['ArrowLeft', 'ArrowRight', 'Escape', 'F11'].includes(event.key)) {
            event.preventDefault();
            event.stopPropagation();
        }

        console.log(`⌨️ Klávesa stisknuta: ${event.key}`);

        switch(event.key) {
            case 'ArrowLeft':
                console.log('⬅️ Předchozí obrázek (←)');
                navigateImageModal(-1);
                break;
            case 'ArrowRight':
                console.log('➡️ Další obrázek (→)');
                navigateImageModal(1);
                break;
            case 'Escape':
                console.log('🚪 Zavírám modal (ESC)');
                closeImageModal();
                break;
            case 'F11':
                console.log('🖥️ Přepínám PROHLÍŽEČOVÝ celoobrazovkový režim (F11)');
                toggleBrowserFullscreen(); // Voláme skutečný prohlížečový fullscreen
                break;
        }
    });

    // Listener pro událost fullscreenchange (když uživatel opustí/vstoupí do fullscreenu přes prohlížeč, např. F11)
    document.addEventListener('fullscreenchange', () => {
        const modal = document.getElementById('image-modal');
        const body = document.body;
        // Aktualizujeme náš stav isFullscreenMode a třídy podle skutečného stavu prohlížeče
        if (document.fullscreenElement) {
            console.log('🖥️ Fullscreen prohlížeče je aktivní.');
            if (modal) modal.classList.add('fullscreen-mode');
            if (body) body.classList.add('fullscreen-active');
            isFullscreenMode = true; // Aktualizujeme interní proměnnou
        } else {
            console.log('🖥️ Fullscreen prohlížeče byl ukončen.');
            if (modal) modal.classList.remove('fullscreen-mode');
            if (body) body.classList.remove('fullscreen-active');
            isFullscreenMode = false; // Aktualizujeme interní proměnnou
        }
        updateFullscreenButtonIcon(); // Aktualizujeme ikonu tlačítka
        updateAllIndicators(); // Aktualizujeme indikátory (např. pozici)
    });
}

// Funkce pro dynamické vložení CSS stylů
function injectFullscreenStyles() {
    const style = document.createElement('style');
    style.textContent = `
        /* Univerzální reset pro HTML a BODY, aby se zajistilo plné pokrytí viewportu bez okrajů */
        html, body {
            margin: 0;
            padding: 0;
            width: 100%;
            height: 100%;
            text-align: center;
            /* overflow: hidden;  TOTO ZPŮSOBOVALO PROBLÉM, ODSTRANĚNO */
        }

        /* Skrytí posuvníků, pokud by se náhodou objevily při fullscreenu */
        body.fullscreen-active {
            overflow: hidden;
        }

        /* --- Styly pro Celoobrazovkový režim (Fullscreen Mode) --- */
        .modal.fullscreen-mode {
            position: fixed;
            top: 0;
            left: 0;
            width: 100vw;
            height: 100vh;
            max-width: 100vw;
            max-height: 100vh;
            background-color: black; /* Čistě černé pozadí pro fullscreen */
            z-index: 9999; /* Zajištění, že bude nad vším ostatním */
            display: flex; /* Použití flexboxu pro centrování obsahu */
            align-items: center; /* Vertikální centrování */
            justify-content: center; /* Horizontální centrování */
            padding: 0; /* Bez vnitřního odsazení */
            backdrop-filter: none; /* Vypnutí rozmazání, aby nic nerušilo */
            animation: none; /* Vypnutí animace při přepnutí do fullscreenu */
        }

        .modal.fullscreen-mode .modal-content {
            width: 100%;
            height: 100%;
            max-width: 100%;
            max-height: 100%;
            border-radius: 0;
            background: transparent;
            box-shadow: none;
            display: flex;
            align-items: center;
            justify-content: center;
            padding: 0;
            animation: none; /* Vypnutí animace při přepnutí do fullscreenu */
        }

        .modal.fullscreen-mode #modal-img {
            /* Ponechání automatických rozměrů */
            width: auto;
            height: auto;
            /* Omezení na 60% s centrováním */
            max-width: 60%;
            max-height: 60%;
            /* Zajištění správného poměru stran */
            object-fit: contain;
            /* Perfektní centrování pomocí flexboxu */
            margin: 0; /* Reset všech margin hodnot */
            /* Cursor pro indikaci možnosti kliknutí */
            cursor: zoom-out;
            /* Reset ostatních stylů */
            border-radius: 0;
            padding: 0;
            border: none;
            transform: none;
            /* Dodatečné centrování pro jistotu */
            position: relative;
            display: block;
        }

        /* Alternativní způsob centrování pro lepší kompatibilitu */
        .modal.fullscreen-mode .modal-content {
            position: relative;
        }

        .modal.fullscreen-mode #modal-img {
            position: absolute;
            top: 50%;
            left: 50%;
            transform: translate(-50%, -50%);
            /* Ponechání původních omezení velikosti */
            max-width: 80%;
            max-height: 80%;
            width: auto;
            height: auto;
            object-fit: contain;
            cursor: zoom-out;
            border-radius: 0;
            padding: 0;
            border: none;
            margin: 0;
        }

        /* zobrazeny ovládacích prvků, které nechceme ve fullscreenu */
        .modal.fullscreen-mode .modal-header,
        .modal.fullscreen-mode .modal-footer,
        /*.modal.fullscreen-mode .position-indicator,*/
        .modal.fullscreen-mode .modal-caption {
            display: none;
             
        }
       
           /* Centrování indikátoru pozice v celoobrazovkovém režimu */
        .modal.fullscreen-mode .position-indicator {
            position: absolute;
            top: 10px;
            left: 10px;
            color: white;
            padding: 8px 12px;
            border-radius: 6px;
            font-size: 14px;
            font-weight: bold;
            z-index: 1001;
        }

        /* Úpravy pro navigační a fullscreen tlačítka ve fullscreenu */
        .modal.fullscreen-mode #prev-image-btn,
        .modal.fullscreen-mode #next-image-btn,
        .modal.fullscreen-mode #fullscreen-btn,
        .modal.fullscreen-mode #close-modal-btn {
            position: absolute; /* Absolutní pozice */
            z-index: 10000; /* Ještě vyšší z-index, aby byly vidět */
            background-color: rgba(50, 50, 50, 0.6); /* Tmavší, průhledné pozadí */
            color: white;
            border-radius: 50%; /* Kulaté tlačítka */
            padding: 10px;
            font-size: 0.6em;
            width: 50px;
            height: 50px;
            display: flex;
            align-items: center;
            justify-content: center;
            transition: background-color 0.2s ease, opacity 0.2s ease;
            /* Reset původních pozic, pokud byly definovány jinak */
            top: 95%; /* Reset top */
            bottom: auto; /* Reset bottom */
            left: auto; /* Reset left */
            right: auto; /* Reset right */
            transform: none; /* Reset transform */
        }

        .modal.fullscreen-mode #prev-image-btn {
            left: 20px;
             
            transform: translateY(-50%);
        }

        .modal.fullscreen-mode #next-image-btn {
            right: 20px;
             
            transform: translateY(-50%);
        }

       .modal.fullscreen-mode #fullscreen-btn {
    /* Původní transform: translateY(-50%); zůstává pro vertikální centrování */
    /* Následující řádky přidáš pro horizontální centrování */
    left: 50%; /* Posune levý okraj tlačítka na 50% šířky */
    transform: translate(5px, -50%); /* Posune ho o 5px doprava a o polovinu vlastní výšky nahoru */
}

.modal.fullscreen-mode #close-modal-btn {
    /* Původní transform: translateY(-50%); zůstává pro vertikální centrování */
    /* Následující řádky přidáš pro horizontální centrování */
    left: 50%; /* Posune levý okraj tlačítka na 50% šířky */
    transform: translate(calc(-100% - 55px), -50%); /* Posune ho o vlastní šířku + 5px doleva a o polovinu vlastní výšky nahoru */
}

        /* Hover efekty pro tlačítka ve fullscreenu */
        .modal.fullscreen-mode button:hover {
            background-color: rgba(80, 80, 80, 0.8);
        }

        /* Responzivní úpravy pro fullscreen tlačítka */
        @media (max-width: 480px) {
            .modal.fullscreen-mode #prev-image-btn,
            .modal.fullscreen-mode #next-image-btn {
                display: none; /* Skryj navigační tlačítka na extra malých obrazovkách ve fullscreenu */
            }
            .modal.fullscreen-mode #close-modal-btn,
            .modal.fullscreen-mode #fullscreen-btn {
                font-size: 1.5em;
                width: 20px;
                height: 20px;
                padding: 5px;
                top: 10px;
                left: 10px; /* Pro close button */
                right: 10px; /* Pro fullscreen button */
            }
            .modal.fullscreen-mode #fullscreen-btn {
                left: auto; /* Reset pro fullscreen button */
                right: 10px; /* Přesun na pravou stranu */
            }
        }
    `;
    document.head.appendChild(style);
    console.log('✅ Celoobrazovkové styly dynamicky vloženy do <head>.');
}



// OPRAVENÁ FUNKCE SETUP S LEPŠÍMI EVENT LISTENERY + CELOOBRAZOVKOVÉ TLAČÍTKO
function setupGallery() {
    console.log('🚀 Inicializuji galerii s opraveným indexováním a celoobrazovkovým režimem...');

    // Vložení CSS stylů na začátku inicializace
     injectFullscreenStyles();

    const addBtn = document.getElementById('addImageUrlBtn');
    const closeBtn = document.getElementById('close-modal-btn');
    const prevBtn = document.getElementById('prev-image-btn');
    const nextBtn = document.getElementById('next-image-btn');
    const fullscreenBtn = document.getElementById('fullscreen-btn');
    const saveEditImageBtn = document.getElementById('save-edit-image-btn');
    const cancelEditImageBtn = document.getElementById('cancel-edit-image-btn');

    // Event listenery s lepším error handlingem
    if (addBtn) {
        addBtn.addEventListener('click', handleAddImageUrl);
        console.log('✅ Add button listener nastaven');
    }

    if (closeBtn) {
        closeBtn.addEventListener('click', closeImageModal);
        console.log('✅ Close button listener nastaven');
    }

    // OPRAVA: Robustní navigační tlačítka
    if (prevBtn) {
        prevBtn.addEventListener('click', function(e) {
            e.preventDefault();
            e.stopPropagation();
            console.log('⬅️ Klik na předchozí tlačítko');
            navigateImageModal(-1);
        });
        console.log('✅ Previous button listener nastaven');
    }

    if (nextBtn) {
        nextBtn.addEventListener('click', function(e) {
            e.preventDefault();
            e.stopPropagation();
            console.log('➡️ Klik na další tlačítko');
            navigateImageModal(1);
        });
        console.log('✅ Next button listener nastaven');
    }

    // NOVÝ: Celoobrazovkové tlačítko nyní volá přímo prohlížečový fullscreen
    if (fullscreenBtn) {
        fullscreenBtn.addEventListener('click', function(e) {
            e.preventDefault();
            e.stopPropagation();
            console.log('🖥️ Klik na celoobrazovkové tlačítko (spouští prohlížečový fullscreen)');
            toggleBrowserFullscreen(); // Tlačítko nyní volá přímo prohlížečový fullscreen
        });
        console.log('✅ Fullscreen button listener nastaven');
    }

    // Ostatní listenery
    if (saveEditImageBtn) {
        saveEditImageBtn.addEventListener('click', saveEditedImage);
        console.log('✅ Save edit listener nastaven');
    }

    if (cancelEditImageBtn) {
        cancelEditImageBtn.addEventListener('click', () => {
            hideModal(document.getElementById('edit-image-modal'));
        });
        console.log('✅ Cancel edit listener nastaven');
    }

    // Nastavení klávesových zkratek
    setupKeyboardNavigation();
    console.log('✅ Klávesové zkratky nastaveny (F11 pro skutečný celoobrazovkový režim)');

    console.log('🎉 Galerie s opraveným indexováním a celoobrazovkovým režimem je připravena!');
}

// OPRAVENÁ FUNKCE PRO AKTUALIZACI ZOBRAZENÍ GALERIE
function updateGalleryDisplay() {
    console.log('🔄 Aktualizuji zobrazení galerie...');

    const container = document.getElementById('gallery-container');
    if (!container) {
        console.error('❌ Gallery container nenalezen!');
        return;
    }

    // Prázdná galerie
    if (galleryImagesData.length === 0) {
        container.innerHTML = '<p>Galerie je prázdná.</p>';
        console.log('📭 Galerie je prázdná');
        return;
    }

    container.innerHTML = '';

    galleryImagesData.forEach((imgData, index) => {
        const div = document.createElement('div');
        div.className = 'gallery-image-wrapper';
        const isOwner = currentUserId && imgData.userId === currentUserId;

        div.innerHTML = `
            <img src="${imgData.url}" alt="${imgData.name || 'Obrázek z galerie'}"
                 onerror="this.onerror=null;this.src='https://placehold.co/250x200/cccccc/ffffff?text=Obrázek+nelze+načíst';this.alt='Obrázek nelze načíst';">
            <button class="delete-img-btn ${isEditMode && isOwner ? '' : 'hidden'}" title="Smazat obrázek">&times;</button>
            <i class="fas fa-edit edit-icon ${isEditMode && isOwner ? '' : 'hidden'}" data-image-id="${imgData.id}"></i>
        `;

        // OPRAVA: Správné předání indexu při kliku na obrázek
        const img = div.querySelector('img');
        img.addEventListener('click', () => {
            console.log(`🖱️ Klik na obrázek s indexem: ${index}`);
            openImageModal(index);
        });

        // Delete button
        const deleteBtn = div.querySelector('.delete-img-btn');
        if (deleteBtn) {
            deleteBtn.addEventListener('click', (e) => {
                e.stopPropagation();
                console.log(`🗑️ Mazání obrázku: ${imgData.name}`);
                deleteGalleryImageFromFirestore(imgData.id);
            });
        }

        // Edit button
        const editIcon = div.querySelector('.edit-icon');
        if (editIcon) {
            editIcon.addEventListener('click', (e) => {
                e.stopPropagation();
                console.log(`✏️ Úprava obrázku: ${imgData.name}`);
                editImage(imgData.id);
            });
        }

        container.appendChild(div);
    });

    console.log(`✅ Zobrazení galerie aktualizováno (${galleryImagesData.length} obrázků)`);

    // OPRAVA: Po změně galerie resetujeme index pokud je neplatný
    if (currentModalImageIndex >= galleryImagesData.length) {
        currentModalImageIndex = Math.max(0, galleryImagesData.length - 1);
        console.log(`🔧 Index resetován na: ${currentModalImageIndex}`);
    }
}

// VYLEPŠENÁ DEBUG FUNKCE
function debugGallery() {
    console.log('🔍 === DEBUG GALERIE ===');
    console.log(`📊 Celkem obrázků: ${galleryImagesData.length}`);
    console.log(`📍 Aktuální index: ${currentModalImageIndex}`);
    console.log(`🎯 Aktuální obrázek: ${galleryImagesData[currentModalImageIndex]?.name || 'ŽÁDNÝ/NEPLATNÝ'}`);
    console.log(`✅ Index je platný: ${currentModalImageIndex >= 0 && currentModalImageIndex < galleryImagesData.length}`);
    console.log(`🖥️ Celoobrazovkový režim: ${document.fullscreenElement ? 'ZAPNUT (prohlížečový)' : 'VYPNUT'}`);

    console.log('📋 Seznam všech obrázků:');
    galleryImagesData.forEach((img, index) => {
        const indicator = index === currentModalImageIndex ? '👉 AKTUÁLNÍ' : '  ';
        console.log(`${indicator} [${index}]: ${img.name} - ${img.url.substring(0, 50)}...`);
    });

    console.log('🧪 Simulace navigace:');
    if (galleryImagesData.length > 0) {
        const prevIndex = getSafeIndex(currentModalImageIndex - 1);
        const nextIndex = getSafeIndex(currentModalImageIndex + 1);
        console.log(`⬅️ Předchozí: index ${prevIndex} (${galleryImagesData[prevIndex]?.name || 'N/A'})`);
        console.log(`➡️ Další: index ${nextIndex} (${galleryImagesData[nextIndex]?.name || 'N/A'})`);
    }

    console.log('🔧 Stav DOM elementů:');
    console.log(`Modal existuje: ${!!document.getElementById('image-modal')}`);
    console.log(`Modal img existuje: ${!!document.getElementById('modal-img')}`);
    console.log(`Prev button existuje: ${!!document.getElementById('prev-image-btn')}`);
    console.log(`Next button existuje: ${!!document.getElementById('next-image-btn')}`);
    console.log(`Fullscreen button existuje: ${!!document.getElementById('fullscreen-btn')}`);

    console.log('======================');
}

// POMOCNÉ FUNKCE (zůstávají stejné)
function isValidHttpUrl(string) {
    let url;
    try {
        url = new URL(string);
    }
    catch (_) {
        return false;
    }
    return url.protocol === "http:" || url.protocol === "https:";
}

// Funkce pro přidání obrázku (bez změn v logice indexování)
async function handleAddImageUrl() {
    if (!currentUserId) {
        showAlertModal("Přístup zamítnut", "Pro přidání obrázku se musíte přihlásit.");
        return;
    }

    const urlInput = document.getElementById('newImageUrl');
    if (!urlInput) {
        console.error("Element #newImageUrl not found for adding gallery image.");
        return;
    }

    const imageUrl = urlInput.value.trim();
    if (imageUrl && isValidHttpUrl(imageUrl)) {
        const imageNamePrompt = prompt(`Zadejte název pro obrázek (URL: ${imageUrl.substring(0,50)}...). Prázdné pro výchozí název.`, `Obrázek ${galleryImagesData.length + 1}`);
        let imageName = (imageNamePrompt && imageNamePrompt.trim() !== "") ? imageNamePrompt.trim() : `Obrázek ${galleryImagesData.length + 1}_${Math.floor(Math.random()*1000)}`;

        showLoading("Přidávám obrázek...");
        const newImage = {
            id: `img-${Date.now()}-${Math.random().toString(36).substr(2,5)}`,
            url: imageUrl,
            name: imageName,
            createdAt: Date.now(),
            userId: currentUserId
        };

        try {
            galleryImagesData.unshift(newImage); // Přidá na začátek
            await saveDataToFirestore();
            showAlertModal("Obrázek přidán", `Obrázek "${imageName}" byl uložen do cloudu.`);
            urlInput.value = '';

            // OPRAVA: Po přidání nového obrázku aktualizuj zobrazení
            updateGalleryDisplay();

            hideLoading();
            console.log(`✅ Přidán nový obrázek: ${imageName}, nová velikost galerie: ${galleryImagesData.length}`);
        } catch (error) {
            console.error('Chyba při přidávání obrázku do Firestore:', error);
            showAlertModal("Chyba přidání", `Nepodařilo se přidat obrázek: ${error.message}`);
            hideLoading();
        }
    } else {
        showAlertModal("Neplatná URL", "Zadejte platnou URL adresu obrázku (http:// nebo https://).");
    }
}

// Funkce pro mazání s opravou indexování
async function deleteGalleryImageFromFirestore(idToDelete) {
    if (!currentUserId) {
        showAlertModal("Přístup zamítnut", "Pro smazání obrázku se musíte přihlásit.");
        return;
    }

    const imageToDelete = galleryImagesData.find(img => img.id === idToDelete);
    if (!imageToDelete || imageToDelete.userId !== currentUserId) {
        showAlertModal("Přístup zamítnut", "Nemáte oprávnění smazat tento obrázek. Můžete smazat pouze své vlastní obrázky.");
        return;
    }

    const confirmed = await (window.showConfirmModal ?
        showConfirmModal("Smazat obrázek?", `Opravdu smazat "${imageToDelete.name || 'tento obrázek'}"? Tato akce je nevratná!`) :
        confirm(`Smazat obrázek "${imageToDelete.name || 'tento obrázek'}"?`)
    );

    if (confirmed) {
        showLoading("Mažu obrázek...");
        try {
            const deletedIndex = galleryImagesData.findIndex(img => img.id === idToDelete);
            galleryImagesData = galleryImagesData.filter(img => img.id !== idToDelete);

            // OPRAVA: Korekce indexu po smazání
            if (currentModalImageIndex >= galleryImagesData.length) {
                currentModalImageIndex = Math.max(0, galleryImagesData.length - 1);
                console.log(`🔧 Index po smazání korigován na: ${currentModalImageIndex}`);
            }

            await saveDataToFirestore();
            showAlertModal("Obrázek smazán", "Obrázek byl úspěšně smazán z cloudu.");

            // Aktualizuj zobrazení
            updateGalleryDisplay();

            hideLoading();
            console.log(`✅ Obrázek smazán, nová velikost galerie: ${galleryImagesData.length}`);
        } catch (error) {
            console.error('Chyba při mazání obrázku z Firestore:', error);
            showAlertModal("Chyba mazání", `Nepodařilo se smazat obrázek: ${error.message}`);
            hideLoading();
        }
    }
}

// Funkce pro úpravu obrázku (zůstává stejná)
let editingImageId = null;

async function editImage(imageId) {
    if (!currentUserId) {
        showAlertModal("Přístup zamítnut", "Pro úpravu obrázku se musíte přihlásit.");
        return;
    }

    editingImageId = imageId;
    const image = galleryImagesData.find(img => img.id === imageId);
    if (!image || image.userId !== currentUserId) {
        showAlertModal("Přístup zamítnut", "Nemáte oprávnění upravit tento obrázek. Můžete upravit pouze své vlastní obrázky.");
        return;
    }

    if (image) {
        document.getElementById('edit-image-url').value = image.url;
        document.getElementById('edit-image-name').value = image.name;
        showModal(document.getElementById('edit-image-modal'));
    }
}

async function saveEditedImage() {
    if (!currentUserId) {
        showAlertModal("Uložení selhalo", "Pro úpravu obrázku se musíte přihlásit.");
        return;
    }

    const url = document.getElementById('edit-image-url').value.trim();
    const name = document.getElementById('edit-image-name').value.trim();

    if (!isValidHttpUrl(url)) {
        showAlertModal("Neplatná URL", "Zadejte platnou URL adresu obrázku (http:// nebo https://).");
        return;
    }

    showLoading("Ukládám upravený obrázek...");
    try {
        const index = galleryImagesData.findIndex(img => img.id === editingImageId);
        if (index !== -1 && galleryImagesData[index].userId === currentUserId) {
            galleryImagesData[index].url = url;
            galleryImagesData[index].name = name;
            await saveDataToFirestore();
            showAlertModal("Obrázek upraven", `Obrázek "${name}" byl úspěšně upraven v cloudu.`);

            // OPRAVA: Po úpravě aktualizuj zobrazení
            updateGalleryDisplay();
        } else {
            showAlertModal("Chyba", "Obrázek k úpravě nebyl nalezen nebo nemáte oprávnění.");
        }
        hideModal(document.getElementById('edit-image-modal'));
        hideLoading();
    } catch (error) {
        console.error('Chyba při ukládání upraveného obrázku do Firestore:', error);
        showAlertModal("Chyba ukládání", `Nepodařilo se uložit úpravy obrázku: ${error.message}`);
        hideLoading();
    }
}
//tady končí obrázek



// --- Externí odkazy (ukládá do Firestore) ---
function renderExternalLinks() {
    const tableBody = document.querySelector('#links-table tbody');
    if (!tableBody) {
        console.error("Table body for links not found!");
        return;
    }
    tableBody.innerHTML = '';

    if (externalLinksData.length === 0) {
        const row = tableBody.insertRow();
        const cell = row.insertCell();
        cell.colSpan = 4;
        cell.textContent = 'Žádné odkazy.';
        cell.style.textAlign = 'center';
        return;
    }

    externalLinksData.forEach((link, index) => {
        const row = tableBody.insertRow();
        const isOwner = currentUserId && link.userId === currentUserId;

        row.insertCell().innerHTML = `<svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M10 13a5 5 0 0 0 7.54.54l3-3a5 5 0 0 0-7.07-7.07l-1.72 1.71"></path><path d="M14 11a5 5 0 0 0-7.54-.54l-3 3a5 5 0 0 0 7.07 7.07l1.71-1.71"></path></svg>`;

        const titleCell = row.insertCell();
        const anchor = document.createElement('a');
        anchor.href = link.url;
        anchor.target = "_blank";
        anchor.rel = "noopener noreferrer";
        anchor.textContent = link.title;
        titleCell.appendChild(anchor);

        row.insertCell().textContent = link.url;

        const actionsCell = row.insertCell();
        actionsCell.className = 'edit-mode-only';
        actionsCell.innerHTML = `
            <button class="button btn-secondary edit-link-btn ${isOwner ? '' : 'hidden'}" data-index="${index}">Editovat</button>
            <button class="button btn-danger delete-link-btn ${isOwner ? '' : 'hidden'}" data-index="${index}">Smazat</button>
        `;
        actionsCell.querySelector('.edit-link-btn')?.addEventListener('click', () => editLink(link.id));
        actionsCell.querySelector('.delete-link-btn')?.addEventListener('click', () => deleteLinkFromFirestore(link.id));
    });
}

document.getElementById('add-link-btn')?.addEventListener('click', addLink);

function addLink() {
    if (!currentUserId) {
        showAlertModal("Přístup zamítnut", "Pro přidání odkazu se musíte přihlásit.");
        return;
    }
    editingLinkFirebaseId = null;
    document.getElementById('edit-link-title').value = '';
    document.getElementById('edit-link-url').value = '';
    showModal(document.getElementById('edit-link-modal'));
}

let editingLinkFirebaseId = null;
async function editLink(linkId) {
    if (!currentUserId) {
        showAlertModal("Přístup zamítnut", "Pro úpravu odkazu se musíte přihlásit.");
        return;
    }
    editingLinkFirebaseId = linkId;
    const link = externalLinksData.find(l => l.id === linkId);
    if (!link || link.userId !== currentUserId) {
        showAlertModal("Přístup zamítnut", "Nemáte oprávnění upravit tento odkaz. Můžete upravit pouze své vlastní odkazy.");
        return;
    }
    if (link) {
        document.getElementById('edit-link-title').value = link.title;
        document.getElementById('edit-link-url').value = link.url;
        showModal(document.getElementById('edit-link-modal'));
    }
}

async function saveEditedLink() {
        if (!currentUserId) {
            showAlertModal("Uložení selhalo", "Pro úpravu odkazu se musíte přihlásit.");
            return;
        }
        const title = document.getElementById('edit-link-title').value.trim();
        const url = document.getElementById('edit-link-url').value.trim();

        if (!title || !url || !isValidHttpUrl(url)) {
            showAlertModal("Chybějící/neplatné údaje", "Zadejte platný název a URL (http:// nebo https://) pro odkaz.");
            return;
        }

        showLoading("Ukládám odkaz...");
        try {
            if (editingLinkFirebaseId === null) {
                const newLink = {
                    id: `link-${Date.now()}-${Math.random().toString(36).substr(2,5)}`,
                    title, url,
                    createdAt: Date.now(), // ZMĚNA ZDE: Používáme Date.now() pro časový otisk na straně klienta
                    userId: currentUserId
                };
                externalLinksData.push(newLink);
                showAlertModal("Odkaz přidán", `Odkaz "${title}" byl přidán do cloudu.`);
            } else {
                const index = externalLinksData.findIndex(l => l.id === editingLinkFirebaseId);
                if (index !== -1 && externalLinksData[index].userId === currentUserId) {
                    externalLinksData[index].title = title;
                    externalLinksData[index].url = url;
                    showAlertModal("Odkaz upraven", `Odkaz "${title}" byl upraven v cloudu.`);
                } else {
                    showAlertModal("Chyba", "Odkaz k úpravě nebyl nalezen nebo nemáte oprávnění.");
                }
            }
            await saveDataToFirestore();
            hideModal(document.getElementById('edit-link-modal'));
            hideLoading();
        } catch (error) {
            console.error('Chyba při ukládání odkazu do Firestore:', error);
            showAlertModal("Chyba ukládání", `Nepodařilo se uložit odkaz: ${error.message}`);
            hideLoading();
        }
    }

async function deleteLinkFromFirestore(idToDelete) {
    if (!currentUserId) {
        showAlertModal("Přístup zamítnut", "Pro smazání odkazu se musíte přihlásit.");
        return;
    }
    const linkToDelete = externalLinksData.find(l => l.id === idToDelete);
    if (!linkToDelete || linkToDelete.userId !== currentUserId) {
        showAlertModal("Přístup zamítnut", "Nemáte oprávnění smazat tento odkaz. Můžete smazat pouze své vlastní odkazy.");
        return;
    }
    const confirmed = await (window.showConfirmModal ?
        showConfirmModal("Smazat odkaz?", `Opravdu smazat odkaz "${linkToDelete.title}"? Tato akce je nevratná!`) :
        confirm(`Smazat odkaz "${linkToDelete.title}"?`)
    );
    if (confirmed) {
        showLoading("Mažu odkaz...");
        try {
            externalLinksData = externalLinksData.filter(link => link.id !== idToDelete);
            await saveDataToFirestore();
            showAlertModal("Odkaz smazán", "Odkaz byl úspěšně smazán z cloudu.");
            hideLoading();
        } catch (error) {
            console.error('Chyba při mazání odkazu z Firestore:', error);
            showAlertModal("Chyba mazání", `Nepodařilo se smazat odkaz: ${error.message}`);
            hideLoading();
        }
    }
}

// --- Modální okna ---
function showModal(modalElement) {
    if(modalElement) modalElement.classList.add('visible');
}
function hideModal(modalElement) {
    if(modalElement) modalElement.classList.remove('visible');
}

const saveCodeModalEl = document.getElementById('save-code-modal');
const codeTitleInputEl = document.getElementById('code-title-input');
const confirmSaveCodeBtnEl = document.getElementById('confirm-save-code-btn');
const cancelSaveCodeBtnEl = document.getElementById('cancel-save-code-btn');

if(confirmSaveCodeBtnEl && codeTitleInputEl) {
    confirmSaveCodeBtnEl.addEventListener('click', () => {
        const title = codeTitleInputEl.value.trim();
        const editor = document.getElementById('html-editor');
        const code = editor ? editor.value : '';
        if (title && code) {
            saveHtmlCodeToFirestore(title, code);
            if(saveCodeModalEl) hideModal(saveCodeModalEl);
            codeTitleInputEl.value = '';
        } else {
            showAlertModal("Chybějící údaje", "Zadejte název a ujistěte se, že kód není prázdný.");
        }
    });
}
if(cancelSaveCodeBtnEl) cancelSaveCodeBtnEl.addEventListener('click', () => {
    if(saveCodeModalEl) hideModal(saveCodeModalEl);
    if(codeTitleInputEl) codeTitleInputEl.value = '';
});

if (!window.showAlertModal) {
    window.showAlertModal = (title, message) => {
        console.warn("Custom showAlertModal not fully initialized, using native alert.");
        return new Promise((resolve) => {
            alert(`${title}\n\n${message}`);
            resolve(true);
        });
    };
}
if (!window.showConfirmModal) {
    window.showConfirmModal = (title, message, buttonTexts = {}) => {
        console.warn("Custom showConfirmModal not fully initialized, using native confirm.");
        return new Promise((resolve) => {
            resolve(confirm(`${title}\n\n${message}`));
        });
    };
}

const alertModalEl = document.getElementById('alert-modal');
const alertModalTitleEl = document.getElementById('alert-modal-title');
const alertModalMessageEl = document.getElementById('alert-modal-message');
let alertModalOkBtnEl = document.getElementById('alert-modal-ok-btn');

if(alertModalEl && alertModalTitleEl && alertModalMessageEl && alertModalOkBtnEl) {
    window.showAlertModal = (title, message) => {
        return new Promise((resolve) => {
            alertModalTitleEl.textContent = title;
            alertModalMessageEl.textContent = message;

            const newOkBtn = alertModalOkBtnEl.cloneNode(true);
            alertModalOkBtnEl.parentNode.replaceChild(newOkBtn, alertModalOkBtnEl);
            alertModalOkBtnEl = newOkBtn;

            alertModalOkBtnEl.onclick = () => {
                hideModal(alertModalEl);
                resolve(true);
            };
            showModal(alertModalEl);
        });
    };
}

const confirmModalEl = document.getElementById('confirm-modal');
const confirmModalTitleEl = document.getElementById('confirm-modal-title');
const confirmModalMessageEl = document.getElementById('confirm-modal-message');
let confirmModalOkBtnEl = document.getElementById('confirm-modal-ok-btn');
let confirmModalCancelBtnEl = document.getElementById('confirm-modal-cancel-btn');

if(confirmModalEl && confirmModalTitleEl && confirmModalMessageEl && confirmModalOkBtnEl && confirmModalCancelBtnEl) {
    window.showConfirmModal = (title, message, buttonTexts = {}) => {
        return new Promise((resolve) => {
            confirmModalTitleEl.textContent = title;
            confirmModalMessageEl.textContent = message;

            const newOkBtn = confirmModalOkBtnEl.cloneNode(true);
            newOkBtn.textContent = buttonTexts.okText || 'Potvrdit';
            confirmModalOkBtnEl.parentNode.replaceChild(newOkBtn, confirmModalOkBtnEl);
            confirmModalOkBtnEl = newOkBtn;

            const newCancelBtn = confirmModalCancelBtnEl.cloneNode(true);
            newCancelBtn.textContent = buttonTexts.cancelText || 'Zrušit';
            confirmModalCancelBtnEl.parentNode.replaceChild(newCancelBtn, confirmModalCancelBtnEl);
            confirmModalCancelBtnEl = newCancelBtn;

            confirmModalOkBtnEl.onclick = () => {
                hideModal(confirmModalEl);
                resolve(true);
            };
            confirmModalCancelBtnEl.onclick = () => {
                hideModal(confirmModalEl);
                resolve(false);
            };
            showModal(confirmModalEl);
        });
    };
}

window.showSection = showSection;

// --- NOVÉ FUNKCE PRO EDITACI PORTFOLIA (ukládá do Firestore pod-kolekce) ---

// Zjednodušená addPortfolioItem pro novou strukturu
function addPortfolioItem() {
    if (!currentUserId) {
        showAlertModal("Přístup zamítnut", "Pro přidání položky se musíte přihlásit.");
        return;
    }
    editingPortfolioItemId = null; // Indikuje, že se přidává nová položka
    document.getElementById('edit-portfolio-title').value = '';
    document.getElementById('edit-portfolio-desc-1').value = '';
    document.getElementById('edit-portfolio-desc-2').value = '';
    document.getElementById('edit-portfolio-link-text').value = '';
    document.getElementById('edit-portfolio-link-url').value = '';
    document.getElementById('edit-portfolio-youtube').value = '';
    document.getElementById('youtube-preview-container').style.display = 'none';
    document.getElementById('youtube-preview').src = '';
    document.getElementById('delete-portfolio-btn').classList.add('hidden'); // Skryje tlačítko Smazat
    showModal(document.getElementById('edit-portfolio-modal'));
}

// Zjednodušená editPortfolioItem pro novou strukturu
async function editPortfolioItem(itemId) {
    if (!currentUserId) {
        showAlertModal("Přístup zamítnut", "Pro úpravu položky se musíte přihlásit.");
        return;
    }
    editingPortfolioItemId = itemId;
    const item = portfolioItemsData.find(p => p.id === itemId);

    if (!item) {
        showAlertModal("Chyba", "Položka portfolia k úpravě nebyla nalezena.");
        return;
    }
    if (item.userId !== currentUserId) {
        showAlertModal("Přístup zamítnut", "Nemáte oprávnění upravit tuto položku portfolia. Můžete upravit pouze své vlastní položky.");
        return;
    }

    document.getElementById('edit-portfolio-title').value = item.title || '';
    document.getElementById('edit-portfolio-desc-1').value = item.desc1 || '';
    document.getElementById('edit-portfolio-desc-2').value = item.desc2 || '';
    document.getElementById('edit-portfolio-link-text').value = item.linkText || '';
    document.getElementById('edit-portfolio-link-url').value = item.linkUrl || '';
    const youtubeInput = document.getElementById('edit-portfolio-youtube');
    youtubeInput.value = item.youtubeUrl || '';

    const event = new Event('input');
    youtubeInput.dispatchEvent(event);

    document.getElementById('delete-portfolio-btn').classList.remove('hidden'); // Zobrazí tlačítko Smazat
    showModal(document.getElementById('edit-portfolio-modal'));
}

// Úprava saveEditedPortfolioItem pro ukládání do pod-kolekce
async function saveEditedPortfolioItem() {
    if (!currentUserId) {
       // showAlertModal("Uložení selhalo", "Pro úpravu položky se musíte přihlásit.");
        return;
    }
    const title = document.getElementById('edit-portfolio-title').value.trim();
    const desc1 = document.getElementById('edit-portfolio-desc-1').value.trim();
    const desc2 = document.getElementById('edit-portfolio-desc-2').value.trim();
    const linkText = document.getElementById('edit-portfolio-link-text').value.trim();
    const linkUrl = document.getElementById('edit-portfolio-link-url').value.trim();
    const youtubeUrl = document.getElementById('edit-portfolio-youtube').value.trim();

    if (!title || !desc1) {
        showAlertModal("Chybějící údaje", "Vyplňte prosím název a první popis položky portfolia.");
        return;
    }
    if (linkUrl && !isValidHttpUrl(linkUrl)) {
        showAlertModal("Neplatná URL", "Zadejte platnou URL adresu pro odkaz (http:// nebo https://).");
        return;
    }

    showLoading("Ukládám položku portfolia...");
    try {
        const portfolioCollectionRef = db.collection('publicContent').doc(DOC_ID).collection('portfolioItems');
        let itemData = {
            title,
            desc1,
            desc2,
            linkText,
            linkUrl,
            youtubeUrl,
            userId: currentUserId,
            lastUpdated: firebase.firestore.FieldValue.serverTimestamp()
        };

        if (editingPortfolioItemId) {
            // Úprava existující položky
            await portfolioCollectionRef.doc(editingPortfolioItemId).update(itemData);
            showAlertModal("Položka upravena", `Položka portfolia "${title}" byla upravena v cloudu.`);
        } else {
            // Přidání nové položky
            itemData.createdAt = firebase.firestore.FieldValue.serverTimestamp();
            const newDocRef = await portfolioCollectionRef.add(itemData);
            // Aktualizujeme editingPortfolioItemId pro případné okamžité smazání po přidání
            editingPortfolioItemId = newDocRef.id;
            showAlertModal("Položka přidána", `Nová položka portfolia "${title}" byla přidána do cloudu.`);
        }

        hideModal(document.getElementById('edit-portfolio-modal'));
        hideLoading();
        // Po uložení/úpravě se data automaticky aktualizují přes realtime listener
        // renderPortfolioItems(); se zavolá z listeneru
        editingPortfolioItemId = null;
    } catch (error) {
        console.error('Chyba při ukládání položky portfolia do Firestore:', error);
        showAlertModal("Chyba ukládání", `Nepodařilo se uložit položku portfolia: ${error.message}`);
        hideLoading();
    }
}

// Úprava deletePortfolioItem pro mazání z pod-kolekce
async function deletePortfolioItem(itemIdToDelete) {
    if (!currentUserId) {
        showAlertModal("Přístup zamítnut", "Pro smazání položky se musíte přihlásit.");
        return;
    }
    if (!itemIdToDelete) { // Používáme přímo ID z argumentu, ne z editingPortfolioItemId
        showAlertModal("Chyba", "Nebylo zadáno ID položky k smazání.");
        return;
    }

    const itemToDelete = portfolioItemsData.find(p => p.id === itemIdToDelete);
    if (!itemToDelete || itemToDelete.userId !== currentUserId) {
        showAlertModal("Přístup zamítnut", "Nemáte oprávnění smazat tuto položku portfolia. Můžete smazat pouze své vlastní položky.");
        return;
    }

    hideModal(document.getElementById('edit-portfolio-modal'));
    const confirmed = await (window.showConfirmModal ?
        showConfirmModal("Smazat položku portfolia?", "Opravdu chcete smazat tuto položku z portfolia? Tato akce je nevratná! Smaže se i z cloudu pro všechny!", { okText: 'Ano, smazat', cancelText: 'Zrušit' }) :
        confirm("Opravdu chcete smazat tuto položku z portfolia? Tato akce je nevratná!")
    );

    if (confirmed) {
        showLoading("Mažu položku portfolia...");
        try {
            // Smažeme dokument přímo z pod-kolekce
            await db.collection('publicContent').doc(DOC_ID).collection('portfolioItems').doc(itemIdToDelete).delete();

            showAlertModal("Položka smazána", "Položka portfolia byla úspěšně smazána z cloudu.");
            hideLoading();
            // Data se automaticky aktualizují přes realtime listener, který zavolá renderPortfolioItems()
            editingPortfolioItemId = null; // Resetujeme
        } catch (error) {
            console.error('Chyba při mazání položky portfolia z Firestore:', error);
            showAlertModal("Chyba mazání", `Nepodařilo se smazat položku portfolia: ${error.message}`);
            hideLoading();
        }
    } else {
        showModal(document.getElementById('edit-portfolio-modal')); // Znovu otevřeme modal, pokud uživatel zrušil
    }
}


// --- Pomocný script pro správu viditelnosti tlačítek ---
(function() {
    'use strict';

    function hideDataManagementButtons() {
        const container = document.querySelector('.function-setupDataManagement');
        if (container) {
            container.style.display = 'none';
        }
    }

    function showDataManagementButtons() {
        const container = document.querySelector('.function-setupDataManagement');
        if (container) {
            container.style.display = 'flex';
        }
    }

    function applyBaseVisualStyles() {
        const container = document.querySelector('.function-setupDataManagement');
        const innerContainer = document.querySelector('.function-setupDataManagement .data-management-container');
        const buttons = document.querySelectorAll('.function-setupDataManagement .button');
        const logoutBtn = document.getElementById('logout-button');

        if (container) {
            container.style.cssText = `
                justify-content: center !important;
                border: 1px solid rgba(255, 255, 255, 0.2) !important;
                border-radius: 10px !important;
                box-shadow: 0 4px 8px rgba(0,0,0,0.2) !important;
            `;
        }

        if (innerContainer) {
            innerContainer.style.cssText = `
                justify-content: center !important;
                flex-wrap: wrap !important;
            `;
        }

        const baseButtonVisuals = `
            text-decoration: none !important;
            transition: all 0.3s ease !important;
            background: rgba(255, 255, 255, 0.1) !important;
            backdrop-filter: blur(5px) !important;
            -webkit-backdrop-filter: blur(5px) !important;
            border: none !important;
            cursor: pointer !important;
            box-shadow: 0 4px 8px rgba(0,0,0,0.2) !important;
            border-radius: 10px !important;
        `;

        const baseColorStyles = {
            saveBtn: `color: white !important;`,
            clearBtn: `color: red !important;`,
            exportBtn: `color: white !important;`,
            importBtn: `color: white !important;`,
            logoutBtn: `color: red !important;`
        };

        if (document.getElementById('save-all-data-btn')) {
            document.getElementById('save-all-data-btn').style.cssText = baseButtonVisuals + baseColorStyles.saveBtn;
        }
        if (document.getElementById('clear-all-data-btn')) {
            document.getElementById('clear-all-data-btn').style.cssText = baseButtonVisuals + baseColorStyles.clearBtn;
        }
        if (document.getElementById('export-data-btn')) {
            document.getElementById('export-data-btn').style.cssText = baseButtonVisuals + baseColorStyles.exportBtn;
        }
        if (document.getElementById('import-data-btn')) {
            document.getElementById('import-data-btn').style.cssText = baseButtonVisuals + baseColorStyles.importBtn;
        }
        if (logoutBtn) {
            logoutBtn.style.cssText = `
                padding: 0.1rem 1rem !important;
                ${baseButtonVisuals}
                ${baseColorStyles.logoutBtn}
            `;
        }
    }

    function applyDataManagementResponsiveStyles() {
        const container = document.querySelector('.function-setupDataManagement');
        const innerContainer = document.querySelector('.function-setupDataManagement .data-management-container');
        const buttons = document.querySelectorAll('.function-setupDataManagement .button');

        if (!container || !innerContainer || buttons.length === 0) {
            return;
        }

        if (container.style.display === 'none') {
            return;
        }

        const width = window.innerWidth;

        buttons.forEach(btn => {
            btn.style.padding = '';
            btn.style.fontSize = '';
            btn.style.margin = '';
            btn.style.width = '';
            btn.style.textAlign = '';
            btn.style.whiteSpace = '';
            btn.style.overflow = '';
            btn.style.textOverflow = '';
        });

        if (width >= 768) {
            container.style.maxWidth = '800px';
            container.style.width = '100%';
            container.style.padding = '1.5rem 2rem';
            container.style.margin = '2rem auto';

            innerContainer.style.display = 'grid';
            innerContainer.style.gridTemplateColumns = 'repeat(7, 1fr)';
            innerContainer.style.gap = '1.5rem';
            innerContainer.style.padding = '0 1rem';

            buttons.forEach(btn => {
                btn.style.padding = '1rem 1.2rem';
                btn.style.fontSize = '1rem';
            });
        } else if (width < 768 && width >= 481) {
            container.style.maxWidth = '400px';
            container.style.width = '100%';
            container.style.padding = '1rem 0.5rem';
            container.style.margin = '1rem auto';

            innerContainer.style.display = 'grid';
            innerContainer.style.gridTemplateColumns = 'repeat(4, 1fr)';
            innerContainer.style.gap = '0.8rem';
            innerContainer.style.justifyItems = 'center';
            innerContainer.style.alignItems = 'center';
            innerContainer.style.padding = '0 0.5rem';

            buttons.forEach(btn => {
                btn.style.padding = '0.8rem 1rem';
                btn.style.fontSize = '0.85rem';
                btn.style.margin = '0';
                btn.style.width = '100%';
                btn.style.textAlign = 'center';
                btn.style.whiteSpace = 'nowrap';
                btn.style.overflow = 'hidden';
                btn.style.textOverflow = 'ellipsis';
            });
        } else if (width <= 480 && width >= 321) {
            container.style.maxWidth = '425px';
            container.style.width = '100%';
            container.style.padding = '0.8rem 0.25rem';
            container.style.margin = '0.8rem auto';

            innerContainer.style.display = 'grid';
            innerContainer.style.gridTemplateColumns = 'repeat(4, 1fr)';
            innerContainer.style.gap = '0.6rem';
            innerContainer.style.justifyItems = 'center';
            innerContainer.style.alignItems = 'center';
            innerContainer.style.padding = '0 0.25rem';

            buttons.forEach(btn => {
                btn.style.fontSize = '0.75rem';
                btn.style.padding = '0.7rem 0.8rem';
                btn.style.margin = '0';
                btn.style.width = '100%';
                btn.style.textAlign = 'center';
                btn.style.whiteSpace = 'nowrap';
                btn.style.overflow = 'hidden';
                btn.style.textOverflow = 'ellipsis';
            });
        } else if (width <= 320) {
            container.style.maxWidth = '200px';
            container.style.width = '100%';
            container.style.padding = '0.6rem 0.1rem';
            container.style.margin = '0.6rem auto';

            innerContainer.style.display = 'grid';
            innerContainer.style.gridTemplateColumns = 'repeat(4, 1fr)';
            innerContainer.style.gap = '0.4rem';
            innerContainer.style.justifyItems = 'center';
            innerContainer.style.alignItems = 'center';
            innerContainer.style.padding = '0 0.1rem';

            buttons.forEach(btn => {
                btn.style.fontSize = '0.7rem';
                btn.style.padding = '0.6rem 0.4rem';
                btn.style.margin = '0';
                btn.style.width = '100%';
                btn.style.textAlign = 'center';
                btn.style.whiteSpace = 'nowrap';
                btn.style.overflow = 'hidden';
                btn.style.textOverflow = 'ellipsis';
            });
        }
    }

    function observeEditMode() {
        const body = document.body;

        const observer = new MutationObserver(function(mutations) {
            mutations.forEach(function(mutation) {
                if (mutation.type === 'attributes' && mutation.attributeName === 'class') {
                    if (body.classList.contains('edit-mode')) {
                        showDataManagementButtons();
                        applyDataManagementResponsiveStyles();
                    } else {
                        hideDataManagementButtons();
                    }
                }
            });
        });

        observer.observe(body, {
            attributes: true,
            attributeFilter: ['class']
        });

        if (body.classList.contains('edit-mode')) {
            showDataManagementButtons();
            applyDataManagementResponsiveStyles();
        } else {
            hideDataManagementButtons();
        }
    }

    function initDataManagementVisibility() {
        applyBaseVisualStyles();
        observeEditMode();
    }

    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', initDataManagementVisibility);
    } else {
        initDataManagementVisibility();
    }

    window.hideDataManagementButtons = hideDataManagementButtons;
    window.showDataManagementButtons = showDataManagementButtons;

    window.addEventListener('resize', function() {
        const container = document.querySelector('.function-setupDataManagement');
        if (container && container.style.display !== 'none') {
            applyDataManagementResponsiveStyles();
        }
    });

})();

// --- Pomocní script pro heslo před přechodem k přihlášení a registrace ---
(function() {
    'use strict';

    const HARDCODED_ACCESS_PASSWORD_HASH = '256b5537a792c98a13c9b32bb6b6c90f0e63531fe77c3b4dee69ee1ca82c984b';

    const loginButton = document.getElementById('login-button');

    if (!loginButton) {
        console.warn("Gemini Helper: Tlačítko pro přihlášení (login-button) nebylo nalezeno. Pomocný script se nespustí.");
        return;
    }

    async function hashString(text) {
        const textEncoder = new TextEncoder();
        const data = textEncoder.encode(text);
        const hashBuffer = await crypto.subtle.digest('SHA-256', data);
        const hashArray = Array.from(new Uint8Array(hashBuffer));
        const hexHash = hashArray.map(b => b.toString(16).padStart(2, '0')).join('');
        return hexHash;
    }

    function showCustomPromptModal(modalId, inputId, errorId = null) {
        return new Promise(resolve => {
            const modal = document.getElementById(modalId);
            const input = document.getElementById(inputId);
            const okBtn = modal.querySelector('#' + modalId + ' #local-password-ok-btn');
            const cancelBtn = modal.querySelector('#' + modalId + ' #local-password-cancel-btn');
            const errorEl = errorId ? document.getElementById(errorId) : null;

            if (!modal || !input || !okBtn || !cancelBtn) {
                console.error(`Chyba: Chybí HTML elementy pro vlastní prompt modal (${modalId}). Zkontrolujte ID.`);
                resolve(null);
                return;
            }

            input.value = '';
            if (errorEl) errorEl.textContent = '';

            const clearListeners = () => {
                okBtn.onclick = null;
                cancelBtn.onclick = null;
                input.removeEventListener('keydown', handleEnterKey);
            };

            const handleEnterKey = (event) => {
                if (event.key === 'Enter') {
                    event.preventDefault();
                    okBtn.click();
                }
            };
            input.addEventListener('keydown', handleEnterKey);

            okBtn.onclick = () => {
                clearListeners();
                window.hideModal(modal);
                resolve(input.value);
            };
            cancelBtn.onclick = () => {
                clearListeners();
                window.hideModal(modal);
                resolve(null);
            };

            window.showModal(modal);
            input.focus();
        });
    }

    async function handleLocalAccessPasswordHashedCustomModal() {
        const { data: { session } } = await supabaseClient.auth.getSession();
        if (session && session.user) {
            console.log("Gemini Helper: Uživatel je již přihlášen přes Supabase. Lokální hardcoded heslo přeskočeno.");
            window.showAuthModal();
            return;
        }

        const enteredPassword = await showCustomPromptModal(
            'local-password-modal',
            'local-password-input',
            'local-password-error'
        );

        if (enteredPassword === null) {
            console.log("Gemini Helper: Zadání hesla zrušeno uživatelem.");
            const errorEl = document.getElementById('local-password-error');
            if (errorEl) errorEl.textContent = '';
            return;
        }

        const enteredPasswordHash = await hashString(enteredPassword);

        if (enteredPasswordHash === HARDCODED_ACCESS_PASSWORD_HASH) {
            console.log("Gemini Helper: Lokální heslo (hash) správně, přístup povolen.");
            window.showAuthModal();
        } else {
            const errorEl = document.getElementById('local-password-error');
            if (errorEl) {
                errorEl.textContent = "Chybné heslo! Zkuste to znovu.";
                window.showModal(document.getElementById('local-password-modal'));
                document.getElementById('local-password-input').focus();
            } else {
                alert("Chybné heslo. Přístup zamítnut.");
            }
            console.log("Gemini Helper: Lokální heslo (hash) chybné, přístup zamítnut.");
        }
    }

    loginButton.onclick = handleLocalAccessPasswordHashedCustomModal;

})();

// logout_button_helper.js
(function() {
    'use strict';

    const logoutButton = document.getElementById('logout-button');

    if (!logoutButton) {
        console.warn("Logout Button Helper: Tlačítko s ID 'logout-button' nebylo nalezeno. Script se nespustí.");
        return;
    }

    if (typeof supabaseClient === 'undefined') {
        console.error("Logout Button Helper: supabaseClient není definován. Ujistěte se, že Supabase SDK je načteno a inicializováno před tímto scriptem.");
        logoutButton.classList.add('hidden');
        return;
    }

    supabaseClient.auth.onAuthStateChange((event, session) => {
        if (session && session.user) {
            logoutButton.classList.remove('hidden');
        } else {
            logoutButton.classList.add('hidden');
        }
    });

    supabaseClient.auth.getSession().then(({ data: { session } }) => {
        if (session && session.user) {
            logoutButton.classList.remove('hidden');
        } else {
            logoutButton.classList.add('hidden');
        }
    });

})();

// --- OPRAVENÉ FUNKCE BEZ setupModalEventListeners ---
// Tyto funkce byly přesunuty do globálního scopu nebo upraveny pro novou strukturu
// a jejich event listenery jsou inicializovány níže.

// Funkce pro bezpečné připojení event listenerů
function attachEventListenerSafely(elementId, eventType, handler, description) {
    const element = document.getElementById(elementId);
    if (element) {
        element.onclick = null; // Odebereme inline onclick, pokud existuje
        element.removeEventListener(eventType, handler); // Odebereme předchozí listenery
        element.addEventListener(eventType, handler); // Připojíme nový
        return true;
    } else {
        console.warn(`Element s ID "${elementId}" pro ${description} nebyl nalezen.`);
        return false;
    }
}

// Funkce pro inicializaci všech event listenerů pro externí odkazy
function initializeAllEventListeners() {
    attachEventListenerSafely('add-link-btn', 'click', addLink, 'tlačítko Přidat odkaz');
    attachEventListenerSafely('save-edited-link-btn', 'click', saveEditedLink, 'tlačítko Uložit odkaz');
    attachEventListenerSafely('cancel-edit-link-btn', 'click', function() {
        hideModal(document.getElementById('edit-link-modal'));
    }, 'tlačítko Zrušit odkaz');

    // Portfolio listenery
    attachEventListenerSafely('save-edit-portfolio-btn', 'click', saveEditedPortfolioItem, 'tlačítko Uložit portfolio');
    attachEventListenerSafely('cancel-edit-portfolio-btn', 'click', function() {
        hideModal(document.getElementById('edit-portfolio-modal'));
        document.getElementById('youtube-preview-container').style.display = 'none';
        document.getElementById('youtube-preview').src = '';
        document.getElementById('edit-portfolio-youtube').value = '';
    }, 'tlačítko Zrušit portfolio');
    attachEventListenerSafely('add-portfolio-item-btn', 'click', addPortfolioItem, 'tlačítko Přidat položku portfolia');
    // Tlačítko smazat portfolio se připojuje dynamicky v renderPortfolioItems
}

// Zbytek funkcí zůstává stejný...
document.addEventListener('DOMContentLoaded', function() {
    initializeAllEventListeners();
});

// Další pojistka - pokud by se stránka načetla dříve než DOMContentLoaded
if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', initializeAllEventListeners);
} else {
    initializeAllEventListeners();
}

window.addEventListener('load', function() {
    setTimeout(() => {
        const addLinkBtn = document.getElementById('add-link-btn');
        const saveLinkBtn = document.getElementById('save-edited-link-btn');
        if ((addLinkBtn && !addLinkBtn.onclick && !addLinkBtn.hasEventListener) ||
            (saveLinkBtn && !saveLinkBtn.onclick && !saveLinkBtn.hasEventListener)) {
            initializeAllEventListeners();
        }
    }, 100);
});

// --- Pomocný script pro YouTube video HTTPS ---
function getYouTubeVideoId(url) {
    const regExp = /^.*((youtu.be\/)|(v\/)|(\/u\/\w\/)|(embed\/)|(watch\?))\??v?=?([^#&?]*).*/;
    const match = url.match(regExp);
    return (match && match[7].length === 11) ? match[7] : null;
}

document.getElementById('edit-portfolio-youtube')?.addEventListener('input', function() {
    const url = this.value;
    const previewContainer = document.getElementById('youtube-preview-container');
    const previewIframe = document.getElementById('youtube-preview');

    if (url.trim() === '') {
        previewContainer.style.display = 'none';
        return;
    }

    const videoId = getYouTubeVideoId(url);

    if (videoId) {
        const embedUrl = `https://www.youtube.com/embed/${videoId}`;
        previewIframe.src = embedUrl;
        previewContainer.style.display = 'block';
    } else {
        previewContainer.style.display = 'none';
    }
});

// Vyčištění náhledu při zavření modalu (již integrováno v initializeAllEventListeners pro cancel-edit-portfolio-btn)

// --- Dynamický vkladač pro obrázky ---
document.addEventListener('DOMContentLoaded', function() {
    const projectImagesData = {
        'zly-obrazek-1': {
            src: 'https://img40.rajce.idnes.cz/d4003/19/19517/19517492_984d6887838eae80a8eb677199393188/images/Moderni-foto-editor.jpg?ver=1',
            desktop: {
                width: '450px',
                height: '250px',
                objectFit: 'cover',
                borderRadius: '12px',
                border: '5px solid black'
            },
            mobile: {
                width: '100%',
                height: 'auto',
                objectFit: 'contain',
                borderRadius: '6px',
                border: '1px solid black'
            }
        },
        'zly-obrazek-2': {
            src: 'https://img40.rajce.idnes.cz/d4003/19/19517/19517492_984d6887838eae80a8eb677199393188/images/Star-Trek-Hudebni-Prehravac.jpg?ver=2',
            desktop: {
                width: '450px',
                height: '250px',
                objectFit: 'cover',
                borderRadius: '12px',
                border: '5px solid #00ffff'
            },
            mobile: {
                width: '100%',
                height: 'auto',
                objectFit: 'contain',
                borderRadius: '6px',
                border: '1px solid #00ffff'
            }
        },
        'zly-obrazek-3': {
            src: 'https://img40.rajce.idnes.cz/d4003/19/19517/19517492_984d6887838eae80a8eb677199393188/images/pokrocili-vahovy-tracker.jpg?ver=3',
            desktop: {
                width: '450px',
                height: '250px',
                objectFit: 'cover',
                borderRadius: '12px',
                border: '5px solid #a0a0a0'
            },
            mobile: {
                width: '100%',
                height: 'auto',
                objectFit: 'contain',
                borderRadius: '6px',
                border: '1px solid #a0a0a0'
            }
        },
        'zly-obrazek-4': {
            src: 'https://img40.rajce.idnes.cz/d4003/19/19517/19517492_984d6887838eae80a8eb677199393188/images/mapy-html-kodu.jpg?ver=0',
            desktop: {
                width: '450px',
                height: '250px',
                objectFit: 'cover',
                borderRadius: '12px',
                border: '5px solid #5cb85c'
            },
            mobile: {
                width: '100%',
                height: 'auto',
                objectFit: 'contain',
                borderRadius: '6px',
                border: '1px solid #5cb85c'
            }
        },
        'zly-obrazek-5': {
            src: 'https://img41.rajce.idnes.cz/d4102/19/19244/19244630_db82ad174937335b1a151341387b7af2/images/Tutorial.jpg?ver=0',
            desktop: {
                width: '450px',
                height: '250px',
                objectFit: 'cover',
                borderRadius: '12px',
                border: '5px solid #FF00FF'
            },
            mobile: {
                width: '100%',
                height: 'auto',
                objectFit: 'contain',
                borderRadius: '6px',
                border: '1px solid #5cb85c'
            }
        }
    };

    const mobileMediaQuery = window.matchMedia('(max-width: 768px)');

    function applyImageStyles(imgElement, imgData) {
        let stylesToApply;
        if (mobileMediaQuery.matches) {
            stylesToApply = imgData.mobile;
        } else {
            stylesToApply = imgData.desktop;
        }

        imgElement.style.width = stylesToApply.width;
        imgElement.style.height = stylesToApply.height;
        imgElement.style.objectFit = stylesToApply.objectFit;
        imgElement.style.borderRadius = stylesToApply.borderRadius;
        imgElement.style.border = stylesToApply.border;
    }

    function loadAndStyleProjectImages() {
        for (const id in projectImagesData) {
            const imgElement = document.getElementById(id);
            if (imgElement) {
                const imgData = projectImagesData[id];
                imgElement.src = imgData.src;
                applyImageStyles(imgElement, imgData);
            }
        }
    }

    loadAndStyleProjectImages();

    mobileMediaQuery.addEventListener('change', function() {
        console.log("Změna velikosti okna, aktualizuji styly obrázků.");
        for (const id in projectImagesData) {
            const imgElement = document.getElementById(id);
            if (imgElement) {
                applyImageStyles(imgElement, projectImagesData[id]);
            }
        }
    });
});

// --- JS PRO CELOOBRAZOVÝ REŽIM ---
document.addEventListener('DOMContentLoaded', () => {
    const fullscreenButton = document.getElementById('fullscreenButton');

    fullscreenButton.addEventListener('click', () => {
        if (!document.fullscreenElement) {
            document.documentElement.requestFullscreen().catch(err => {
                console.error(`Chyba při pokusu o přechod na celou obrazovku: ${err.message} (${err.name})`);
            });
        } else {
            document.exitFullscreen();
        }
    });
});



//tady začíná url
 
