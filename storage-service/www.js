const express = require('express')
const { nanoid } = require('nanoid')
const cors = require('cors')
const fs = require('node:fs')
const path = require('node:path')
const process = require('node:process')

const app = express() 

app.use(express.json())
app.use(express.urlencoded({ extended: true }))

const allowedOrigins = [
  'http://localhost'
]

app.use(cors((req, callback) => {
  if (req.method === 'GET') {
    callback(null, { origin: true })
  } else if (req.method === 'POST') {
    callback(null, { origin: allowedOrigins.includes(req.headers.origin)})
  }
}))

app.get('/api/v2/:id', (req, res, next) => {
  try {
    const id = req.params.id
    const data = fs.readFileSync(path.join(__dirname, 'data', id))

    console.info(`GET /api/v2/${id}`)

    res.status(200)
    res.setHeader('content-type', 'application/octet-stream')
    res.send(data)
  } catch (error) {
    console.error(error)
    res.status(404).json({ message: 'Could not find the file.' })
  }
})

app.post('/api/v2/post/', (req, res, next) => {
  try {
    const id = nanoid()
    let data = []

    console.info(`POST /api/v2/${id}`)

    req.on('data', chunk => {
      console.debug(`Saving chunk...`)
      data.push(chunk)
    })

    req.on('end', () => {
      console.info(`Writing data to disk`)
      fs.writeFileSync(path.resolve(__dirname, 'data', id), Buffer.concat(data))

      res.status(200).json({
        id,
        data: `http://${req.get("host")}:3000/api/v2/${id}`,
      })
    })
  } catch (error) {
    console.error(error)
    res.status(500).json({ message: 'Could not upload the data.' })
  }
})

app.listen(3000)

// Helps Docker shutdown cleanly.
process.on('SIGTERM', () => process.exit())