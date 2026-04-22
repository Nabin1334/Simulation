
        // ============================================
        // ATM SYSTEM - COMPLETE REALISTIC SIMULATION
        // ============================================

        class ATM {
            constructor() {
                this.state = {
                    // User session
                    cardInserted: false,
                    pinVerified: false,
                    sessionActive: false,
                    language: 'en',
                    
                    // Security
                    pinAttempts: 0,
                    maxPinAttempts: 3,
                    currentPin: '',
                    enteredPin: '',
                    
                    // Account data
                    accounts: {
                        checking: {
                            balance: 245678.50,
                            number: '•••• 1234',
                            type: 'CHECKING',
                            dailyLimit: 100000,
                            dailyWithdrawn: 12500
                        },
                        savings: {
                            balance: 1520050.75,
                            number: '•••• 5678',
                            type: 'SAVINGS',
                            dailyLimit: 200000,
                            dailyWithdrawn: 0
                        }
                    },
                    currentAccount: 'checking',
                    
                    // Transaction state
                    currentTransaction: null,
                    transactionAmount: 0,
                    transactionFee: 0,
                    transactionRef: this.generateReference(),
                    recipientAccount: '',
                    depositAmount: 0,
                    
                    // Screen state
                    currentScreen: 'welcome',
                    inputBuffer: '',
                    inputType: null,
                    inputMaxLength: null,
                    confirmationStep: 0,
                    
                    // System
                    isProcessing: false,
                    lastTransaction: null
                };
                
                this.messages = {
                    en: this.getEnglishMessages(),
                    es: this.getSpanishMessages(),
                    fr: this.getFrenchMessages()
                };
                
                this.init();
            }
            
            getEnglishMessages() {
                return {
                    welcome: [
                        "════════════════════════",
                        "GLOBAL BANK ATM",
                        "════════════════════════",
                        "",
                        "PLEASE INSERT YOUR CARD",
                        "",
                        "SELECT LANGUAGE:",
                        "1. ENGLISH",
                        "2. ESPAÑOL",
                        "3. FRANÇAIS",
                        ""
                    ],
                    insertCard: "PLEASE INSERT YOUR CARD",
                    enterPin: [
                        "ENTER YOUR PIN",
                        "════════════════════════",
                        "FOR SECURITY, PLEASE ENTER",
                        "YOUR 4-DIGIT PIN NUMBER",
                        "",
                        "PIN: ",
                        "",
                        "PRESS ENTER TO CONTINUE"
                    ],
                    mainMenu: [
                        "MAIN MENU",
                        "════════════════════════",
                        "SELECT TRANSACTION:",
                        "",
                        "1. BALANCE INQUIRY",
                        "2. CASH WITHDRAWAL",
                        "3. DEPOSIT",
                        "4. TRANSFER FUNDS",
                        "5. PIN CHANGE",
                        "6. MINI STATEMENT",
                        "",
                        "PRESS CORRESPONDING KEY"
                    ],
                    selectAccount: [
                        "SELECT ACCOUNT",
                        "════════════════════════",
                        "",
                        "1. CHECKING (****1234)",
                        "2. SAVINGS (****5678)",
                        "",
                        "PRESS 1 OR 2"
                    ],
                    withdrawAmount: [
                        "CASH WITHDRAWAL",
                        "════════════════════════",
                        "SELECT AMOUNT:",
                        "",
                        "DAILY LIMIT: रु",
                        "AVAILABLE TODAY: रु",
                        "ACCOUNT BALANCE: रु",
                        "",
                        "PRESS CORRESPONDING KEY"
                    ],
                    processing: (msg) => [
                        "PROCESSING",
                        "════════════════════════",
                        msg,
                        "",
                        "PLEASE WAIT...",
                        ""
                    ],
                    error: (msg) => [
                        "TRANSACTION ERROR",
                        "════════════════════════",
                        msg,
                        "",
                        "PLEASE TRY AGAIN",
                        "OR CONTACT YOUR BANK"
                    ],
                    success: (msg) => [
                        "TRANSACTION COMPLETE",
                        "════════════════════════",
                        msg,
                        "",
                        "PLEASE TAKE YOUR CARD",
                        "AND TRANSACTION RECEIPT",
                        "",
                        "THANK YOU"
                    ]
                };
            }
            
            getSpanishMessages() {
                return {
                    welcome: [
                        "════════════════════════",
                        "CAJERO AUTOMÁTICO",
                        "════════════════════════",
                        "",
                        "POR FAVOR INSERTE SU TARJETA",
                        "",
                        "SELECCIONE IDIOMA:",
                        "1. INGLÉS",
                        "2. ESPAÑOL",
                        "3. FRANCÉS",
                        ""
                    ],
                    insertCard: "POR FAVOR INSERTE SU TARJETA"
                };
            }
            
            getFrenchMessages() {
                return {
                    welcome: [
                        "════════════════════════",
                        "DISTRIBUTEUR AUTOMATIQUE",
                        "════════════════════════",
                        "",
                        "VEUILLEZ INSÉRER VOTRE CARTE",
                        "",
                        "CHOISISSEZ LA LANGUE:",
                        "1. ANGLAIS",
                        "2. ESPAGNOL",
                        "3. FRANÇAIS",
                        ""
                    ],
                    insertCard: "VEUILLEZ INSÉRER VOTRE CARTE"
                };
            }
            
            init() {
                this.updateScreen('welcome');
                this.updateInstruction("Please insert your bank card");
                this.enableKeypad(false);
                this.updateButtons(['btnCancel']);
                
                // Auto-insert card after 5 seconds
                setTimeout(() => {
                    if (!this.state.cardInserted) {
                        this.insertCard();
                    }
                }, 5000);
            }
            
            insertCard() {
                if (this.state.cardInserted) return;
                
                this.state.cardInserted = true;
                this.state.sessionActive = true;
                
                // Show card animation
                document.getElementById('bankCard').classList.add('visible');
                this.playSound('beep');
                
                setTimeout(() => {
                    this.updateScreen('enterPin');
                    this.state.currentScreen = 'pinEntry';
                    this.state.inputType = 'pin';
                    this.state.inputMaxLength = 4;
                    this.enableKeypad(true);
                    this.updateInstruction("Enter your 4-digit PIN");
                }, 1500);
            }
            
            ejectCard() {
                if (!this.state.cardInserted) return;
                
                this.state.cardInserted = false;
                this.state.sessionActive = false;
                this.state.pinVerified = false;
                this.state.enteredPin = '';
                this.state.currentTransaction = null;
                
                document.getElementById('bankCard').classList.remove('visible');
                this.playSound('beep');
                
                setTimeout(() => {
                    this.updateScreen('welcome');
                    this.enableKeypad(false);
                    this.updateButtons(['btnCancel']);
                    this.hideAmountGrid();
                    this.hideSummary();
                    this.updateInstruction("Please insert your bank card");
                }, 1000);
            }
            
            verifyPin() {
                if (this.state.enteredPin.length !== 4) return;
                
                this.showProcessing("VERIFYING PIN...");
                this.enableKeypad(false);
                
                setTimeout(() => {
                    // Default PIN is 1234
                    if (this.state.enteredPin === '1234') {
                        this.state.pinVerified = true;
                        this.state.pinAttempts = 0;
                        this.state.currentScreen = 'accountSelection';
                        this.updateScreen('selectAccount');
                        this.updateInstruction("Select account type");
                        this.enableKeypad(true);
                    } else {
                        this.state.pinAttempts++;
                        this.state.enteredPin = '';
                        
                        if (this.state.pinAttempts >= this.state.maxPinAttempts) {
                            this.retainCard();
                        } else {
                            this.updateScreen('error', [`INVALID PIN`, `ATTEMPTS: ${this.state.pinAttempts}/${this.state.maxPinAttempts}`]);
                            this.updateInstruction("Invalid PIN - Try again");
                            
                            setTimeout(() => {
                                this.updateScreen('enterPin');
                                this.enableKeypad(true);
                            }, 3000);
                        }
                    }
                }, 2000);
            }
            
            retainCard() {
                this.state.cardInserted = false;
                this.state.sessionActive = false;
                this.updateScreen('error', ["SECURITY ALERT", "CARD RETAINED", "CONTACT YOUR BANK"]);
                document.getElementById('bankCard').style.background = 'linear-gradient(135deg, #dc2626, #7f1d1d)';
                this.playSound('error');
            }
            
            selectAccount(accountType) {
                this.state.currentAccount = accountType;
                this.state.currentScreen = 'mainMenu';
                this.updateScreen('mainMenu');
                this.updateInstruction("Select transaction type");
                this.updateButtons(['btnBalance', 'btnWithdraw', 'btnDeposit', 'btnTransfer', 'btnPinChange', 'btnMiniStatement', 'btnCancel']);
            }
            
            balanceInquiry() {
                this.state.currentTransaction = 'balance';
                this.showProcessing("RETRIEVING BALANCE...");
                
                setTimeout(() => {
                    const account = this.state.accounts[this.state.currentAccount];
                    this.updateScreen('success', [
                        "ACCOUNT BALANCE",
                        "",
                        `ACCOUNT: ${account.type}`,
                        `NUMBER: ${account.number}`,
                        "",
                        `AVAILABLE BALANCE:`,
                        `रु${this.formatNepaliCurrency(account.balance)}`,
                        "",
                        "PRESS ANY KEY"
                    ]);
                    this.updateInstruction("Balance displayed");
                    this.state.lastTransaction = {
                        type: 'balance',
                        amount: 0,
                        balance: account.balance,
                        timestamp: new Date()
                    };
                }, 2000);
            }
            
            withdrawMenu() {
                this.state.currentTransaction = 'withdraw';
                this.state.currentScreen = 'withdrawAmount';
                const account = this.state.accounts[this.state.currentAccount];
                
                const messages = this.messages[this.state.language].withdrawAmount.slice();
                messages[4] += this.formatNepaliCurrency(account.dailyLimit);
                messages[5] += this.formatNepaliCurrency(account.dailyLimit - account.dailyWithdrawn);
                messages[6] += this.formatNepaliCurrency(account.balance);
                
                this.updateScreenCustom(messages);
                this.showAmountGrid();
                this.updateInstruction("Select withdrawal amount");
                this.updateButtons(['btnCancel']);
            }
            
            selectAmount(amount) {
                const account = this.state.accounts[this.state.currentAccount];
                
                // Validate amount
                if (amount > account.balance) {
                    this.showError("INSUFFICIENT FUNDS");
                    return;
                }
                
                if (amount > (account.dailyLimit - account.dailyWithdrawn)) {
                    this.showError("EXCEEDS DAILY LIMIT");
                    return;
                }
                
                this.state.transactionAmount = amount;
                this.state.transactionFee = amount <= 10000 ? 0 : 25;
                
                // Show confirmation
                this.updateTransactionSummary();
                this.showSummary();
                this.hideAmountGrid();
                this.updateInstruction("Confirm transaction");
                this.updateButtons(['btnConfirm', 'btnCancel']);
            }
            
            confirmTransaction() {
                if (!this.state.currentTransaction) return;
                
                this.showProcessing("PROCESSING...");
                this.enableKeypad(false);
                this.updateButtons([]);
                
                setTimeout(() => {
                    switch(this.state.currentTransaction) {
                        case 'withdraw':
                            this.processWithdrawal();
                            break;
                        case 'deposit':
                            this.processDeposit();
                            break;
                        case 'transfer':
                            this.processTransfer();
                            break;
                    }
                }, 3000);
            }
            
            processWithdrawal() {
                const account = this.state.accounts[this.state.currentAccount];
                
                // Update account
                account.balance -= (this.state.transactionAmount + this.state.transactionFee);
                account.dailyWithdrawn += this.state.transactionAmount;
                
                // Update transaction record
                this.state.lastTransaction = {
                    type: 'withdrawal',
                    amount: this.state.transactionAmount,
                    fee: this.state.transactionFee,
                    balance: account.balance,
                    timestamp: new Date()
                };
                
                // Dispense cash
                const cashStack = document.getElementById('cashStack');
                cashStack.textContent = `रु${this.formatNepaliCurrency(this.state.transactionAmount)}`;
                cashStack.classList.add('visible');
                this.playSound('cash');
                
                // Update screen
                this.updateScreen('success', [
                    "TRANSACTION COMPLETE",
                    "",
                    `WITHDRAWN: रु${this.formatNepaliCurrency(this.state.transactionAmount)}`,
                    `FEE: रु${this.formatNepaliCurrency(this.state.transactionFee)}`,
                    `TOTAL: रु${this.formatNepaliCurrency(this.state.transactionAmount + this.state.transactionFee)}`,
                    "",
                    `NEW BALANCE:`,
                    `रु${this.formatNepaliCurrency(account.balance)}`,
                    "",
                    "PRESS ENTER FOR RECEIPT"
                ]);
                
                this.updateInstruction("Please take your cash");
                
                // Auto-print receipt after delay
                setTimeout(() => {
                    cashStack.classList.remove('visible');
                    this.printReceipt();
                }, 5000);
            }
            
            processDeposit() {
                // Implementation for deposit
                const account = this.state.accounts[this.state.currentAccount];
                account.balance += this.state.depositAmount;
                
                this.state.lastTransaction = {
                    type: 'deposit',
                    amount: this.state.depositAmount,
                    fee: 0,
                    balance: account.balance,
                    timestamp: new Date()
                };
                
                this.updateScreen('success', [
                    "DEPOSIT ACCEPTED",
                    "",
                    `AMOUNT: रु${this.formatNepaliCurrency(this.state.depositAmount)}`,
                    "",
                    `NEW BALANCE:`,
                    `रु${this.formatNepaliCurrency(account.balance)}`,
                    "",
                    "PRESS ENTER FOR RECEIPT"
                ]);
                
                setTimeout(() => this.printReceipt(), 3000);
            }
            
            processTransfer() {
                // Implementation for transfer
                const account = this.state.accounts[this.state.currentAccount];
                account.balance -= this.state.transactionAmount;
                
                this.state.lastTransaction = {
                    type: 'transfer',
                    amount: this.state.transactionAmount,
                    fee: 15,
                    recipient: this.state.recipientAccount,
                    balance: account.balance,
                    timestamp: new Date()
                };
                
                this.updateScreen('success', [
                    "TRANSFER COMPLETE",
                    "",
                    `AMOUNT: रु${this.formatNepaliCurrency(this.state.transactionAmount)}`,
                    `TO: ${this.state.recipientAccount}`,
                    `FEE: रु15`,
                    "",
                    `NEW BALANCE:`,
                    `रु${this.formatNepaliCurrency(account.balance)}`,
                    "",
                    "PRESS ENTER FOR RECEIPT"
                ]);
                
                setTimeout(() => this.printReceipt(), 3000);
            }
            
            printReceipt() {
                if (!this.state.lastTransaction) return;
                
                // Update receipt data
                const now = new Date();
                document.getElementById('receiptDate').textContent = `DATE: ${now.toLocaleDateString('en-US', {month: '2-digit', day: '2-digit', year: 'numeric'})}`;
                document.getElementById('receiptTime').textContent = `TIME: ${now.toLocaleTimeString('en-US', {hour: '2-digit', minute: '2-digit', hour12: true}).toLowerCase()}`;
                document.getElementById('receiptRef').textContent = this.generateReference().substring(0, 6);
                
                const trans = this.state.lastTransaction;
                document.getElementById('receiptTransaction').textContent = trans.type.toUpperCase();
                document.getElementById('receiptAmount').textContent = `AMOUNT: रु${this.formatNepaliCurrency(trans.amount)}`;
                document.getElementById('receiptFee').textContent = `FEE: रु${this.formatNepaliCurrency(trans.fee || 0)}`;
                document.getElementById('receiptBalance').textContent = `BALANCE: रु${this.formatNepaliCurrency(trans.balance)}`;
                
                // Show receipt
                const receipt = document.getElementById('receiptPaper');
                receipt.classList.add('visible');
                this.playSound('printer');
                
                setTimeout(() => {
                    receipt.classList.remove('visible');
                    this.ejectCard();
                }, 4000);
            }
            
            cancelTransaction() {
                this.state.currentTransaction = null;
                this.state.transactionAmount = 0;
                this.hideAmountGrid();
                this.hideSummary();
                
                if (this.state.pinVerified) {
                    this.updateScreen('mainMenu');
                    this.updateInstruction("Select transaction type");
                    this.updateButtons(['btnBalance', 'btnWithdraw', 'btnDeposit', 'btnTransfer', 'btnPinChange', 'btnMiniStatement', 'btnCancel']);
                } else {
                    this.ejectCard();
                }
                
                this.playSound('beep');
            }
            
            // UI Helper methods
            updateScreen(screenType, customMessages = null) {
                const screenContent = document.getElementById('screenContent');
                screenContent.innerHTML = '';
                
                let messages;
                if (customMessages) {
                    messages = customMessages;
                } else if (typeof this.messages[this.state.language][screenType] === 'string') {
                    messages = [this.messages[this.state.language][screenType]];
                } else {
                    messages = [...this.messages[this.state.language][screenType]];
                }
                
                messages.forEach(line => {
                    const div = document.createElement('div');
                    div.className = 'screen-line';
                    
                    if (line.includes('PIN: ')) {
                        div.textContent = 'PIN: ';
                        const pinDisplay = document.createElement('span');
                        pinDisplay.className = 'input-display';
                        pinDisplay.id = 'pinDisplay';
                        pinDisplay.textContent = this.getPinDisplay();
                        div.appendChild(pinDisplay);
                    } else if (line === '') {
                        div.innerHTML = '&nbsp;';
                    } else {
                        div.textContent = line;
                    }
                    
                    screenContent.appendChild(div);
                });
                
                // Add cursor
                const cursorDiv = document.createElement('div');
                cursorDiv.className = 'screen-line';
                cursorDiv.innerHTML = '<span class="cursor"></span>';
                screenContent.appendChild(cursorDiv);
            }
            
            updateScreenCustom(lines) {
                const screenContent = document.getElementById('screenContent');
                screenContent.innerHTML = '';
                
                lines.forEach(line => {
                    const div = document.createElement('div');
                    div.className = 'screen-line';
                    div.textContent = line;
                    screenContent.appendChild(div);
                });
                
                const cursorDiv = document.createElement('div');
                cursorDiv.className = 'screen-line';
                cursorDiv.innerHTML = '<span class="cursor"></span>';
                screenContent.appendChild(cursorDiv);
            }
            
            showProcessing(message) {
                this.updateScreenCustom([
                    "PROCESSING",
                    "════════════════════════",
                    message,
                    "",
                    "PLEASE WAIT...",
                    "",
                    this.getLoadingAnimation()
                ]);
            }
            
            showError(message) {
                this.updateScreen('error', [message]);
                this.playSound('error');
                
                setTimeout(() => {
                    if (this.state.currentScreen === 'withdrawAmount') {
                        this.withdrawMenu();
                    } else if (this.state.currentScreen === 'mainMenu') {
                        this.updateScreen('mainMenu');
                    }
                }, 3000);
            }
            
            getPinDisplay() {
                let display = '';
                for (let i = 0; i < 4; i++) {
                    display += i < this.state.enteredPin.length ? '•' : '_';
                }
                return display;
            }
            
            getLoadingAnimation() {
                return '⠋⠙⠹⠸⠼⠴⠦⠧⠇⠏';
            }
            
            updateInstruction(text) {
                document.getElementById('instructionText').textContent = text;
            }
            
            updateButtons(buttons) {
                const allButtons = ['btnBalance', 'btnWithdraw', 'btnDeposit', 'btnTransfer', 'btnPinChange', 'btnMiniStatement', 'btnCancel', 'btnConfirm'];
                allButtons.forEach(btn => {
                    document.getElementById(btn).disabled = true;
                });
                
                buttons.forEach(btn => {
                    const button = document.getElementById(btn);
                    if (button) button.disabled = false;
                });
            }
            
            enableKeypad(enabled) {
                const keys = ['0','1','2','3','4','5','6','7','8','9','Clear','Enter'];
                keys.forEach(key => {
                    const btn = document.getElementById('btnKey' + key) || document.getElementById('btnClear') || document.getElementById('btnEnter');
                    if (btn) btn.disabled = !enabled;
                });
            }
            
            showAmountGrid() {
                document.getElementById('amountGrid').classList.add('visible');
            }
            
            hideAmountGrid() {
                document.getElementById('amountGrid').classList.remove('visible');
            }
            
            showSummary() {
                document.getElementById('transactionSummary').classList.add('visible');
            }
            
            hideSummary() {
                document.getElementById('transactionSummary').classList.remove('visible');
            }
            
            updateTransactionSummary() {
                document.getElementById('summaryType').textContent = this.state.currentTransaction?.toUpperCase() || '-';
                document.getElementById('summaryAmount').textContent = `रु${this.formatNepaliCurrency(this.state.transactionAmount)}`;
                document.getElementById('summaryFee').textContent = `रु${this.formatNepaliCurrency(this.state.transactionFee)}`;
                document.getElementById('summaryTotal').textContent = `रु${this.formatNepaliCurrency(this.state.transactionAmount + this.state.transactionFee)}`;
            }
            
            playSound(type) {
                const audioContext = new (window.AudioContext || window.webkitAudioContext)();
                
                switch(type) {
                    case 'beep':
                        this.playBeep(audioContext, 800, 0.1);
                        break;
                    case 'error':
                        this.playBeep(audioContext, 400, 0.2);
                        setTimeout(() => this.playBeep(audioContext, 300, 0.2), 200);
                        break;
                    case 'cash':
                        this.playBeep(audioContext, 1200, 0.05);
                        setTimeout(() => this.playBeep(audioContext, 1000, 0.05), 100);
                        setTimeout(() => this.playBeep(audioContext, 800, 0.05), 200);
                        break;
                    case 'printer':
                        for (let i = 0; i < 5; i++) {
                            setTimeout(() => this.playBeep(audioContext, 2000, 0.02), i * 100);
                        }
                        break;
                }
            }
            
            playBeep(audioContext, frequency, duration) {
                const oscillator = audioContext.createOscillator();
                const gainNode = audioContext.createGain();
                
                oscillator.connect(gainNode);
                gainNode.connect(audioContext.destination);
                
                oscillator.frequency.value = frequency;
                oscillator.type = 'sine';
                
                gainNode.gain.setValueAtTime(0, audioContext.currentTime);
                gainNode.gain.linearRampToValueAtTime(0.1, audioContext.currentTime + 0.01);
                gainNode.gain.exponentialRampToValueAtTime(0.001, audioContext.currentTime + duration);
                
                oscillator.start(audioContext.currentTime);
                oscillator.stop(audioContext.currentTime + duration);
            }
            
            generateReference() {
                return Math.floor(100000 + Math.random() * 900000).toString();
            }
            
            formatNepaliCurrency(amount) {
                // Format with Nepali numbering style (1,00,000 instead of 100,000)
                let formatted = parseFloat(amount).toFixed(2);
                
                // Split into integer and decimal parts
                let parts = formatted.split('.');
                let integerPart = parts[0];
                let decimalPart = parts[1] || '00';
                
                // Format integer part with Indian numbering system
                let lastThree = integerPart.substring(integerPart.length - 3);
                let otherNumbers = integerPart.substring(0, integerPart.length - 3);
                if (otherNumbers !== '') {
                    lastThree = ',' + lastThree;
                }
                let formattedInteger = otherNumbers.replace(/\B(?=(\d{2})+(?!\d))/g, ",") + lastThree;
                
                return formattedInteger + '.' + decimalPart;
            }
            
            // Keypad handler
            handleKeyPress(key) {
                switch(this.state.currentScreen) {
                    case 'pinEntry':
                        if (key >= '0' && key <= '9') {
                            if (this.state.enteredPin.length < 4) {
                                this.state.enteredPin += key;
                                document.getElementById('pinDisplay').textContent = this.getPinDisplay();
                                
                                if (this.state.enteredPin.length === 4) {
                                    this.verifyPin();
                                }
                            }
                        } else if (key === 'clear') {
                            this.state.enteredPin = '';
                            document.getElementById('pinDisplay').textContent = this.getPinDisplay();
                        } else if (key === 'enter') {
                            if (this.state.enteredPin.length === 4) {
                                this.verifyPin();
                            }
                        }
                        break;
                        
                    case 'accountSelection':
                        if (key === '1') {
                            this.selectAccount('checking');
                        } else if (key === '2') {
                            this.selectAccount('savings');
                        }
                        break;
                }
            }
            
            // Missing transaction functions
            depositMenu() {
                this.state.currentTransaction = 'deposit';
                this.updateScreenCustom([
                    "DEPOSIT",
                    "════════════════════════",
                    "ENTER DEPOSIT AMOUNT:",
                    "",
                    "MAXIMUM: रु10,00,000",
                    "",
                    "AMOUNT: रु",
                    "",
                    "PRESS ENTER TO CONTINUE"
                ]);
                this.state.currentScreen = 'depositAmount';
                this.state.inputType = 'amount';
                this.state.inputMaxLength = 7;
                this.updateInstruction("Enter deposit amount");
            }
            
            transferMenu() {
                this.state.currentTransaction = 'transfer';
                this.updateScreenCustom([
                    "TRANSFER FUNDS",
                    "════════════════════════",
                    "ENTER ACCOUNT NUMBER:",
                    "",
                    "RECIPIENT ACCOUNT:",
                    "",
                    "",
                    "",
                    "PRESS ENTER TO CONTINUE"
                ]);
                this.state.currentScreen = 'transferAccount';
                this.state.inputType = 'account';
                this.state.inputMaxLength = 10;
                this.updateInstruction("Enter recipient account number");
            }
            
            pinChange() {
                this.showError("SERVICE TEMPORARILY UNAVAILABLE");
            }
            
            miniStatement() {
                const account = this.state.accounts[this.state.currentAccount];
                this.updateScreenCustom([
                    "MINI STATEMENT",
                    "════════════════════════",
                    `ACCOUNT: ${account.number}`,
                    `BALANCE: रु${this.formatNepaliCurrency(account.balance)}`,
                    "",
                    "LAST TRANSACTIONS:",
                    "",
                    "1. WITHDRAWAL   रु10,000.00",
                    "2. DEPOSIT      रु50,000.00",
                    "3. TRANSFER     रु25,000.00",
                    "",
                    "PRESS ANY KEY"
                ]);
            }
            
            changeLanguage(lang) {
                this.state.language = lang;
                if (!this.state.cardInserted) {
                    this.updateScreen('welcome');
                }
            }
        }

        // ============================================
        // GLOBAL ATM INSTANCE & EVENT HANDLERS
        // ============================================

        let atm;

        function init() {
            atm = new ATM();
            updateReceiptDate();
        }

        function pressKey(key) {
            atm.playSound('beep');
            atm.handleKeyPress(key);
        }

        function selectAmount(amount) {
            atm.selectAmount(amount);
        }

        function balanceInquiry() {
            atm.balanceInquiry();
        }

        function withdrawMenu() {
            atm.withdrawMenu();
        }

        function depositMenu() {
            atm.depositMenu();
        }

        function transferMenu() {
            atm.transferMenu();
        }

        function pinChange() {
            atm.pinChange();
        }

        function miniStatement() {
            atm.miniStatement();
        }

        function cancelTransaction() {
            atm.cancelTransaction();
        }

        function confirmTransaction() {
            atm.confirmTransaction();
        }

        function changeLanguage(lang) {
            atm.changeLanguage(lang);
        }

        function updateReceiptDate() {
            const now = new Date();
            document.getElementById('receiptDate').textContent = `DATE: ${now.toLocaleDateString('en-US', {month: '2-digit', day: '2-digit', year: 'numeric'})}`;
            document.getElementById('receiptTime').textContent = `TIME: ${now.toLocaleTimeString('en-US', {hour: '2-digit', minute: '2-digit', hour12: true}).toLowerCase()}`;
        }

        // Initialize on load
        window.addEventListener('load', init);