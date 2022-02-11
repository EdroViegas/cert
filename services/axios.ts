import axios, { HeadersDefaults } from 'axios'

export interface CommonHeaderProperties extends HeadersDefaults {
  Authorization: string
}

//Axios instance configuration to getdata from REDIV
export function getREDIV() {
  const token =
    'NtQGaj-1PwYeZ0LiBbmYIvsFVYUpI_V2LQDIQbo6ukSWKmEUwgVoXhElIhvwjVYHNfFe7YVk2K-7fXXHB7u0gHdCR2rEv6gqBaxiGlRG3VtQZFyIxaOcDZhzeyirVB0dfVkBWYXXhRYgLgErQNjKVYY7V-MUgKpHp4nNNQhpMZH-YTv7kbLVhdPLXkA7jeWVe4opO5aqG0IsjB7MOo3dweZsIgR-b2zxs_oDCw7e9TOzNblfzUxA_f65w8JFz7PjYMiLGLxeWJS36u-aSKTe-NZ9zP53cWG9H0hrCh_RL2kPmIQBmsVX4Lb120B5XKfeiPTI4xnn9ZJdqINWHwjxaw'

  const api = axios.create({
    baseURL: process.env.REDIV_API_URL,
  })
  //Remove after test
  api.interceptors.request.use((config) => {
    //console.log(config)

    return config
  })

  api.interceptors.response.use(
    (response) => {
      return response
    },
    (error) => {
      if (error.response.status === 401) {
        //Apaga o token não valido - Remove not valid token
        //Prevent errors
        console.log('Invalid token')
        return error
      }
      if (error.response.status === 404) {
        console.log('Resource not found')
        return error
      }
      if (error.response.status === 500) {
        console.log('An error occured in server')
        return error
      }
      return error
    }
  )

  if (token) {
    api.defaults.headers = {
      Authorization: 'Bearer ' + token,
    } as CommonHeaderProperties
  }

  return api
}

//Axios instance configuration to getdata from DID4ALL

export function getDID4ALL() {
  const token =
    'NtQGaj-1PwYeZ0LiBbmYIvsFVYUpI_V2LQDIQbo6ukSWKmEUwgVoXhElIhvwjVYHNfFe7YVk2K-7fXXHB7u0gHdCR2rEv6gqBaxiGlRG3VtQZFyIxaOcDZhzeyirVB0dfVkBWYXXhRYgLgErQNjKVYY7V-MUgKpHp4nNNQhpMZH-YTv7kbLVhdPLXkA7jeWVe4opO5aqG0IsjB7MOo3dweZsIgR-b2zxs_oDCw7e9TOzNblfzUxA_f65w8JFz7PjYMiLGLxeWJS36u-aSKTe-NZ9zP53cWG9H0hrCh_RL2kPmIQBmsVX4Lb120B5XKfeiPTI4xnn9ZJdqINWHwjxaw'

  const api = axios.create({
    baseURL: process.env.DID4ALL_API_URL,
  })
  //Remove after test
  api.interceptors.request.use((config) => {
    //console.log(config)

    return config
  })

  api.interceptors.response.use(
    (response) => {
      return response
    },
    (error) => {
      if (error.response.status === 401) {
        //Apaga o token não valido - Remove not valid token
        //Prevent errors
      }
      if (error.response.status === 404) {
        console.log('Página não encontrada')
        return error
      }
      if (error.response.status === 500) {
        console.log('Ocorreu um erro no servidor')
        return error
      }
      return error
    }
  )

  if (token) {
    api.defaults.headers = {
      Authorization: 'Bearer ' + token,
    } as CommonHeaderProperties
  }

  return api
}
