'use strict'

var gImgs = [
    { id: 1, url: 'img/1.jpg', keywords: ['funny', 'politics', 'trump'] },
    { id: 2, url: 'img/2.jpg', keywords: ['cute', 'dog'] },
    { id: 3, url: 'img/3.jpg', keywords: ['cute', 'baby', 'dog'] },
    { id: 4, url: 'img/4.jpg', keywords: ['cute', 'cat'] },
    { id: 5, url: 'img/5.jpg', keywords: ['success', 'baby'] },
    { id: 6, url: 'img/6.jpg', keywords: ['funny', 'history'] },
    { id: 7, url: 'img/7.jpg', keywords: ['funny', 'baby'] },
    { id: 8, url: 'img/8.jpg', keywords: ['funny', 'movie', 'wonka'] },
    { id: 9, url: 'img/9.jpg', keywords: ['evil', 'baby'] },
    { id: 10, url: 'img/10.jpg', keywords: ['funny', 'obama'] },
    { id: 11, url: 'img/11.jpg', keywords: ['funny', 'sports'] },
    { id: 12, url: 'img/12.jpg', keywords: ['funny', 'pointing'] },
    { id: 13, url: 'img/13.jpg', keywords: ['funny', 'leo'] },
    { id: 14, url: 'img/14.jpg', keywords: ['sad', 'movie', 'matrix'] },
    { id: 15, url: 'img/15.jpg', keywords: ['funny', 'movie', 'lord'] },
    { id: 16, url: 'img/16.jpg', keywords: ['funny', 'star', 'movie'] },
    { id: 17, url: 'img/17.jpg', keywords: ['funny', 'putin', 'politics'] },
    { id: 18, url: 'img/18.jpg', keywords: ['funny', 'toy', 'movie'] }
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

function getImages() {
    return gImgs
}

function getMeme() {
    return gMeme
}

function setImg(imgId) {
    gMeme.selectedImgId = imgId
    gMeme.lines = [{ txt: '', size: 20, color: '#ff0000', x: 250, y: 50, boxX: 0, boxY: 0, boxWidth: 0, boxHeight: 0, fontFamily: 'Arial', align: 'center' }]
    gMeme.selectedLineIdx = 0
}

function getImageById(imgId) {
    return gImgs.find(img => img.id === imgId)
}

function setLineTxt(txt, lineIdx) {
    gMeme.lines[lineIdx].txt = txt
}

function setColor(color, lineIdx) {
    gMeme.lines[lineIdx].color = color
}

function addLine() {
    gMeme.lines.push({ txt: '', size: 20, color: '#ff0000', x: 250, y: 150, boxX: 0, boxY: 0, boxWidth: 0, boxHeight: 0, fontFamily: 'Arial', align: 'center' })
    return gMeme.lines.length - 1
}

function switchLine() {
    const meme = getMeme()
    meme.selectedLineIdx = (meme.selectedLineIdx + 1) % meme.lines.length
}

function setFontSize(size, lineIdx) {
    gMeme.lines[lineIdx].size = size
}

function setFontFamily(fontFamily, lineIdx) {
    gMeme.lines[lineIdx].fontFamily = fontFamily
}

function setAlignment(align, lineIdx) {
    gMeme.lines[lineIdx].align = align
}

function setSelectedLine(idx) {
    gMeme.selectedLineIdx = idx
}

function setLineBox(idx, boxX, boxY, boxWidth, boxHeight) {
    const line = gMeme.lines[idx]
    line.boxX = boxX
    line.boxY = boxY
    line.boxWidth = boxWidth
    line.boxHeight = boxHeight
}

function adjustLinePosition(lineIdx, deltaY, canvasHeight) {
    const line = gMeme.lines[lineIdx]
    const newY = line.y + deltaY
    const minY = 0 + line.boxHeight / 2
    const maxY = canvasHeight - line.boxHeight / 2
    line.y = Math.max(minY, Math.min(newY, maxY))
}

function saveMeme() {
    const meme = getMeme()
    const savedMemes = storageService.loadFromStorage('savedMemes') || []
    savedMemes.push({ ...meme })
    storageService.saveToStorage('savedMemes', savedMemes)
}

function loadSavedMemes() {
    return storageService.loadFromStorage('savedMemes') || []
}

function loadMeme(memeData) {
    gMeme.selectedImgId = memeData.selectedImgId
    gMeme.lines = memeData.lines.map(line => ({ ...line }))
    gMeme.selectedLineIdx = 0
}