'use strict'

function initGalleryController() {
    console.log('initGalleryController called')
    renderGallery()
    renderSavedMemes()
    initSearchBar()
    initFlexibleBtn()
    initSaveBtn()
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
    // Create a temporary canvas with higher resolution for sharper text
    const highResSize = 400 // Higher resolution (2x the display size)
    const displaySize = 200 // Actual display size
    const canvas = document.createElement('canvas')
    const ctx = canvas.getContext('2d')
    
    // Set canvas to high resolution
    canvas.width = highResSize
    canvas.height = highResSize

    // Load the image
    const img = getImageById(meme.selectedImgId)
    const imageObj = new Image()
    imageObj.src = img.url

    return new Promise((resolve) => {
        imageObj.onload = () => {
            // Draw the image at high resolution, scaled to fit
            ctx.drawImage(imageObj, 0, 0, highResSize, highResSize)

            // Draw each text line at high resolution
            const scale = highResSize / 500 // Scale factor based on assumed editor canvas size
            meme.lines.forEach(line => {
                const scaledSize = line.size * scale // Scale the font size
                ctx.font = `${Math.round(scaledSize)}px ${line.fontFamily}` // Round for crisp rendering
                ctx.fillStyle = line.color
                ctx.textAlign = line.align
                ctx.textBaseline = 'middle' // Improve vertical alignment

                // Scale the text position
                const scaleX = highResSize / 500
                const scaleY = highResSize / 500
                const x = line.x * scaleX
                const y = line.y * scaleY

                ctx.fillText(line.txt, x, y)
            })

            // Create a second canvas for the final display size
            const displayCanvas = document.createElement('canvas')
            displayCanvas.width = displaySize
            displayCanvas.height = displaySize
            const displayCtx = displayCanvas.getContext('2d')

            // Disable image smoothing if supported (reduces blur when scaling down)
            displayCtx.imageSmoothingEnabled = false
            if (displayCtx.imageSmoothingQuality) {
                displayCtx.imageSmoothingQuality = 'high'
            }

            // Draw the high-res canvas onto the display canvas, scaled down
            displayCtx.drawImage(canvas, 0, 0, displaySize, displaySize)

            // Convert to data URL
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