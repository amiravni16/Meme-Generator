'use strict'

console.log('gallery-controller.js loaded')

function initGalleryController() {
    console.log('initGalleryController called')
    populateKeywordList()
    renderKeywordCloud()
    renderGallery()
    renderSavedMemes()
    initSearchBar()
    initFlexibleBtn()
    initSaveBtn()
    initImageUpload()
}

function initImageUpload() {
    const uploadInput = document.getElementById('upload-image-btn')
    uploadInput.addEventListener('change', onImgInput)
}

function onImgInput(ev) {
    loadImageFromInput(ev, onImageUploaded)
}

function loadImageFromInput(ev, onImageReady) {
    const reader = new FileReader()

    reader.onload = function (event) {
        const img = new Image()
        img.onload = () => {
            onImageReady(img)
        }
        img.src = event.target.result
    }
    reader.readAsDataURL(ev.target.files[0])
}

function onImageUploaded(img) {
    const images = getImages()
    const newImageId = images.length + 1
    const newImage = {
        id: newImageId,
        url: img.src,
        keywords: ['custom']
    }
    images.push(newImage)
    setImg(newImageId)
    window.dispatchEvent(new Event('imageSelected'))
    document.getElementById('gallery').style.display = 'none'
    document.getElementById('saved-memes').style.display = 'none'
    document.getElementById('editor').style.display = 'block'
    renderMeme()
}

function populateKeywordList() {
    const images = getImages()
    const keywords = [...new Set(images.flatMap(img => img.keywords))]
    const datalist = document.getElementById('keyword-list')
    datalist.innerHTML = keywords.map(keyword => `<option value="${keyword}">`).join('')
}

function renderKeywordCloud() {
    const keywordPopularity = getKeywordPopularity()
    const keywords = Object.keys(keywordPopularity)
    const maxPopularity = Math.max(...Object.values(keywordPopularity))
    const minPopularity = Math.min(...Object.values(keywordPopularity))
    const maxFontSize = 40
    const minFontSize = 16

    const keywordCloud = document.getElementById('keyword-cloud')
    const strHTMLs = keywords.map(keyword => {
        const popularity = keywordPopularity[keyword]
        let fontSize = minFontSize
        if (maxPopularity !== minPopularity) {
            fontSize = minFontSize + (popularity - minPopularity) * (maxFontSize - minFontSize) / (maxPopularity - minPopularity)
        }
        return `<span class="keyword" style="font-size: ${fontSize}px;" onclick="onKeywordClick('${keyword}')">${keyword}</span>`
    })
    keywordCloud.innerHTML = strHTMLs.join(' ')
}

function onKeywordClick(keyword) {
    incrementKeywordPopularity(keyword)
    const searchInput = document.getElementById('search-input')
    searchInput.value = keyword
    filterGallery(keyword)
    renderKeywordCloud()
}

function filterGallery(keyword) {
    const images = getImages()
    const filteredImages = keyword ? images.filter(img => 
        img.keywords.some(kw => kw.toLowerCase().includes(keyword.toLowerCase()))
    ) : images
    const galleryContent = document.getElementById('gallery-content')
    const strHTMLs = filteredImages.map(img => `
        <div class="gallery-item">
            <img src="${img.url}" alt="Meme image ${img.id}" onclick="onImageSelect(${img.id})">
        </div>
    `)
    galleryContent.innerHTML = strHTMLs.join('')
    console.log(`Filtered gallery: ${filteredImages.length} images rendered with keyword "${keyword || 'none'}"`)
}

function renderGallery() {
    console.log('renderGallery called')
    const images = getImages()
    console.log(`Rendering gallery with ${images.length} images`)
    const galleryContent = document.getElementById('gallery-content')
    const strHTMLs = images.map(img => `
        <div class="gallery-item">
            <img src="${img.url}" alt="Meme image ${img.id}" onclick="onImageSelect(${img.id})">
        </div>
    `)
    galleryContent.innerHTML = strHTMLs.join('')
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

function initSearchBar() {
    const searchInput = document.getElementById('search-input')
    const clearFilterBtn = document.getElementById('clear-filter-btn')

    searchInput.addEventListener('input', () => {
        const keyword = searchInput.value.toLowerCase()
        filterGallery(keyword)
    })

    clearFilterBtn.addEventListener('click', () => {
        searchInput.value = ''
        renderGallery()
        renderKeywordCloud()
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
        'I CAN\'T EVEN',
        'WHY IS THIS ME',
        'MEME LIFE',
        'TOO REAL',
        'SEND HELP',
        'I\'M DONE'
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
    setSelectedImg(imgId)
    const event = new CustomEvent('imageSelected')
    window.dispatchEvent(event)
    document.getElementById('gallery').style.display = 'none'
    document.getElementById('saved-memes').style.display = 'none'
    document.getElementById('editor').style.display = 'block'
    renderMeme()
}

function onSavedMemeSelect(memeIdx) {
    const savedMemes = loadSavedMemes()
    const memeData = savedMemes[memeIdx]
    loadMeme(memeData)
    window.dispatchEvent(new Event('imageSelected'))
    document.getElementById('gallery').style.display = 'none'
    document.getElementById('saved-memes').style.display = 'none'
    document.getElementById('editor').style.display = 'block'
    renderMeme()
}