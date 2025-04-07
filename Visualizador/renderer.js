const fs = require('fs')
const path = require('path')

window.addEventListener('DOMContentLoaded', () => {
  const filePath = path.join(__dirname, 'propriedades.json')
  const propriedades = JSON.parse(fs.readFileSync(filePath, 'utf8'))

  const select = document.getElementById('select')
  const canvas = document.getElementById('canvas')
  const ctx = canvas.getContext('2d')

  propriedades.forEach(p => {
    const opt = document.createElement('option')
    opt.value = p.objectId
    opt.textContent = `ID ${p.objectId} - ${p.freguesia}`
    select.appendChild(opt)
  })

  select.addEventListener('change', () => {
    const prop = propriedades.find(p => p.objectId == select.value)
    if (prop) drawPolygon(prop.geometry)
  })

  drawPolygon(propriedades[0].geometry)

  function drawPolygon(coords) {
    ctx.clearRect(0, 0, canvas.width, canvas.height)

    const margin = 20
    const xs = coords.map(p => p[0])
    const ys = coords.map(p => p[1])
    const minX = Math.min(...xs)
    const minY = Math.min(...ys)
    const maxX = Math.max(...xs)
    const maxY = Math.max(...ys)
    const scaleX = (canvas.width - 2 * margin) / (maxX - minX)
    const scaleY = (canvas.height - 2 * margin) / (maxY - minY)
    const scale = Math.min(scaleX, scaleY)

    ctx.beginPath()
    coords.forEach(([x, y], i) => {
      const drawX = (x - minX) * scale + margin
      const drawY = canvas.height - ((y - minY) * scale + margin)
      i === 0 ? ctx.moveTo(drawX, drawY) : ctx.lineTo(drawX, drawY)
    })
    ctx.closePath()
    ctx.fillStyle = 'rgba(0, 123, 255, 0.3)'
    ctx.fill()
    ctx.strokeStyle = '#0078ff'
    ctx.lineWidth = 2
    ctx.stroke()
  }
})
