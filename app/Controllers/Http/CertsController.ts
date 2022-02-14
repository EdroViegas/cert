import { HttpContextContract } from '@ioc:Adonis/Core/HttpContext'
import { base64 } from '@ioc:Adonis/Core/Helpers'
import CoseSigner from '../../../cose/cose_signer'
import { getClient } from '../../../services/rediv_services'
import Cert from 'App/Models/Cert'

export default class CertsController {
  public async index({ response }: HttpContextContract) {
    const data = {
      Category: {
        Id_Categoria: 22,
        Id_Setor: 2,
        Nome: 'Administrativos',
      },
      Nationality: {
        Id_Nacionalidade: 2,
        Nome: 'Portuguesa',
      },
      DocumentType: {
        Id_tipoDocumento: 2,
        Nome: 'Cartão de Estrangeiro Residente',
      },
      Vaccinations: [
        {
          Id_regVacinacao: 86,
          Id_regIndividual: 143,
          Vacina: 'AstraZeneca',
          Dose: '1ª Dose',
          numLote: '4120Z028',
          Fabricante: 'Serum Institute of Índia',
          PostoVacinacao: 'EA Depósito Central de Medicamentos',
          DataCad: '2021-03-02T17:17:37.91',
        },
        {
          Id_regVacinacao: 551835,
          Id_regIndividual: 143,
          Vacina: 'AstraZeneca',
          Dose: '2ª Dose',
          numLote: '4120Z029',
          Fabricante: 'Serum Institute of Índia',
          PostoVacinacao: 'PVAR Paz Flor1 (Tenda)',
          DataCad: '2021-05-04T14:44:44.02',
        },
        {
          Id_regVacinacao: 1089823,
          Id_regIndividual: 143,
          Vacina: 'Pfizer',
          Dose: '1ª Dose',
          numLote: 'FC8889',
          Fabricante: 'mRNA Pfizer',
          PostoVacinacao: 'EA - Depósito Central de Vacinas',
          DataCad: '2021-06-03T00:00:00',
        },
      ],
      VaccinationsNext: {
        Id_regIndividual: 143,
        NumDias: 21,
        NumDiasProximaDose: -190,
        DataProximaDose: '2021-06-24T00:00:00',
        Dose: '2ª Dose',
        SituacaoRegularizada: false,
      },
      Institution: {
        Id_regInstituicao: 54,
        Nome: 'Centro de Vacinação Depósito Central de Medicamentos',
        Provincia: 'Luanda',
        Municipio: 'Kilamba Kiaxi',
        Morada: 'Depósito Central de Medicamentos',
        Codigo: '54ZLM0WOLYNGT',
      },
      Id_regIndividual: 143,
      Id_regInstituicao: 54,
      Nome: 'JOSÉ MARIA FERREIRA MOURA',
      Telefone: '932378148',
      Email: 'jose.ferreira.moura@gmail.com',
      Genero: 'Masculino',
      dtNascimento: '1969-02-24T00:00:00',
      Id_tipoDocumento: 2,
      docNum: '0040955T01',
      Id_Nacionalidade: 2,
      Id_provincia: 13,
      Id_Municipio: 133,
      Id_Categoria: 22,
      Codigo: '1437NPZ0PY8BW',
      Status: 'C',
      DataCad: '2021-03-02T17:06:44.233',
      FlagRegSimp: null,
      Id_regDoencas: null,
      Id_Setor: 2,
      Comorbilidade: null,
      certificado: 'S',
      Observacao: null,
      WebAlt: null,
      NomePai: null,
      NomeMae: null,
      NumDoses: 0,
    }

    const coseSigner = new CoseSigner(data)

    const qrInfo = await coseSigner.sign()

    const verified = await coseSigner.verify(qrInfo)

    const cert = await Cert.create({ plaintext: JSON.stringify(data), base45: qrInfo })

    return response
      .status(202)
      .send({ message: 'REDIV and QRcode data', rediv: data, qrcode: qrInfo, verified, cert })
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
