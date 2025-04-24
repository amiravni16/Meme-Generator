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
    lines: [{ txt: 'I sometimes eat Falafel', size: 20, color: 'red' }]
}

var gKeywordSearchCountMap = { funny: 12, cat: 16, baby: 2 }

function getMeme() {
    return gMeme
}

function getImageById(imgId) {
    return gImgs.find(img => img.id === imgId)
}

function getImages() {
    console.log('getImages called, returning:', gImgs)
    return gImgs
}

function setMemeImg(imgId) {
    gMeme.selectedImgId = imgId
}

function setLineTxt(txt) {
    gMeme.lines[gMeme.selectedLineIdx].txt = txt
}