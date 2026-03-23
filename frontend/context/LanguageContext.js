import { createContext, useContext, useState, useEffect } from 'react';

const LanguageContext = createContext(null);

const translations = {
  en: {
    title: 'SAB3',
    subtitle: 'THE BLUFFING GAME',
    choosePath: 'CHOOSE YOUR PATH',
    createRoom: 'CREATE ROOM',
    joinRoom: 'JOIN ROOM',
    leaderboard: 'LEADERBOARD',
    back: 'BACK',
    yourName: 'YOUR NAME',
    roomCode: 'ROOM CODE',
    rounds: 'ROUNDS',
    launchRoom: 'LAUNCH ROOM',
    enterRoom: 'ENTER ROOM',
    copyLink: 'COPY LINK',
    playersOnline: 'PLAYERS ONLINE',
    waitingPlayers: 'Waiting for more players...',
    startGame: 'START GAME',
    waitingHost: 'Waiting for host to start...',
    enterName: 'Enter your name',
    connecting: 'Connecting to server...',
    enterCode: 'Enter a room code',
    shareCode: 'Share this code with friends to join',
    correctGuess: 'CORRECT GUESS',
    foolSomeone: 'FOOL SOMEONE',
    round: 'ROUND',
    answerTime: 'ANSWER TIME',
    votingTime: 'VOTING TIME',
    theQuestionIs: 'THE QUESTION IS...',
    writeFakeAnswer: 'WRITE A CONVINCING FAKE ANSWER',
    submit: 'SUBMIT',
    answerLocked: 'ANSWER LOCKED IN',
    waitingOthers: 'Waiting for others...',
    whichReal: 'WHICH IS THE REAL ANSWER?',
    voteNow: 'VOTE NOW',
    yourAnswer: 'your answer',
    voteSubmitted: 'VOTE SUBMITTED',
    playersSubmitted: 'players submitted',
    truthRevealed: 'THE TRUTH REVEALED',
    correctAnswerLabel: 'CORRECT ANSWER:',
    realAnswer: 'REAL ANSWER',
    by: 'by',
    votes: 'votes',
    vote: 'vote',
    roundScores: 'ROUND SCORES',
    scoreboard: 'SCOREBOARD',
    finalResults: 'FINAL RESULTS',
    afterRound: 'AFTER ROUND',
    pts: 'PTS',
    nextRoundStarting: 'Next round starting soon...',
    winner: 'WINNER',
    playAgain: 'PLAY AGAIN',
    home: 'HOME',
    go: 'GO!',
    secondsShort: 's',
    allTimeTop: 'ALL-TIME TOP SCORERS',
    noScores: 'No scores yet. Play a game first!',
    loading: 'Loading...',
    backToHome: 'BACK TO HOME',
    history: 'HISTORY',
    science: 'SCIENCE',
    geography: 'GEOGRAPHY',
    animals: 'ANIMALS',
    technology: 'TECHNOLOGY',
    music: 'MUSIC',
    fun: 'FUN',
    writingPhase: 'WRITING PHASE',
    votingPhase: 'VOTING PHASE',
    resultsPhase: 'RESULTS PHASE',
    scoreboard: 'SCOREBOARD',
    finished: 'GAME OVER',
    hostLabel: 'HOST',
    errorRoomNotFound: 'Room not found',
    errorGameFinished: 'Game already finished',
    errorRoomFull: 'Room is full (max 7 players)',
    errorHostOnly: 'Only the host can start the game',
    errorMinPlayers: 'Need at least 2 players to start',
    createdBy: 'CREATED BY KOSSAY LI',
  },
  ar: {
    title: 'سبعة',
    subtitle: 'لعبة الخداع',
    choosePath: 'اختر طريقك',
    createRoom: 'إنشاء غرفة',
    joinRoom: 'انضمام لغرفة',
    leaderboard: 'لوحة الصدارة',
    back: 'رجوع',
    yourName: 'اسمك',
    roomCode: 'رمز الغرفة',
    rounds: 'الجولات',
    launchRoom: 'ابدأ الغرفة',
    enterRoom: 'دخول الغرفة',
    copyLink: 'نسخ الرابط',
    playersOnline: 'اللاعبون المتصلون',
    waitingPlayers: 'في انتظار المزيد من اللاعبين...',
    startGame: 'بدء اللعبة',
    waitingHost: 'في انتظار المضيف لبدء اللعبة...',
    enterName: 'أدخل اسمك',
    connecting: 'جاري الاتصال بالسيرفر...',
    enterCode: 'أدخل رمز الغرفة',
    shareCode: 'شارك هذا الرمز مع أصدقائك للانضمام',
    correctGuess: 'تخمين صحيح',
    foolSomeone: 'خدعت شخصاً ما',
    round: 'الجولة',
    answerTime: 'وقت الإجابة',
    votingTime: 'وقت التصويت',
    theQuestionIs: 'السؤال هو...',
    writeFakeAnswer: 'اكتب إجابة مزيفة مقنعة',
    submit: 'إرسال',
    answerLocked: 'تم تثبيت الإجابة',
    waitingOthers: 'في انتظار الآخرين...',
    whichReal: 'أي إجابة هي الحقيقية؟',
    voteNow: 'صوّت الآن',
    yourAnswer: 'إجابتك',
    voteSubmitted: 'تم التصويت',
    playersSubmitted: 'لاعبون أرسلوا إجاباتهم',
    truthRevealed: 'كشف الحقيقة',
    correctAnswerLabel: 'الإجابة الصحيحة:',
    realAnswer: 'الإجابة الحقيقية',
    by: 'بواسطة',
    votes: 'أصوات',
    vote: 'صوت',
    roundScores: 'نتائج الجولة',
    scoreboard: 'لوحة النتائج',
    finalResults: 'النتائج النهائية',
    afterRound: 'بعد الجولة',
    pts: 'نقطة',
    nextRoundStarting: 'تبدأ الجولة القادمة قريباً...',
    winner: 'الفائز',
    playAgain: 'اللعب مرة أخرى',
    home: 'الرئيسية',
    go: 'انطلق!',
    secondsShort: 'ث',
    allTimeTop: 'أفضل الهدافين على مر العصور',
    noScores: 'لا توجد نتائج بعد. العب أولاً!',
    loading: 'جاري التحميل...',
    backToHome: 'العودة للرئيسية',
    history: 'تاريخ',
    science: 'علوم',
    geography: 'جغرافيا',
    animals: 'حيوانات',
    technology: 'تكنولوجيا',
    music: 'موسيقى',
    fun: 'تسلية',
    writingPhase: 'مرحلة الكتابة',
    votingPhase: 'مرحلة التصويت',
    resultsPhase: 'مرحلة النتائج',
    scoreboard: 'لوحة النتائج',
    finished: 'انتهت اللعبة',
    hostLabel: 'المضيف',
    errorRoomNotFound: 'الغرفة غير موجودة',
    errorGameFinished: 'اللعبة انتهت بالفعل',
    errorRoomFull: 'الغرفة ممتلئة (الحد الأقصى 7 لاعبين)',
    errorHostOnly: 'المضيف فقط يمكنه بدء اللعبة',
    errorMinPlayers: 'يجب وجود لاعبين على الأقل للبدء',
    createdBy: 'تم التطوير بواسطة قصي ',
  }
};

export function LanguageProvider({ children }) {
  const [language, setLanguage] = useState('en');

  useEffect(() => {
    const savedLang = localStorage.getItem('language');
    if (savedLang) {
      setLanguage(savedLang);
    }
  }, []);

  useEffect(() => {
    document.documentElement.lang = language;
    document.documentElement.dir = language === 'ar' ? 'rtl' : 'ltr';
    localStorage.setItem('language', language);
  }, [language]);

  const toggleLanguage = () => {
    setLanguage(prev => prev === 'en' ? 'ar' : 'en');
  };

  const t = (key) => {
    return translations[language][key] || key;
  };

  return (
    <LanguageContext.Provider value={{ language, toggleLanguage, t }}>
      {children}
    </LanguageContext.Provider>
  );
}

export function useLanguage() {
  return useContext(LanguageContext);
}
