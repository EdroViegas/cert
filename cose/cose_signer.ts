import fs from 'fs'
import path from 'path'
import cose from 'cose-js'
import zlib from 'pako'
import { Certificate, PrivateKey } from '@fidm/x509'
var cbor = require('cbor')
const base45 = require('base45-js')
const rawHash = require('sha256-uint8array').createHash

class CoseSigner {
  private keyID: any
  private keyD: any
  private data: string

  constructor(data: any) {
    this.data = data
  }

  //Get certificate to add data into the final result
  private getCertificates() {
    const cert = Certificate.fromPEM(
      fs.readFileSync(path.resolve(__dirname, '../certificates/dsc-worker.pem'))
    )
    var bytes = new Uint8Array(cert.raw)

    const fingerprint = rawHash().update(cert.raw).digest()
    this.keyID = fingerprint.slice(0, 8)

    const pk = PrivateKey.fromPEM(
      fs.readFileSync(path.resolve(__dirname, '../certificates/dsc-worker.p8'))
    )
    // Highly ES256 specific - extract the 'D' for signing.

    this.keyD = Buffer.from(pk.keyRaw.slice(7, 7 + 32))
  }

  private encodeCBOR() {
    return cbor.encode(JSON.parse(JSON.stringify(this.data)))
  }

  public async sign() {
    this.getCertificates()
    const plaintext = this.encodeCBOR()

    const headers = {
      p: { alg: 'ES256', kid: this.keyID },
      u: {},
    }

    const signer = {
      key: {
        d: this.keyD,
      },
    }

    //Assigne a cose to the plaintext
    const assigned = await cose.sign.create(headers, plaintext, signer)

    //Compress the data in assigned cose
    let buf = zlib.deflate(assigned)
    //Encode the data into base45
    var strBuf = 'HC1:' + base45.encode(buf)

    //Transforms  Buffer to String
    strBuf = Buffer.from(strBuf).toString()
    return strBuf
  }

  public async verify(data) {
    const cert = Certificate.fromPEM(
      fs.readFileSync(path.resolve(__dirname, '../certificates/dsc-worker.pem'))
    )

    var bytes = new Uint8Array(cert.raw)

    const fingerprint = rawHash().update(cert.raw).digest()
    const keyID = fingerprint.slice(0, 8)

    // Highly ES256 specific - extract the 'X' and 'Y' for verification
    //
    const pk = cert.publicKey.keyRaw
    const keyB = Buffer.from(pk.slice(0, 1))
    const keyX = Buffer.from(pk.slice(1, 1 + 32))
    const keyY = Buffer.from(pk.slice(33, 33 + 32))

    // Read in the Base45
    //
    /*
    const buffer = Buffer.alloc(4_096)
    var len = fs.readSync(process.stdin.fd, buffer, 0, buffer.length)
    var data = buffer.slice(0, len).toString('ASCII')*/

    var content = data.toString('ASCII')

    // Strip off the HC1 header if present
    //
    if (content.startsWith('HC1')) {
      content = content.substring(3)
      if (content.startsWith(':')) {
        content = content.substring(1)
      } else {
        console.log('Warning: unsafe HC1: header - update to v0.0.4')
      }
    } else {
      console.log('Warning: no HC1: header - update to v0.0.4')
    }

    content = base45.decode(content)

    // Zlib magic headers:
    // 78 01 - No Compression/low
    // 78 9C - Default Compression
    // 78 DA - Best Compression
    //
    // eslint-disable-next-line eqeqeq
    if (content[0] == 0x78) {
      content = zlib.inflate(content)
    }

    const verifier = { key: { x: keyX, y: keyY, kid: keyID } }

    try {
      const signed = await cose.sign.verify(content, verifier)

      content = cbor.decode(signed)
      // content = JSON.stringify(content, null, 5)
      return content
    } catch (error) {
      console.log(error)
      return error
    }
  }
}

export default CoseSigner
