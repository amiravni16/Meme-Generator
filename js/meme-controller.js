'use strict'

function initMemeController() {
    console.log('initMemeController called')
    initTextInput()
    initColorPicker()
    initFontSizeControls()
    initAddLineBtn()
    initSwitchLineBtn()
    initCanvasClick()
    initDownloadLink()
    initFontFamilyControl()
    initAlignmentControls()
    initDeleteLineBtn()
    initEmojiControls()
    initShareBtn()
    initPositionControls()
    updateSelectedLineUI()
    updateFontSizeDisplay()
    updateFontColorDisplay()
}

function initTextInput() {
    const textInput = document.getElementById('meme-text-input')
    textInput.addEventListener('input', () => {
        setLineTxt(textInput.value, getMeme().selectedLineIdx)
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
    
    increaseBtn.addEventListener('click', () => {
        const meme = getMeme()
        const currentSize = meme.lines[meme.selectedLineIdx].size
        const newSize = currentSize + 2
        setFontSize(newSize, meme.selectedLineIdx)
        renderMeme()
    })
    
    decreaseBtn.addEventListener('click', () => {
        const meme = getMeme()
        const currentSize = meme.lines[meme.selectedLineIdx].size
        const newSize = Math.max(currentSize - 2, 10)
        setFontSize(newSize, meme.selectedLineIdx)
        renderMeme()
    })
}

function initAddLineBtn() {
    const addLineBtn = document.getElementById('add-line-btn')
    addLineBtn.addEventListener('click', () => {
        const newLineIdx = addLine()
        switchLine()
        updateSelectedLineUI()
        updateFontSizeDisplay()
        updateFontColorDisplay()
        renderMeme()
    })
}

function initSwitchLineBtn() {
    const switchLineBtn = document.getElementById('switch-line-btn')
    switchLineBtn.addEventListener('click', () => {
        switchLine()
        updateSelectedLineUI()
        updateFontSizeDisplay()
        updateFontColorDisplay()
        renderMeme()
    })
}

function initCanvasClick() {
    const canvas = document.getElementById('meme-canvas')
    const ctx = canvas.getContext('2d')
    canvas.addEventListener('click', (event) => {
        const rect = canvas.getBoundingClientRect()
        const clickX = event.clientX - rect.left
        const clickY = event.clientY - rect.top
        
        const meme = getMeme()
        let lineClicked = false
        
        meme.lines.forEach((line, idx) => {
            ctx.font = `${line.size}px ${line.fontFamily}`
            const textWidth = ctx.measureText(line.txt).width
            let adjustedX = line.boxX
            if (line.align === 'center') {
                adjustedX = line.boxX + (line.boxWidth - textWidth) / 2
            } else if (line.align === 'right') {
                adjustedX = line.boxX + (line.boxWidth - textWidth)
            }
            if (
                clickX >= line.boxX &&
                clickX <= line.boxX + line.boxWidth &&
                clickY >= line.boxY &&
                clickY <= line.boxY + line.boxHeight
            ) {
                setSelectedLine(idx)
                updateSelectedLineUI()
                updateFontSizeDisplay()
                updateFontColorDisplay()
                renderMeme()
                lineClicked = true
            }
        })
        
        if (!lineClicked) {
            console.log('No line clicked at', clickX, clickY)
        }
    })
}

function updateSelectedLineUI() {
    const meme = getMeme()
    const textInput = document.getElementById('meme-text-input')
    textInput.value = meme.lines[meme.selectedLineIdx].txt
}

function updateFontSizeDisplay() {
}

function updateFontColorDisplay() {
    const meme = getMeme()
    const colorPicker = document.getElementById('font-color')
    colorPicker.value = meme.lines[meme.selectedLineIdx].color
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
        ctx.clearRect(0, 0, canvas.width, canvas.height)
        ctx.drawImage(img, 0, 0)
        
        meme.lines.forEach((line, idx) => {
            const yPos = line.y
            console.log(`Line ${idx} rendering at yPos: ${yPos}`)
            
            ctx.font = `${line.size}px ${line.fontFamily}`
            ctx.fillStyle = line.color
            ctx.strokeStyle = 'white'
            ctx.lineWidth = 2
            ctx.textAlign = line.align
            
            const textWidth = ctx.measureText(line.txt).width
            const textHeight = line.size
            const padding = 10
            let textX
            let boxX
            if (line.align === 'left') {
                textX = 10
                boxX = textX - padding
            } else if (line.align === 'right') {
                textX = canvas.width - 10
                boxX = textX - textWidth - padding
            } else { 
                textX = canvas.width / 2
                boxX = textX - textWidth / 2 - padding
            }
            const boxY = yPos - textHeight - padding / 2
            const boxWidth = textWidth + padding * 2
            const boxHeight = textHeight + padding
            
            setLineBox(idx, boxX, boxY, boxWidth, boxHeight)
            
            ctx.lineWidth = 3
            ctx.strokeStyle = 'black'
            ctx.strokeText(line.txt, textX, yPos)
            ctx.fillText(line.txt, textX, yPos)
            
            if (idx === meme.selectedLineIdx) {
                ctx.strokeStyle = 'white'
                ctx.lineWidth = 2
                ctx.strokeRect(boxX, boxY, boxWidth, boxHeight)
            }
        })
    }
}

function initFontFamilyControl() {
    const fontFamilySelect = document.getElementById('font-family')
    fontFamilySelect.addEventListener('change', () => {
        setFontFamily(fontFamilySelect.value, getMeme().selectedLineIdx)
        renderMeme()
    })
}

function initAlignmentControls() {
    const alignLeftBtn = document.getElementById('align-left')
    const alignCenterBtn = document.getElementById('align-center')
    const alignRightBtn = document.getElementById('align-right')
    
    alignLeftBtn.addEventListener('click', () => {
        const meme = getMeme()
        const originalY = meme.lines[meme.selectedLineIdx].y
        console.log(`Align left, original y: ${originalY}`)
        setAlignment('left', meme.selectedLineIdx)
        console.log(`After align left, y: ${meme.lines[meme.selectedLineIdx].y}`)
        renderMeme()
    })
    alignCenterBtn.addEventListener('click', () => {
        const meme = getMeme()
        const originalY = meme.lines[meme.selectedLineIdx].y
        console.log(`Align center, original y: ${originalY}`)
        setAlignment('center', meme.selectedLineIdx)
        console.log(`After align center, y: ${meme.lines[meme.selectedLineIdx].y}`)
        renderMeme()
    })
    alignRightBtn.addEventListener('click', () => {
        const meme = getMeme()
        const originalY = meme.lines[meme.selectedLineIdx].y
        console.log(`Align right, original y: ${originalY}`)
        setAlignment('right', meme.selectedLineIdx)
        console.log(`After align right, y: ${meme.lines[meme.selectedLineIdx].y}`)
        renderMeme()
    })
}

function initDeleteLineBtn() {
    const deleteLineBtn = document.getElementById('delete-line-btn')
    deleteLineBtn.addEventListener('click', () => {
        const meme = getMeme()
        if (meme.lines.length > 1) {
            meme.lines.splice(meme.selectedLineIdx, 1)
            meme.selectedLineIdx = Math.min(meme.selectedLineIdx, meme.lines.length - 1)
            updateSelectedLineUI()
            updateFontSizeDisplay()
            updateFontColorDisplay()
            renderMeme()
        }
    })
}

function initEmojiControls() {
    const emojis = document.querySelectorAll('.emoji-controls button')
    emojis.forEach(btn => {
        btn.addEventListener('click', () => {
            const emoji = btn.textContent
            setLineTxt(getMeme().lines[getMeme().selectedLineIdx].txt + emoji, getMeme().selectedLineIdx)
            renderMeme()
        })
    })
}

function initShareBtn() {
    const shareBtn = document.getElementById('share-btn')
    shareBtn.addEventListener('click', () => {
        alert('Share functionality to be implemented')
    })
}

function initPositionControls() {
    const moveUpBtn = document.getElementById('move-up-btn')
    const moveDownBtn = document.getElementById('move-down-btn')
    const canvas = document.getElementById('meme-canvas')
    
    moveUpBtn.addEventListener('click', () => {
        const meme = getMeme()
        console.log(`Move Up clicked, current y: ${meme.lines[meme.selectedLineIdx].y}`)
        adjustLinePosition(meme.selectedLineIdx, -10, canvas.height)
        console.log(`After moving up, new y: ${meme.lines[meme.selectedLineIdx].y}`)
        renderMeme()
    })
    
    moveDownBtn.addEventListener('click', () => {
        const meme = getMeme()
        console.log(`Move Down clicked, current y: ${meme.lines[meme.selectedLineIdx].y}`)
        adjustLinePosition(meme.selectedLineIdx, 50, canvas.height)
        console.log(`After moving down, new y: ${meme.lines[meme.selectedLineIdx].y}`)
        renderMeme()
    })
}