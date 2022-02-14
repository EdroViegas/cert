import { did4allAPI } from './api'

type SignInRequestData = {
  UserName: string
  Password: string
  grant_type: string
}

export type ContactType = {
  name: string
  email: string
  phone: string
  age: number
  genre: string
}

export async function TokenRequest(data: SignInRequestData) {
  try {
    const response = await did4allAPI.post('/token', data)

    if (response) {
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
  const response = await did4allAPI.post(`/logout`)

  const { code, message } = response.data

  return {
    code,
    message,
  }
}

export async function registerUser(user: any) {
  const response = await did4allAPI.post('/users', {
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

export async function getClient() {
  const response = await did4allAPI.get('api/person/single?filter=1437NPZ0PY8BW')

  console.log(response.data)

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
