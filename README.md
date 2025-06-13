# 영어 단어 학습과 즐거움을 결합한 '고양이 육성 영어 단어장(VoCat)' 서비스


 **_"아, 영어 공부 진짜 해야 하는데...."_** 
 
 어떤 분야를 공부하는 친구든 항상 골칫거리로 여기는 것이 바로 영어 공부입니다.
 특히나 대학생들에게 필수적인 역량 중 하나인 토익(TOEIC) 점수 향상을 위해, 재미있고 효과적인 영어 단어 학습을 돕는 '웹 기반 단어장 서비스'를 개발하고자 했습니다. 
 
 저 또한 단순히 단어를 암기하는 방식으로는 학습 의지를 유지하기 어려웠기 때문에 어떻게 학습에 재미를 더할까 고민하던 중, 토스(Toss) 앱의 '고양이 키우기' 출석 체크 기능에서 영감을 얻었습니다.
 귀여운 고양이를 키운다는 목적을 가지게 되니 귀찮은 과제일지라도 매일 출석해서 원하는 목표를 이뤄가는 저를 발견했습니다.
 영어 단어를 조금이라도 재미있게 공부하고 싶은 학생이 고양이를 보기 위해 토스 앱을 켜던 저처럼, 우선 가벼운 목표를 가지고 이 VoCat과 영어 공부를 시작했으면 하는 바람입니다!

---

### 코드 실행 방법


 본격적인 상세 기능 설명에 들어가기 앞서 이 웹 앱이 프론트 엔드와 firebase를 통한 백엔드를 구현하여 파일에서 직접 html를 실행시키면 제대로 작동되지 않습니다. 따라서 제대로 실행할 수 있는 방법을 알려드리겠습니다.

 1. 일단 Vs Code 확장 프로그램이 필요합니다.
 2. Vs Code를 열고 왼쪽 사이드바에서 확장(Extensions) 아이콘(네모 상자가 여러 개 있는 모양)을 클릭합니다.
 3. 검색창에 "Live Server"를 입력하고, Ritwick Dey가 개발한 확장 프로그램을 찾아 설치합니다.
 4. 그리고 모든 소스코드를 다운받아서 한 파일에 저장한 뒤, VS CODE 앱에서 소스코드가 들어있는 폴더를 열어줍니다.
 5. 그 다음 html 파일을 누르고 Vs Code의 오른쪽 하단에 있는 "Go Live"를 눌러주면 자동으로 실행이 됩니다!

---

### 코드 상세 기능 설명

이 웹 앱은 사용자가 영어 단어 학습을 통해 가상 고양이를 키우는 영어 단어 학습 및 냥이 육성 애플리케이션입니다. 사용자는 매일 일정 수의 단어 테스트를 풀고, 정답률에 따라 냥이의 행복도와 레벨이 변화하며, 틀린 단어는 오답노트를 통해 다시 학습할 수 있습니다.

**1. HTML (웹 앱 구조)**

initial-loading-spinner (초기 로딩 스피너): 앱이 처음 로드되거나 데이터를 불러올 때 사용자에게 로딩 중임을 시각적으로 알려줍니다.

>입력: 없음

>출력: 화면 중앙에 로딩 스피너와 "데이터를 불러오는 중..." 메시지 표시.

>상태: isLoading 변수에 따라 표시되거나 숨겨집니다.

auth-section (로그인/회원가입 섹션): 사용자가 앱에 로그인하거나 새로운 계정을 생성할 수 있도록 합니다.

>입력: 사용자의 이메일(email-input), 비밀번호(password-input).

>출력: 로그인/회원가입 폼, 오류 메시지(auth-error-message).

>상태: appState가 'login_register'일 때 표시됩니다.

cat-naming-section (냥이 이름 짓기 섹션): 새로 가입한 사용자 또는 냥이 이름이 없는 사용자가 냥이의 이름을 설정할 수 있도록 합니다.

>입력: 냥이 이름(cat-name-input).

>출력: 이름 입력 필드, 오류 메시지(naming-error-message).

>상태: appState가 'cat_naming'일 때 표시됩니다.

main-app-content (메인 앱 콘텐츠): 로그인 후 앱의 핵심 기능을 제공하는 주 화면입니다. 냥이 정보 섹션과 단어 테스트 섹션으로 나뉩니다.

cat-section (냥이 정보 섹션): 냥이의 이름, 레벨, 행복도 등을 표시합니다. 레벨업 시에는 말풍선이 나타납니다.

>입력: 없음 (냥이 데이터는 내부적으로 관리)

>출력: 냥이 이미지(cat-image), 냥이 이름 및 레벨(cat-name-level), 행복도 바(happiness-bar) 및 텍스트(happiness-text), 레벨업 시 "Level up!" 말풍선(level-up-speech-bubble).

test-section (단어 테스트 섹션): 사용자에게 단어 테스트를 제공하고, 답변에 대한 피드백을 보여줍니다.

>입력: 옵션 버튼 클릭 (사용자의 답변).

>출력: 테스트 진행 상황(test-progress), 질문 프롬프트(question-prompt), 표시 단어(display-question), 여러 개의 선택지 버튼(options-area), 정오답 피드백 메시지(feedback-message), 정답 표시(correct-answer-display), 다음 버튼(next-button), 현재 상태 메시지(status-message).

>상태: appState가 'initial' 또는 'review'일 때 질문/옵션 영역이 표시됩니다. feedback 변수에 따라 피드백 영역이 표시됩니다. appState가 'session_ended' 등일 때는 상태 메시지 영역이 표시됩니다.

modal-backdrop (모달 구조): 테스트 완료, 다음 테스트 진행 여부, 오답노트 학습 시작 안내 등 중요한 알림을 사용자에게 모달 팝업 형태로 보여줍니다.

>입력: 모달 내의 버튼 클릭 (예/아니오, 확인, 닫기).

>출력: 모달 제목(modal-title), 메시지(modal-message), 주 작업 버튼(modal-primary-action), 닫기 버튼(modal-close).

>상태: appState가 'round_completed_success', 'ask_to_continue', 'show_daily_words', 'initial_test_completed_with_errors'일 때 표시됩니다.


**2. CSS (시각적 스타일)**


기본 스타일: font-family: 'Inter', sans-serif;로 폰트를 설정하고, margin: 0;으로 기본 여백을 제거합니다.

overflow: hidden;은 초기 로딩 시 스크롤바가 나타나는 것을 방지합니다.

animate-wag 애니메이션: @keyframes wag를 정의하여 꼬리를 흔드는 듯한 애니메이션을 구현합니다. 이는 냥이 이미지에 적용될 수 있습니다.

화면 전환 효과: main-app-hidden 클래스는 opacity: 0;과 pointer-events: none;을 사용하여 앱 콘텐츠를 숨기고 클릭을 비활성화합니다.

transition-opacity를 통해 숨김/표시 시 부드러운 전환 효과를 제공합니다.

#level-up-speech-bubble 스타일: 레벨업 시 나타나는 말풍선의 위치, 크기, 색상, 그림자, 둥근 모서리 등을 정의합니다.

position: absolute;, top: 50%;, right: 0;, transform: translateY(-50%) translateX(50%);를 사용하여 냥이 이미지 오른쪽 상단에 위치하도록 합니다.

opacity: 0;과 transition을 통해 기본적으로 숨겨져 있다가 나타날 때 부드럽게 페이드인/아웃됩니다.

@keyframes pop-in을 사용하여 나타날 때 미세하게 확대되는 효과를 줍니다.

**3. JavaScript (핵심 로직)**

3.1. 초기화 및 설정

Firebase SDK 임포트: Firebase 인증 및 Firestore 데이터베이스 기능을 사용하기 위한 라이브러리를 가져옵니다.

firebaseConfig: Firebase 프로젝트 설정 정보를 담고 있습니다.

전역 상태 변수: db, auth, userId, catData, appState 등 앱의 현재 상태와 데이터를 저장하는 변수들입니다. 이 변수들의 값 변화에 따라 앱의 UI가 업데이트됩니다.

getDOMElements(): HTML 요소들이 모두 로드된 후, 필요한 모든 DOM 요소를 JavaScript 변수에 할당하여 쉽게 접근할 수 있도록 합니다.

setupEventListeners(): 모든 버튼과 인터랙티브 요소에 클릭 이벤트 리스너를 추가하여 사용자의 상호작용을 처리합니다.

window.onload: 웹 페이지가 완전히 로드되면 getDOMElements()를 호출하여 DOM 요소를 가져오고, setupEventListeners()를 호출하여 이벤트 리스너를 설정하며, initializeFirebaseAndAuth()를 호출하여 Firebase를 초기화하고 사용자 인증 상태를 확인합니다.

3.2. 사용자 인증

initializeFirebaseAndAuth(): Firebase 앱을 초기화하고 Firestore 및 Auth 인스턴스를 가져옵니다.

onAuthStateChanged(auth, async (user) => { ... }) 리스너를 설정하여 사용자의 로그인 상태 변화를 실시간으로 감지합니다.

>입력: Firebase 인증 상태 변화 (로그인/로그아웃/초기 로딩).

>출력: userId 및 userEmail 업데이트, isAuthReady 상태 설정, appState 전환 (로그인 필요 시 login_register, 로그인 완료 시 loadUserData 호출).

handleRegister():

>입력: 이메일, 비밀번호 (HTML <input> 필드에서 가져옴).

>처리: createUserWithEmailAndPassword를 사용하여 새 계정을 생성합니다.

>출력: 성공 시 onAuthStateChanged가 트리거되어 앱 상태가 변경됩니다. 실패 시 authErrorMessage에 오류 메시지를 표시합니다.

handleLogin():

>입력: 이메일, 비밀번호.

>처리: signInWithEmailAndPassword를 사용하여 로그인합니다.

>출력: onAuthStateChanged가 트리거됩니다. 실패 시 authErrorMessage에 오류 메시지를 표시합니다.

handleLogout():

>입력: 없음 (로그아웃 버튼 클릭).

>처리: signOut(auth)를 호출하여 현재 사용자를 로그아웃합니다.

>출력: onAuthStateChanged가 트리거되어 앱 상태가 login_register로 전환됩니다.

3.3. 냥이 데이터 관리

loadUserData():

>입력: Firebase 인증이 완료된 사용자 ID.

>처리: Firestore에서 현재 사용자의 냥이 데이터를 실시간으로 감지(onSnapshot)하고 catData 변수를 업데이트합니다.

>출력: catData 변수 업데이트, catData.name이 null이면 cat_naming 상태로 전환, 오늘 테스트를 이미 했다면 session_ended 상태로 전환, 아니면 initial 상태로 전환하며 새 테스트를 시작합니다.

handleSaveCatName():

>입력: 냥이 이름 (HTML <input> 필드에서 가져옴).

>처리: catData.name을 업데이트하고 updateCatDataInFirestore()를 호출하여 Firestore에 저장합니다.

>출력: Firestore 데이터 업데이트.

updateCatDataInFirestore():

>입력: 현재 catData 상태.

>처리: setDoc 함수를 사용하여 catData를 Firestore에 저장(병합)합니다.

>출력: Firestore에 냥이 데이터 저장.

updateCatHappiness(allCorrect):

>입력: allCorrect (이번 테스트를 모두 맞혔는지 여부 - true/false).

>처리: allCorrect 값에 따라 냥이의 happiness를 증가시키거나 감소시키고, 일정 행복도 이상이 되면 level을 증가시킵니다. 레벨업 시 showLevelUpSpeechBubble을 true로 설정하고 2초 후 다시 false로 설정하는 setTimeout을 실행합니다.

>출력: catData 변수 업데이트, levelUpSpeechBubble 표시/숨김, updateCatDataInFirestore() 호출.

updateLastTestDate():

>입력: 없음.

>처리: 현재 날짜를 catData.lastTestDate에 저장하고 Firestore에 업데이트하여 일일 테스트 제한을 구현합니다.

>출력: Firestore에 lastTestDate 업데이트.

3.4. 단어 테스트 로직
startNewTest():

>입력: 없음 (테스트 시작 버튼 클릭 또는 자동 시작).

>처리: canTakeTest를 확인하고, 테스트에 필요한 변수들(currentQuestionIndex, initialTestCorrectCount, incorrectWordsForReview, resultMessage, feedback)을 초기화합니다. initialWords에서 무작위로 TEST_WORD_COUNT만큼의 단어를 dailyWords로 선택합니다.

>출력: dailyWords 배열 생성, setupQuestion 호출, appState를 'initial'로 설정.

setupQuestion(word):

>입력: 현재 테스트할 단어 객체.

>처리: 영어-한국어 또는 한국어-영어로 무작위로 테스트 유형을 결정하고, 올바른 답과 3개의 오답을 포함하는 options 배열을 생성합니다.

>출력: testType, options 배열 업데이트 (UI 렌더링에 사용될 데이터 준비).

handleAnswer(selectedOption):

>입력: 사용자가 클릭한 선택지(selectedOption).

>처리: selectedOption과 현재 단어의 정답을 비교하여 정오답 여부를 판단합니다. 정답이면 initialTestCorrectCount를 증가시키거나 오답노트에서 해당 단어를 제거합니다. 오답이면 incorrectWordsForReview에 단어를 추가합니다.

>출력: feedback 객체 업데이트 (정답/오답 메시지 및 정답 표시). renderApp() 호출.

proceedToNextQuestionOrPhase():

>입력: 없음 (다음 버튼 클릭).

>처리: feedback을 초기화하고, currentQuestionIndex를 증가시켜 다음 질문으로 넘어갑니다. 모든 질문을 다 풀었다면, 오답이 없으면 round_completed_success 상태로 전환하고 updateCatHappiness 및 updateLastTestDate를 호출합니다. 오답이 있다면 initial_test_completed_with_errors 상태로 전환하여 오답노트 학습을 안내합니다.

>출력: 다음 질문 설정 또는 앱 상태 전환 (모달 표시, 세션 종료 등).

3.5. 렌더링 로직

renderApp() (메인 렌더링 함수): 앱의 핵심 렌더링 로직으로, isLoading 및 appState 변수의 값에 따라 각 HTML 섹션의 가시성을 제어합니다.

renderCatSection(), renderTestSection(), renderModal()을 호출하여 해당 UI를 업데이트합니다.

>입력: isLoading, appState 및 기타 전역 상태 변수의 변화.

>출력: HTML 요소들의 hidden 클래스 토글, userEmailDisplay 업데이트, renderCatSection, renderTestSection, renderModal 호출을 통한 세부 UI 업데이트.

renderCatSection(): catData의 현재 값(이름, 레벨, 행복도)을 기반으로 냥이 정보 UI를 업데이트합니다. showLevelUpSpeechBubble 값에 따라 말풍선을 표시하거나 숨깁니다.

renderTestSection(): appState에 따라 질문 영역, 피드백 영역, 상태 메시지 영역의 가시성을 제어하고, 현재 단어 테스트 데이터를 기반으로 질문, 옵션, 진행 상황을 업데이트합니다.

renderModal(): appState가 특정 모달 관련 상태일 때 모달을 표시하고, resultMessage 및 현재 앱 상태에 맞는 제목과 메시지를 모달에 채워 넣습니다. 각 모달 버튼에 적절한 onclick 이벤트를 할당하여 상태 전환을 처리합니다.

이러한 단계들을 통해 앱은 사용자 인증부터 단어 학습, 냥이 육성까지의 전체적인 흐름을 유기적으로 제공합니다. 각 기능은 데이터 상태에 따라 동적으로 UI를 업데이트하며 상호작용합니다.
