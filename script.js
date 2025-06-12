// Firebase SDKs
import { initializeApp } from "https://www.gstatic.com/firebasejs/11.6.1/firebase-app.js";
import { 
    getAuth, 
    createUserWithEmailAndPassword, 
    signInWithEmailAndPassword, 
    signOut, 
    onAuthStateChanged 
} from "https://www.gstatic.com/firebasejs/11.6.1/firebase-auth.js";
import { getFirestore, doc, setDoc, getDoc, onSnapshot } from "https://www.gstatic.com/firebasejs/11.6.1/firebase-firestore.js";

// initialWords는 이제 words.js에서 전역적으로 제공

// 실제 나의 Firebase 콘솔의 Firebase 구성
const firebaseConfig = {
  apiKey: "AIzaSyB4ppRGai7vrfE_gerw55PqGdzQcO7DSQc",
  authDomain: "my-vocat-app.firebaseapp.com",
  projectId: "my-vocat-app",
  storageBucket: "my-vocat-app.firebasestorage.app",
  messagingSenderId: "530680658968",
  appId: "1:530680658968:web:5e03dc4ec1a91b4d55576d"
};

// 전역 상태 변수
let db;
let auth;
let userId = null;
let userEmail = null; // 사용자 이메일 저장
let isAuthReady = false; 

let catData = { level: 1, happiness: 50, name: null, lastTestDate: null }; // 이름은 이제 null 허용
let currentQuestionIndex = 0;
let dailyWords = []; 
let incorrectWordsForReview = []; 
let sessionWords = []; 
let testType = 'englishToKorean'; 
let options = [];
let initialTestCorrectCount = 0; 
// 앱 상태: 'loading', 'auth_pending', 'login_register', 'cat_naming', 'initial', 'review', 'round_completed_success', 'ask_to_continue', 'session_ended', 'show_daily_words', 'initial_test_completed_with_errors'
let appState = 'loading'; 
let resultMessage = ''; 
let isLoading = true; 
let canTakeTest = false; 

let feedback = null; 

const TEST_WORD_COUNT = 10;
const CAT_DOC_ID = "myCat"; 
const APP_ID = typeof __app_id !== 'undefined' ? __app_id : 'default-app-id'; // Firestore 경로용


let isFirstReviewPrompt = true; // 첫 오답노트 프롬프트와 이후 프롬프트를 구분하기 위한 플래그
let showLevelUpSpeechBubble = false; // 레벨업 말풍선을 표시할 상태
let levelUpSpeechBubbleTimeout = null; // 말풍선을 숨기기 위한 타임아웃 ID


// DOM 요소 참조
let initialLoadingSpinner;
let authSection;
let emailInput;
let passwordInput;
let authErrorMessage;
let loginButton;
let registerButton;
let catNamingSection;
let catNameInput;
let namingErrorMessage;
let saveCatNameButton;
let mainAppContent;
let userEmailDisplay;
let logoutButton;
let catImageContainer; 
let catImage; 
let levelUpSpeechBubble;
let catNameLevel;
let happinessBar;
let happinessText;
let testProgress;
let questionPrompt;
let displayQuestionElem;
let optionsArea;
let questionArea; 
let feedbackArea;
let feedbackMessage;
let correctAnswerDisplay;
let nextButton;
let statusMessageArea;
let statusMessage;
let reviewWordsButton; 

let modalBackdrop;
let modalTitle;
let modalMessage;
let modalPrimaryAction;
let modalClose;


// 문서가 로드된 후 DOM 요소를 가져오는 함수
function getDOMElements() {
    initialLoadingSpinner = document.getElementById('initial-loading-spinner');
    authSection = document.getElementById('auth-section');
    emailInput = document.getElementById('email-input');
    passwordInput = document.getElementById('password-input');
    authErrorMessage = document.getElementById('auth-error-message');
    loginButton = document.getElementById('login-button');
    registerButton = document.getElementById('register-button');
    catNamingSection = document.getElementById('cat-naming-section');
    catNameInput = document.getElementById('cat-name-input');
    namingErrorMessage = document.getElementById('naming-error-message');
    saveCatNameButton = document.getElementById('save-cat-name-button');
    mainAppContent = document.getElementById('main-app-content');
    userEmailDisplay = document.getElementById('user-email-display');
    logoutButton = document.getElementById('logout-button');
    catImageContainer = document.getElementById('cat-image-container'); 
    catImage = document.getElementById('cat-image'); 
    levelUpSpeechBubble = document.getElementById('level-up-speech-bubble'); 
    catNameLevel = document.getElementById('cat-name-level');
    happinessBar = document.getElementById('happiness-bar');
    happinessText = document.getElementById('happiness-text');
    testProgress = document.getElementById('test-progress');
    questionPrompt = document.getElementById('question-prompt');
    displayQuestionElem = document.getElementById('display-question');
    optionsArea = document.getElementById('options-area');
    questionArea = document.getElementById('question-area');
    feedbackArea = document.getElementById('feedback-area');
    feedbackMessage = document.getElementById('feedback-message');
    correctAnswerDisplay = document.getElementById('correct-answer-display');
    nextButton = document.getElementById('next-button');
    statusMessageArea = document.getElementById('status-message-area');
    statusMessage = document.getElementById('status-message');
    reviewWordsButton = document.getElementById('review-words-button'); 

    modalBackdrop = document.getElementById('modal-backdrop');
    modalTitle = document.getElementById('modal-title');
    modalMessage = document.getElementById('modal-message');
    modalPrimaryAction = document.getElementById('modal-primary-action');
    modalClose = document.getElementById('modal-close');

    const requiredElements = {
        'initialLoadingSpinner': initialLoadingSpinner, 'authSection': authSection, 'emailInput': emailInput, 
        'passwordInput': passwordInput, 'authErrorMessage': authErrorMessage, 'loginButton': loginButton, 
        'registerButton': registerButton, 'catNamingSection': catNamingSection, 'catNameInput': catNameInput,
        'namingErrorMessage': namingErrorMessage, 'saveCatNameButton': saveCatNameButton, 'mainAppContent': mainAppContent,
        'userEmailDisplay': userEmailDisplay, 'logoutButton': logoutButton, 'catImageContainer': catImageContainer,
        'catImage': catImage, 
        'levelUpSpeechBubble': levelUpSpeechBubble, 
        'catNameLevel': catNameLevel, 'happinessBar': happinessBar, 'happinessText': happinessText, 
        'testProgress': testProgress, 'questionPrompt': questionPrompt, 'displayQuestionElem': displayQuestionElem, 
        'optionsArea': optionsArea, 'questionArea': questionArea, 'feedbackArea': feedbackArea, 
        'feedbackMessage': feedbackMessage, 'correctAnswerDisplay': correctAnswerDisplay, 'nextButton': nextButton, 
        'statusMessageArea': statusMessageArea, 'statusMessage': statusMessage, 'reviewWordsButton': reviewWordsButton, 
        'modalBackdrop': modalBackdrop, 'modalTitle': modalTitle, 'modalMessage': modalMessage, 
        'modalPrimaryAction': modalPrimaryAction, 'modalClose': modalClose
    };

    let allElementsFound = true;
    for (const id in requiredElements) {
        if (requiredElements[id] === null) {
            console.error(`오류: ID '${id}'를 가진 필수 DOM 요소를 찾을 수 없습니다. HTML 및 요소 ID를 확인하세요.`);
            allElementsFound = false;
        }
    }

    if (!allElementsFound) {
        document.body.innerHTML = '<div style="color: red; text-align: center; margin-top: 50px; font-size: 24px; padding: 20px;">앱 초기화에 실패했습니다.<br>필요한 화면 구성 요소를 찾을 수 없습니다.<br>HTML 구조와 요소 ID를 확인해주세요.</div>';
        document.body.style.overflow = 'auto'; 
        return false; 
    }
    return true; 
}



function renderCatSection() {
    console.log("냥이 섹션 렌더링 중. 현재 행복도:", catData.happiness, "현재 레벨:", catData.level, "showLevelUpSpeechBubble:", showLevelUpSpeechBubble); // 디버그 로그
    if (catNameLevel && happinessBar && happinessText && catImage) { 
        catNameLevel.textContent = `${catData.name || '냥이'} (Lv.${catData.level})`;
        happinessBar.style.width = `${catData.happiness}%`;
        happinessText.textContent = `행복도: ${catData.happiness}%`;

        // showLevelUpSpeechBubble 플래그에 따라 말풍선 표시/숨기기
        if (levelUpSpeechBubble) {
            if (showLevelUpSpeechBubble) {
                levelUpSpeechBubble.textContent = "Level up!";
                levelUpSpeechBubble.classList.remove('hidden');
                console.log("레벨업 말풍선 표시."); // 디버그 로그
            } else {
                levelUpSpeechBubble.classList.add('hidden');
                console.log("레벨업 말풍선 숨김."); // 디버그 로그
            }
        }
    }
}

function renderTestSection() {
    let currentDisplayQuestion = '';
    let currentQuestionPrompt = '';
    let testProgressText = '';
    let currentWord = null;

    if (questionArea) questionArea.classList.add('hidden');
    if (feedbackArea) feedbackArea.classList.add('hidden');
    if (statusMessageArea) statusMessageArea.classList.add('hidden');
    if (reviewWordsButton) reviewWordsButton.classList.add('hidden');
    if (optionsArea) optionsArea.innerHTML = ''; 
    if (testProgress) testProgress.textContent = "테스트 준비 중..."; 

    if (appState === 'initial' || appState === 'review') {
        if (dailyWords.length > 0 && currentQuestionIndex < dailyWords.length) {
            currentWord = dailyWords[currentQuestionIndex];
            currentDisplayQuestion = testType === 'englishToKorean' ? currentWord.english : currentWord.korean;
            currentQuestionPrompt = `다음 단어의 ${testType === 'englishToKorean' ? '뜻을' : '영어를'} 고르세요:`;
        }
        testProgressText = appState === 'initial' ?
            `일일 단어 테스트 (${currentQuestionIndex + 1}/${TEST_WORD_COUNT})` :
            `오답노트 (${currentQuestionIndex + 1}/${incorrectWordsForReview.length})`;

        if (testProgress) testProgress.textContent = testProgressText;
        if (questionPrompt) questionPrompt.textContent = currentQuestionPrompt;
        if (displayQuestionElem) displayQuestionElem.textContent = currentDisplayQuestion;

        if (feedback) {
            if (questionArea) questionArea.classList.add('hidden');
            if (feedbackArea) feedbackArea.classList.remove('hidden');
            if (feedbackMessage) feedbackMessage.textContent = feedback.displayMessage;
            if (feedbackMessage) feedbackMessage.classList.remove('text-green-600', 'text-red-600');
            if (feedbackMessage) feedbackMessage.classList.add(feedback.isCorrect ? 'text-green-600' : 'text-red-600');
            if (correctAnswerDisplay) correctAnswerDisplay.textContent = feedback.correctAnswerDisplay;
        } else {
            if (questionArea) questionArea.classList.remove('hidden');
            if (feedbackArea) feedbackArea.classList.add('hidden');

            if (currentWord) {
                if (optionsArea) optionsArea.innerHTML = '';
                options.forEach((option) => {
                    const button = document.createElement('button');
                    button.className = "bg-white text-purple-700 font-semibold py-4 px-6 rounded-lg shadow-md hover:bg-purple-100 transition duration-300 ease-in-out transform hover:scale-105 border-2 border-purple-300 text-lg text-left";
                    button.textContent = option;
                    button.onclick = () => handleAnswer(option);
                    if (optionsArea) optionsArea.appendChild(button);
                });
            } else { 
                if (statusMessageArea) statusMessageArea.classList.remove('hidden');
                if (statusMessage) statusMessage.textContent = resultMessage || "테스트를 시작할 준비가 완료되었습니다!";
            }
        }
    } else if (appState === 'session_ended') {
        if (questionArea) questionArea.classList.add('hidden');
        if (feedbackArea) feedbackArea.classList.add('hidden');
        if (statusMessageArea) statusMessageArea.classList.remove('hidden');
        if (statusMessage) statusMessage.textContent = "오늘의 학습을 마쳤습니다. 😊"; 
        if (reviewWordsButton) reviewWordsButton.classList.remove('hidden'); 
        if (testProgress) testProgress.textContent = "테스트 종료";
    } else if (appState === 'loading' || appState === 'auth_pending') { 
        if (statusMessageArea) statusMessageArea.classList.remove('hidden');
        if (statusMessage) statusMessage.textContent = "데이터를 불러오는 중...";
    } else if (appState === 'login_register' || appState === 'cat_naming') {
        if (testProgress) testProgress.textContent = ""; 
    }
}


function renderModal() {
    console.log("renderModal 호출됨. 현재 appState:", appState, "resultMessage:", resultMessage); // 디버그 로그

    // 주 작업 버튼 가시성 초기화
    if (modalPrimaryAction) modalPrimaryAction.classList.add('hidden');

    // appState에 따라 모달이 보여야 하는지 결정
    const isModalActive = (appState === 'round_completed_success' || 
                          appState === 'ask_to_continue' || 
                          appState === 'show_daily_words' ||
                          appState === 'initial_test_completed_with_errors'); // 모달을 위한 새 상태

    if (modalBackdrop) {
        if (isModalActive) {
            modalBackdrop.classList.remove('hidden');
        } else {
            modalBackdrop.classList.add('hidden');
            // 모달이 숨겨질 때, 다음 표시 시 깜빡임을 방지하기 위해 내용이 지워졌는지 확인
            if (modalTitle) modalTitle.textContent = '';
            if (modalMessage) modalMessage.textContent = ''; // 일반 텍스트 메시지에는 textContent 사용
        }
    }

    // 이제 활성 상태인 경우에만 모달 내용 채우기
    if (isModalActive) {
        if (appState === 'round_completed_success') {
            modalTitle.textContent = "테스트 완료!";
            modalMessage.textContent = resultMessage; // resultMessage 표시
            console.log("renderModal: round_completed_success에 대한 resultMessage 표시:", resultMessage);
            modalClose.textContent = "확인";
            modalClose.onclick = () => {
                console.log("round_completed_success 모달 '확인' 클릭. 다음 상태: ask_to_continue"); // 디버그 로그
                appState = 'ask_to_continue'; // 상태 전환
                resultMessage = "다음 테스트에 도전하시겠습니까?"; // 다음 상태를 위한 resultMessage 설정
                renderApp(); // 다음 모달을 표시하기 위해 다시 렌더링
            };
        } else if (appState === 'ask_to_continue') {
            modalTitle.textContent = "다음 테스트";
            modalMessage.textContent = resultMessage; // 이전 상태에서 설정된 resultMessage 표시
            console.log("renderModal: ask_to_continue에 대한 resultMessage 표시:", resultMessage);
            modalPrimaryAction.classList.remove('hidden');
            modalPrimaryAction.textContent = "예";
            modalPrimaryAction.onclick = () => {
                console.log("ask_to_continue 모달 '예' 클릭. 새 테스트 시작."); // 디버그 로그
                startNewTest(); 
            };
            modalClose.textContent = "아니오";
            modalClose.onclick = () => {
                console.log("ask_to_continue 모달 '아니오' 클릭. 세션 종료."); // 디버그 로그
                appState = 'session_ended'; // 모달이 아닌 상태로 전환
                renderApp(); 
            };
        } else if (appState === 'show_daily_words') { 
            modalTitle.textContent = "오늘의 단어 복습";
            if (modalMessage) {
                let wordListHtml = '<div class="text-left max-h-60 overflow-y-auto px-2 py-1">';
                if (sessionWords.length === 0) {
                    wordListHtml += '<p>오늘 학습한 단어가 없습니다.</p>';
                } else {
                    sessionWords.forEach((word) => {
                        wordListHtml += `<p class="mb-2 p-2 border-b border-gray-200 last:border-b-0"><strong>${word.english}</strong>: ${word.korean} (${word.koreanMeaning || '의미 없음'})</p>`;
                    });
                }
                wordListHtml += '</div>';
                modalMessage.innerHTML = wordListHtml;
            }
            modalPrimaryAction.classList.add('hidden'); 
            modalClose.textContent = "닫기";
            modalClose.onclick = () => {
                console.log("show_daily_words 모달 '닫기' 클릭."); // 디버그 로그
                appState = 'session_ended'; 
                renderApp(); 
            };
        } else if (appState === 'initial_test_completed_with_errors') { 
            modalTitle.textContent = "오답노트 학습 안내";
            modalMessage.textContent = resultMessage; 
            console.log("renderModal: initial_test_completed_with_errors에 대한 resultMessage 표시:", resultMessage);
            modalPrimaryAction.classList.remove('hidden');
            
            // isFirstReviewPrompt 플래그에 따라 버튼 텍스트 동적 설정
            modalPrimaryAction.textContent = isFirstReviewPrompt ? "오답노트 학습 시작" : "다음 오답 풀기";

            modalPrimaryAction.onclick = () => {
                console.log("initial_test_completed_with_errors 모달 '오답노트 학습 시작/다음 오답 풀기' 클릭.");
                appState = 'review'; // 오답노트 상태로 전환
                dailyWords = [...incorrectWordsForReview].sort(() => 0.5 - Math.random()); 
                if (dailyWords.length > 0) {
                    setupQuestion(dailyWords[0]); // 오답노트를 위한 첫 질문 설정
                }
                renderApp(); // 오답 질문을 시작하기 위해 다시 렌더링
            };
            modalClose.textContent = "닫기";
            modalClose.onclick = () => {
                console.log("initial_test_completed_with_errors 모달 '닫기' 클릭. 세션 종료.");
                appState = 'session_ended'; 
                resultMessage = "오늘의 학습을 마쳤습니다. 😊"; // 세션 종료 메시지 설정
                renderApp(); 
            };
        }
    }
}

// 메인 렌더링 함수 - 상태가 변경될 때마다 호출
function renderApp() {
    console.log("renderApp 호출됨. 현재 appState:", appState, "isLoading:", isLoading); // 디버그 로그
    // 전반적인 로딩 스피너 가시성 관리
    if (isLoading) {
        if (initialLoadingSpinner) initialLoadingSpinner.classList.remove('hidden');
        if (mainAppContent) mainAppContent.classList.add('main-app-hidden');
        if (authSection) authSection.classList.add('hidden');
        if (catNamingSection) catNamingSection.classList.add('hidden');
        document.body.style.overflow = 'hidden'; 
    } else {
        if (initialLoadingSpinner) initialLoadingSpinner.classList.add('hidden');
        document.body.style.overflow = 'auto'; 

        // appState에 따라 섹션 가시성 관리
        if (appState === 'login_register') {
            if (authSection) authSection.classList.remove('hidden');
            if (mainAppContent) mainAppContent.classList.add('main-app-hidden');
            if (catNamingSection) catNamingSection.classList.add('hidden');
        } else if (appState === 'cat_naming') {
            if (catNamingSection) catNamingSection.classList.remove('hidden');
            if (authSection) authSection.classList.add('hidden');
            if (mainAppContent) mainAppContent.classList.add('main-app-hidden');
        } else { // 다른 모든 상태 (initial, review, session_ended 등은 메인 앱 콘텐츠에 의해 처리됨)
            if (mainAppContent) mainAppContent.classList.remove('main-app-hidden');
            if (authSection) authSection.classList.add('hidden');
            if (catNamingSection) catNamingSection.classList.add('hidden');
        }
    }
}

    if (userEmailDisplay) userEmailDisplay.textContent = userEmail || '로그인 중...';
    renderCatSection();
    renderTestSection();
    renderModal(); 

// Firebase 초기화 및 인증
async function initializeFirebaseAndAuth() {
    console.log("Firebase 및 인증 초기화 시작."); // 디버그 로그
    try {
        const app = initializeApp(firebaseConfig);
        db = getFirestore(app);
        auth = getAuth(app);

        onAuthStateChanged(auth, async (user) => {
            if (user) {
                console.log("사용자 인증됨:", user.uid, user.email); // 디버그 로그
                userId = user.uid;
                userEmail = user.email || '익명 사용자'; 
                isAuthReady = true;
                loadUserData(); 
            } else {
                console.log("사용자 인증 안 됨. 로그인/회원가입 화면으로 전환."); // 디버그 로그
                userId = null;
                userEmail = null;
                isAuthReady = false;
                isLoading = false;
                appState = 'login_register'; 
                renderApp();
            }
        });
    } catch (error) {
        console.error("Firebase 초기화 실패:", error); // 디버그 로그
        isLoading = false; 
        appState = 'login_register'; 
        authErrorMessage.textContent = "Firebase 초기화에 실패했습니다. 인터넷 연결을 확인하거나 관리자에게 문의하세요.";
        renderApp(); 
    }
}

// 사용자 인증 함수
async function handleRegister() {
    const email = emailInput.value;
    const password = passwordInput.value;
    if (!email || !password) {
        authErrorMessage.textContent = "이메일과 비밀번호를 모두 입력해주세요.";
        return;
    }
    authErrorMessage.textContent = ''; 
    try {
        console.log("회원가입 시도 중:", email); // 디버그 로그
        await createUserWithEmailAndPassword(auth, email, password);
        // 성공적인 등록 후 onAuthStateChanged가 상태 전환을 처리
    } catch (error) {
        console.error("회원가입 오류:", error); // 디버그 로그
        switch (error.code) {
            case 'auth/email-already-in-use':
                authErrorMessage.textContent = "이미 등록된 이메일입니다. 로그인하거나 다른 이메일을 사용해주세요.";
                break;
            case 'auth/invalid-email':
                authErrorMessage.textContent = "유효하지 않은 이메일 형식입니다.";
                break;
            case 'auth/weak-password':
                authErrorMessage.textContent = "비밀번호는 6자 이상이어야 합니다.";
                break;
            default:
                authErrorMessage.textContent = `회원가입 오류: ${error.message}`;
        }
    }
}

async function handleLogin() {
    const email = emailInput.value;
    const password = passwordInput.value;
    if (!email || !password) {
        authErrorMessage.textContent = "이메일과 비밀번호를 모두 입력해주세요.";
        return;
    }
    authErrorMessage.textContent = ''; 
    try {
        console.log("로그인 시도 중:", email); // 디버그 로그
        await signInWithEmailAndPassword(auth, email, password);
        // 성공적인 로그인 후 onAuthStateChanged가 상태 전환을 처리
    } catch (error) {
        console.error("로그인 오류:", error); // 디버그 로그
        switch (error.code) {
            case 'auth/invalid-credential': 
            case 'auth/user-not-found':    
            case 'auth/wrong-password':    
                authErrorMessage.textContent = "존재하지 않는 계정이거나, 비밀번호가 틀렸습니다.";
                break;
            case 'auth/invalid-email':
                authErrorMessage.textContent = "유효하지 않은 이메일 형식입니다.";
                break;
            case 'auth/too-many-requests':
                authErrorMessage.textContent = "로그인 시도 횟수가 너무 많습니다. 잠시 후 다시 시도해주세요.";
                break;
            default:
                authErrorMessage.textContent = `로그인 오류: ${error.message}`;
        }
    }
}

async function handleLogout() {
    try {
        console.log("로그아웃 시도 중."); // 디버그 로그
        await signOut(auth);
        // onAuthStateChanged는 사용자가 null임을 감지하고 login_register 상태로 전환
    } catch (error) {
        console.error("로그아웃 오류:", error); // 디버그 로그
        resultMessage = `로그아웃 오류: ${error.message}`;
        renderApp();
    }
}

// 사용자 데이터 (냥이 데이터)를 로드하고 테스트 가능 여부를 결정합니다.
function loadUserData() {
    if (!isAuthReady || !db || !userId) {
        console.warn("loadUserData: 준비되지 않았거나 사용자 ID 없음. 로드 건너뛰기."); // 디버그 로그
        return;
    }

    const userDocRef = doc(db, `artifacts/${APP_ID}/users/${userId}/userData`, CAT_DOC_ID);

    onSnapshot(userDocRef, (docSnap) => {
        let loadedCatData;
        if (docSnap.exists()) {
            loadedCatData = docSnap.data();
            loadedCatData.level = loadedCatData.level || 1;
            loadedCatData.happiness = loadedCatData.happiness !== undefined ? loadedCatData.happiness : 50;
            loadedCatData.name = loadedCatData.name || null; 
            loadedCatData.lastTestDate = loadedCatData.lastTestDate || null; 
            console.log("Firestore에서 냥이 데이터 로드됨:", loadedCatData); // 디버그 로그
        } else {
            loadedCatData = { level: 1, happiness: 50, name: null, lastTestDate: null }; 
            console.log("Firestore에 냥이 데이터 없음, 사용자 이름 지정 필요."); // 디버그 로그
        }

        const oldAppState = appState; // 잠재적인 변경 전에 현재 appState 캡처
        catData = loadedCatData; // 전역 catData 업데이트

        // 현재 appState가 onSnapshot의 기본 로직에 의해 덮어씌워져서는 안 되는 모달 또는 활성 테스트 상태인지 확인
        const shouldNotOverrideAppState = ['round_completed_success', 'ask_to_continue', 'show_daily_words', 'initial', 'review', 'initial_test_completed_with_errors'].includes(oldAppState); // 새 상태 추가됨

        let hasStateChangedInOnSnapshot = false; // onSnapshot의 로직으로 인해 renderApp이 필요한지 결정하는 플래그

        if (catData.name === null) {
            if (oldAppState !== 'cat_naming') { // 이미 이름 지정 상태가 아니라면 변경
                appState = 'cat_naming'; 
                isLoading = false;
                hasStateChangedInOnSnapshot = true;
            }
        } else {
            const today = new Date();
            today.setHours(0, 0, 0, 0);
            const lastTestDay = catData.lastTestDate ? new Date(catData.lastTestDate) : null;
            if (lastTestDay) lastTestDay.setHours(0, 0, 0, 0);

            if (lastTestDay && today.getTime() === lastTestDay.getTime()) {
                canTakeTest = false;
                if (!shouldNotOverrideAppState && oldAppState !== 'session_ended') { // 이미 모달 표시 중이거나 session_ended 상태가 아니라면 변경
                    appState = 'session_ended'; 
                    resultMessage = "오늘은 이미 테스트를 완료했어요! 내일 다시 도전하세요.";
                    isLoading = false;
                    hasStateChangedInOnSnapshot = true;
                }
            } else {
                canTakeTest = true;
                if (!shouldNotOverrideAppState && oldAppState !== 'initial' && oldAppState !== 'review' && oldAppState !== 'initial_test_completed_with_errors') { // 새 상태 추가됨
                    appState = 'initial'; 
                    isLoading = false;
                    startNewTest(); // startNewTest는 내부적으로 renderApp을 호출하고 appState를 'initial'로 설정
                    // hasStateChangedInOnSnapshot = false; // startNewTest가 이미 렌더링을 처리
                }
            }
        }

        // startNewTest에 의해 처리되지 않은 상태 변경이 onSnapshot에서 발생했거나,
        // 초기 로딩 단계가 완료되었을 때만 renderApp을 호출
        if (hasStateChangedInOnSnapshot || (oldAppState === 'loading' && !isLoading)) {
            renderApp();
        }

    }, (error) => {
        console.error("Firestore에서 냥이 데이터 가져오기 오류:", error); // 디버그 로그
        isLoading = false;
        appState = 'session_ended'; 
        resultMessage = "데이터 로딩에 실패했습니다. 다시 시도해 주세요.";
        renderApp(); 
    });
}

// 냥이 이름 처리
async function handleSaveCatName() {
    const name = catNameInput.value.trim();
    if (!name) {
        namingErrorMessage.textContent = "냥이 이름을 입력해주세요.";
        return;
    }
    if (name.length > 10) {
        namingErrorMessage.textContent = "이름은 10자 이내로 입력해주세요.";
        return;
    }
    namingErrorMessage.textContent = ''; 

    catData.name = name;
    console.log("냥이 이름 저장:", name); // 디버그 로그
    await updateCatDataInFirestore();
}

// Firestore에서 냥이의 행복도와 레벨을 업데이트
async function updateCatDataInFirestore() {
    if (!db || !userId) {
        console.error("Firestore DB 또는 사용자 ID 사용 불가: 냥이 데이터 업데이트 실패."); // 디버그 로그
        return;
    }
    const userDocRef = doc(db, `artifacts/${APP_ID}/users/${userId}/userData`, CAT_DOC_ID);
    try {
        await setDoc(userDocRef, catData, { merge: true });
        console.log("Firestore에 냥이 데이터 업데이트됨:", catData); // 디버그 로그
    } catch (error) {
        console.error("Firestore에 냥이 데이터 업데이트 오류:", error); // 디버그 로그
    }
}


function updateCatHappiness(allCorrect) {
    const oldLevel = catData.level; // 업데이트 전 이전 레벨 캡처
    const newCatData = { ...catData };

    if (allCorrect) {
        newCatData.happiness = Math.min(100, newCatData.happiness + 15);
        if (newCatData.happiness >= newCatData.level * 20 + 30) {
            newCatData.level += 1;
            newCatData.happiness = Math.max(0, newCatData.happiness - (newCatData.level * 10));
        }
    } else {
        newCatData.happiness = Math.max(0, newCatData.happiness - 5);
    }
    catData = newCatData; 
    console.log("냥이 행복도 업데이트:", catData.happiness, "새 레벨:", catData.level); // 디버그 로그

    // catData 업데이트 후 레벨업 확인
    if (catData.level > oldLevel) {
        showLevelUpSpeechBubble = true; 
        // 여러 말풍선 또는 조기 숨김을 방지하기 위해 기존 타임아웃 지우기
        if (levelUpSpeechBubbleTimeout) {
            clearTimeout(levelUpSpeechBubbleTimeout);
        }
        // 2초 후 말풍선을 숨기기 위한 타임아웃 설정
        levelUpSpeechBubbleTimeout = setTimeout(() => {
            showLevelUpSpeechBubble = false;
            renderApp(); // 말풍선을 숨기기 위해 다시 렌더링
        }, 8000); // 8초 동안 표시
        console.log("냥이 레벨업! 새로운 레벨:", catData.level); // 디버그 로그
    }

    updateCatDataInFirestore(); 
}

// 일일 제한을 적용하기 위해 Firestore에서 마지막 테스트 날짜를 업데이트
async function updateLastTestDate() {
    if (!db || !userId) {
        console.error("Firestore DB 또는 사용자 ID 사용 불가: 마지막 테스트 날짜 업데이트 실패."); // 디버그 로그
        return;
    }
    const userDocRef = doc(db, `artifacts/${APP_ID}/users/${userId}/userData`, CAT_DOC_ID);
    const today = new Date();
    today.setHours(0, 0, 0, 0); 
    catData.lastTestDate = today.getTime(); 
    try {
        await setDoc(userDocRef, { lastTestDate: catData.lastTestDate }, { merge: true });
        console.log("Firestore에 마지막 테스트 날짜 업데이트됨:", new Date(catData.lastTestDate)); // 디버그 로그
    } catch (error) {
        console.error("Firestore에 마지막 테스트 날짜 업데이트 오류:", error); // 디버그 로그
    }
}


// 새 테스트 라운드를 초기화하고 시작합니다.
function startNewTest() {
    console.log("새 테스트 시작 시도. canTakeTest:", canTakeTest); // 디버그 로그
    if (!canTakeTest) { 
        appState = 'session_ended';
        resultMessage = "오늘은 이미 테스트를 완료했어요! 내일 다시 도전하세요.";
        renderApp();
        return;
    }

    currentQuestionIndex = 0;
    initialTestCorrectCount = 0;
    incorrectWordsForReview = [];
    resultMessage = '';
    appState = 'initial'; 
    feedback = null;
    showLevelUpSpeechBubble = false; // 말풍선 가시성 초기화
    if (levelUpSpeechBubbleTimeout) clearTimeout(levelUpSpeechBubbleTimeout); // 보류 중인 타임아웃 지우기

    const shuffledWords = [...initialWords].sort(() => 0.5 - Math.random());
    dailyWords = shuffledWords.slice(0, TEST_WORD_COUNT);

    dailyWords.forEach(word => {
        if (!sessionWords.some(sWord => sWord.english === word.english)) {
            sessionWords.push(word);
        }
    });

    if (dailyWords.length > 0) {
        setupQuestion(dailyWords[0]);
    }
    console.log("새 테스트 시작됨. dailyWords:", dailyWords.map(w => w.english)); // 디버그 로그
    renderApp(); 
}

// 현재 질문과 옵션을 설정
function setupQuestion(word) {
    testType = Math.random() < 0.5 ? 'englishToKorean' : 'koreanToEnglish';

    let correctOption;
    let otherWords;

    if (testType === 'englishToKorean') {
        correctOption = word.korean;
        otherWords = initialWords.filter(w => w.korean !== word.korean);
    } else {
        correctOption = word.english;
        otherWords = initialWords.filter(w => w.english !== word.english);
    }

    const shuffledOthers = otherWords.sort(() => 0.5 - Math.random());
    const distractors = shuffledOthers.slice(0, 3).map(w => testType === 'englishToKorean' ? w.korean : w.english);

    options = [...distractors, correctOption].sort(() => 0.5 - Math.random());
    console.log("질문 설정됨:", word.english, "옵션:", options); // 디버그 로그
}

// 사용자가 선택한 답변을 처리하고 피드백을 표시
function handleAnswer(selectedOption) {
    const currentWord = dailyWords[currentQuestionIndex];
    let isCorrect;

    if (testType === 'englishToKorean') {
        isCorrect = (selectedOption === currentWord.korean);
    } else {
        isCorrect = (selectedOption === currentWord.english);
    }

    console.log("답변 처리. 선택:", selectedOption, "정답:", isCorrect, "현재 오답 단어 수 (이전):", incorrectWordsForReview.length); // 디버그 로그

    if (isCorrect) {
        if (appState === 'initial') {
            initialTestCorrectCount++;
        } else if (appState === 'review') {
            incorrectWordsForReview = incorrectWordsForReview.filter(word => word.english !== currentWord.english);
        }
        feedback = { isCorrect: true, displayMessage: '정답이에요!', correctAnswerDisplay: '' };
    } else { 
        if (!incorrectWordsForReview.some(word => word.english === currentWord.english)) {
            incorrectWordsForReview.push(currentWord);
        }
        const correctText = testType === 'englishToKorean' ? currentWord.korean : currentWord.english;
        feedback = { isCorrect: false, displayMessage: '오답이에요.', correctAnswerDisplay: `정답: ${correctText}` };
    }
    console.log("답변 처리 완료. 현재 오답 단어 수 (이후):", incorrectWordsForReview.length); // 디버그 로그
    renderApp(); 
}

// 피드백 후 다음 질문 또는 다음 테스트 단계로 진행하는 함수
function proceedToNextQuestionOrPhase() {
    feedback = null; 
    console.log("다음 질문/단계 진행. 현재 appState:", appState, "다음 질문 인덱스:", currentQuestionIndex + 1, "총 단어 수:", dailyWords.length, "오답 단어 수:", incorrectWordsForReview.length); // 디버그 로그

    const nextQuestionIndex = currentQuestionIndex + 1;

    if (nextQuestionIndex < dailyWords.length) {
        currentQuestionIndex = nextQuestionIndex;
        setupQuestion(dailyWords[currentQuestionIndex]);
    } else { 
        currentQuestionIndex = 0; 

        if (appState === 'initial') {
            if (incorrectWordsForReview.length === 0) {
                appState = 'round_completed_success'; 
                resultMessage = `축하합니다! 모든 문제를 맞히고 ${catData.name}의 행복도가 올랐어요!`;
                console.log("proceedToNextQuestionOrPhase: round_completed_success에 대한 resultMessage 설정:", resultMessage); // 디버그 로그
                updateCatHappiness(true); // Firestore 업데이트, onSnapshot 및 renderApp 트리거
                updateLastTestDate(); // Firestore 업데이트, onSnapshot 및 renderApp 트리거
                canTakeTest = false; 
                console.log("앱 상태: round_completed_success (초기 테스트 모두 맞힘)"); // 디버그 로그
            } else {
                appState = 'initial_test_completed_with_errors'; 
                resultMessage = `${incorrectWordsForReview.length}개의 틀린 단어가 있어요. 오답노트 학습을 시작합니다!`;
                console.log("proceedToNextQuestionOrPhase: initial_test_completed_with_errors (initial)에 대한 resultMessage 설정:", resultMessage); // 디버그 로그
                isFirstReviewPrompt = true; // 초기 프롬프트에 대한 플래그 설정
                console.log("앱 상태: initial_test_completed_with_errors (오답노트 시작 전 알림)"); // 디버그 로그
            }
        } else if (appState === 'review') {
            if (incorrectWordsForReview.length === 0) {
                appState = 'round_completed_success'; 
                resultMessage = `대단해요! 모든 단어를 완벽하게 마스터했어요! ${catData.name}의 행복도가 크게 올랐어요!`; 
                console.log("proceedToNextQuestionOrPhase: 오답노트 성공에 대한 resultMessage 설정:", resultMessage); // 디버그 로그
                updateCatHappiness(true); 
                updateLastTestDate(); 
                canTakeTest = false; 
                console.log("앱 상태: round_completed_success (오답노트 모두 맞힘)"); // 디버그 로그
            } else {
                appState = 'initial_test_completed_with_errors'; 
                resultMessage = `아직 ${incorrectWordsForReview.length}개의 단어가 남아있어요. 계속해서 도전하세요!`;
                console.log("proceedToNextQuestionOrPhase: 계속된 오답노트 (모달)에 대한 resultMessage 설정:", resultMessage); // 디버그 로그
                isFirstReviewPrompt = false; // 이후 프롬프트에 대한 플래그 설정
                console.log("앱 상태: initial_test_completed_with_errors (오답노트 이어서 진행 전 알림)"); // 디버그 로그
            }
        }
    }
    renderApp(); 
}

// 이벤트 리스너 설정 함수
function setupEventListeners() {
    if (nextButton) nextButton.addEventListener('click', proceedToNextQuestionOrPhase);
    else console.warn("setupEventListeners: nextButton 요소를 찾을 수 없습니다."); // 디버그 로그

    if (reviewWordsButton) {
        reviewWordsButton.addEventListener('click', () => {
            appState = 'show_daily_words'; 
            renderApp(); 
        });
    } else console.warn("setupEventListeners: reviewWordsButton 요소를 찾을 수 없습니다."); // 디버그 로그

    // 인증 섹션 리스너
    if (loginButton) loginButton.addEventListener('click', handleLogin);
    if (registerButton) registerButton.addEventListener('click', handleRegister);
    if (logoutButton) logoutButton.addEventListener('click', handleLogout);
    
    // 냥이 이름 지정 섹션 리스너
    if (saveCatNameButton) saveCatNameButton.addEventListener('click', handleSaveCatName);
}

// 초기 앱 로드 - 모든 DOM이 완전히 파싱되었는지 확인하기 위해 window.onload 사용
window.onload = function() {
    console.log("window.onload 호출됨."); // 디버그 로그
    const elementsReady = getDOMElements(); 

    if (!elementsReady) {
        console.error("필수 DOM 요소를 찾을 수 없습니다. 앱을 초기화할 수 없습니다."); // 디버그 로그
        return; 
    }

    setupEventListeners(); 
    isLoading = true; 
    appState = 'loading'; 
    initializeFirebaseAndAuth(); 
};