'use strict'

function initMemeController() {
    console.log('initMemeController called')
    initTextInput()
    initColorPicker()
    initFontSizeControls()
    initDownloadLink()
}

function initTextInput() {
    const textInput0 = document.getElementById('meme-text-input-0')
    const textInput1 = document.getElementById('meme-text-input-1')
    
    textInput0.addEventListener('input', () => {
        setLineTxt(textInput0.value, 0)
        renderMeme()
    })
    
    textInput1.addEventListener('input', () => {
        setLineTxt(textInput1.value, 1)
        renderMeme()
    })
}

function initColorPicker() {
    const colorPicker = document.getElementById('font-color')
    colorPicker.addEventListener('input', () => {
        setColor(colorPicker.value, getMeme().selectedLineIdx)
        renderMeme()
    })
}

function initFontSizeControls() {
    const increaseBtn = document.getElementById('increase-font')
    const decreaseBtn = document.getElementById('decrease-font')
    const fontSizeInput = document.getElementById('font-size-input')
    
    increaseBtn.addEventListener('click', () => {
        const meme = getMeme()
        const currentSize = meme.lines[meme.selectedLineIdx].size
        const newSize = currentSize + 2
        setFontSize(newSize, meme.selectedLineIdx)
        fontSizeInput.value = newSize
        renderMeme()
    })
    
    decreaseBtn.addEventListener('click', () => {
        const meme = getMeme()
        const currentSize = meme.lines[meme.selectedLineIdx].size
        const newSize = currentSize - 2
        setFontSize(newSize, meme.selectedLineIdx)
        fontSizeInput.value = newSize
        renderMeme()
    })
    
    fontSizeInput.addEventListener('input', () => {
        const inputValue = fontSizeInput.value
        const newSize = parseInt(inputValue)
        if (!isNaN(newSize)) {
            setFontSize(newSize, getMeme().selectedLineIdx)
            renderMeme()
        } else {
            fontSizeInput.value = getMeme().lines[getMeme().selectedLineIdx].size
        }
    })
    
    fontSizeInput.addEventListener('keypress', (event) => {
        const charCode = event.charCode
        if (charCode < 48 || charCode > 57) {
            event.preventDefault()
        }
    })
    
    fontSizeInput.addEventListener('blur', () => {
        const meme = getMeme()
        const currentSize = meme.lines[meme.selectedLineIdx].size
        if (!fontSizeInput.value || isNaN(parseInt(fontSizeInput.value))) {
            fontSizeInput.value = currentSize
        }
    })
}

function initDownloadLink() {
    const downloadLink = document.getElementById('download-link')
    downloadLink.addEventListener('click', (event) => {
        event.preventDefault()
        downloadMeme()
    })
}

function downloadMeme() {
    const canvas = document.getElementById('meme-canvas')
    renderMeme()
    setTimeout(() => {
        const dataUrl = canvas.toDataURL('image/png')
        const link = document.createElement('a')
        link.href = dataUrl
        link.download = 'meme.png'
        document.body.appendChild(link)
        link.click()
        document.body.removeChild(link)
    }, 100)
}

function renderMeme() {
    console.log('renderMeme called')
    const meme = getMeme()
    const imgData = getImageById(meme.selectedImgId)
    console.log('Rendering image:', imgData)
    
    const canvas = document.getElementById('meme-canvas')
    const ctx = canvas.getContext('2d')

    const img = new Image()
    img.src = imgData.url
    img.onerror = () => console.error('Failed to load image in editor:', imgData.url)
    img.onload = () => {
        console.log('Image loaded in editor:', imgData.url)
        canvas.width = img.width
        canvas.height = img.height
        ctx.drawImage(img, 0, 0)
        
   
        const line0 = meme.lines[0]
        ctx.font = `${line0.size}px Arial`
        ctx.fillStyle = line0.color
        ctx.strokeStyle = 'white'
        ctx.lineWidth = 2
        ctx.textAlign = 'center'
        ctx.strokeText(line0.txt, canvas.width / 2, 50)
        ctx.fillText(line0.txt, canvas.width / 2, 50)
    
        const line1 = meme.lines[1]
        ctx.font = `${line1.size}px Arial`
        ctx.fillStyle = line1.color
        ctx.strokeStyle = 'white'
        ctx.lineWidth = 2
        ctx.textAlign = 'center'
        ctx.strokeText(line1.txt, canvas.width / 2, canvas.height - 40)
        ctx.fillText(line1.txt, canvas.width / 2, canvas.height - 40)
    }
}