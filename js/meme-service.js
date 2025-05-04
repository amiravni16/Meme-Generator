'use strict'

const gImgs = [
    { id: 1, url: 'img/1.jpg', keywords: ['funny', 'trump' , 'president', 'politics'] },
    { id: 2, url: 'img/2.jpg', keywords: ['dog', 'cute', 'animal'] },
    { id: 3, url: 'img/3.jpg', keywords: ['cute', 'dog', 'baby'] },
    { id: 4, url: 'img/4.jpg', keywords: ['funny', 'cat', 'cute'] },
    { id: 5, url: 'img/5.jpg', keywords: ['funny', 'baby', 'cute'] },
    { id: 6, url: 'img/6.jpg', keywords: ['funny', 'man'] },
    { id: 7, url: 'img/7.jpg', keywords: ['funny', 'baby'] },
    { id: 8, url: 'img/8.jpg', keywords: ['funny', 'man'] },
    { id: 9, url: 'img/9.jpg', keywords: ['funny', 'baby','evil'] },
    { id: 10, url: 'img/10.jpg', keywords: ['funny', 'obama', 'president', 'politics'] },
    { id: 11, url: 'img/11.jpg', keywords: ['funny', 'sports'] },
    { id: 12, url: 'img/12.jpg', keywords: ['funny', 'man'] },
    { id: 13, url: 'img/13.jpg', keywords: ['movie', 'leo','winning'] },
    { id: 14, url: 'img/14.jpg', keywords: ['movie', 'matrix','sad', 'serious'] },
    { id: 15, url: 'img/15.jpg', keywords: ['movie', 'lord'] },
    { id: 16, url: 'img/16.jpg', keywords: ['funny', 'star', 'movie'] },
    { id: 17, url: 'img/17.jpg', keywords: ['politics', 'putin', 'president'] },
    { id: 18, url: 'img/18.jpg', keywords: ['funny', 'movie', 'toy'] }
]

const gMeme = {
    selectedImgId: 1,
    selectedLineIdx: 0,
    lines: [
        {
            txt: 'Enter Text',
            size: 40,
            align: 'center',
            color: 'white',
            fontFamily: 'Impact',
            x: 250,
            y: 50,
            rotation: 0,
            scale: 1,
            boxX: 0,
            boxY: 0,
            boxWidth: 0,
            boxHeight: 0
        }
    ]
}

var gKeywordPopularity = loadKeywordPopularity()

function getMeme() {
    return gMeme
}

function getImages() {
    return gImgs
}

function getImageById(id) {
    return gImgs.find(img => img.id === id)
}

function setSelectedImg(imgId) {
    gMeme.selectedImgId = imgId
}

function setLineTxt(txt, lineIdx) {
    gMeme.lines[lineIdx].txt = txt
}

function setSelectedLine(lineIdx) {
    gMeme.selectedLineIdx = lineIdx
}

function addLine() {
    const newLine = {
        txt: 'Enter Text',
        size: 40,
        align: 'center',
        color: 'white',
        fontFamily: 'Impact',
        x: 250,
        y: 250,
        rotation: 0,
        scale: 1,
        boxX: 0,
        boxY: 0,
        boxWidth: 0,
        boxHeight: 0
    }
    gMeme.lines.push(newLine)
    return gMeme.lines.length - 1
}

function switchLine() {
    gMeme.selectedLineIdx = (gMeme.selectedLineIdx + 1) % gMeme.lines.length
}

function setFontSize(size, lineIdx) {
    gMeme.lines[lineIdx].size = size
}

function setColor(color, lineIdx) {
    gMeme.lines[lineIdx].color = color
}

function setFontFamily(fontFamily, lineIdx) {
    gMeme.lines[lineIdx].fontFamily = fontFamily
}

function setAlignment(align, lineIdx) {
    gMeme.lines[lineIdx].align = align
}

function setRotation(rotation, lineIdx) {
    gMeme.lines[lineIdx].rotation = rotation
}

function setScale(scale, lineIdx) {
    gMeme.lines[lineIdx].scale = scale
}

function setLineBox(lineIdx, x, y, width, height) {
    gMeme.lines[lineIdx].boxX = x
    gMeme.lines[lineIdx].boxY = y
    gMeme.lines[lineIdx].boxWidth = width
    gMeme.lines[lineIdx].boxHeight = height
}

function adjustLinePosition(lineIdx, deltaY, duration) {
    const line = gMeme.lines[lineIdx]
    const startY = line.y
    const endY = startY + deltaY
    const startTime = performance.now()

    function animate(currentTime) {
        const elapsed = currentTime - startTime
        const progress = Math.min(elapsed / duration, 1)
        line.y = startY + (endY - startY) * progress

        if (progress < 1) {
            requestAnimationFrame(animate)
        }
    }

    requestAnimationFrame(animate)
}

function saveMeme() {
    const savedMemes = loadSavedMemes()
    savedMemes.push(JSON.parse(JSON.stringify(gMeme)))
    saveToStorage('savedMemes', savedMemes)
}

function loadSavedMemes() {
    return loadFromStorage('savedMemes') || []
}

function loadMeme(memeData) {
    gMeme.selectedImgId = memeData.selectedImgId
    gMeme.selectedLineIdx = memeData.selectedLineIdx
    gMeme.lines = memeData.lines
}

function loadKeywordPopularity() {
    const savedPopularity = loadFromStorage('keywordPopularity')
    if (savedPopularity) return savedPopularity

    const initialPopularity = {
        'funny': 10,
        'animal': 8,
        'bad': 6,
        'awkward': 4,
        'happy': 12,
        'sad': 5,
        'nature': 3,
        'custom': 1
    }
    saveToStorage('keywordPopularity', initialPopularity)
    return initialPopularity
}

function incrementKeywordPopularity(keyword) {
    gKeywordPopularity[keyword] = (gKeywordPopularity[keyword] || 0) + 1
    saveToStorage('keywordPopularity', gKeywordPopularity)
}

function getKeywordPopularity() {
    return gKeywordPopularity
}