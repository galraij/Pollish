import { createContext, useContext, useState, useCallback } from 'react'

const translations = {
  en: {
    appName: 'Pollish',
    createOrSelect: 'Create a poll or select one from the panel',
    noPolls: 'No polls yet',
    title: 'Title',
    titlePlaceholder: 'Give your poll a title',
    userName: 'User Name',
    userNamePlaceholder: 'Your name',
    question: 'Question',
    questionPlaceholder: 'What do you want to ask?',
    options: 'Options',
    optionN: 'Option',
    addOption: 'Add option',
    submit: 'Pollish it',
    fillAllFields: 'Please fill in all fields',
    min2Options: 'At least 2 non-empty options required',
    failedCreate: 'Failed to create poll',
    pollNotFound: 'Poll not found',
    by: 'by',
    vote: 'vote',
    votes: 'votes',
    totalVote: 'total vote',
    totalVotes: 'total votes',
    copyLink: 'Copy link',
    copied: 'Copied!',
    hidePanel: 'Hide panel',
    showPanel: 'Show panel',
    noMorePolls: 'No more polls to show',
    createPoll: 'Create Poll',
    swipeToSkip: 'Swipe to skip',
    useCheckboxes: 'Allow multiple selections',
    minSelections: 'Minimum selections',
    maxSelections: 'Maximum selections',
    submitVote: 'Submit Vote',
    selectionLimitError: 'Select between {min} and {max} options',
    toggleLang: 'עב',
  },
  he: {
    appName: 'סקרים וסקרנים',
    createOrSelect: 'צרו סקר או בחרו אחד מהרשימה',
    noPolls: 'אין סקרים עדיין',
    title: 'כותרת',
    titlePlaceholder: 'תנו לסקר שלכם כותרת',
    userName: 'שם משתמש',
    userNamePlaceholder: 'השם שלכם',
    question: 'שאלה',
    questionPlaceholder: 'מה תרצו לשאול?',
    options: 'אפשרויות',
    optionN: 'אפשרות',
    addOption: 'הוסיפו אפשרות',
    submit: 'צור סקר',
    fillAllFields: 'נא למלא את כל השדות',
    min2Options: 'נדרשות לפחות 2 אפשרויות',
    failedCreate: 'יצירת הסקר נכשלה',
    pollNotFound: 'הסקר לא נמצא',
    by: 'מאת',
    vote: 'הצבעה',
    votes: 'הצבעות',
    totalVote: 'הצבעה',
    totalVotes: 'הצבעות',
    copyLink: 'העתיקו קישור',
    copied: 'הועתק!',
    hidePanel: 'הסתירו חלונית',
    showPanel: 'הציגו חלונית',
    noMorePolls: 'אין עוד סקרים להצגה',
    createPoll: 'צור סקר',
    swipeToSkip: 'החליקו לדילוג',
    useCheckboxes: 'אפשר בחירה מרובה',
    minSelections: 'מינימום בחירות',
    maxSelections: 'מקסימום בחירות',
    submitVote: 'הצבע/י',
    selectionLimitError: 'יש לבחור בין {min} ל-{max} אפשרויות',
    toggleLang: 'EN',
  },
}

const LangContext = createContext()

export function LangProvider({ children }) {
  const [lang, setLangState] = useState(() => {
    return localStorage.getItem('pollish_lang') || 'en'
  })

  const setLang = useCallback((newLang) => {
    setLangState(newLang)
    localStorage.setItem('pollish_lang', newLang)
  }, [])

  const t = useCallback((key) => {
    return translations[lang]?.[key] ?? translations.en[key] ?? key
  }, [lang])

  const dir = lang === 'he' ? 'rtl' : 'ltr'
  const isRTL = lang === 'he'

  return (
    <LangContext.Provider value={{ lang, setLang, t, dir, isRTL }}>
      {children}
    </LangContext.Provider>
  )
}

export function useLang() {
  const ctx = useContext(LangContext)
  if (!ctx) throw new Error('useLang must be used within LangProvider')
  return ctx
}
