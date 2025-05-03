'use strict'

function initGalleryController() {
    console.log('initGalleryController called')
    renderGallery()
    initSearchBar()
    initFlexibleBtn()
}

function renderGallery() {
    console.log('renderGallery called')
    const images = getImages()
    const galleryContent = document.getElementById('gallery-content')
    const strHTMLs = images.map(img => `
        <div class="gallery-item">
            <img src="${img.url}" alt="Meme image ${img.id}" onclick="onImageSelect(${img.id})">
        </div>
    `)
    galleryContent.innerHTML = strHTMLs.join('')
}

function initSearchBar() {
    const searchInput = document.querySelector('.search-bar input')
    searchInput.addEventListener('input', () => {
        const keyword = searchInput.value.toLowerCase()
        const images = getImages()
        const filteredImages = images.filter(img => 
            img.keywords.some(kw => kw.toLowerCase().includes(keyword))
        )
        const galleryContent = document.getElementById('gallery-content')
        const strHTMLs = filteredImages.map(img => `
            <div class="gallery-item">
                <img src="${img.url}" alt="Meme image ${img.id}" onclick="onImageSelect(${img.id})">
            </div>
        `)
        galleryContent.innerHTML = strHTMLs.join('')
    })
}

function initFlexibleBtn() {
    const flexibleBtn = document.getElementById('flexible-btn')
    flexibleBtn.addEventListener('click', () => {
        generateRandomMeme()
        document.getElementById('gallery').style.display = 'none'
        document.getElementById('editor').style.display = 'block'
        renderMeme()
    })
}

function generateRandomMeme() {
    const images = getImages()
    const randomImg = images[Math.floor(Math.random() * images.length)]
    const randomTexts = [
        'LOL THIS IS FUNNY',
        'WHEN LIFE GETS TOUGH',
        'I CAN’T EVEN',
        'WHY IS THIS ME',
        'MEME LIFE',
        'TOO REAL',
        'SEND HELP',
        'I’M DONE'
    ]
    const randomText = randomTexts[Math.floor(Math.random() * randomTexts.length)]
    
    setImg(randomImg.id)
    const meme = getMeme()
    meme.lines = [{
        txt: randomText,
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
    }]
    meme.selectedLineIdx = 0
}

function onImageSelect(imgId) {
    setImg(imgId)
    document.getElementById('gallery').style.display = 'none'
    document.getElementById('editor').style.display = 'block'
    renderMeme()
}