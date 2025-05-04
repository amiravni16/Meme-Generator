const gTrans = {
    'title': {
        en: 'Meme Generator',
        he: 'מחולל ממים'
    },
    'add-line': {
        en: 'Add Line',
        he: 'הוסף שורה'
    },
    'delete-line': {
        en: 'Delete Line',
        he: 'מחק שורה'
    },
    'download': {
        en: 'Download',
        he: 'הורד'
    },
    'share': {
        en: 'Share',
        he: 'שתף'
    },
    'font-size': {
        en: 'Font Size',
        he: 'גודל גופן'
    },
    'color': {
        en: 'Color',
        he: 'צבע'
    },
    'switch-line': {
        en: 'Switch Line',
        he: 'החלף שורה'
    },
    'move-up': {
        en: 'Move Up',
        he: 'הזז למעלה'
    },
    'move-down': {
        en: 'Move Down',
        he: 'הזז למטה'
    },
    'save': {
        en: 'Save',
        he: 'שמור'
    },
    'gallery': {
        en: 'Gallery',
        he: 'גלריה'
    },
    'editor': {
        en: 'Editor',
        he: 'עורך'
    },
    'about': {
        en: 'About',
        he: 'אודות'
    },
    // Add more keys as needed
}

let gCurrLang = 'en'

function getTrans(key) {
    const transMap = gTrans[key]
    if (!transMap) return 'UNKNOWN'
    let txt = transMap[gCurrLang]
    if (!txt) txt = transMap['en']
    return txt
}

function setLang(lang) {
    gCurrLang = lang
    doTrans()
}

function doTrans() {
    const els = document.querySelectorAll('[data-trans]')
    els.forEach(el => {
        const key = el.getAttribute('data-trans')
        el.innerText = getTrans(key)
    })
    // document.body.dir = (gCurrLang === 'he') ? 'rtl' : 'ltr'
} 