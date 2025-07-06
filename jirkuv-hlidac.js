(function() {
    // Globální flag pro zajištění jednorázové inicializace celého skriptu
    if (window.conzolLogBeta1Initialized) {
        return;
    }
    window.conzolLogBeta1Initialized = true;

    document.addEventListener('DOMContentLoaded', () => {
        // Záloha původních konzolových metod
        const originalConsole = {
            log: console.log,
            warn: console.warn,
            error: console.error,
            info: console.info,
            debug: console.debug,
            setTimeout: console.setTimeout,
        };  

        if (typeof console !== 'undefined' && originalConsole.warn) {
            originalConsole.log('🚀 jirkuv-hlidac.js: Plně Připravena.');
        }

        // Pole pro ukládání záznamů konzole
        const logEntries = [];
        const maxLogEntries = 2000;

        /**
         * Přidá záznam do pole logEntries a aktualizuje zobrazení.
         * VŠECHNY logy se nyní zobrazí v modálu (bez filtrování)
         */
        function addLogEntry(type, message, args) {
            const timestamp = new Date();
            const fullMessage = message + (args.length > 0 ? ' ' + args.map(a => typeof a === 'object' ? JSON.stringify(a) : String(a)).join(' ') : '');

            logEntries.push({
                timestamp: timestamp,
                type: type,
                message: fullMessage,
            });

            // Omezení počtu záznamů
            if (logEntries.length > maxLogEntries) {
                logEntries.shift();
            }

            updateLogDisplay();
        }

        // Přepíšeme standardní konzolové metody - VŠECHNY logy jdou do modálu
        console.log = function(...args) {
            originalConsole.log.apply(console, args);
            addLogEntry('LOG', String(args[0]), args.slice(1));
        };
        console.warn = function(...args) {
            originalConsole.warn.apply(console, args);
            addLogEntry('WARN', String(args[0]), args.slice(1));
        };
        console.error = function(...args) {
            originalConsole.error.apply(console, args);
            addLogEntry('ERROR', String(args[0]), args.slice(1));
        };
        console.info = function(...args) {
            originalConsole.info.apply(console, args);
            addLogEntry('INFO', String(args[0]), args.slice(1));
        };
        console.debug = function(...args) {   
            originalConsole.debug.apply(console, args);
            addLogEntry('DEBUG', String(args[0]), args.slice(1));
        };
        console.info = function(...args) {
            originalConsole.info.apply(console, args);
            addLogEntry('setTimeout', String(args[0]), args.slice(1));
        };
        // HTML struktura pro modalní okno
        const jirikModalHTML = `
            <div id="jirik-modal" class="jirik-modal-overlay">
                <div class="jirik-modal-content">
                    <span class="jirik-close-button" id="jirik-close-button">&times;</span>
                    <h5>Výpis Konzole (Jiřík)</h5>
                    <div class="jirik-log-controls">
                        <button id="jirik-clear-button" class="jirik-button jirik-btn-danger">Vyčistit log</button>
                        <button id="jirik-export-button" class="jirik-button jirik-btn-secondary">Export HTML</button>
                        <div class="jirik-log-stats">
                            <span id="jirik-log-count">Záznamy: 0</span>
                        </div>
                    </div>
                    <div class="jirik-log-table-container">
                        <table id="jirik-log-table">
                            <thead>
                                <tr>
                                    <th>Čas</th>
                                    <th>Typ</th>
                                    <th>Zpráva</th>
                                    <th>Akce</th>
                                </tr>
                            </thead>
                            <tbody id="jirik-table-body">
                            </tbody>
                        </table>
                    </div>
                </div>
            </div>
        `;

        // Zjednodušené CSS styly
        const jirikModalCSS = `
            .jirik-modal-overlay {
                position: fixed !important;
                z-index: 999999 !important;
                left: 0 !important;
                top: 0 !important;
                width: 100% !important;
                height: 100% !important;
                background-color: rgba(0,0,0,0.7) !important;
                display: flex !important;
                justify-content: center !important;
                align-items: center !important;
                opacity: 0 !important;
                visibility: hidden !important;
                transition: opacity 0.3s ease !important;
                backdrop-filter: blur(5px) !important;
            }

            .jirik-modal-overlay.jirik-visible {
                opacity: 1 !important;
                visibility: visible !important;
            }

            .jirik-modal-content {
                background-color: #2a2a2a !important;
                padding: 25px !important;
                border-radius: 8px !important;
                width: 90% !important;
                max-width: 1200px !important;
                max-height: 90vh !important;
                color: #e0e0e0 !important;
                display: flex !important;
                flex-direction: column !important;
                position: relative !important;
            }

            .jirik-close-button {
                position: absolute !important;
                right: 20px !important;
                top: 10px !important;
                font-size: 28px !important;
                color: #aaa !important;
                cursor: pointer !important;
            }

            .jirik-close-button:hover {
                color: #fff !important;
            }

            .jirik-modal-content h5 {
                color: #00ffff !important;
                text-align: center !important;
                margin: 0 0 20px 0 !important;
            }

            .jirik-log-controls {
                display: flex !important;
                gap: 15px !important;
                margin-bottom: 20px !important;
                justify-content: center !important;
                flex-wrap: wrap !important;
            }

            .jirik-button {
                padding: 10px 20px !important;
                border: none !important;
                border-radius: 5px !important;
                cursor: pointer !important;
                color: white !important;
            }

            .jirik-btn-danger {
                background-color: #dc3545 !important;
            }

            .jirik-btn-secondary {
                background-color: #6c757d !important;
            }

            .jirik-log-stats {
                display: flex !important;
                align-items: center !important;
                color: #bbb !important;
            }

            .jirik-log-table-container {
                flex-grow: 1 !important;
                overflow-y: auto !important;
                background-color: #1a1a1a !important;
                border-radius: 5px !important;
                padding: 10px !important;
            }

            #jirik-log-table {
                width: 100% !important;
                border-collapse: collapse !important;
                color: #f0f0f0 !important;
            }

            #jirik-log-table th,
            #jirik-log-table td {
                border: 1px solid #333 !important;
                padding: 8px !important;
                text-align: left !important;
            }

            #jirik-log-table th {
                background-color: #3a3a3a !important;
                color: #00ffff !important;
                position: sticky !important;
                top: 0 !important;
            }

            #jirik-log-table tbody tr:nth-child(even) {
                background-color: #222 !important;
            }

            #jirik-log-table tbody tr:hover {
                background-color: #333 !important;
            }

            .log-type-log-text { color: #87ceeb !important; }
            .log-type-warn-text { color: #ffcc00 !important; }
            .log-type-error-text { color: #ff6347 !important; }
            .log-type-info-text { color: #98fb98 !important; }
            .log-type-debug-text { color: #dda0dd !important; }

            .jirik-copy-log-btn {
                background: #555 !important;
                color: white !important;
                border: none !important;
                padding: 5px 10px !important;
                border-radius: 3px !important;
                cursor: pointer !important;
                font-size: 0.8em !important;
            }

            .jirik-copy-log-btn:hover {
                background: #777 !important;
            }
        `;

        // Vložení HTML a CSS do dokumentu
        document.body.insertAdjacentHTML('beforeend', jirikModalHTML);
        const styleElement = document.createElement('style');
        styleElement.textContent = jirikModalCSS;
        document.head.appendChild(styleElement);

        // Získání DOM elementů
        const jirikModal = document.getElementById('jirik-modal');
        const closeJirikModalBtn = document.getElementById('jirik-close-button');
        const clearJirikLogBtn = document.getElementById('jirik-clear-button');
        const exportJirikLogBtn = document.getElementById('jirik-export-button');
        const jirikLogTableBody = document.getElementById('jirik-table-body');
        const jirikLogCountSpan = document.getElementById('jirik-log-count');

        // Vytvoření hlavního tlačítka
        const dataManagementContainer = document.querySelector('.function-setupDataManagement .data-management-container');
        
        if (dataManagementContainer) {
            let openJirikModalBtn = document.getElementById('jirik-open-modal-btn');
            
            if (!openJirikModalBtn) {
                openJirikModalBtn = document.createElement('button');
                openJirikModalBtn.id = 'jirik-open-modal-btn';
                openJirikModalBtn.className = 'button custom-button';
                openJirikModalBtn.textContent = '📋';
                
                openJirikModalBtn.style.cssText = `
                    color: #FF7F50 !important;
                    padding: 10px !important;
                    border-radius: 10px !important;
                    background: rgba(255, 255, 255, 0.1) !important;
                    backdrop-filter: blur(5px) !important;
                    border: none !important;
                    cursor: pointer !important;
                `;
                
                dataManagementContainer.appendChild(openJirikModalBtn);
            }
            
            if (!openJirikModalBtn.hasAttribute('data-console-listener-bound')) {
                openJirikModalBtn.addEventListener('click', (e) => {
                    e.preventDefault();
                    e.stopPropagation();
                    jirikModal.classList.add('jirik-visible');
                    updateLogDisplay();
                });
                openJirikModalBtn.setAttribute('data-console-listener-bound', 'true');
            }
        }

        // Záložní tlačítko
        const jirikManualOpenerBtn = document.getElementById('jirik-manual-opener-btn');
        if (jirikManualOpenerBtn) {
            jirikManualOpenerBtn.style.cssText = `
                color: #FF7F50 !important;
                padding: 10px !important;
                border-radius: 10px !important;
                background: rgba(255, 255, 255, 0.1) !important;
                backdrop-filter: blur(5px) !important;
                border: none !important;
                cursor: pointer !important;
            `;
            
            if (!jirikManualOpenerBtn.hasAttribute('data-console-listener-bound-manual')) {
                jirikManualOpenerBtn.addEventListener('click', (e) => {
                    e.preventDefault();
                    e.stopPropagation();
                    window.openJirikModal();
                });
                jirikManualOpenerBtn.setAttribute('data-console-listener-bound-manual', 'true');
            }
        }

        // Funkce pro aktualizaci zobrazení logů
        function updateLogDisplay() {
            if (!jirikLogTableBody) return;
            
            jirikLogTableBody.innerHTML = '';
            
            logEntries.forEach((entry, index) => {
                const row = jirikLogTableBody.insertRow();
                row.title = entry.message;

                // Čas
                const timeCell = row.insertCell();
                timeCell.textContent = entry.timestamp.toLocaleString('cs-CZ', {
                    year: 'numeric',
                    month: '2-digit',
                    day: '2-digit',
                    hour: '2-digit',
                    minute: '2-digit',
                    second: '2-digit'
                });

                // Typ
                const typeCell = row.insertCell();
                typeCell.classList.add(`log-type-${entry.type.toLowerCase()}-text`);
                typeCell.textContent = entry.type;

                // Zpráva
                const messageCell = row.insertCell();
                messageCell.textContent = entry.message;

                // Akce
                const actionCell = row.insertCell();
                const copyBtn = document.createElement('button');
                copyBtn.textContent = 'Kopírovat';
                copyBtn.classList.add('jirik-copy-log-btn');
                copyBtn.onclick = () => {
                    navigator.clipboard.writeText(entry.message).then(() => {
                        originalConsole.info('Zpráva zkopírována!');
                    });
                };
                actionCell.appendChild(copyBtn);
            });
            
            if (jirikLogCountSpan) {
                jirikLogCountSpan.textContent = `Záznamy: ${logEntries.length}`;
            }
            
            // Scroll na konec
            const tableContainer = jirikLogTableBody.parentElement;
            if (tableContainer) {
                tableContainer.scrollTop = tableContainer.scrollHeight;
            }
        }

        // Event listenery
        if (closeJirikModalBtn) {
            closeJirikModalBtn.addEventListener('click', () => {
                jirikModal.classList.remove('jirik-visible');
            });
        }

        if (jirikModal) {
            window.addEventListener('click', (event) => {
                if (event.target === jirikModal) {
                    jirikModal.classList.remove('jirik-visible');
                }
            });
        }

        if (clearJirikLogBtn) {
            clearJirikLogBtn.addEventListener('click', () => {
                if (confirm("Opravdu chcete vyčistit všechny záznamy?")) {
                    logEntries.length = 0;
                    updateLogDisplay();
                    originalConsole.log('✅ Log vyčištěn!');
                }
            });
        }

        if (exportJirikLogBtn) {
            exportJirikLogBtn.addEventListener('click', () => {
                const timestamp = new Date().toLocaleString('cs-CZ').replace(/[,: ]/g, '-');
                const filename = `jirik-console-log-${timestamp}.html`;

                const htmlContent = `<!DOCTYPE html>
<html lang="cs">
<head>
    <meta charset="UTF-8">
    <title>Výpis Konzole - ${new Date().toLocaleString('cs-CZ')}</title>
    <style>
        body { font-family: Arial, sans-serif; background: #1a1a1a; color: #f0f0f0; padding: 20px; }
        table { width: 100%; border-collapse: collapse; }
        th, td { border: 1px solid #444; padding: 10px; text-align: left; }
        th { background-color: #3a3a3a; color: #00ffff; }
        tr:nth-child(even) { background-color: #222; }
    </style>
</head>
<body>
    <h1>Výpis Konzole</h1>
    <p>Exportováno: ${new Date().toLocaleString('cs-CZ')}</p>
    <table>
        <thead><tr><th>Čas</th><th>Typ</th><th>Zpráva</th></tr></thead>
        <tbody>
        ${logEntries.map(entry => `
            <tr>
                <td>${entry.timestamp.toLocaleString('cs-CZ')}</td>
                <td>${entry.type}</td>
                <td>${entry.message}</td>
            </tr>
        `).join('')}
        </tbody>
    </table>
</body>
</html>`;

                const blob = new Blob([htmlContent], { type: 'text/html' });
                const url = URL.createObjectURL(blob);
                const a = document.createElement('a');
                a.href = url;
                a.download = filename;
                document.body.appendChild(a);
                a.click();
                document.body.removeChild(a);
                URL.revokeObjectURL(url);
                originalConsole.log('✅ Log exportován:', filename);
            });
        }

        // Globální funkce pro ruční otevření
        window.openJirikModal = function() {
            if (jirikModal) {
                jirikModal.classList.add('jirik-visible');
                updateLogDisplay();
            }
        };

        // Úvodní aktualizace
        updateLogDisplay();
        originalConsole.log('🔥 Console logger úspěšně inicializován!');
    });
})();