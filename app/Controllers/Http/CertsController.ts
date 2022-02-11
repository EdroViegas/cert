import { HttpContextContract } from '@ioc:Adonis/Core/HttpContext'
import { base64 } from '@ioc:Adonis/Core/Helpers'
import CoseSigner from '../../../cose/cose_signer'
import { getClient } from '../../../services/rediv_services'

export default class CertsController {
  public async index({ response }: HttpContextContract) {
    const redivData = await getClient('1437NPZ0PY8BW')
    const coseSigner = new CoseSigner(redivData)

    const qrInfo = await coseSigner.sign()

    return response
      .status(202)
      .send({ message: 'REDIV and QRcode data', rediv: redivData, qrcode: qrInfo })
  }

  public async show({ response, params }: HttpContextContract) {
    try {
      const rediv = await getClient(params.id)

      if (!rediv) {
        return response
          .status(500)
          .send({ status: 'failed', message: 'Ocorreu um erro ao obter os dados', data: null })
      }
      if (JSON.stringify(rediv) === JSON.stringify({})) {
        return response
          .status(404)
          .send({ status: 'failed', message: 'Nenhum registro encontrado', data: null })
      }

      const coseSigner = new CoseSigner(rediv)
      const qrcode = await coseSigner.sign()
      const qrcode64 = base64.encode(qrcode)

      return response.status(202).send({
        status: 'success',
        message: 'REDIV and QRcode data',
        data: { rediv, qrcode, qrcode64 },
      })
    } catch (error) {
      console.log(error)
      return response
        .status(500)
        .send({ status: 'failed', message: 'Ocorreu um erro ao obter os dados', data: error })
    }
  }

  public async update({}: HttpContextContract) {}

  public async destroy({}: HttpContextContract) {}
}
