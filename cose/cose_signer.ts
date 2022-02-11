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
}

export default CoseSigner
