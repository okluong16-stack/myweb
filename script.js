//==========CNC MEG=================

// ===== DỮ LIỆU NHÂN VIÊN =====
const employeesData = `14581160,Dương Văn Hùng
16752372,Trương Văn Bắc
13504657,Đặng Quang Tuệ
18758792,Bùi Đức Hạnh
18758857,Hoàng Quốc Lực
13632101,Hoàng Văn Nam
16787826,Lưu Đại Lượng
17795713,Nguyễn Văn Chiến
22526813,Nguyễn Hải Long
21503928,Nguyễn Thúy Hiền
14823527,Nguyễn Thanh Tùng
19505173,Nguyễn Thị Huyền Trang
15804462,Nguyễn Văn Hùng
14823466,Nguyễn Văn Đông
17810539,Trần Thị Quyên
17795877,Đinh Tiến Dũng
23526131,Đỗ Thúy Phương
15825095,Đinh Thị Mai
14827254,Nguyễn Trọng Luân
14820126,Lê Tiến Luật
24506056,Phạm Bá Trưởng
14823077,Long Quang Hiếu
15759187,Dương Công Định
17786692,Phạm Đăng Kiên
23520835,Vương Xuân Thành
17776216,Nguyễn Quang Bình
22515945,Vũ Đức Sơn
13691141,Lại Vi Ánh
14819985,Nguyễn Xuân Hiếu
15836190,Trần Đức Tùng
17795771,Bùi Xuân Thái
24518344,Nguyễn Văn Cảnh
22511590,Nguyễn Đình Tôn
17795472,Vũ Quang Dũng
13654931,Phạm Hồng Thắng
12581823,Lý Văn Hoàn
12510281,Hoàng Văn Tuyên
17783181,Cao Tiến Phi
15781693,Lê Việt Đức
17811398,Nguyễn Duy Văn
15753210,Trần Xuân Hùng
15766144,Nguyễn Văn Duy
17771885,Vũ Văn Trình
16787871,Bùi Minh Đức
24519062,Lê Thị Minh
25512349,Nguyễn Hữu Mạnh
25503707,Phạm Thu Hoài
23520887,Trần Minh Vũ
15804526,Đinh Công Giang
15797460,Phan Hữu Thân
15797387,Lê Thị Trang
15794017,Đào Thị Huyền Trang
15797720,Nguyễn Văn Đoàn
16779414,Bế Thị Hương Lan
18768485,Bùi Thị Như Huệ
16806399,Lý  Thị Thanh
15774534,Lục Thị Nhuận

`;

// ===== DỮ LIỆU KHÁCH MỜI (CHỈ QUAY TRONG GIẢI KHUYẾN KHÍCH) =====
const guestsData = `
`;

// ===== GLOBAL VARIABLES =====
let employees = [];
let guests = [];
let availableEmployees = [];
let availableGuests = [];
let winners = [];
let isSpinning = false;
let spinInterval;
let currentEmployeeIndex = 0;
let selectedPrize = null;
let digitIntervals = [];
let currentWinnerCode = '';

//thời gian quay
const prizeConfig = {
    special: { name: 'Giải Thịnh Vượng', icon: '🏆', color: '#FFD700', spinDuration: 20000 }, //20s
    first: { name: 'Giải Hạnh Phúc', icon: '🥇', color: '#FFA500', spinDuration: 20000 }, 
    second: { name: 'Giải Bình An', icon: '🥈', color: '#C0C0C0', spinDuration: 20000 }, 
    third: { name: 'Giải Cộng Đồng', icon: '🥉', color: '#CD7F32', spinDuration: 20000 } 
};

// ===== DOM ELEMENTS =====
const wheel = document.getElementById('wheel');
const wheelText = document.getElementById('wheelText');
const displayCode = document.getElementById('displayCode');
const displayName = document.getElementById('displayName');
const spinBtn = document.getElementById('spinBtn');
const resetBtn = document.getElementById('resetBtn');
const winnerSection = document.getElementById('winnerSection');
const winnerCode = document.getElementById('winnerCode');
const winnerName = document.getElementById('winnerName');
const totalEmployees = document.getElementById('totalEmployees');
const remainingEmployees = document.getElementById('remainingEmployees');
const winnerCount = document.getElementById('winnerCount');
const historyList = document.getElementById('historyList');
const clearHistoryBtn = document.getElementById('clearHistoryBtn');
const fireworksCanvas = document.getElementById('fireworksCanvas');
const currentPrizeDisplay = document.getElementById('currentPrizeDisplay');
const currentPrizeText = currentPrizeDisplay.querySelector('.current-prize-text');
const prizeCards = document.querySelectorAll('.prize-card');
const digitDisplay = document.getElementById('digitDisplay');

// ===== INITIALIZATION =====
document.addEventListener('DOMContentLoaded', function() {
    initializeEmployees();
    initializeGuests();
    loadWinnersFromStorage();
    updateStatistics();
    updateHistoryDisplay();
    setupEventListeners();
    initializeFireworks();
    resetDigitDisplay();
    initializeBackgroundMusic();
    initializeMobileMenu();
});

function initializeBackgroundMusic() {
    const backgroundMusic = document.getElementById('backgroundMusic');
    
    if (!backgroundMusic) {
        console.log('Background music element not found');
        return;
    }
    
    // Set volume to 30%
    backgroundMusic.volume = 0.3;
    
    // Try to play on page load
    const playPromise = backgroundMusic.play();
    
    if (playPromise !== undefined) {
        playPromise.then(_ => {
            // Autoplay started successfully
            console.log('Background music playing');
        })
        .catch(error => {
            // Autoplay was prevented
            console.log('Autoplay prevented, waiting for user interaction');
            
            // Add click listener to start music on first interaction
            const startMusicOnInteraction = function() {
                backgroundMusic.play().then(() => {
                    console.log('Background music started on user interaction');
                }).catch(err => {
                    console.log('Still unable to play:', err);
                });
                
                // Remove the listener after first interaction
                document.removeEventListener('click', startMusicOnInteraction);
                document.removeEventListener('keydown', startMusicOnInteraction);
            };
            
            // Listen for first user interaction
            document.addEventListener('click', startMusicOnInteraction);
            document.addEventListener('keydown', startMusicOnInteraction);
        });
    }
}

// ===== PARSE EMPLOYEES DATA =====
function initializeEmployees() {
    const lines = employeesData.trim().split('\n');
    employees = lines.map(line => {
        const [code, ...nameParts] = line.split(',');
        const name = nameParts.join(',').trim();
        return { code: code.trim(), name };
    });
    
    // Filter out winners from available employees
    const winnerCodes = winners.map(w => w.code);
    availableEmployees = employees.filter(emp => !winnerCodes.includes(emp.code));
    
    // Shuffle available employees
    shuffleArray(availableEmployees);
}

// ===== PARSE GUESTS DATA =====
function initializeGuests() {
    const lines = guestsData.trim().split('\n');
    guests = lines.map(line => {
        const [code, ...nameParts] = line.split(',');
        const name = nameParts.join(',').trim();
        return { code: code.trim(), name };
    });
    
    // Filter out winners from available guests
    const winnerCodes = winners.map(w => w.code);
    availableGuests = guests.filter(guest => !winnerCodes.includes(guest.code));
    
    // Shuffle available guests
    shuffleArray(availableGuests);
}

// ===== SHUFFLE ARRAY =====
function shuffleArray(array) {
    for (let i = array.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [array[i], array[j]] = [array[j], array[i]];
    }
}

// ===== SETUP EVENT LISTENERS =====
function setupEventListeners() {
    spinBtn.addEventListener('click', startSpin);
    resetBtn.addEventListener('click', resetSpin);
    clearHistoryBtn.addEventListener('click', clearHistory);
    
    // Prize card listeners
    prizeCards.forEach(card => {
        card.addEventListener('click', function() {
            selectPrize(this.dataset.prize);
        });
    });
    
    // Keyboard shortcuts
    document.addEventListener('keydown', function(e) {
        if (e.code === 'Space' && !isSpinning && selectedPrize) {
            e.preventDefault();
            startSpin();
        } else if (e.code === 'Escape' && isSpinning) {
            stopSpin();
        } else if (e.code === 'KeyR' && e.ctrlKey) {
            e.preventDefault();
            clearHistory();
        }
    });
}

// ===== PRIZE SELECTION =====
function selectPrize(prizeType) {
    if (isSpinning) return;
    
    // Remove previous selection
    prizeCards.forEach(card => card.classList.remove('selected'));
    
    // Add selection to clicked prize
    const selectedCard = document.querySelector(`[data-prize="${prizeType}"]`);
    selectedCard.classList.add('selected');
    
    selectedPrize = prizeType;
    
    // Update current prize display
    const prize = prizeConfig[prizeType];
    currentPrizeText.textContent = `${prize.icon} Đang quay: ${prize.name}`;
    currentPrizeDisplay.classList.add('has-prize');
    
    // Enable spin button
    spinBtn.disabled = false;
    
    // Update spin button text
    spinBtn.querySelector('.btn-text').textContent = `QUAY ${prize.name.toUpperCase()}`;
    
    // Reset display when changing prize
    resetDigitDisplay();
    // displayName.textContent = 'TEST NHÂN PHẨM';
    displayName.textContent = 'Chúc mọi người may mắn ^^';
    winnerSection.style.display = 'none';
}

// ===== SPIN FUNCTIONS =====
function startSpin() {
    if (isSpinning) return;
    
    if (availableEmployees.length === 0) {
        showMessage('Đã hết nhân viên để quay!');
        return;
    }
    
    isSpinning = true;
    spinBtn.disabled = true;
    wheel.classList.add('spinning');
    winnerSection.style.display = 'none';
    
    if (selectedPrize === 'special') {
        // Giải Thịnh Vượng - 1 winner at once
        spinSpecialPrize();
    } else if (selectedPrize === 'first') {
        // Giải Hạnh Phúc - 5 winners at once
        spinFirstPrize();
    } else if (selectedPrize === 'second') {
        // Giải Bình An - 10 winners at once
        spinSecondPrize();
    } else if (selectedPrize === 'third') {
        // Giải Cộng Đồng - 42 winners at once
        spinThirdPrize();
    }
}

function spinSpecialPrize() {
    // Giải Thịnh Vượng - 1 winner at once
    const prize = prizeConfig[selectedPrize];
    const spinDuration = prize.spinDuration;
    
    // Select 1 random winner
    const winnerIndex = Math.floor(Math.random() * availableEmployees.length);
    const winner = availableEmployees[winnerIndex];
    currentWinnerCode = winner.code;
    
    // Start spinning all 8 digits
    startDigitSpinning();
    
    // Stop spinning and show winner
    setTimeout(() => {
        stopSpecialPrize([winner], winnerIndex);
    }, spinDuration);
}

function spinFirstPrize() {
    // Giải Hạnh Phúc - 5 winners at once
    const prize = prizeConfig[selectedPrize];
    const spinDuration = prize.spinDuration;
    
    // Select 5 random winners
    const numberOfWinners = Math.min(5, availableEmployees.length);
    const firstPrizeWinners = [];
    
    // Shuffle and select 5 winners
    const shuffled = [...availableEmployees];
    shuffleArray(shuffled);
    
    for (let i = 0; i < numberOfWinners; i++) {
        firstPrizeWinners.push(shuffled[i]);
    }
    
    // Start spinning all 8 digits
    startDigitSpinning();
    
    // Stop spinning and show winners
    setTimeout(() => {
        stopFirstPrize(firstPrizeWinners);
    }, spinDuration);
}

function spinSecondPrize() {
    // Giải Bình An - 10 winners at once
    const prize = prizeConfig[selectedPrize];
    const spinDuration = prize.spinDuration;
    
    // Select 10 random winners
    const numberOfWinners = Math.min(10, availableEmployees.length);
    const secondPrizeWinners = [];
    
    // Shuffle and select 10 winners
    const shuffled = [...availableEmployees];
    shuffleArray(shuffled);
    
    for (let i = 0; i < numberOfWinners; i++) {
        secondPrizeWinners.push(shuffled[i]);
    }
    
    // Start spinning all 8 digits
    startDigitSpinning();
    
    // Stop spinning and show winners
    setTimeout(() => {
        stopSecondPrize(secondPrizeWinners);
    }, spinDuration);
}

function spinThirdPrize() {
    // Giải Cộng Đồng - 42 winners at once
    const prize = prizeConfig[selectedPrize];
    const spinDuration = prize.spinDuration;
    
    // Select 42 random winners
    const numberOfWinners = Math.min(42, availableEmployees.length);
    const thirdPrizeWinners = [];
    
    // Shuffle and select 42 winners
    const shuffled = [...availableEmployees];
    shuffleArray(shuffled);
    
    for (let i = 0; i < numberOfWinners; i++) {
        thirdPrizeWinners.push(shuffled[i]);
    }
    
    // Start spinning all 8 digits
    startDigitSpinning();
    
    // Stop spinning and show winners
    setTimeout(() => {
        stopThirdPrize(thirdPrizeWinners);
    }, spinDuration);
}

function startDigitSpinning() {
    // Clear any existing intervals
    digitIntervals.forEach(interval => clearInterval(interval));
    digitIntervals = [];
    
    // Start spinning each digit
    for (let i = 0; i < 8; i++) {
        const digitBox = document.getElementById(`digit${i}`);
        digitBox.classList.remove('revealed');
        
        const interval = setInterval(() => {
            const randomDigit = Math.floor(Math.random() * 10);
            digitBox.textContent = randomDigit;
        }, 50);
        
        digitIntervals.push(interval);
    }
}

function revealDigit(index, digit) {
    const digitBox = document.getElementById(`digit${index}`);
    
    // Stop spinning this digit
    if (digitIntervals[index]) {
        clearInterval(digitIntervals[index]);
    }
    
    // Set the final digit
    digitBox.textContent = digit;
    digitBox.classList.add('revealed');
}

function stopSpecialPrize(winners, winnerIndex) {
    if (!isSpinning) return;
    
    // Clear all digit intervals
    digitIntervals.forEach(interval => clearInterval(interval));
    digitIntervals = [];
    
    isSpinning = false;
    spinBtn.disabled = false;
    wheel.classList.remove('spinning');
    
    // Display single winner
    const winner = winners[0];
    displayWinner(winner);
    
    // Add to winners list
    addToWinners(winner);
    
    // Remove from available employees
    if (winnerIndex !== undefined) {
        availableEmployees.splice(winnerIndex, 1);
    } else {
        const winnerCodes = winners.map(w => w.code);
        availableEmployees = availableEmployees.filter(emp => !winnerCodes.includes(emp.code));
    }
    
    // Update statistics
    updateStatistics();
    updateHistoryDisplay();
    
    // Save to localStorage
    saveWinnersToStorage();
    
    // Launch fireworks
    launchFireworks();
    
    // Play sound effect (if available)
    playWinSound();
}

function stopFirstPrize(winners) {
    if (!isSpinning) return;
    
    // Clear all digit intervals
    digitIntervals.forEach(interval => clearInterval(interval));
    digitIntervals = [];
    
    isSpinning = false;
    spinBtn.disabled = false;
    wheel.classList.remove('spinning');
    
    // Display multiple winners
    displayMultipleWinnersFirst(winners);
    
    // Add all winners to the list
    winners.forEach(winner => {
        addToWinners(winner);
    });
    
    // Remove winners from available employees
    const winnerCodes = winners.map(w => w.code);
    availableEmployees = availableEmployees.filter(emp => !winnerCodes.includes(emp.code));
    
    // Update statistics
    updateStatistics();
    updateHistoryDisplay();
    
    // Save to localStorage
    saveWinnersToStorage();
    
    // Launch enhanced fireworks for multiple winners
    launchMultipleFireworks();
    
    // Play sound effect (if available)
    playWinSound();
}

function stopSecondPrize(winners) {
    if (!isSpinning) return;
    
    // Clear all digit intervals
    digitIntervals.forEach(interval => clearInterval(interval));
    digitIntervals = [];
    
    isSpinning = false;
    spinBtn.disabled = false;
    wheel.classList.remove('spinning');
    
    // Display multiple winners
    displayMultipleWinnersSecond(winners);
    
    // Add all winners to the list
    winners.forEach(winner => {
        addToWinners(winner);
    });
    
    // Remove winners from available employees
    const winnerCodes = winners.map(w => w.code);
    availableEmployees = availableEmployees.filter(emp => !winnerCodes.includes(emp.code));
    
    // Update statistics
    updateStatistics();
    updateHistoryDisplay();
    
    // Save to localStorage
    saveWinnersToStorage();
    
    // Launch enhanced fireworks for multiple winners
    launchMultipleFireworks();
    
    // Play sound effect (if available)
    playWinSound();
}

function stopThirdPrize(winners) {
    if (!isSpinning) return;
    
    // Clear all digit intervals
    digitIntervals.forEach(interval => clearInterval(interval));
    digitIntervals = [];
    
    isSpinning = false;
    spinBtn.disabled = false;
    wheel.classList.remove('spinning');
    
    // Display multiple winners
    displayMultipleWinnersThird(winners);
    
    // Add all winners to the list
    winners.forEach(winner => {
        addToWinners(winner);
    });
    
    // Remove winners from available employees
    const winnerCodes = winners.map(w => w.code);
    availableEmployees = availableEmployees.filter(emp => !winnerCodes.includes(emp.code));
    
    // Update statistics
    updateStatistics();
    updateHistoryDisplay();
    
    // Save to localStorage
    saveWinnersToStorage();
    
    // Launch enhanced fireworks for multiple winners
    launchMultipleFireworks();
    
    // Play sound effect (if available)
    playWinSound();
}

function resetSpin() {
    if (isSpinning) {
        stopSpin();
    }
    
    resetDigitDisplay();
    // displayName.textContent = 'TEST NHÂN PHẨM';
    displayName.textContent = 'Chúc mọi người may mắn ^^';
    winnerSection.style.display = 'none';
}

function resetDigitDisplay() {
    for (let i = 0; i < 8; i++) {
        const digitBox = document.getElementById(`digit${i}`);
        digitBox.textContent = '0';
        digitBox.classList.remove('revealed');
    }
}

// ===== DISPLAY WINNER =====
function displayWinner(winner) {
    winnerCode.textContent = winner.code;
    winnerName.textContent = winner.name;
    winnerSection.style.display = 'block';
    
    // Add animation
    winnerSection.style.animation = 'none';
    setTimeout(() => {
        winnerSection.style.animation = 'slideInUp 0.5s ease';
    }, 10);
}

function displayMultipleWinnersSpecial(winners) {
    console.log('displayMultipleWinnersSpecial called with:', winners.length, 'winners');
    
    // Hide main content
    const container = document.querySelector('.container');
    const footer = document.querySelector('.footer');
    if (container) container.style.display = 'none';
    if (footer) footer.style.display = 'none';
    
    // Divide winners into 4 groups: 10, 10, 10, 12
    const group1 = winners.slice(0, 10);
    const group2 = winners.slice(10, 20);
    const group3 = winners.slice(20, 30);
    const group4 = winners.slice(30, 42);
    
    // Create full screen display with 4 groups
    const fullScreenHTML = `
        <div class="multiple-winners-fullscreen" id="multipleWinnersFullscreen">
            <div class="fullscreen-header">
                <h1 class="fullscreen-title">🎉 CHÚC MỪNG ${winners.length} NGƯỜI MAY MẮN 🎉</h1>
                <p class="fullscreen-subtitle">GIẢI THỊNH VƯỢNG</p>
                <button class="fullscreen-close-btn" id="closeFullscreenBtn">✕ ĐÓNG</button>
            </div>
            <div class="fullscreen-winners-container">
                <div class="winner-group">
                    <h3 class="group-title">🏆 NHÓM 1</h3>
                    <div class="fullscreen-winners-grid">
                        ${group1.map((winner, index) => `
                            <div class="fullscreen-winner-item" style="animation-delay: ${index * 0.05}s">
                                <span class="winner-number">${index + 1}</span>
                                <span class="winner-code">${winner.code}<br>${winner.name}</span>
                            </div>
                        `).join('')}
                    </div>
                </div>
                <div class="winner-group">
                    <h3 class="group-title">🏆 NHÓM 2</h3>
                    <div class="fullscreen-winners-grid">
                        ${group2.map((winner, index) => `
                            <div class="fullscreen-winner-item" style="animation-delay: ${index * 0.05}s">
                                <span class="winner-number">${index + 11}</span>
                                <span class="winner-code">${winner.code}<br>${winner.name}</span>
                            </div>
                        `).join('')}
                    </div>
                </div>
                <div class="winner-group">
                    <h3 class="group-title">🏆 NHÓM 3</h3>
                    <div class="fullscreen-winners-grid">
                        ${group3.map((winner, index) => `
                            <div class="fullscreen-winner-item" style="animation-delay: ${index * 0.05}s">
                                <span class="winner-number">${index + 21}</span>
                                <span class="winner-code">${winner.code}<br>${winner.name}</span>
                            </div>
                        `).join('')}
                    </div>
                </div>
                <div class="winner-group">
                    <h3 class="group-title">🏆 NHÓM 4</h3>
                    <div class="fullscreen-winners-grid">
                        ${group4.map((winner, index) => `
                            <div class="fullscreen-winner-item" style="animation-delay: ${index * 0.05}s">
                                <span class="winner-number">${index + 31}</span>
                                <span class="winner-code">${winner.code}<br>${winner.name}</span>
                            </div>
                        `).join('')}
                    </div>
                </div>
            </div>
        </div>
    `;
    
    console.log('Adding fullscreen HTML to body');
    
    // Add to body
    document.body.insertAdjacentHTML('beforeend', fullScreenHTML);
    
    // Show with animation immediately
    setTimeout(() => {
        const fullscreen = document.getElementById('multipleWinnersFullscreen');
        if (fullscreen) {
            console.log('Adding active class to fullscreen');
            fullscreen.classList.add('active');
            
            // Add close button functionality
            const closeBtn = document.getElementById('closeFullscreenBtn');
            if (closeBtn) {
                closeBtn.addEventListener('click', closeMultipleWinnersFullscreen);
            }
            
            // Also close on Escape key
            document.addEventListener('keydown', function escHandler(e) {
                if (e.code === 'Escape') {
                    closeMultipleWinnersFullscreen();
                    document.removeEventListener('keydown', escHandler);
                }
            });
            
            // Play enhanced sound for multiple winners
            playWinSound();
            
            // Launch enhanced fireworks
            launchMultipleFireworks();
        } else {
            console.error('Fullscreen element not found!');
        }
    }, 100);
    
    // Update wheel display to show number of winners
    resetDigitDisplay();
    displayName.textContent = `TRÚNG GIẢI THỊNH VƯỢNG`;
}

function displayMultipleWinnersFirst(winners) {
    console.log('displayMultipleWinnersFirst called with:', winners.length, 'winners');
    
    // Hide main content
    const container = document.querySelector('.container');
    const footer = document.querySelector('.footer');
    if (container) container.style.display = 'none';
    if (footer) footer.style.display = 'none';
    
    // Create full screen display for 10 winners
    const fullScreenHTML = `
        <div class="multiple-winners-fullscreen" id="multipleWinnersFullscreen">
            <div class="fullscreen-header">
                <h1 class="fullscreen-title">🎉 CHÚC MỪNG ${winners.length} NGƯỜI MAY MẮN 🎉</h1>
                <p class="fullscreen-subtitle">GIẢI HẠNH PHÚC</p>
                <button class="fullscreen-close-btn" id="closeFullscreenBtn">✕ ĐÓNG</button>
            </div>
            <div class="fullscreen-winners-container">
                <div class="winner-group">
                    <h3 class="group-title">🥇 DANH SÁCH TRÚNG GIẢI</h3>
                    <div class="fullscreen-winners-grid">
                        ${winners.map((winner, index) => `
                            <div class="fullscreen-winner-item" style="animation-delay: ${index * 0.05}s">
                                <span class="winner-number">${index + 1}</span>
                                <span class="winner-code">${winner.code}<br>${winner.name}</span>
                            </div>
                        `).join('')}
                    </div>
                </div>
            </div>
        </div>
    `;
    
    console.log('Adding fullscreen HTML to body');
    
    // Add to body
    document.body.insertAdjacentHTML('beforeend', fullScreenHTML);
    
    // Show with animation immediately
    setTimeout(() => {
        const fullscreen = document.getElementById('multipleWinnersFullscreen');
        if (fullscreen) {
            console.log('Adding active class to fullscreen');
            fullscreen.classList.add('active');
            
            // Add close button functionality
            const closeBtn = document.getElementById('closeFullscreenBtn');
            if (closeBtn) {
                closeBtn.addEventListener('click', closeMultipleWinnersFullscreen);
            }
            
            // Also close on Escape key
            document.addEventListener('keydown', function escHandler(e) {
                if (e.code === 'Escape') {
                    closeMultipleWinnersFullscreen();
                    document.removeEventListener('keydown', escHandler);
                }
            });
            
            // Play enhanced sound for multiple winners
            playWinSound();
            
            // Launch enhanced fireworks
            launchMultipleFireworks();
        } else {
            console.error('Fullscreen element not found!');
        }
    }, 100);
    
    // Update wheel display to show number of winners
    resetDigitDisplay();
    displayName.textContent = `TRÚNG GIẢI HẠNH PHÚC`;
}

function displayMultipleWinnersSecond(winners) {
    console.log('displayMultipleWinnersSecond called with:', winners.length, 'winners');
    
    // Hide main content
    const container = document.querySelector('.container');
    const footer = document.querySelector('.footer');
    if (container) container.style.display = 'none';
    if (footer) footer.style.display = 'none';
    
    // Create full screen display for 10 winners
    const fullScreenHTML = `
        <div class="multiple-winners-fullscreen" id="multipleWinnersFullscreen">
            <div class="fullscreen-header">
                <h1 class="fullscreen-title">🎉 CHÚC MỪNG ${winners.length} NGƯỜI MAY MẮN 🎉</h1>
                <p class="fullscreen-subtitle">GIẢI BÌNH AN</p>
                <button class="fullscreen-close-btn" id="closeFullscreenBtn">✕ ĐÓNG</button>
            </div>
            <div class="fullscreen-winners-container">
                <div class="winner-group">
                    <h3 class="group-title">🥈 DANH SÁCH TRÚNG GIẢI</h3>
                    <div class="fullscreen-winners-grid">
                        ${winners.map((winner, index) => `
                            <div class="fullscreen-winner-item" style="animation-delay: ${index * 0.05}s">
                                <span class="winner-number">${index + 1}</span>
                                <span class="winner-code">${winner.code}<br>${winner.name}</span>
                            </div>
                        `).join('')}
                    </div>
                </div>
            </div>
        </div>
    `;
    
    console.log('Adding fullscreen HTML to body');
    
    // Add to body
    document.body.insertAdjacentHTML('beforeend', fullScreenHTML);
    
    // Show with animation immediately
    setTimeout(() => {
        const fullscreen = document.getElementById('multipleWinnersFullscreen');
        if (fullscreen) {
            console.log('Adding active class to fullscreen');
            fullscreen.classList.add('active');
            
            // Add close button functionality
            const closeBtn = document.getElementById('closeFullscreenBtn');
            if (closeBtn) {
                closeBtn.addEventListener('click', closeMultipleWinnersFullscreen);
            }
            
            // Also close on Escape key
            document.addEventListener('keydown', function escHandler(e) {
                if (e.code === 'Escape') {
                    closeMultipleWinnersFullscreen();
                    document.removeEventListener('keydown', escHandler);
                }
            });
            
            // Play enhanced sound for multiple winners
            playWinSound();
            
            // Launch enhanced fireworks
            launchMultipleFireworks();
        } else {
            console.error('Fullscreen element not found!');
        }
    }, 100);
    
    // Update wheel display to show number of winners
    resetDigitDisplay();
    displayName.textContent = `TRÚNG GIẢI BÌNH AN`;
}

function displayMultipleWinnersThird(winners) {
    console.log('displayMultipleWinnersThird called with:', winners.length, 'winners');
    
    // Hide main content
    const container = document.querySelector('.container');
    const footer = document.querySelector('.footer');
    if (container) container.style.display = 'none';
    if (footer) footer.style.display = 'none';
    
    // Divide winners into 4 groups: 10, 10, 10, 12
    const group1 = winners.slice(0, 10);
    const group2 = winners.slice(10, 20);
    const group3 = winners.slice(20, 30);
    const group4 = winners.slice(30, 42);
    
    // Create full screen display with 4 groups
    const fullScreenHTML = `
        <div class="multiple-winners-fullscreen" id="multipleWinnersFullscreen">
            <div class="fullscreen-header">
                <h1 class="fullscreen-title">🎉 CHÚC MỪNG ${winners.length} NGƯỜI MAY MẮN 🎉</h1>
                <p class="fullscreen-subtitle">GIẢI CỘNG ĐỒNG</p>
                <button class="fullscreen-close-btn" id="closeFullscreenBtn">✕ ĐÓNG</button>
            </div>
            <div class="fullscreen-winners-container">
                <div class="winner-group">
                    <h3 class="group-title">🥉 NHÓM 1</h3>
                    <div class="fullscreen-winners-grid">
                        ${group1.map((winner, index) => `
                            <div class="fullscreen-winner-item" style="animation-delay: ${index * 0.05}s">
                                <span class="winner-number">${index + 1}</span>
                                <span class="winner-code">${winner.code}<br>${winner.name}</span>
                            </div>
                        `).join('')}
                    </div>
                </div>
                <div class="winner-group">
                    <h3 class="group-title">🥉 NHÓM 2</h3>
                    <div class="fullscreen-winners-grid">
                        ${group2.map((winner, index) => `
                            <div class="fullscreen-winner-item" style="animation-delay: ${index * 0.05}s">
                                <span class="winner-number">${index + 11}</span>
                                <span class="winner-code">${winner.code}<br>${winner.name}</span>
                            </div>
                        `).join('')}
                    </div>
                </div>
                <div class="winner-group">
                    <h3 class="group-title">🥉 NHÓM 3</h3>
                    <div class="fullscreen-winners-grid">
                        ${group3.map((winner, index) => `
                            <div class="fullscreen-winner-item" style="animation-delay: ${index * 0.05}s">
                                <span class="winner-number">${index + 21}</span>
                                <span class="winner-code">${winner.code}<br>${winner.name}</span>
                            </div>
                        `).join('')}
                    </div>
                </div>
                <div class="winner-group">
                    <h3 class="group-title">🥉 NHÓM 4</h3>
                    <div class="fullscreen-winners-grid">
                        ${group4.map((winner, index) => `
                            <div class="fullscreen-winner-item" style="animation-delay: ${index * 0.05}s">
                                <span class="winner-number">${index + 31}</span>
                                <span class="winner-code">${winner.code}<br>${winner.name}</span>
                            </div>
                        `).join('')}
                    </div>
                </div>
            </div>
        </div>
    `;
    
    console.log('Adding fullscreen HTML to body');
    
    // Add to body
    document.body.insertAdjacentHTML('beforeend', fullScreenHTML);
    
    // Show with animation immediately
    setTimeout(() => {
        const fullscreen = document.getElementById('multipleWinnersFullscreen');
        if (fullscreen) {
            console.log('Adding active class to fullscreen');
            fullscreen.classList.add('active');
            
            // Add close button functionality
            const closeBtn = document.getElementById('closeFullscreenBtn');
            if (closeBtn) {
                closeBtn.addEventListener('click', closeMultipleWinnersFullscreen);
            }
            
            // Also close on Escape key
            document.addEventListener('keydown', function escHandler(e) {
                if (e.code === 'Escape') {
                    closeMultipleWinnersFullscreen();
                    document.removeEventListener('keydown', escHandler);
                }
            });
            
            // Play enhanced sound for multiple winners
            playWinSound();
            
            // Launch enhanced fireworks
            launchMultipleFireworks();
        } else {
            console.error('Fullscreen element not found!');
        }
    }, 100);
    
    // Update wheel display to show number of winners
    resetDigitDisplay();
    displayName.textContent = `TRÚNG GIẢI CỘNG ĐỒNG`;
}

function displayMultipleWinners(winners) {
    console.log('displayMultipleWinners called with:', winners.length, 'winners');
    
    // Hide main content
    const container = document.querySelector('.container');
    const footer = document.querySelector('.footer');
    if (container) container.style.display = 'none';
    if (footer) footer.style.display = 'none';
    
    // Divide winners into 3 groups of 10 each
    const group1 = winners.slice(0, 10);
    const group2 = winners.slice(10, 20);
    const group3 = winners.slice(20, 30);
    
    // Create full screen display with 3 groups
    const fullScreenHTML = `
        <div class="multiple-winners-fullscreen" id="multipleWinnersFullscreen">
            <div class="fullscreen-header">
                <h1 class="fullscreen-title">🎉 CHÚC MỪNG ${winners.length} NGƯỜI MAY MẮN 🎉</h1>
                <p class="fullscreen-subtitle">GIẢI KHUYẾN KHÍCH</p>
                <button class="fullscreen-close-btn" id="closeFullscreenBtn">✕ ĐÓNG</button>
            </div>
            <div class="fullscreen-winners-container">
                <div class="winner-group">
                    <h3 class="group-title">🎁 NHÓM 1</h3>
                    <div class="fullscreen-winners-grid">
                        ${group1.map((winner, index) => `
                            <div class="fullscreen-winner-item" style="animation-delay: ${index * 0.05}s">
                                <span class="winner-number">${index + 1}</span>
                                <span class="winner-code">${winner.code}<br>${winner.name}</span>
                            </div>
                        `).join('')}
                    </div>
                </div>
                <div class="winner-group">
                    <h3 class="group-title">🎁 NHÓM 2</h3>
                    <div class="fullscreen-winners-grid">
                        ${group2.map((winner, index) => `
                            <div class="fullscreen-winner-item" style="animation-delay: ${index * 0.05}s">
                                <span class="winner-number">${index + 11}</span>
                                <span class="winner-code">${winner.code}<br>${winner.name}</span>
                            </div>
                        `).join('')}
                    </div>
                </div>
                <div class="winner-group">
                    <h3 class="group-title">🎁 NHÓM 3</h3>
                    <div class="fullscreen-winners-grid">
                        ${group3.map((winner, index) => `
                            <div class="fullscreen-winner-item" style="animation-delay: ${index * 0.05}s">
                                <span class="winner-number">${index + 21}</span>
                                <span class="winner-code">${winner.code}<br>${winner.name}</span>
                            </div>
                        `).join('')}
                    </div>
                </div>
            </div>
        </div>
    `;
    
    console.log('Adding fullscreen HTML to body');
    
    // Add to body
    document.body.insertAdjacentHTML('beforeend', fullScreenHTML);
    
    // Show with animation immediately
    setTimeout(() => {
        const fullscreen = document.getElementById('multipleWinnersFullscreen');
        if (fullscreen) {
            console.log('Adding active class to fullscreen');
            fullscreen.classList.add('active');
            
            // Add close button functionality
            const closeBtn = document.getElementById('closeFullscreenBtn');
            if (closeBtn) {
                closeBtn.addEventListener('click', closeMultipleWinnersFullscreen);
            }
            
            // Also close on Escape key
            document.addEventListener('keydown', function escHandler(e) {
                if (e.code === 'Escape') {
                    closeMultipleWinnersFullscreen();
                    document.removeEventListener('keydown', escHandler);
                }
            });
            
            // Play enhanced sound for multiple winners
            playWinSound();
            
            // Launch enhanced fireworks
            launchMultipleFireworks();
        } else {
            console.error('Fullscreen element not found!');
        }
    }, 100);
    
    // Update wheel display to show number of winners
    resetDigitDisplay();
    displayName.textContent = `TRÚNG GIẢI KHUYẾN KHÍCH`;
}

function closeMultipleWinnersFullscreen() {
    const fullscreen = document.getElementById('multipleWinnersFullscreen');
    if (fullscreen) {
        fullscreen.classList.remove('active');
        setTimeout(() => {
            document.body.removeChild(fullscreen);
            // Show main content again
            const container = document.querySelector('.container');
            const footer = document.querySelector('.footer');
            if (container) container.style.display = 'block';
            if (footer) footer.style.display = 'block';
        }, 300);
    }
}

// ===== WINNERS MANAGEMENT =====
function addToWinners(winner) {
    const winnerData = {
        ...winner,
        prize: selectedPrize,
        prizeName: prizeConfig[selectedPrize].name,
        prizeIcon: prizeConfig[selectedPrize].icon,
        timestamp: new Date().toISOString(),
        id: Date.now()
    };
    
    winners.unshift(winnerData);
    
    // Update prize count
    updatePrizeCount(selectedPrize);
}

// ===== LOCAL STORAGE =====
function saveWinnersToStorage() {
    try {
        localStorage.setItem('luckyDrawWinners', JSON.stringify(winners));
    } catch (e) {
        console.error('Error saving to localStorage:', e);
    }
}

function loadWinnersFromStorage() {
    try {
        const stored = localStorage.getItem('luckyDrawWinners');
        if (stored) {
            winners = JSON.parse(stored);
        }
    } catch (e) {
        console.error('Error loading from localStorage:', e);
        winners = [];
    }
}

function clearHistory() {
    if (confirm('Bạn có chắc chắn muốn xóa toàn bộ lịch sử?')) {
        winners = [];
        saveWinnersToStorage();
        initializeEmployees();
        initializeGuests();
        updateStatistics();
        updateHistoryDisplay();
        resetSpin();
        showMessage('Đã xóa lịch sử!');
    }
}

// ===== UPDATE UI =====
function updateStatistics() {
    const totalParticipants = employees.length + guests.length;
    const totalAvailable = availableEmployees.length + availableGuests.length;
    
    totalEmployees.textContent = totalParticipants;
    remainingEmployees.textContent = totalAvailable;
    winnerCount.textContent = winners.length;
    
    // Update prize counts
    updateAllPrizeCounts();
}

function updateHistoryDisplay() {
    if (winners.length === 0) {
        historyList.innerHTML = '<div class="history-empty">Chưa có ai trúng giải</div>';
        return;
    }
    
    const historyHTML = winners.slice(0, 10).map(winner => {
        const date = new Date(winner.timestamp);
        const timeString = date.toLocaleString('vi-VN', {
            hour: '2-digit',
            minute: '2-digit',
            day: '2-digit',
            month: '2-digit'
        });
        
        const prizeIcon = winner.prizeIcon || '🎁';
        const prizeName = winner.prizeName || 'Giải thưởng';
        
        return `
            <div class="history-item">
                <div class="history-info">
                    <div class="history-prize">${prizeIcon} ${prizeName}</div>
                    <div class="history-code">${winner.code}</div>
                    <div class="history-name">${winner.name}</div>
                </div>
                <div class="history-time">${timeString}</div>
            </div>
        `;
    }).join('');
    
    historyList.innerHTML = historyHTML;
}

function updatePrizeCount(prizeType) {
    const countElement = document.getElementById(`${prizeType}Count`);
    if (countElement) {
        const count = winners.filter(w => w.prize === prizeType).length;
        countElement.textContent = count;
    }
}

function updateAllPrizeCounts() {
    Object.keys(prizeConfig).forEach(prizeType => {
        updatePrizeCount(prizeType);
    });
}

// ===== FIREWORKS =====
function initializeFireworks() {
    const canvas = fireworksCanvas;
    const ctx = canvas.getContext('2d');
    
    function resizeCanvas() {
        canvas.width = window.innerWidth;
        canvas.height = window.innerHeight;
    }
    
    resizeCanvas();
    window.addEventListener('resize', resizeCanvas);
}

function launchFireworks() {
    const canvas = fireworksCanvas;
    const ctx = canvas.getContext('2d');
    const particles = [];
    const fireworks = [];
    
    class Particle {
        constructor(x, y, color, velocity) {
            this.x = x;
            this.y = y;
            this.color = color;
            this.velocity = velocity;
            this.alpha = 1;
            this.decay = Math.random() * 0.02 + 0.01;
        }
        
        update() {
            this.velocity.x *= 0.99;
            this.velocity.y *= 0.99;
            this.velocity.y += 0.1;
            this.x += this.velocity.x;
            this.y += this.velocity.y;
            this.alpha -= this.decay;
        }
        
        draw() {
            ctx.save();
            ctx.globalAlpha = this.alpha;
            ctx.fillStyle = this.color;
            ctx.beginPath();
            ctx.arc(this.x, this.y, 2, 0, Math.PI * 2);
            ctx.fill();
            ctx.restore();
        }
    }
    
    class Firework {
        constructor(x, y, targetY, color) {
            this.x = x;
            this.y = y;
            this.targetY = targetY;
            this.color = color;
            this.velocity = { x: 0, y: -Math.random() * 3 - 12 };
            this.trail = [];
            this.exploded = false;
        }
        
        update() {
            if (!this.exploded) {
                this.velocity.y += 0.3;
                this.y += this.velocity.y;
                
                this.trail.push({ x: this.x, y: this.y });
                if (this.trail.length > 10) {
                    this.trail.shift();
                }
                
                if (this.velocity.y >= 0 || this.y <= this.targetY) {
                    this.explode();
                }
            }
        }
        
        explode() {
            this.exploded = true;
            const particleCount = Math.random() * 50 + 50;
            
            for (let i = 0; i < particleCount; i++) {
                const angle = (Math.PI * 2 / particleCount) * i;
                const velocity = Math.random() * 5 + 2;
                
                particles.push(new Particle(
                    this.x,
                    this.y,
                    this.color,
                    {
                        x: Math.cos(angle) * velocity,
                        y: Math.sin(angle) * velocity
                    }
                ));
            }
        }
        
        draw() {
            if (!this.exploded) {
                ctx.fillStyle = this.color;
                ctx.beginPath();
                ctx.arc(this.x, this.y, 3, 0, Math.PI * 2);
                ctx.fill();
                
                // Draw trail
                this.trail.forEach((point, index) => {
                    ctx.save();
                    ctx.globalAlpha = index / this.trail.length * 0.5;
                    ctx.fillStyle = this.color;
                    ctx.beginPath();
                    ctx.arc(point.x, point.y, 2, 0, Math.PI * 2);
                    ctx.fill();
                    ctx.restore();
                });
            }
        }
    }
    
    // Create multiple fireworks
    const colors = ['#00d4ff', '#9d50bb', '#ff006e', '#ffff00', '#00ff00'];
    
    for (let i = 0; i < 5; i++) {
        setTimeout(() => {
            const x = Math.random() * canvas.width;
            const targetY = Math.random() * canvas.height * 0.5;
            const color = colors[Math.floor(Math.random() * colors.length)];
            
            fireworks.push(new Firework(x, canvas.height, targetY, color));
        }, i * 200);
    }
    
    // Animation loop
    function animate() {
        ctx.fillStyle = 'rgba(0, 0, 0, 0.1)';
        ctx.fillRect(0, 0, canvas.width, canvas.height);
        
        // Update and draw fireworks
        for (let i = fireworks.length - 1; i >= 0; i--) {
            fireworks[i].update();
            fireworks[i].draw();
            
            if (fireworks[i].exploded) {
                fireworks.splice(i, 1);
            }
        }
        
        // Update and draw particles
        for (let i = particles.length - 1; i >= 0; i--) {
            particles[i].update();
            particles[i].draw();
            
            if (particles[i].alpha <= 0) {
                particles.splice(i, 1);
            }
        }
        
        if (fireworks.length > 0 || particles.length > 0) {
            requestAnimationFrame(animate);
        } else {
            ctx.clearRect(0, 0, canvas.width, canvas.height);
        }
    }
    
    animate();
}

function launchMultipleFireworks() {
    const canvas = fireworksCanvas;
    const ctx = canvas.getContext('2d');
    const particles = [];
    const fireworks = [];
    
    class Particle {
        constructor(x, y, color, velocity) {
            this.x = x;
            this.y = y;
            this.color = color;
            this.velocity = velocity;
            this.alpha = 1;
            this.decay = Math.random() * 0.02 + 0.01;
        }
        
        update() {
            this.velocity.x *= 0.99;
            this.velocity.y *= 0.99;
            this.velocity.y += 0.1;
            this.x += this.velocity.x;
            this.y += this.velocity.y;
            this.alpha -= this.decay;
        }
        
        draw() {
            ctx.save();
            ctx.globalAlpha = this.alpha;
            ctx.fillStyle = this.color;
            ctx.beginPath();
            ctx.arc(this.x, this.y, 3, 0, Math.PI * 2);
            ctx.fill();
            ctx.restore();
        }
    }
    
    class Firework {
        constructor(x, y, targetY, color) {
            this.x = x;
            this.y = y;
            this.targetY = targetY;
            this.color = color;
            this.velocity = { x: 0, y: -Math.random() * 3 - 15 };
            this.trail = [];
            this.exploded = false;
        }
        
        update() {
            if (!this.exploded) {
                this.velocity.y += 0.3;
                this.y += this.velocity.y;
                
                this.trail.push({ x: this.x, y: this.y });
                if (this.trail.length > 15) {
                    this.trail.shift();
                }
                
                if (this.velocity.y >= 0 || this.y <= this.targetY) {
                    this.explode();
                }
            }
        }
        
        explode() {
            this.exploded = true;
            const particleCount = Math.random() * 80 + 80; // More particles for multiple winners
            
            for (let i = 0; i < particleCount; i++) {
                const angle = (Math.PI * 2 / particleCount) * i;
                const velocity = Math.random() * 8 + 4; // Faster velocity
                
                particles.push(new Particle(
                    this.x,
                    this.y,
                    this.color,
                    {
                        x: Math.cos(angle) * velocity,
                        y: Math.sin(angle) * velocity
                    }
                ));
            }
        }
        
        draw() {
            if (!this.exploded) {
                ctx.fillStyle = this.color;
                ctx.beginPath();
                ctx.arc(this.x, this.y, 4, 0, Math.PI * 2);
                ctx.fill();
                
                // Draw enhanced trail
                this.trail.forEach((point, index) => {
                    ctx.save();
                    ctx.globalAlpha = index / this.trail.length * 0.7;
                    ctx.fillStyle = this.color;
                    ctx.beginPath();
                    ctx.arc(point.x, point.y, 3, 0, Math.PI * 2);
                    ctx.fill();
                    ctx.restore();
                });
            }
        }
    }
    
    // Create enhanced multiple fireworks for 30 winners
    const colors = ['#00d4ff', '#9d50bb', '#ff006e', '#ffff00', '#00ff00', '#FFD700', '#FFA500'];
    
    // Launch 15 fireworks instead of 5 for multiple winners
    for (let i = 0; i < 15; i++) {
        setTimeout(() => {
            const x = Math.random() * canvas.width;
            const targetY = Math.random() * canvas.height * 0.4;
            const color = colors[Math.floor(Math.random() * colors.length)];
            
            fireworks.push(new Firework(x, canvas.height, targetY, color));
        }, i * 150);
    }
    
    // Animation loop
    function animate() {
        ctx.fillStyle = 'rgba(0, 0, 0, 0.1)';
        ctx.fillRect(0, 0, canvas.width, canvas.height);
        
        // Update and draw fireworks
        for (let i = fireworks.length - 1; i >= 0; i--) {
            fireworks[i].update();
            fireworks[i].draw();
            
            if (fireworks[i].exploded) {
                fireworks.splice(i, 1);
            }
        }
        
        // Update and draw particles
        for (let i = particles.length - 1; i >= 0; i--) {
            particles[i].update();
            particles[i].draw();
            
            if (particles[i].alpha <= 0) {
                particles.splice(i, 1);
            }
        }
        
        if (fireworks.length > 0 || particles.length > 0) {
            requestAnimationFrame(animate);
        } else {
            ctx.clearRect(0, 0, canvas.width, canvas.height);
        }
    }
    
    animate();
}

// ===== SOUND EFFECTS =====
function playWinSound() {
    try {
        // Create a simple win sound using Web Audio API
        const audioContext = new (window.AudioContext || window.webkitAudioContext)();
        const oscillator = audioContext.createOscillator();
        const gainNode = audioContext.createGain();
        
        oscillator.connect(gainNode);
        gainNode.connect(audioContext.destination);
        
        oscillator.frequency.setValueAtTime(523.25, audioContext.currentTime); // C5
        oscillator.frequency.setValueAtTime(659.25, audioContext.currentTime + 0.1); // E5
        oscillator.frequency.setValueAtTime(783.99, audioContext.currentTime + 0.2); // G5
        
        gainNode.gain.setValueAtTime(0.3, audioContext.currentTime);
        gainNode.gain.exponentialRampToValueAtTime(0.01, audioContext.currentTime + 0.5);
        
        oscillator.start(audioContext.currentTime);
        oscillator.stop(audioContext.currentTime + 0.5);
    } catch (e) {
        console.log('Audio not supported');
    }
}

// ===== UTILITY FUNCTIONS =====
function showMessage(message) {
    // Create a toast message
    const toast = document.createElement('div');
    toast.className = 'toast-message';
    toast.textContent = message;
    toast.style.cssText = `
        position: fixed;
        top: 20px;
        right: 20px;
        background: rgba(0, 0, 0, 0.8);
        color: white;
        padding: 15px 20px;
        border-radius: 10px;
        z-index: 10000;
        animation: slideInRight 0.3s ease;
    `;
    
    document.body.appendChild(toast);
    
    setTimeout(() => {
        toast.style.animation = 'slideOutRight 0.3s ease';
        setTimeout(() => {
            document.body.removeChild(toast);
        }, 300);
    }, 3000);
}

// ===== KEYBOARD HELP =====
function showKeyboardHelp() {
    const helpText = `
    Phím tắt:
    Space - Bắt đầu quay số
    Esc - Dừng quay số
    Ctrl+R - Xóa lịch sử
    `;
    console.log(helpText);
}

// Add CSS for toast animations
const style = document.createElement('style');
style.textContent = `
    @keyframes slideOutRight {
        to {
            transform: translateX(100%);
            opacity: 0;
        }
    }
`;
document.head.appendChild(style);

// ===== MOBILE MENU =====
function initializeMobileMenu() {
    const mobileMenuBtn = document.getElementById('mobileMenuBtn');
    const mobileMenu = document.getElementById('mobileMenu');
    const mobileSoundToggle = document.getElementById('mobileSoundToggle');
    const mobileFullscreenBtn = document.getElementById('mobileFullscreenBtn');
    const mobileHelpBtn = document.getElementById('mobileHelpBtn');
    
    if (!mobileMenuBtn || !mobileMenu) return;
    
    // Toggle menu
    mobileMenuBtn.addEventListener('click', function() {
        mobileMenuBtn.classList.toggle('active');
        mobileMenu.classList.toggle('active');
    });
    
    // Close menu when clicking outside
    document.addEventListener('click', function(e) {
        if (!mobileMenu.contains(e.target) && !mobileMenuBtn.contains(e.target)) {
            mobileMenuBtn.classList.remove('active');
            mobileMenu.classList.remove('active');
        }
    });
    
    // Sound toggle
    if (mobileSoundToggle) {
        mobileSoundToggle.addEventListener('click', function() {
            const backgroundMusic = document.getElementById('backgroundMusic');
            if (backgroundMusic) {
                if (backgroundMusic.paused) {
                    backgroundMusic.play();
                    mobileSoundToggle.textContent = '🔊 Nhạc nền';
                    showMessage('Đã bật nhạc nền');
                } else {
                    backgroundMusic.pause();
                    mobileSoundToggle.textContent = '🔇 Tắt nhạc';
                    showMessage('Đã tắt nhạc nền');
                }
            }
            // Close menu
            mobileMenuBtn.classList.remove('active');
            mobileMenu.classList.remove('active');
        });
    }
    
    // Fullscreen toggle
    if (mobileFullscreenBtn) {
        mobileFullscreenBtn.addEventListener('click', function() {
            if (!document.fullscreenElement) {
                document.documentElement.requestFullscreen().catch(err => {
                    showMessage('Không thể vào chế độ toàn màn hình');
                });
            } else {
                document.exitFullscreen();
            }
            // Close menu
            mobileMenuBtn.classList.remove('active');
            mobileMenu.classList.remove('active');
        });
    }
    
    // Help button
    if (mobileHelpBtn) {
        mobileHelpBtn.addEventListener('click', function() {
            const helpText = `
🎮 HƯỚNG DẪN SỬ DỤNG

1. Chọn giải thưởng muốn quay
2. Nhấn "BẮT ĐẦU QUAY" để bắt đầu
3. Chờ đợi kết quả

⌨️ Phím tắt:
• Space: Bắt đầu quay
• Esc: Đóng màn hình
• Ctrl+R: Xóa lịch sử

📱 Chế độ toàn màn hình:
Nhấn nút ⛶ trong menu để trải nghiệm tốt hơn
            `;
            alert(helpText);
            // Close menu
            mobileMenuBtn.classList.remove('active');
            mobileMenu.classList.remove('active');
        });
    }
}

// Initialize keyboard help
showKeyboardHelp();
