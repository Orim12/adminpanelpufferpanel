require('dotenv').config({ path: require('path').resolve(__dirname, '../.env') })

async function uploadModViaSftp(arrayBuffer, fileName) {
  const SftpClient = require('ssh2-sftp-client')
  const sftp = new SftpClient()
  try {
    console.log('SFTP credentials:', {
      host: process.env.SFTP_HOST,
      port: process.env.SFTP_PORT,
      username: process.env.SFTP_USER,
      password: process.env.SFTP_PASS ? '[HIDDEN]' : undefined
    })
    await sftp.connect({
      host: process.env.SFTP_HOST,
      port: process.env.SFTP_PORT ? parseInt(process.env.SFTP_PORT) : 22,
      username: process.env.SFTP_USER,
      password: process.env.SFTP_PASS,
    })
    await sftp.put(Buffer.from(arrayBuffer), `/mods/${fileName}`)
    console.log('SFTP upload succesvol:', `/mods/${fileName}`)
  } finally {
    await sftp.end()
  }
}

module.exports = { uploadModViaSftp }
