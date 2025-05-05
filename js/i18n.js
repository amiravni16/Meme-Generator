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
    'text-label': {
        en: 'Text:',
        he: 'טקסט:'
    },
    'delete-line': {
        en: 'Delete',
        he: 'מחק'
    },
    'move-up': {
        en: 'Move Up',
        he: 'הזז למעלה'
    },
    'move-down': {
        en: 'Move Down',
        he: 'הזז למטה'
    },
    'switch-line': {
        en: 'Switch Line',
        he: 'החלף שורה'
    },
    'increase-font': {
        en: 'Increase Font',
        he: 'הגדל גופן'
    },
    'decrease-font': {
        en: 'Decrease Font',
        he: 'הקטן גופן'
    },
    'color-label': {
        en: 'Color:',
        he: 'צבע:'
    },
    'align-left': {
        en: 'Align Left',
        he: 'יישור שמאלה'
    },
    'align-center': {
        en: 'Align Center',
        he: 'יישור למרכז'
    },
    'align-right': {
        en: 'Align Right',
        he: 'יישור ימינה'
    },
    'font-label': {
        en: 'Font:',
        he: 'גופן:'
    },
    'font-family': {
        en: 'Font Family',
        he: 'משפחת גופנים'
    },
    'emoji1': {
        en: 'Emoji 1',
        he: 'אימוג׳י 1'
    },
    'emoji2': {
        en: 'Emoji 2',
        he: 'אימוג׳י 2'
    },
    'emoji3': {
        en: 'Emoji 3',
        he: 'אימוג׳י 3'
    },
    'emoji4': {
        en: 'Emoji 4',
        he: 'אימוג׳י 4'
    },
    'share': {
        en: 'Share',
        he: 'שתף'
    },
    'download-image': {
        en: 'Download Image',
        he: 'הורד תמונה'
    },
    'save-to-memes': {
        en: 'Save to Memes',
        he: 'שמור לממים'
    },
    'share-facebook': {
        en: 'Share on Facebook',
        he: 'שתף בפייסבוק'
    },
    // Add more keys as needed
}

var gCurrLang = 'en'

function getTrans(key) {
    const transMap = gTrans[key]
    if (!transMap) return 'UNKNOWN'
    var txt = transMap[gCurrLang]
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