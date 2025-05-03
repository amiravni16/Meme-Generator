'use strict'

function initGalleryController() {
    console.log('initGalleryController called')
    populateKeywordList()
    renderGallery()
    renderSavedMemes()
    initSearchBar()
    initFlexibleBtn()
    initSaveBtn()
}

function populateKeywordList() {
    const images = getImages()
    const keywords = [...new Set(images.flatMap(img => img.keywords))] // Unique keywords
    const datalist = document.getElementById('keyword-list')
    datalist.innerHTML = keywords.map(keyword => `<option value="${keyword}">`).join('')
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

function generateMemeThumbnail(meme) {
    const highResSize = 400
    const displaySize = 200
    const canvas = document.createElement('canvas')
    const ctx = canvas.getContext('2d')
    
    canvas.width = highResSize
    canvas.height = highResSize

    const img = getImageById(meme.selectedImgId)
    const imageObj = new Image()
    imageObj.src = img.url

    return new Promise((resolve) => {
        imageObj.onload = () => {
            ctx.drawImage(imageObj, 0, 0, highResSize, highResSize)

            const scale = highResSize / 500
            meme.lines.forEach(line => {
                const scaledSize = line.size * scale
                ctx.font = `${Math.round(scaledSize)}px ${line.fontFamily}`
                ctx.fillStyle = line.color
                ctx.textAlign = line.align
                ctx.textBaseline = 'middle'

                const scaleX = highResSize / 500
                const scaleY = highResSize / 500
                const x = line.x * scaleX
                const y = line.y * scaleY

                ctx.fillText(line.txt, x, y)
            })

            const displayCanvas = document.createElement('canvas')
            displayCanvas.width = displaySize
            displayCanvas.height = displaySize
            const displayCtx = displayCanvas.getContext('2d')

            displayCtx.imageSmoothingEnabled = false
            if (displayCtx.imageSmoothingQuality) {
                displayCtx.imageSmoothingQuality = 'high'
            }

            displayCtx.drawImage(canvas, 0, 0, displaySize, displaySize)

            const dataUrl = displayCanvas.toDataURL('image/png')
            resolve(dataUrl)
        }
    })
}

async function renderSavedMemes() {
    console.log('renderSavedMemes called')
    const savedMemes = loadSavedMemes()
    const savedMemesContent = document.getElementById('saved-memes-content')
    const strHTMLs = []

    for (let idx = 0; idx < savedMemes.length; idx++) {
        const meme = savedMemes[idx]
        const thumbnailUrl = await generateMemeThumbnail(meme)
        strHTMLs.push(`
            <div class="gallery-item">
                <img src="${thumbnailUrl}" alt="Saved meme ${idx}" onclick="onSavedMemeSelect(${idx})">
            </div>
        `)
    }

    savedMemesContent.innerHTML = strHTMLs.join('')
    document.getElementById('saved-memes').style.display = savedMemes.length > 0 ? 'block' : 'none'
}

function initSearchBar() {
    const searchInput = document.getElementById('search-input')
    const clearFilterBtn = document.getElementById('clear-filter-btn')

    searchInput.addEventListener('input', () => {
        const keyword = searchInput.value.toLowerCase()
        const images = getImages()
        const filteredImages = keyword ? images.filter(img => 
            img.keywords.some(kw => kw.toLowerCase().includes(keyword))
        ) : images
        const galleryContent = document.getElementById('gallery-content')
        const strHTMLs = filteredImages.map(img => `
            <div class="gallery-item">
                <img src="${img.url}" alt="Meme image ${img.id}" onclick="onImageSelect(${img.id})">
            </div>
        `)
        galleryContent.innerHTML = strHTMLs.join('')
    })

    clearFilterBtn.addEventListener('click', () => {
        searchInput.value = ''
        renderGallery() // Reset to show all images
    })
}

function initFlexibleBtn() {
    const flexibleBtn = document.getElementById('flexible-btn')
    flexibleBtn.addEventListener('click', () => {
        generateRandomMeme()
        document.getElementById('gallery').style.display = 'none'
        document.getElementById('saved-memes').style.display = 'none'
        document.getElementById('editor').style.display = 'block'
        renderMeme()
    })
}

function initSaveBtn() {
    const saveBtn = document.getElementById('save-btn')
    saveBtn.addEventListener('click', () => {
        saveMeme()
        renderSavedMemes()
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
    document.getElementById('saved-memes').style.display = 'none'
    document.getElementById('editor').style.display = 'block'
    renderMeme()
}

function onSavedMemeSelect(memeIdx) {
    const savedMemes = loadSavedMemes()
    const memeData = savedMemes[memeIdx]
    loadMeme(memeData)
    document.getElementById('gallery').style.display = 'none'
    document.getElementById('saved-memes').style.display = 'none'
    document.getElementById('editor').style.display = 'block'
    renderMeme()
}