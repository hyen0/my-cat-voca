# 영어 단어 학습과 즐거움을 결합한 '고양이 육성 영어 단어장(VoCat)' 서비스


 **_"아, 영어 공부 진짜 해야 하는데...."_** 제 주변 친구들이 가장 자주 하는 다짐입니다.
 
  어떤 분야를 공부하는 친구든 항상 골칫거리로 여기는 것이 바로 영어 공부인데요.
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

 이 웹 앱은 사용자가 영어 단어 학습을 통해 가상 고양이의 레벨을 올리는 영어 단어 학습 및 냥이 육성 웹 애플리케이션입니다. 사용자는 회원 가입 후 자신만의 냥이 이름을 정한 뒤 영어 단어 공부를 시작할 수 있습니다. 사용자는 테스트 하나 당 10개의 단어 문제를 풀고, 정답률에 따라 냥이의 행복도와 레벨이 변화하며, 틀린 단어는 오답노트를 통해 다시 학습할 수 있습니다. 하루에 원하는 만큼 테스트에 계속 도전할 수 있으며, 학습을 종료하게 되면 오늘 학습한 단어를 복습할 수 있습니다. 나갔다가 다시 실행해도 고양이의 레벨과 테스트는 변하지 않고 이어지게 됩니다.

**1. HTML (웹 앱 구조)**

head: 웹 페이지의 메타 정보, 외부 스타일시트 및 스크립트 파일을 연결

>입력: 웹 브라우저 (페이지 로드)

>출력: 페이지 제목, 문자 인코딩(UTF-8), 뷰포트 설정(모바일 반응형 디자인), Tailwind CSS 프레임워크 로드, 커스텀 CSS 파일(style.css) 및 JavaScript 파일(words.js, script.js) 링크

초기 로딩 스피너 오버레이 (initial-loading-spinner): 앱이 처음 로드될 때 데이터를 가져오는 동안 사용자에게 로딩 중임을 시각적으로 표시

>입력: 없음 (JavaScript에 의해 자동으로 표시/숨김)

>출력: 애니메이션 스피너와 "데이터를 불러오는 중..." 메시지

랜딩 페이지 섹션 (landing-page-section): 앱의 시작 화면으로, 사용자에게 앱을 소개하고 시작 버튼을 제공

>입력: 사용자 클릭 (start-button)

>출력: 앱 제목, 소개 메시지, '시작하기' 버튼

로그인/회원가입 섹션 (auth-section): 사용자가 이메일과 비밀번호로 로그인하거나 새로운 계정을 등록할 수 있도록 함

>입력: 이메일 입력 (email-input), 비밀번호 입력 (password-input), '로그인' 버튼 (login-button), '회원가입' 버튼 (register-button)

>출력: 입력 필드, 인증 오류 메시지 (auth-error-message)

냥이 이름 짓기 섹션 (cat-naming-section): 새로운 사용자가 고양이의 이름을 설정할 수 있도록 함

>입력: 냥이 이름 입력 (cat-name-input), '저장하고 시작하기' 버튼 (save-cat-name-button)

>출력: 입력 필드, 이름 설정 오류 메시지 (naming-error-message)

메인 앱 콘텐츠 컨테이너 (main-app-content): 고양이 정보 표시 및 단어 테스트가 이루어지는 핵심 영역

>입력: 고양이 섹션: 고양이 이미지 (cat-image), 고양이 이름/레벨 (cat-name-level) / 행복도 진행 바 (happiness-bar), 행복도 텍스트 (happiness-text). 테스트 섹션: 테스트 진행 상황 (test-progress) / 질문 지시문 (question-prompt) / 실제 질문 (display-question) / 단어 옵션 버튼들 (options-area) / 피드백 메시지 (feedback-message) / 정답 표시 (correct-answer-display) / '다음' 버튼 (next-button) / 상태 메시지 (status-message) / '단어 복습하기' 버튼 (review-words-button) / '다음 단계 도전' 버튼 (continue-test-button) / 사용자 정보: 사용자 이메일 (user-email-display) / '로그아웃' 버튼 (logout-button)

>출력: 위에서 언급된 모든 동적인 UI 요소들이 JavaScript에 의해 채워지고 업데이트

모달 구조 (modal-backdrop): 사용자에게 중요한 정보, 경고, 확인 등을 표시하는 오버레이 팝업

>입력: 모달 내 '닫기' 버튼 (modal-close), 선택적 '기본 동작' 버튼 (modal-primary-action)

>출력: 모달 제목 (modal-title), 메시지 (modal-message), 액션 버튼들

**2. CSS (시각적 디자인)**

전역 스타일 및 폰트 (body, @import url(...))

애니메이션 정의 (@keyframes wag, @keyframes pop-in): pop-in은 요소가 나타날 때 부드럽게 튀어나오는 효과를 정의. (레벨업 말풍선에 적용)

>입력: JavaScript가 해당 애니메이션 클래스를 요소에 추가

>출력: 요소의 회전, 크기, 투명도 변화를 통한 시각적 애니메이션

레벨업 말풍선 스타일 (#level-up-speech-bubble): 고양이 레벨업 시 나타나는 말풍선의 위치, 배경색, 글꼴, 그림자, 테두리 등을 정의하고 pop-in 애니메이션을 적용

>입력: JavaScript가 showLevelUpSpeechBubble 상태에 따라 hidden 클래스를 추가/제거

>출력: 레벨업 메시지를 포함하는 시각적으로 눈에 띄는 팝업 말풍선

**3. JavaScript (핵심 코드)**

1. 전역 변수 및 상태 관리: 앱의 현재 상태, 사용자 정보, 고양이 데이터, 테스트 진행 상황 등을 저장하고 관리

>입력: 사용자 로그인/회원가입 정보 (이메일, 비밀번호) / Firestore에서 로드된 고양이 데이터 / 사용자 상호작용 (버튼 클릭, 이름 입력 등) / 단어 테스트 결과 (정답/오답)

>출력: db, auth: Firebase 서비스 인스턴스 / userId, userEmail: 현재 로그인한 사용자 정보 / catData: 고양이의 레벨, 행복도, 이름, testRoundNumber (현재 라운드 번호), masteredWords (학습한 단어 목록) 등 / appState: 현재 앱의 화면/상태('loading', 'landing_page', 'initial' 등) / dailyWords, incorrectWordsForReview: 현재 테스트 단어 및 오답 단어 목록 / resultMessage, feedback: UI에 표시될 메시지 및 피드백

2. DOM 요소 핸들링 (getDOMElements()): HTML 문서가 로드된 후, JavaScript가 조작할 모든 주요 UI 요소(버튼, 입력 필드, 표시 영역 등)에 대한 참조를 가져옴

>입력: HTML 문서의 미리 정의된 id를 가진 요소들

>출력: 각 HTML 요소에 직접 접근하고 내용을 변경할 수 있는 JavaScript 변수들. 필수 요소가 누락되면 오류 메시지를 콘솔에 출력하고 앱 초기화 실패를 사용자에게 알림

3. 렌더링 함수 (renderApp(), renderCatSection(), renderTestSection(), renderModal()): appState 및 기타 전역 상태 변수의 변화에 따라 앱의 사용자 인터페이스를 동적으로 업데이트

>입력: appState (현재 앱의 단계) / isLoading (로딩 중 여부) / catData (고양이 정보) / dailyWords, currentQuestionIndex (테스트 진행 상황) / feedback (단어 테스트 피드백) / resultMessage, isFirstReviewPrompt (모달 메시지 및 동작 결정)

>출력: 각 HTML 섹션의 가시성(hidden/visible) 제어 / catNameLevel, happinessText, userEmailDisplay 등 텍스트 콘텐츠 업데이트 / happinessBar의 width 스타일 변경 / optionsArea에 단어 테스트 옵션 버튼들을 동적으로 생성 / levelUpSpeechBubble의 표시/숨김 및 내용 업데이트 / modalBackdrop, modalTitle, modalMessage, modalPrimaryAction, modalClose 등 모달 팝업의 내용과 동작을 동적으로 설정

4. Firebase 통합 (initializeFirebaseAndAuth(), handleRegister(), handleLogin(), handleLogout(), loadUserData(), updateCatDataInFirestore()): Firebase 클라우드 서비스를 통해 사용자 인증 및 데이터 지속성을 처리

> 입력: firebaseConfig (Firebase 프로젝트 설정) / 사용자의 이메일, 비밀번호 (인증) / catData 객체 (Firestore 저장용) / Firestore의 사용자 문서 변화 (실시간 동기화)

>출력: 인증 상태: 사용자 로그인/로그아웃 상태 (userId, userEmail)를 관리하고 앱 상태를 전환 / 데이터 저장: 고양이 데이터 (catData)를 Firestore에 저장하고 업데이트 / 데이터 로드: Firestore에서 고양이 데이터를 로드하고 (onSnapshot으로 실시간 감지), 데이터가 없으면 기본값으로 초기화, 특히 testRoundNumber와 masteredWords가 초기화되거나 로드됨 / 인증 및 데이터 로드 중 발생할 수 있는 오류 메시지

5. 고양이 데이터 관리 (handleSaveCatName(), updateCatHappiness()): 고양이의 이름, 행복도, 레벨 등 핵심 데이터를 관리하고 업데이트

>입력: 사용자가 입력한 고양이 이름 / 단어 테스트 결과 (allCorrect boolean)

> 출력: catData.name 업데이트 및 Firestore에 저장 이 때 testRoundNumber가 0이면 1로 설정됨 / catData.happiness 및 catData.level 업데이트 / 레벨업 시 showLevelUpSpeechBubble 플래그를 설정하여 말풍선 표시를 트리거함 / 업데이트된 catData를 Firestore에 반영

6. 단어 테스트 로직 (startNewTest(), setupQuestion(), handleAnswer(), proceedToNextQuestionOrPhase()): 단어 테스트의 전체 흐름을 제어

>입력: initialWords (단어 데이터) / 사용자의 답변 옵션 선택 / appState (현재 테스트 단계: 'initial' 또는 'review')

>출력: dailyWords: 무작위로 선택된 테스트 단어 목록 이 단어들은 catData.masteredWords에도 추가됨 / testType: 영어-한국어 또는 한국어-영어 질문 유형 / options: 4지선다형 답변 보기 / feedback: 정답/오답 메시지 및 정답 표시 / incorrectWordsForReview: 틀린 단어 목록을 업데이트하여 오답노트 학습에 활용 / catData.testRoundNumber를 증가시키고 Firestore에 저장 (전체 테스트 라운드 성공 완료 시) / appState 전환 ('round_completed_success', 'initial_test_completed_with_errors', 'review', 'session_ended' 등)

7. 이벤트 리스너 설정 (setupEventListeners()): HTML의 버튼과 같은 사용자 상호작용 요소에 클릭 이벤트를 연결하여, 사용자의 동작에 따라 위에 설명된 JavaScript 함수들을 호출

>입력: HTML 요소들의 클릭 이벤트

>출력: 해당 이벤트 핸들러 함수(예: handleLogin, startNewTest, proceedToNextQuestionOrPhase)를 실행합니다

8. 초기 앱 로드 (window.onload): 웹 페이지가 완전히 로드된 시점을 감지하여 앱의 초기 설정을 시작합니다

>입력: window.onload 이벤트

>출력: getDOMElements() 호출로 DOM 요소 초기화 / setupEventListeners() 호출로 이벤트 리스너 연결 / isLoading 및 appState를 'loading'으로 설정하여 초기 로딩 화면 표시 / initializeFirebaseAndAuth() 호출로 Firebase 초기화 및 인증 프로세스 시작
