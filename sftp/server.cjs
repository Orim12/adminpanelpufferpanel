const express = require('express')
const cors = require('cors')
const { uploadModViaSftp } = require('./uploadMod.cjs')

const app = express()
app.use(cors())
app.use(express.json({ limit: '500mb' }))

app.post('/sftp-upload', async (req, res) => {
  try {
    console.log('Received /sftp-upload request')
    const { arrayBuffer, fileName } = req.body
    if (!arrayBuffer || !fileName) {
      return res.status(400).send('Missing parameters')
    }
    console.log('Calling uploadModViaSftp...')
    await uploadModViaSftp(Buffer.from(arrayBuffer.data), fileName)
    res.status(200).send('SFTP upload successful')
  } catch (e) {
    console.error('Error in /sftp-upload handler:', e)
    res.status(500).send(`SFTP upload failed: ${e.message || e}`)
  }
})

const PORT = process.env.SFTP_SERVER_PORT || 4001
app.listen(PORT, () => {
  console.log(`SFTP server listening on port ${PORT}`)
})
