'use strict'

var gImgs = [
    { id: 1, url: 'img/1.jpg', keywords: ['funny', 'animal'] },
    { id: 2, url: 'img/2.jpg', keywords: ['happy', 'nature'] },
    { id: 3, url: 'img/3.jpg', keywords: ['bad', 'awkward'] },
    { id: 4, url: 'img/4.jpg', keywords: ['sad', 'animal'] },
    { id: 5, url: 'img/5.jpg', keywords: ['funny', 'happy'] },
    { id: 6, url: 'img/6.jpg', keywords: ['nature', 'awkward'] },
    { id: 7, url: 'img/7.jpg', keywords: ['bad', 'sad'] },
    { id: 8, url: 'img/8.jpg', keywords: ['funny', 'nature'] },
    { id: 9, url: 'img/9.jpg', keywords: ['animal', 'happy'] },
    { id: 10, url: 'img/10.jpg', keywords: ['bad', 'funny'] },
    { id: 11, url: 'img/11.jpg', keywords: ['awkward', 'sad'] },
    { id: 12, url: 'img/12.jpg', keywords: ['nature', 'animal'] },
    { id: 13, url: 'img/13.jpg', keywords: ['happy', 'bad'] },
    { id: 14, url: 'img/14.jpg', keywords: ['funny', 'sad'] },
    { id: 15, url: 'img/15.jpg', keywords: ['animal', 'awkward'] },
    { id: 16, url: 'img/16.jpg', keywords: ['nature', 'happy'] },
    { id: 17, url: 'img/17.jpg', keywords: ['bad', 'animal'] },
    { id: 18, url: 'img/18.jpg', keywords: ['funny', 'nature'] }
]

var gMeme = {
    selectedImgId: 1,
    selectedLineIdx: 0,
    lines: [
        {
            txt: 'I sometimes eat Falafel',
            size: 20,
            color: '#ff0000',
            x: 250,
            y: 50,
            boxX: 0,
            boxY: 0,
            boxWidth: 0,
            boxHeight: 0,
            fontFamily: 'Arial',
            align: 'center'
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

function getImageById(imgId) {
    return gImgs.find(img => img.id === imgId)
}

function setImg(imgId) {
    gMeme.selectedImgId = imgId
}

function setLineTxt(txt, lineIdx) {
    gMeme.lines[lineIdx].txt = txt
}

function addLine() {
    const newLine = {
        txt: '',
        size: 20,
        color: '#ff0000',
        x: 250,
        y: gMeme.lines.length * 50 + 50,
        boxX: 0,
        boxY: 0,
        boxWidth: 0,
        boxHeight: 0,
        fontFamily: 'Arial',
        align: 'center'
    }
    gMeme.lines.push(newLine)
    return gMeme.lines.length - 1
}

function setLineBox(lineIdx, boxX, boxY, boxWidth, boxHeight) {
    gMeme.lines[lineIdx].boxX = boxX
    gMeme.lines[lineIdx].boxY = boxY
    gMeme.lines[lineIdx].boxWidth = boxWidth
    gMeme.lines[lineIdx].boxHeight = boxHeight
}

function setFontFamily(fontFamily, lineIdx) {
    gMeme.lines[lineIdx].fontFamily = fontFamily
}

function setColor(color, lineIdx) {
    gMeme.lines[lineIdx].color = color
}

function setFontSize(size, lineIdx) {
    gMeme.lines[lineIdx].size = size
}

function setAlignment(align, lineIdx) {
    gMeme.lines[lineIdx].align = align
}

function adjustLinePosition(lineIdx, dy, canvasHeight) {
    const line = gMeme.lines[lineIdx]
    line.y = Math.max(0, Math.min(line.y + dy, canvasHeight))
}

function switchLine() {
    gMeme.selectedLineIdx = (gMeme.selectedLineIdx + 1) % gMeme.lines.length
}

function setSelectedLine(lineIdx) {
    gMeme.selectedLineIdx = lineIdx
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