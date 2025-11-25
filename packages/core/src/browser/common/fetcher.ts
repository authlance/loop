import axios, { AxiosInstance } from 'axios'

const API_URL = process.env.API_URL || 'http://localhost:3000'
const AUTH_URL = process.env.AUTH_URL || 'http://localhost:8000'

export const apiClient = axios.create({
  baseURL: `${API_URL}/api/v1`,
  withCredentials: true,
  headers: {
    'Content-type': 'application/json',
  },
})

export const authlanceApiClient: AxiosInstance = axios.create({
  baseURL: `${AUTH_URL}`,
  withCredentials: true,
  headers: {
    'Content-type': 'application/json',
  },
})

export const authApiClient: AxiosInstance = axios.create({
  baseURL: `${AUTH_URL}/authlance/identity`,
  withCredentials: true,
  headers: {
    'Content-type': 'application/json',
  },
})

export const hydraApiClient: AxiosInstance = axios.create({
  baseURL: `${AUTH_URL}/authlance/openid`,
  withCredentials: true,
  headers: {
    'Content-type': 'application/json',
  },
})
