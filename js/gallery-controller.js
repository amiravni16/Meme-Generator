'use strict'

console.log('gallery-controller.js loaded')

function initGalleryController() {
    console.log('initGalleryController called')
    populateKeywordList()
    renderKeywordBar()
    renderGallery()
    renderSavedMemes()
    initSearchBar()
    initFlexibleBtn()
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
    setSelectedImg(newImageId)
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

var keywordBarExpanded = false;

function renderKeywordBar() {
    const images = getImages();
    const keywordsSet = new Set(images.flatMap(img => Array.isArray(img.keywords) ? img.keywords : []));
    const keywords = Array.from(keywordsSet);
    const keywordPopularity = getKeywordPopularity();
    const maxPopularity = Math.max(...keywords.map(k => keywordPopularity[k] || 1));
    const minPopularity = Math.min(...keywords.map(k => keywordPopularity[k] || 1));
    const maxFontSize = 2.2; // rem
    const minFontSize = 1.1; // rem
    const keywordBar = document.getElementById('keyword-bar');
    var strHTMLs = '';

    // Sort keywords by popularity (descending)
    const sortedKeywords = keywords.sort((a, b) => (keywordPopularity[b] || 1) - (keywordPopularity[a] || 1));

    if (!keywordBarExpanded) {
        // Show only the 3 most popular
        const showKeywords = sortedKeywords.slice(0, 3);
        showKeywords.forEach(keyword => {
            const popularity = keywordPopularity[keyword] || 1;
            var fontSize = minFontSize;
            if (maxPopularity !== minPopularity) {
                fontSize = minFontSize + (popularity - minPopularity) * (maxFontSize - minFontSize) / (maxPopularity - minPopularity);
            }
            strHTMLs += `<span class=\"keyword-pill\" style=\"font-size: ${fontSize}rem;\" onclick=\"onKeywordClick('${keyword}')\">${keyword}</span>`;
        });
        if (keywords.length > 3) {
            strHTMLs += `<span class=\"keyword-pill\" onclick=\"expandKeywordBar()\">...</span>`;
        }
    } else {
        // Show all keywords
        sortedKeywords.forEach(keyword => {
            const popularity = keywordPopularity[keyword] || 1;
            var fontSize = minFontSize;
            if (maxPopularity !== minPopularity) {
                fontSize = minFontSize + (popularity - minPopularity) * (maxFontSize - minFontSize) / (maxPopularity - minPopularity);
            }
            strHTMLs += `<span class=\"keyword-pill\" style=\"font-size: ${fontSize}rem;\" onclick=\"onKeywordClick('${keyword}')\">${keyword}</span>`;
        });
        strHTMLs += `<span class=\"keyword-pill\" onclick=\"collapseKeywordBar()\">Show Less</span>`;
    }
    keywordBar.innerHTML = strHTMLs;
}

function expandKeywordBar() {
    keywordBarExpanded = true;
    renderKeywordBar();
}

function collapseKeywordBar() {
    keywordBarExpanded = false;
    renderKeywordBar();
}

function onKeywordClick(keyword) {
    incrementKeywordPopularity(keyword);
    const searchInput = document.getElementById('search-input');
    searchInput.value = keyword;
    filterGallery(keyword);
    renderKeywordBar();
}

function filterGallery(keyword) {
    const images = getImages()
    const trimmedKeyword = keyword.trim().toLowerCase()
    const filteredImages = trimmedKeyword ? images.filter(img => 
        Array.isArray(img.keywords) &&
        img.keywords.some(kw => kw.toLowerCase().includes(trimmedKeyword))
    ) : images
    const galleryContent = document.getElementById('gallery-content')
    const strHTMLs = filteredImages.map(img => `
        <div class="gallery-item">
            <img src="${img.url}" alt="Meme image ${img.id}" onclick="onImageSelect(${img.id})">
        </div>
    `)
    galleryContent.innerHTML = strHTMLs.join('')
    console.log(`Filtered gallery: ${filteredImages.length} images rendered with keyword "${trimmedKeyword || 'none'}"`)
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
            <div class="gallery-item" style="position: relative;">
                <button class="delete-meme-btn" onclick="deleteSavedMeme(${idx})" title="Delete meme" style="position: absolute; top: 8px; right: 8px; z-index: 2; background: #f44336; color: #fff; border: none; border-radius: 50%; width: 28px; height: 28px; font-size: 1.1rem; cursor: pointer;">&times;</button>
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
    const searchInput = document.getElementById('search-input');
    searchInput.addEventListener('input', () => {
        const keyword = searchInput.value.toLowerCase();
        filterGallery(keyword);
    });
    // More button is now handled in renderKeywordBar/showAllKeywords
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

function generateRandomMeme() {
    const images = getImages()
    const randomImg = images[Math.floor(Math.random() * images.length)]
    const topTexts = [
        'WHEN YOU',
        'ME TRYING TO',
        'HOW I FEEL',
        'WHEN SOMEONE',
        'THAT MOMENT WHEN',
        'WHEN THE',
        'HOW I LOOK',
        'WHEN THEY'
    ]
    const bottomTexts = [
        'FINALLY GET IT',
        'FIGURE IT OUT',
        'AFTER 5 HOURS',
        'ON THE FIRST TRY',
        'WITHOUT GOOGLE',
        'IN FRONT OF EVERYONE',
        'AT 3 AM',
        'AFTER COFFEE'
    ]
    
    setSelectedImg(randomImg.id)
    const meme = getMeme()
    meme.lines = [
        {
            txt: topTexts[Math.floor(Math.random() * topTexts.length)],
            size: 40,
            color: 'white',
            fontFamily: 'Impact',
            x: 250,
            y: 50,
            rotation: 0,
            scale: 1,
            boxX: 0,
            boxY: 0,
            boxWidth: 0,
            boxHeight: 0,
            align: 'center'
        },
        {
            txt: bottomTexts[Math.floor(Math.random() * bottomTexts.length)],
            size: 40,
            color: 'white',
            fontFamily: 'Impact',
            x: 250,
            y: 450,
            rotation: 0,
            scale: 1,
            boxX: 0,
            boxY: 0,
            boxWidth: 0,
            boxHeight: 0,
            align: 'center'
        }
    ]
    meme.selectedLineIdx = 0
    
    // Update the text input to show the top text
    const textInput = document.getElementById('meme-text-input')
    if (textInput) textInput.value = meme.lines[0].txt
    
    // Set the font family dropdown to Impact and trigger change event
    const fontFamily = document.getElementById('font-family')
    if (fontFamily) {
        fontFamily.value = 'Impact'
        fontFamily.dispatchEvent(new Event('change'))
    }
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

function deleteSavedMeme(idx) {
    const savedMemes = loadSavedMemes()
    savedMemes.splice(idx, 1)
    saveToStorage('savedMemes', savedMemes)
    renderSavedMemes()
}