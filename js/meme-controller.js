'use strict'

function initMemeController() {
    console.log('initMemeController called')
    initTextInput()
    initColorPicker()
    initFontSizeControls()
    initAddLineBtn()
    initDownloadLink()
}

function initTextInput() {
    const textInputsContainer = document.getElementById('text-inputs')
    const meme = getMeme()
    
    meme.lines.forEach((line, idx) => {
        const input = document.getElementById(`meme-text-input-${idx}`)
        if (input) {
            input.addEventListener('input', () => {
                setLineTxt(input.value, idx)
                renderMeme()
            })
        }
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

function initAddLineBtn() {
    const addLineBtn = document.getElementById('add-line-btn')
    addLineBtn.addEventListener('click', () => {
        const newLineIdx = addLine()
        const textInputsContainer = document.getElementById('text-inputs')
        const newInput = document.createElement('input')
        newInput.type = 'text'
        newInput.id = `meme-text-input-${newLineIdx}`
        newInput.className = 'w-full p-2 mb-4 border rounded'
        newInput.placeholder = `Enter text for line ${newLineIdx + 1}`
        newInput.value = 'New Line'
        
        newInput.addEventListener('input', () => {
            setLineTxt(newInput.value, newLineIdx)
            renderMeme()
        })
        
        textInputsContainer.appendChild(newInput)
        renderMeme()
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
        
        meme.lines.forEach((line, idx) => {
            const totalLines = meme.lines.length
            const spacing = (canvas.height - 100) / (totalLines + 1)
            const yPos = 50 + (idx + 1) * spacing
            
            ctx.font = `${line.size}px Arial`
            ctx.fillStyle = line.color
            ctx.strokeStyle = 'white'
            ctx.lineWidth = 2
            ctx.textAlign = 'center'
            ctx.strokeText(line.txt, canvas.width / 2, yPos)
            ctx.fillText(line.txt, canvas.width / 2, yPos)
        })
    }
}