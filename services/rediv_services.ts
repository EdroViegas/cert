import { redivAPI } from './api'

type SignInRequestData = {
  UserName: string
  Password: string
  grant_type: string
}

export async function TokenRequest(data: SignInRequestData) {
  try {
    //Change to get
    const response = await redivAPI.post('token', data, {
      headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
    })

    if (response) {
      console.log(response)

      // eslint-disable-next-line @typescript-eslint/naming-convention
      const { access_token, token_type, expires_in } = response.data

      return {
        token: access_token,
        token_type: token_type,
        expires_in: expires_in,
      }
    }
  } catch (error) {
    console.log(error)
    return error
  }
}

export async function logout() {
  const response = await redivAPI.post(`/logout`)

  const { code, message } = response.data

  return {
    code,
    message,
  }
}

export async function registerUser(user: any) {
  const response = await redivAPI.post('/users', {
    name: user.name,
    email: user.email,
    role: user.role,
    password: user.password,
    genre: user.genre,
  })

  const { code, message } = response.data

  return {
    code,
    message,
  }
}

export function checkToken() {
  redivAPI
    .post('logged_user')
    .then((res) => {
      var valid = false

      const { user } = res.data

      if (user) valid = true
      return {
        message: 'Token válido',
        code: 'SUCCESS',
        valid: true,
      }
    })
    .catch((error) => {
      return {
        message: error,
        code: 'SERVER ERROR',
        valid: false,
      }
    })
}

export async function getClient(filter: string) {
  const response = await redivAPI.get(`api/person/single?filter=${filter}`)

  //Aproveitar para filtrar os campos necessários apenas
  //E retornar
  return response.data

  //const { user } = response.data
  /*
  return {
    user: {
      id: user.id,
      name: user.name,
      email: user.email,
      role: user.role,
      isActive: user.is_active,
      genre: user.genre,
    },
  }*/
}
