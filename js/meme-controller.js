'use strict'

var isDragging = false
var draggedLineIdx = -1
var dragOffsetX = 0
var dragOffsetY = 0
var selectedLineIdx = 0
var currentImageObj = null
var gElCanvas = document.getElementById('meme-canvas')
var gCtx = gElCanvas.getContext('2d')
var gInlineInput = null
var isResizing = false
var isRotating = false
var resizeHandleSize = 12
var rotateHandleSize = 12
var tooltipTimeout = null

function initMemeController() {
    initEditorControls()
    initCanvasDragAndDrop()
    preloadImage()
    window.addEventListener('imageSelected', () => {
        preloadImage()
        renderMeme()
    })
}

function preloadImage() {
    const meme = getMeme()
    const img = getImageById(meme.selectedImgId)
    if (img && img.url) {
        currentImageObj = new Image()
        currentImageObj.src = img.url
        currentImageObj.onload = () => {
            renderMeme()
        }
    }
}

function initEditorControls() {
    const textInput = document.getElementById('meme-text-input')
    textInput.addEventListener('input', () => {
        const meme = getMeme()
        setLineTxt(textInput.value, meme.selectedLineIdx || 0)
        renderMeme()
    })

    textInput.addEventListener('keydown', (e) => {
        if (e.key === 'Enter') {
            textInput.blur()
            createInlineInput(selectedLineIdx)
        }
    })

    const moveUpBtn = document.getElementById('move-up-btn')
    moveUpBtn.addEventListener('click', () => {
        adjustLinePosition(getMeme().selectedLineIdx, -10, 500)
        renderMeme()
    })

    const moveDownBtn = document.getElementById('move-down-btn')
    moveDownBtn.addEventListener('click', () => {
        adjustLinePosition(getMeme().selectedLineIdx, 10, 500)
        renderMeme()
    })

    const switchLineBtn = document.getElementById('switch-line-btn')
    switchLineBtn.addEventListener('click', () => {
        switchLine()
        const meme = getMeme()
        selectedLineIdx = meme.selectedLineIdx
        document.getElementById('meme-text-input').value = meme.lines[meme.selectedLineIdx].txt
        renderMeme()
    })

    const addLineBtn = document.getElementById('add-line-btn')
    addLineBtn.addEventListener('click', () => {
        const newLineIdx = addLine()
        setSelectedLine(newLineIdx)
        selectedLineIdx = newLineIdx
        document.getElementById('meme-text-input').value = ''
        createInlineInput(newLineIdx)
    })

    const deleteLineBtn = document.getElementById('delete-line-btn')
    deleteLineBtn.addEventListener('click', () => {
        const meme = getMeme()
        if (meme.lines.length > 1) {
            meme.lines.splice(meme.selectedLineIdx, 1)
            selectedLineIdx = Math.max(0, meme.selectedLineIdx - 1)
            setSelectedLine(selectedLineIdx)
            document.getElementById('meme-text-input').value = meme.lines[selectedLineIdx].txt
            renderMeme()
        }
    })

    const fontFamily = document.getElementById('font-family')
    fontFamily.addEventListener('change', (e) => {
        const meme = getMeme()
        setFontFamily(e.target.value, meme.selectedLineIdx)
        renderMeme()
    })

    const fontColor = document.getElementById('font-color')
    fontColor.addEventListener('input', (e) => {
        const meme = getMeme()
        setColor(e.target.value, meme.selectedLineIdx)
        renderMeme()
    })

    const increaseFont = document.getElementById('increase-font')
    increaseFont.addEventListener('click', () => {
        const meme = getMeme()
        const newSize = meme.lines[meme.selectedLineIdx].size + 5
        setFontSize(newSize, meme.selectedLineIdx)
        renderMeme()
    })

    const decreaseFont = document.getElementById('decrease-font')
    decreaseFont.addEventListener('click', () => {
        const meme = getMeme()
        const newSize = Math.max(10, meme.lines[meme.selectedLineIdx].size - 5)
        setFontSize(newSize, meme.selectedLineIdx)
        renderMeme()
    })

    const alignLeft = document.getElementById('align-left')
    alignLeft.addEventListener('click', () => {
        const meme = getMeme()
        setAlignment('left', meme.selectedLineIdx)
        renderMeme()
    })

    const alignCenter = document.getElementById('align-center')
    alignCenter.addEventListener('click', () => {
        const meme = getMeme()
        setAlignment('center', meme.selectedLineIdx)
        renderMeme()
    })

    const alignRight = document.getElementById('align-right')
    alignRight.addEventListener('click', () => {
        const meme = getMeme()
        setAlignment('right', meme.selectedLineIdx)
        renderMeme()
    })

    const emoji1 = document.getElementById('emoji1')
    emoji1.addEventListener('click', () => {
        const meme = getMeme()
        const currentText = meme.lines[meme.selectedLineIdx].txt
        setLineTxt(currentText + '😄', meme.selectedLineIdx)
        document.getElementById('meme-text-input').value = meme.lines[meme.selectedLineIdx].txt
        renderMeme()
    })

    const emoji2 = document.getElementById('emoji2')
    emoji2.addEventListener('click', () => {
        const meme = getMeme()
        const currentText = meme.lines[meme.selectedLineIdx].txt
        setLineTxt(currentText + '😂', meme.selectedLineIdx)
        document.getElementById('meme-text-input').value = meme.lines[meme.selectedLineIdx].txt
        renderMeme()
    })

    const emoji3 = document.getElementById('emoji3')
    emoji3.addEventListener('click', () => {
        const meme = getMeme()
        const currentText = meme.lines[meme.selectedLineIdx].txt
        setLineTxt(currentText + '😢', meme.selectedLineIdx)
        document.getElementById('meme-text-input').value = meme.lines[meme.selectedLineIdx].txt
        renderMeme()
    })

    const emoji4 = document.getElementById('emoji4')
    emoji4.addEventListener('click', () => {
        const meme = getMeme()
        const currentText = meme.lines[meme.selectedLineIdx].txt
        setLineTxt(currentText + '😡', meme.selectedLineIdx)
        document.getElementById('meme-text-input').value = meme.lines[meme.selectedLineIdx].txt
        renderMeme()
    })

    const shareBtn = document.getElementById('share-btn')
    shareBtn.addEventListener('click', onShareImg)

    const downloadLink = document.getElementById('download-link')
    downloadLink.addEventListener('click', (e) => {
        e.preventDefault()
        const canvas = document.getElementById('meme-canvas')
        const link = document.createElement('a')
        link.download = 'meme.png'
        link.href = canvas.toDataURL('image/png')
        link.click()
    })
}

function createInlineInput(lineIdx) {
    if (gInlineInput) {
        gInlineInput.remove()
        gInlineInput = null
    }

    const meme = getMeme()
    const line = meme.lines[lineIdx]
    const canvasRect = gElCanvas.getBoundingClientRect()

    const input = document.createElement('input')
    input.type = 'text'
    input.className = 'inline-input'
    input.value = line.txt
    input.style.position = 'absolute'
    input.style.fontSize = `${line.size}px`
    input.style.fontFamily = line.fontFamily
    input.style.color = line.color
    input.style.background = 'rgba(255, 255, 255, 0.7)'
    input.style.border = '1px solid #ccc'
    input.style.borderRadius = '3px'
    input.style.padding = '2px'
    input.style.textAlign = line.align
    input.style.boxSizing = 'border-box'
    input.style.zIndex = '1000'

    gCtx.font = `${line.size}px ${line.fontFamily}`
    const metrics = gCtx.measureText(line.txt || ' ')
    const width = Math.max(metrics.width + 10, 50)
    input.style.width = `${width}px`

    let left = canvasRect.left + line.x + window.scrollX
    if (line.align === 'center') {
        left -= width / 2
    } else if (line.align === 'right') {
        left -= width
    }
    const top = canvasRect.top + line.y - (line.size / 2) + window.scrollY
    input.style.left = `${left}px`
    input.style.top = `${top}px`

    input.addEventListener('input', () => {
        setLineTxt(input.value, lineIdx)
        renderMeme()
    })

    input.addEventListener('keydown', (e) => {
        if (e.key === 'Enter') {
            input.blur()
        }
    })

    input.addEventListener('blur', () => {
        input.remove()
        gInlineInput = null
        renderMeme()
    })

    document.body.appendChild(input)
    gInlineInput = input
    input.focus()
}

function initCanvasDragAndDrop() {
    const canvas = document.getElementById('meme-canvas')
    const tooltip = document.createElement('div')
    tooltip.style.position = 'absolute'
    tooltip.style.backgroundColor = 'rgba(0, 0, 0, 0.8)'
    tooltip.style.color = 'white'
    tooltip.style.padding = '5px 10px'
    tooltip.style.borderRadius = '4px'
    tooltip.style.fontSize = '12px'
    tooltip.style.pointerEvents = 'none'
    tooltip.style.display = 'none'
    tooltip.style.zIndex = '1000'
    document.body.appendChild(tooltip)
    
    canvas.addEventListener('mousedown', (e) => {
        const rect = canvas.getBoundingClientRect()
        const mouseX = e.clientX - rect.left
        const mouseY = e.clientY - rect.top

        const meme = getMeme()
        const clickedLineIdx = meme.lines.findIndex(line => {
            const left = line.boxX
            const right = line.boxX + line.boxWidth
            const top = line.boxY
            const bottom = line.boxY + line.boxHeight
            return mouseX >= left && mouseX <= right && mouseY >= top && mouseY <= bottom
        })

        if (clickedLineIdx !== -1) {
            const line = meme.lines[clickedLineIdx]
            const centerX = line.x
            const centerY = line.y
            const angle = (line.rotation * Math.PI) / 180
            const cos = Math.cos(angle)
            const sin = Math.sin(angle)

            const resizeHandleX = centerX + (line.boxWidth / 2) * cos - (line.boxHeight / 2) * sin
            const resizeHandleY = centerY + (line.boxWidth / 2) * sin + (line.boxHeight / 2) * cos
            const resizeHandleDist = Math.sqrt(
                Math.pow(mouseX - resizeHandleX, 2) + Math.pow(mouseY - resizeHandleY, 2)
            )

            const rotateHandleX = centerX - (line.boxHeight / 2) * sin
            const rotateHandleY = centerY + (line.boxHeight / 2) * cos
            const rotateHandleDist = Math.sqrt(
                Math.pow(mouseX - rotateHandleX, 2) + Math.pow(mouseY - rotateHandleY, 2)
            )

            if (resizeHandleDist <= resizeHandleSize) {
                isResizing = true
                draggedLineIdx = clickedLineIdx
                dragOffsetX = mouseX - resizeHandleX
                dragOffsetY = mouseY - resizeHandleY
            } else if (rotateHandleDist <= rotateHandleSize) {
                isRotating = true
                draggedLineIdx = clickedLineIdx
                dragOffsetX = mouseX - centerX
                dragOffsetY = mouseY - centerY
            } else {
                isDragging = true
                draggedLineIdx = clickedLineIdx
                dragOffsetX = mouseX - line.x
                dragOffsetY = mouseY - line.y
                selectedLineIdx = clickedLineIdx
                setSelectedLine(selectedLineIdx)
                document.getElementById('meme-text-input').value = line.txt
            }
            renderMeme()
        } else {
            selectedLineIdx = -1
            setSelectedLine(-1)
            document.getElementById('meme-text-input').value = ''
            renderMeme()
        }
    })

    canvas.addEventListener('mousemove', (e) => {
        if (draggedLineIdx === -1) {
            const rect = canvas.getBoundingClientRect()
            const mouseX = e.clientX - rect.left
            const mouseY = e.clientY - rect.top

            const meme = getMeme()
            const line = meme.lines[meme.selectedLineIdx]
            if (line) {
                const centerX = line.x
                const centerY = line.y
                const angle = (line.rotation * Math.PI) / 180
                const cos = Math.cos(angle)
                const sin = Math.sin(angle)

                const resizeHandleX = centerX + (line.boxWidth / 2) * cos - (line.boxHeight / 2) * sin
                const resizeHandleY = centerY + (line.boxWidth / 2) * sin + (line.boxHeight / 2) * cos
                const resizeHandleDist = Math.sqrt(
                    Math.pow(mouseX - resizeHandleX, 2) + Math.pow(mouseY - resizeHandleY, 2)
                )

                const rotateHandleX = centerX - (line.boxHeight / 2) * sin
                const rotateHandleY = centerY + (line.boxHeight / 2) * cos
                const rotateHandleDist = Math.sqrt(
                    Math.pow(mouseX - rotateHandleX, 2) + Math.pow(mouseY - rotateHandleY, 2)
                )

                if (resizeHandleDist <= resizeHandleSize) {
                    tooltip.textContent = 'Drag to resize'
                    tooltip.style.display = 'block'
                    tooltip.style.left = e.clientX + 10 + 'px'
                    tooltip.style.top = e.clientY + 10 + 'px'
                    canvas.style.cursor = 'nwse-resize'
                } else if (rotateHandleDist <= rotateHandleSize) {
                    tooltip.textContent = 'Drag to rotate'
                    tooltip.style.display = 'block'
                    tooltip.style.left = e.clientX + 10 + 'px'
                    tooltip.style.top = e.clientY + 10 + 'px'
                    canvas.style.cursor = 'grab'
                } else {
                    tooltip.style.display = 'none'
                    canvas.style.cursor = 'default'
                }
            }
        } else {
            const rect = canvas.getBoundingClientRect()
            const mouseX = e.clientX - rect.left
            const mouseY = e.clientY - rect.top

            const meme = getMeme()
            const line = meme.lines[draggedLineIdx]

            if (isResizing) {
                const centerX = line.x
                const centerY = line.y
                const angle = (line.rotation * Math.PI) / 180
                const cos = Math.cos(angle)
                const sin = Math.sin(angle)

                const dx = mouseX - centerX
                const dy = mouseY - centerY
                const newWidth = Math.max(50, Math.abs(dx * cos + dy * sin) * 2)
                const newHeight = Math.max(20, Math.abs(-dx * sin + dy * cos) * 2)

                const scaleX = newWidth / line.boxWidth
                const scaleY = newHeight / line.boxHeight
                const newScale = Math.min(scaleX, scaleY)
                setScale(newScale, draggedLineIdx)
            } else if (isRotating) {
                const centerX = line.x
                const centerY = line.y
                const dx = mouseX - centerX
                const dy = mouseY - centerY
                const newRotation = (Math.atan2(dy, dx) * 180) / Math.PI
                setRotation(newRotation, draggedLineIdx)
            } else if (isDragging) {
                line.x = Math.max(0, Math.min(mouseX - dragOffsetX, gElCanvas.width))
                line.y = Math.max(0, Math.min(mouseY - dragOffsetY, gElCanvas.height))
            }

            renderMeme()
        }
    })

    canvas.addEventListener('mouseup', () => {
        isDragging = false
        isResizing = false
        isRotating = false
        draggedLineIdx = -1
        tooltip.style.display = 'none'
        canvas.style.cursor = 'default'
        renderMeme()
    })

    canvas.addEventListener('mouseleave', () => {
        isDragging = false
        isResizing = false
        isRotating = false
        draggedLineIdx = -1
        tooltip.style.display = 'none'
        canvas.style.cursor = 'default'
        renderMeme()
    })
}

function renderMeme() {
    const meme = getMeme()
    if (!currentImageObj) return

    gElCanvas.width = 500
    gElCanvas.height = 500

    gCtx.clearRect(0, 0, gElCanvas.width, gElCanvas.height)
    gCtx.drawImage(currentImageObj, 0, 0, gElCanvas.width, gElCanvas.height)

    meme.lines.forEach((line, idx) => {
        gCtx.font = `${line.size * line.scale}px ${line.fontFamily}`
        gCtx.fillStyle = line.color
        gCtx.textAlign = line.align
        gCtx.textBaseline = 'middle'

        gCtx.save()
        gCtx.translate(line.x, line.y)
        gCtx.rotate((line.rotation * Math.PI) / 180)
        gCtx.fillText(line.txt, 0, 0)
        gCtx.restore()

        if (idx === meme.selectedLineIdx) {
            const textMetrics = gCtx.measureText(line.txt)
            const padding = 5
            const boxWidth = textMetrics.width + (padding * 2)
            const boxHeight = (line.size * line.scale) + (padding * 2)

            gCtx.strokeStyle = 'rgba(255, 255, 255, 0.5)'
            gCtx.lineWidth = 2

            gCtx.save()
            gCtx.translate(line.x, line.y)
            gCtx.rotate((line.rotation * Math.PI) / 180)
            gCtx.strokeRect(-boxWidth / 2, -boxHeight / 2, boxWidth, boxHeight)

            gCtx.fillStyle = 'white'
            gCtx.beginPath()
            gCtx.moveTo(boxWidth / 2 - resizeHandleSize, boxHeight / 2)
            gCtx.lineTo(boxWidth / 2, boxHeight / 2 - resizeHandleSize)
            gCtx.lineTo(boxWidth / 2, boxHeight / 2)
            gCtx.closePath()
            gCtx.fill()

            gCtx.fillStyle = 'white'
            gCtx.beginPath()
            gCtx.arc(0, boxHeight / 2, rotateHandleSize / 2, 0, Math.PI * 2)
            gCtx.fill()

            gCtx.restore()

            setLineBox(idx, line.x - boxWidth / 2, line.y - boxHeight / 2, boxWidth, boxHeight)
        }
    })
}

function onShareImg(ev) {
    ev.preventDefault()
    const canvasData = gElCanvas.toDataURL('image/jpeg')

    if (navigator.share) {
        gElCanvas.toBlob((blob) => {
            const file = new File([blob], 'meme.jpg', { type: 'image/jpeg' })
            navigator.share({
                title: 'My Meme',
                text: 'Check out this meme I created!',
                files: [file]
            })
            .catch((error) => {
                console.log('Error sharing:', error)
                shareToFacebook(canvasData)
            })
        }, 'image/jpeg')
    } else {
        shareToFacebook(canvasData)
    }
}

function shareToFacebook(canvasData) {
    const CLOUD_NAME = 'webify'
    const UPLOAD_URL = `https://api.cloudinary.com/v1_1/${CLOUD_NAME}/image/upload`
    const formData = new FormData()
    formData.append('file', canvasData)
    formData.append('upload_preset', 'webify')
    
    fetch(UPLOAD_URL, {
        method: 'POST',
        body: formData
    })
    .then(res => res.json())
    .then(data => {
        const encodedUploadedImgUrl = encodeURIComponent(data.secure_url)
        const facebookShareUrl = `https://www.facebook.com/sharer/sharer.php?u=${encodedUploadedImgUrl}&t=${encodedUploadedImgUrl}`
        window.open(facebookShareUrl, '_blank', 'width=600,height=400')
    })
    .catch(err => console.log('Error uploading to Cloudinary:', err))
}