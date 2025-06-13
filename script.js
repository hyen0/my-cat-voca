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
// catData에서 lastTestDate 속성을 제거했습니다.
// testRoundNumber를 catData에 추가하여 Firestore에 저장 및 로드되도록 합니다.
let catData = { level: 1, happiness: 50, name: null, testRoundNumber: 0 }; 
let currentQuestionIndex = 0;
let dailyWords = []; 
let incorrectWordsForReview = []; 
let sessionWords = []; 
let testType = 'englishToKorean'; 
let options = [];
let initialTestCorrectCount = 0; 

// 앱 상태: 'loading', 'landing_page', 'login_register', 'cat_naming', 'initial', 'review', 'round_completed_success', 'ask_to_continue', 'session_ended', 'show_daily_words', 'initial_test_completed_with_errors'
let appState = 'loading'; 
let resultMessage = ''; 
let isLoading = true; 
// canTakeTest는 더 이상 날짜에 의해 제한되지 않습니다.
let canTakeTest = true; 
let feedback = null; 
const TEST_WORD_COUNT = 10;
const CAT_DOC_ID = "myCat"; 
const APP_ID = typeof __app_id !== 'undefined' ? __app_id : 'default-app-id'; // Firestore 경로용
let isFirstReviewPrompt = true; // 첫 오답노트 프롬프트와 이후 프롬프트를 구분하기 위한 플래그
let showLevelUpSpeechBubble = false; // 레벨업 말풍선을 표시할 상태
let levelUpSpeechBubbleTimeout = null; // 말풍선을 숨기기 위한 타임아웃 ID

// DOM 요소 참조
let initialLoadingSpinner;
let landingPageSection; // 새로운 표지 화면 섹션
let startButton;        // 표지 화면의 시작하기 버튼
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
let continueTestButton; 
let modalBackdrop;
let modalTitle;
let modalMessage;
let modalPrimaryAction;
let modalClose;


// 문서가 로드된 후 DOM 요소를 가져오는 함수
function getDOMElements() {
    initialLoadingSpinner = document.getElementById('initial-loading-spinner');
    landingPageSection = document.getElementById('landing-page-section'); // 표지 화면 섹션 참조
    startButton = document.getElementById('start-button'); // 시작하기 버튼 참조
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
    continueTestButton = document.getElementById('continue-test-button'); 
    modalBackdrop = document.getElementById('modal-backdrop');
    modalTitle = document.getElementById('modal-title');
    modalMessage = document.getElementById('modal-message');
    modalPrimaryAction = document.getElementById('modal-primary-action');
    modalClose = document.getElementById('modal-close');

    const requiredElements = {
        'initialLoadingSpinner': initialLoadingSpinner, 
        'landingPageSection': landingPageSection, 
        'startButton': startButton,               
        'authSection': authSection, 'emailInput': emailInput, 
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
        'continueTestButton': continueTestButton, 
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
        document.body.innerHTML = '<div style="color: red; text-align: center; margin-top: 50px; font-size: 24px; padding: 20px;">앱 초기화에 실패했습니다.<br>필요한 UI 구성 요소를 찾을 수 없습니다.<br>HTML 구조와 요소 ID를 확인해주세요.</div>';
        document.body.style.overflow = 'auto'; 
        return false; 
    }
    return true; 
}

// 냥이 섹션 UI 렌더링
function renderCatSection() {
    console.log("냥이 섹션 렌더링 중. 현재 행복도:", catData.happiness, "현재 레벨:", catData.level, "showLevelUpSpeechBubble:", showLevelUpSpeechBubble); 
    if (catNameLevel && happinessBar && happinessText && catImage) { 
        catNameLevel.textContent = `${catData.name || '냥이'} (Lv.${catData.level})`; // 냥이 이름과 레벨 표시
        happinessBar.style.width = `${catData.happiness}%`; // 행복도 바 너비 업데이트
        happinessText.textContent = `행복도: ${catData.happiness}%`; // 행복도 텍스트 표시
        // 플래그에 따라 레벨업 말풍선 표시/숨기기
        if (levelUpSpeechBubble) {
            if (showLevelUpSpeechBubble) {
                levelUpSpeechBubble.textContent = "레벨업!";
                levelUpSpeechBubble.classList.remove('hidden');
                console.log("레벨업 말풍선 표시됨."); 
            } else {
                levelUpSpeechBubble.classList.add('hidden');
                console.log("레벨업 말풍선 숨김."); 
            }
        }
    }
}

// 앱 상태에 따라 테스트 섹션 UI 렌더링
function renderTestSection() {
    let currentDisplayQuestion = '';
    let currentQuestionPrompt = '';
    let testProgressText = '';
    let currentWord = null;

    // 모든 관련 영역 및 버튼의 가시성 초기화
    if (questionArea) questionArea.classList.add('hidden');
    if (feedbackArea) feedbackArea.classList.add('hidden');
    if (nextButton) nextButton.classList.add('hidden'); 
    if (statusMessageArea) statusMessageArea.classList.add('hidden');
    if (reviewWordsButton) reviewWordsButton.classList.add('hidden');
    if (continueTestButton) continueTestButton.classList.add('hidden'); 

    if (optionsArea) optionsArea.innerHTML = ''; 
    if (testProgress) testProgress.textContent = "테스트 준비 중..."; 

    if (appState === 'initial' || appState === 'review') {
        // dailyWords가 채워져 있으면 질문 설정
        if (dailyWords.length > 0 && currentQuestionIndex < dailyWords.length) {
            currentWord = dailyWords[currentQuestionIndex];
            currentDisplayQuestion = testType === 'englishToKorean' ? currentWord.english : currentWord.korean;
            currentQuestionPrompt = `다음 단어의 ${testType === 'englishToKorean' ? '뜻을' : '영어를'} 고르세요:`;
        }
        
        const totalWords = appState === 'initial' ? TEST_WORD_COUNT : dailyWords.length;
        testProgressText = appState === 'initial' ?
            `단어 테스트 ${catData.testRoundNumber} (${currentQuestionIndex + 1}/${totalWords})` :
            `오답노트 (단어 테스트 ${catData.testRoundNumber}) (${currentQuestionIndex + 1}/${totalWords})`;
        
        if (testProgress) testProgress.textContent = testProgressText;
        if (questionPrompt) questionPrompt.textContent = currentQuestionPrompt;
        if (displayQuestionElem) displayQuestionElem.textContent = currentDisplayQuestion;
        
        if (feedback) {
            if (feedbackArea) feedbackArea.classList.remove('hidden'); // 피드백 영역 표시
            if (nextButton) nextButton.classList.remove('hidden'); // 피드백 표시 시 다음 버튼 표시
            if (feedbackMessage) feedbackMessage.textContent = feedback.displayMessage;
            if (feedbackMessage) feedbackMessage.classList.remove('text-green-600', 'text-red-600');
            if (feedbackMessage) feedbackMessage.classList.add(feedback.isCorrect ? 'text-green-600' : 'text-red-600');
            if (correctAnswerDisplay) correctAnswerDisplay.textContent = feedback.correctAnswerDisplay;
        } else {
            if (questionArea) questionArea.classList.remove('hidden'); // 질문 영역 표시
            if (currentWord) {
                if (optionsArea) optionsArea.innerHTML = '';
                options.forEach((option) => {
                    const button = document.createElement('button');
                    // 이전 클래스로 되돌림 (고정 높이 및 너비 제거)
                    button.className = "bg-white text-purple-700 font-semibold py-4 px-6 rounded-lg shadow-md hover:bg-purple-100 transition duration-300 ease-in-out transform hover:scale-105 border-2 border-purple-300 text-lg text-left";
                    button.textContent = option;
                    button.onclick = () => handleAnswer(option);
                    if (optionsArea) optionsArea.appendChild(button);
                });
            } else { 
                // 이 경로는 일반적으로 초기 로드 시 또는 테스트를 시작할 수 없는 상태에서 발생
                if (statusMessageArea) statusMessageArea.classList.remove('hidden');
                if (statusMessage) statusMessage.textContent = resultMessage || "테스트를 시작할 준비가 완료되었습니다!";
                // 냥이 이름이 지정되었지만 아직 단어가 로드되지 않은 경우, 계속 버튼 표시
                if (catData.name !== null && appState === 'initial' && continueTestButton) {
                    continueTestButton.classList.remove('hidden');
                    statusMessage.textContent = `단어 테스트 ${catData.testRoundNumber}을(를) 시작할 준비가 되었습니다!`;
                }
            }
        }
    } else if (appState === 'session_ended') {
        if (questionArea) questionArea.classList.add('hidden');
        if (feedbackArea) feedbackArea.classList.add('hidden');
        if (statusMessageArea) statusMessageArea.classList.remove('hidden');
        if (statusMessage) statusMessage.textContent = "오늘의 학습을 마쳤습니다. 😊"; 
        if (reviewWordsButton) reviewWordsButton.classList.remove('hidden'); 
        if (continueTestButton) continueTestButton.classList.remove('hidden'); 
        if (testProgress) testProgress.textContent = "테스트 종료";
    } else if (appState === 'loading' || appState === 'auth_pending') { 
        if (statusMessageArea) statusMessageArea.classList.remove('hidden');
        if (statusMessage) statusMessage.textContent = "데이터를 불러오는 중...";
    } else if (appState === 'landing_page' || appState === 'login_register' || appState === 'cat_naming') {
        // 표지/인증/이름 지정 섹션에서는 테스트 진행 상황을 표시하지 않음
        if (testProgress) testProgress.textContent = ""; 
    }
}

// 앱 상태에 따라 모달 UI 렌더링
function renderModal() {
    console.log("renderModal 호출됨. 현재 appState:", appState, "resultMessage:", resultMessage); 

    if (modalPrimaryAction) modalPrimaryAction.classList.add('hidden');

    // 모달 활성화 여부 결정
    const isModalActive = (appState === 'round_completed_success' || 
                          appState === 'ask_to_continue' || 
                          appState === 'show_daily_words' ||
                          appState === 'initial_test_completed_with_errors'); 

    if (modalBackdrop) {
        if (isModalActive) {
            modalBackdrop.classList.remove('hidden');
        } else {
            modalBackdrop.classList.add('hidden');
            // 다음에 표시될 때 깜박임을 방지하기 위해 숨겨질 때 모달 내용 지우기
            if (modalTitle) modalTitle.textContent = '';
            if (modalMessage) modalMessage.textContent = ''; 
        }
    }

    // 활성 상태인 경우 모달 내용 채우기
    if (isModalActive) {
        if (appState === 'round_completed_success') {
            modalTitle.textContent = "테스트 완료!";
            modalMessage.textContent = resultMessage; 
            console.log("renderModal: round_completed_success에 대한 resultMessage 표시:", resultMessage);
            modalClose.textContent = "확인";
            modalClose.onclick = () => {
                console.log("round_completed_success 모달 '확인' 클릭. 다음 상태: ask_to_continue"); 
                appState = 'ask_to_continue'; 
                resultMessage = "다음 테스트에 도전하시겠습니까?"; 
                renderApp(); 
            };
        } else if (appState === 'ask_to_continue') {
            modalTitle.textContent = "다음 테스트";
            modalMessage.textContent = resultMessage; 
            console.log("renderModal: ask_to_continue에 대한 resultMessage 표시:", resultMessage);
            modalPrimaryAction.classList.remove('hidden');
            modalPrimaryAction.textContent = "예";
            modalPrimaryAction.onclick = () => {
                console.log("ask_to_continue 모달 '예' 클릭. 새 테스트 시작."); 
                startNewTest(); 
            };
            modalClose.textContent = "아니오";
            modalClose.onclick = () => {
                console.log("ask_to_continue 모달 '아니오' 클릭. 세션 종료."); 
                appState = 'session_ended'; 
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
                console.log("show_daily_words 모달 '닫기' 클릭."); 
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
                currentQuestionIndex = 0; // 오답노트용 현재 질문 인덱스 초기화
                dailyWords = [...incorrectWordsForReview].sort(() => 0.5 - Math.random()); // 오답 단어 섞기
                if (dailyWords.length > 0) {
                    setupQuestion(dailyWords[0]); // 오답노트용 첫 질문 설정
                }
                renderApp(); // 오답 질문을 시작하도록 렌더링
            };
            modalClose.textContent = "닫기";
            modalClose.onclick = () => {
                console.log("initial_test_completed_with_errors 모달 '닫기' 클릭. 세션 종료.");
                appState = 'session_ended'; 
                resultMessage = "오늘의 학습을 마쳤습니다. 😊"; 
                renderApp(); 
            };
        }
    }
}

// 메인 렌더링 함수 - 상태가 변경될 때마다 호출
function renderApp() {
    console.log("renderApp 호출됨. 현재 appState:", appState, "isLoading:", isLoading); 

    // 모든 주요 섹션을 숨깁니다.
    // 이 부분은 각 조건문에서 필요한 섹션만 다시 표시하기 전에 항상 실행됩니다.
    if (initialLoadingSpinner) initialLoadingSpinner.classList.add('hidden');
    if (landingPageSection) landingPageSection.classList.add('hidden');
    if (authSection) authSection.classList.add('hidden');
    if (catNamingSection) catNamingSection.classList.add('hidden');
    if (mainAppContent) mainAppContent.classList.add('hidden'); 
    
    document.body.style.overflow = 'auto'; // 기본적으로 스크롤 허용

    if (isLoading) {
        if (initialLoadingSpinner) initialLoadingSpinner.classList.remove('hidden');
        document.body.style.overflow = 'hidden'; // 로딩 중에는 스크롤 금지
    } else {
        if (appState === 'landing_page') {
            if (landingPageSection) landingPageSection.classList.remove('hidden');
        } else if (appState === 'login_register') {
            if (authSection) authSection.classList.remove('hidden');
        } else if (appState === 'cat_naming') {
            if (catNamingSection) catNamingSection.classList.remove('hidden');
        } else { // 'initial', 'review', 'session_ended' 등 메인 앱 콘텐츠 상태
            if (mainAppContent) mainAppContent.classList.remove('hidden');
        }
    }

    if (userEmailDisplay) userEmailDisplay.textContent = userEmail || '로그인 중...';
    renderCatSection();
    renderTestSection();
    renderModal(); 
}

// Firebase 초기화 및 인증
async function initializeFirebaseAndAuth() {
    console.log("Firebase 및 인증 초기화 시작."); 
    try {
        const app = initializeApp(firebaseConfig);
        db = getFirestore(app);
        auth = getAuth(app);
        onAuthStateChanged(auth, async (user) => {
            if (user) {
                console.log("사용자 인증됨:", user.uid, user.email); 
                userId = user.uid;
                userEmail = user.email || '익명 사용자'; 
                isAuthReady = true;
                isLoading = false; // 로딩 완료
                loadUserData(); // 사용자 특정 데이터 로드 진행
            } else {
                console.log("사용자 인증 안 됨. 표지 화면으로 전환."); 
                userId = null;
                userEmail = null;
                isAuthReady = false;
                isLoading = false; // 인증 확인 완료, 로딩 완료
                appState = 'landing_page'; // 로그인되지 않은 경우 표지 화면으로 이동
                renderApp(); // 표지 화면을 표시하도록 렌더링
            }
        });
    } catch (error) {
        console.error("Firebase 초기화 실패:", error); 
        isLoading = false; 
        appState = 'login_register'; // 오류 발생 시 로그인 화면으로 전환 (사용자에게 직접 피드백)
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
        console.log("회원가입 시도 중:", email); 
        await createUserWithEmailAndPassword(auth, email, password);
        // 성공적인 등록 시 onAuthStateChanged가 상태 전환을 처리
    } catch (error) {
        console.error("회원가입 오류:", error); 
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
        console.log("로그인 시도 중:", email); 
        await signInWithEmailAndPassword(auth, email, password);
        // 성공적인 로그인 시 onAuthStateChanged가 상태 전환을 처리
    } catch (error) {
        console.error("로그인 오류:", error); 
        switch (error.code) {
            case 'auth/invalid-credential': 
            case 'auth/user-not-found':    
            case 'auth/wrong-password':    
                authErrorMessage.textContent = "계정을 찾을 수 없거나 비밀번호가 틀렸습니다.";
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
        console.log("로그아웃 시도 중."); 
        await signOut(auth);
        // onAuthStateChanged는 null 사용자를 감지하고 landing_page 상태로 전환
    } catch (error) {
        console.error("로그아웃 오류:", error); 
        resultMessage = `로그아웃 오류: ${error.message}`;
        renderApp();
    }
}

// 사용자 데이터 (냥이 데이터)를 로드하고 테스트 가능 여부를 결정합니다.
function loadUserData() {
    if (!isAuthReady || !db || !userId) {
        console.warn("loadUserData: 준비되지 않았거나 사용자 ID를 사용할 수 없습니다. 로드를 건너뜁니다."); 
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
            // testRoundNumber를 로드합니다. 없으면 0으로 초기화.
            loadedCatData.testRoundNumber = loadedCatData.testRoundNumber || 0; 
            console.log("Firestore에서 냥이 데이터 로드됨:", loadedCatData); 
        } else {
            // 냥이 데이터가 없으면 기본값으로 초기화
            loadedCatData = { level: 1, happiness: 50, name: null, testRoundNumber: 0 }; 
            console.log("Firestore에 냥이 데이터 없음, 냥이 이름 지정 필요."); 
        }

        // 데이터가 가져와졌거나 리스너가 설정되었으므로 isLoading을 false로 설정
        isLoading = false;
        // 전역 catData를 Firestore의 최신 데이터로 업데이트
        catData = loadedCatData;

        // 로드된 데이터에 따라 appState 결정
        const isUserInteracting = ['round_completed_success', 'ask_to_continue', 'show_daily_words', 'initial', 'review', 'initial_test_completed_with_errors'].includes(appState);

        if (!isUserInteracting) { // 현재 상호작용 중이 아닌 경우에만 appState 변경
            if (catData.name === null) {
                appState = 'cat_naming'; // 냥이 이름이 없으면 이름 지정 섹션으로 이동
            } else {
                // 냥이 이름이 지정된 경우, 'session_ended'로 기본값 설정 (시작 또는 계속 준비 완료)
                // 이름 지정된 냥이의 testRoundNumber가 0이면, 이 사용자가 처음 플레이하는 것임.
                // 1로 설정하면 '다음 단계 도전' 버튼이 시작을 유도함.
                if (catData.testRoundNumber === 0) {
                     catData.testRoundNumber = 1;
                     updateCatDataInFirestore(); // 이 변경 사항 저장, onSnapshot을 다시 트리거함.
                }
                appState = 'session_ended'; // 세션 종료로 기본값 설정, 복습 또는 새 테스트 허용
            }
        }
        
        // 스냅샷 처리 후 항상 앱 렌더링
        renderApp();

    }, (error) => {
        console.error("Firestore에서 냥이 데이터 가져오기 오류:", error); 
        isLoading = false; // 오류 발생 시 로딩이 false인지 확인
        appState = 'session_ended'; // 오류/종료 메시지를 표시하는 상태로 전환
        resultMessage = "데이터 로드에 실패했습니다. 다시 시도해주세요.";
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
    // 냥이 이름이 처음 지정될 때, testRoundNumber를 명시적으로 1로 설정 (초기 로드에서 0인 경우)
    if (catData.testRoundNumber === 0) { 
        catData.testRoundNumber = 1; 
    }
    console.log("냥이 이름 저장 중:", name); 
    await updateCatDataInFirestore();
    appState = 'initial'; // 초기 테스트 상태로 전환
    startNewTest(); // 이름 지정 후 첫 테스트 시작
}

// Firestore에서 냥이의 행복도와 레벨을 업데이트
async function updateCatDataInFirestore() {
    if (!db || !userId) {
        console.error("Firestore DB 또는 사용자 ID를 사용할 수 없음: 냥이 데이터 업데이트 실패."); 
        return;
    }
    const userDocRef = doc(db, `artifacts/${APP_ID}/users/${userId}/userData`, CAT_DOC_ID);
    try {
        await setDoc(userDocRef, catData, { merge: true });
        console.log("Firestore에 냥이 데이터 업데이트됨:", catData); 
    } catch (error) {
        console.error("Firestore에 냥이 데이터 업데이트 오류:", error); 
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
    console.log("냥이 행복도 업데이트됨:", catData.happiness, "새 레벨:", catData.level); 

    // catData 업데이트 후 레벨업 확인
    if (catData.level > oldLevel) {
        showLevelUpSpeechBubble = true; 
        // 여러 버블 또는 조기 숨김을 방지하기 위해 기존 타임아웃 지우기
        if (levelUpSpeechBubbleTimeout) {
            clearTimeout(levelUpSpeechBubbleTimeout);
        }
        // 8초 후 말풍선을 숨기기 위한 타임아웃 설정
        levelUpSpeechBubbleTimeout = setTimeout(() => {
            showLevelUpSpeechBubble = false;
            renderApp(); // 말풍선을 숨기기 위해 렌더링
        }, 8000); // 8초 동안 표시
        console.log("냥이가 레벨업했습니다! 새 레벨:", catData.level); 
    }
    updateCatDataInFirestore(); 
}

// 새 테스트 라운드를 초기화하고 시작합니다.
function startNewTest() {
    console.log("새 테스트 시작 시도 중."); 
    if (catData.name === null) { 
        appState = 'cat_naming';
        resultMessage = "냥이의 이름을 먼저 지어주세요!";
        renderApp();
        return;
    }

    currentQuestionIndex = 0;
    initialTestCorrectCount = 0;
    incorrectWordsForReview = [];
    sessionWords = []; // 새 테스트 라운드를 위해 학습한 단어 초기화
    resultMessage = '';
    appState = 'initial'; // 테스트를 위해 appState를 초기 상태로 설정
    feedback = null;
    showLevelUpSpeechBubble = false; 
    if (levelUpSpeechBubbleTimeout) clearTimeout(levelUpSpeechBubbleTimeout); 

    // 테스트 라운드 번호 증가 및 Firestore에 저장
    catData.testRoundNumber = (catData.testRoundNumber || 0) + 1; 
    updateCatDataInFirestore(); 

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
    console.log("새 테스트 시작됨. 일일 단어:", dailyWords.map(w => w.english), "테스트 라운드:", catData.testRoundNumber); 
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
    const shuffledOthers = otherWords.filter(w => (testType === 'englishToKorean' ? w.korean : w.english) !== correctOption)
                                      .sort(() => 0.5 - Math.random());
    const distractors = shuffledOthers.slice(0, 3).map(w => testType === 'englishToKorean' ? w.korean : w.english);
    options = [...distractors, correctOption].sort(() => 0.5 - Math.random());
    console.log("질문 설정됨:", word.english, "옵션:", options); 
}

// 사용자 답변을 처리하고 피드백 표시
function handleAnswer(selectedOption) {
    const currentWord = dailyWords[currentQuestionIndex];
    let isCorrect;
    if (testType === 'englishToKorean') {
        isCorrect = (selectedOption === currentWord.korean);
    } else {
        isCorrect = (selectedOption === currentWord.english);
    }
    console.log("답변 처리 중. 선택:", selectedOption, "정답:", isCorrect, "현재 오답 단어 수 (이전):", incorrectWordsForReview.length); 

    if (isCorrect) {
        if (appState === 'initial') {
            initialTestCorrectCount++;
        } else if (appState === 'review') {
            incorrectWordsForReview = incorrectWordsForReview.filter(word => word.english !== currentWord.english);
        }
        feedback = { isCorrect: true, displayMessage: '정답입니다!', correctAnswerDisplay: '' };
    } else { 
        if (!incorrectWordsForReview.some(word => word.english === currentWord.english)) {
            incorrectWordsForReview.push(currentWord);
        }
        const correctText = testType === 'englishToKorean' ? currentWord.korean : currentWord.english;
        feedback = { isCorrect: false, displayMessage: '오답입니다.', correctAnswerDisplay: `정답: ${correctText}` };
    }
    console.log("답변 처리 완료. 현재 오답 단어 수 (이후):", incorrectWordsForReview.length); 
    renderApp(); 
}

// 피드백 후 다음 질문 또는 다음 테스트 단계로 진행
function proceedToNextQuestionOrPhase() {
    feedback = null; 
    console.log("다음 질문/단계 진행 중. 현재 appState:", appState, "다음 질문 인덱스:", currentQuestionIndex + 1, "총 단어 수:", dailyWords.length, "오답 단어 수:", incorrectWordsForReview.length); 

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
                console.log("proceedToNextQuestionOrPhase: round_completed_success에 대한 resultMessage 설정:", resultMessage); 
                updateCatHappiness(true); 
                console.log("앱 상태: round_completed_success (초기 테스트 모두 정답)"); 
            } else {
                appState = 'initial_test_completed_with_errors'; 
                resultMessage = `${incorrectWordsForReview.length}개의 틀린 단어가 있어요. 오답노트 학습을 시작합니다!`;
                console.log("proceedToNextQuestionOrPhase: initial_test_completed_with_errors (초기)에 대한 resultMessage 설정:", resultMessage); 
                isFirstReviewPrompt = true; 
                console.log("앱 상태: initial_test_completed_with_errors (오답노트 시작 알림 전)"); 
            }
        } else if (appState === 'review') {
            if (incorrectWordsForReview.length === 0) {
                appState = 'round_completed_success'; 
                resultMessage = `대단해요! 모든 단어를 완벽하게 마스터했어요! ${catData.name}의 행복도가 크게 올랐어요!`; 
                console.log("proceedToNextQuestionOrPhase: 오답노트 성공에 대한 resultMessage 설정:", resultMessage); 
                updateCatHappiness(true); 
                console.log("앱 상태: round_completed_success (오답노트 모두 정답)"); 
            } else {
                appState = 'initial_test_completed_with_errors'; 
                resultMessage = `아직 ${incorrectWordsForReview.length}개의 단어가 남아있어요. 계속해서 도전하세요!`;
                console.log("proceedToNextQuestionOrPhase: 오답노트 계속 (모달)에 대한 resultMessage 설정:", resultMessage); 
                isFirstReviewPrompt = false; 
                console.log("앱 상태: initial_test_completed_with_errors (오답노트 계속 알림 전)"); 
            }
        }
    }
    renderApp(); 
}

// 이벤트 리스너 설정 함수
function setupEventListeners() {
    if (nextButton) nextButton.addEventListener('click', proceedToNextQuestionOrPhase);
    else console.warn("setupEventListeners: nextButton 요소를 찾을 수 없습니다."); 

    if (reviewWordsButton) {
        reviewWordsButton.addEventListener('click', () => {
            appState = 'show_daily_words'; 
            renderApp(); 
        });
    } else console.warn("setupEventListeners: reviewWordsButton 요소를 찾을 수 없습니다."); 

    // '다음 단계 도전' 버튼에 이벤트 리스너 추가
    if (continueTestButton) {
        continueTestButton.addEventListener('click', () => {
            console.log("다음 단계 도전 버튼 클릭. 새 테스트 시작."); 
            startNewTest();
        });
    } else console.warn("setupEventListeners: continueTestButton 요소를 찾을 수 없습니다."); 

    // 표지 화면 시작하기 버튼 리스너 추가
    if (startButton) {
        startButton.addEventListener('click', () => {
            console.log("시작하기 버튼 클릭. 로그인 페이지로 전환.");
            appState = 'login_register'; // 로그인/회원가입 페이지로 전환
            renderApp();
        });
    } else console.warn("setupEventListeners: startButton 요소를 찾을 수 없습니다.");

    // 인증 섹션 리스너
    if (loginButton) loginButton.addEventListener('click', handleLogin);
    if (registerButton) registerButton.addEventListener('click', handleRegister);
    if (logoutButton) logoutButton.addEventListener('click', handleLogout);
    
    // 냥이 이름 지정 섹션 리스너
    if (saveCatNameButton) saveCatNameButton.addEventListener('click', handleSaveCatName);
}

// 초기 앱 로드 - 모든 DOM이 완전히 파싱되었는지 확인하기 위해 window.onload 사용
window.onload = function() {
    console.log("window.onload 호출됨."); 
    const elementsReady = getDOMElements(); 
    if (!elementsReady) {
        console.error("필수 DOM 요소를 찾을 수 없습니다. 앱을 초기화할 수 없습니다."); 
        return; 
    }
    setupEventListeners(); 
    isLoading = true; 
    appState = 'loading'; // 초기 상태는 로딩
    initializeFirebaseAndAuth(); 
};
