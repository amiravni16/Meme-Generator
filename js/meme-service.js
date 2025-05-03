'use strict'

var gImgs = [
    { id: 1, url: 'img/1.jpg', keywords: ['funny', 'animal'] },
    { id: 2, url: 'img/2.jpg', keywords: ['happy', 'nature'] },
    { id: 3, url: 'img/3.jpg', keywords: ['bad', 'awkward'] },
    { id: 4, url: 'img/4.jpg', keywords: ['sad', 'animal'] }
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
        'happy': 5,
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