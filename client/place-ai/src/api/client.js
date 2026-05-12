import axios from 'axios'

// Base URL — uses Vite proxy in dev, env var in production
const BASE_URL = import.meta.env.VITE_API_URL || ''

const client = axios.create({
  baseURL: `${BASE_URL}/api`,
  timeout: 90000, // 90s — AI calls can take time
})

// Attach JWT token to every request
client.interceptors.request.use((config) => {
  const token = localStorage.getItem('token')
  if (token) {
    config.headers.Authorization = `Bearer ${token}`
  }
  return config
})

// Handle 401 globally — redirect to login
client.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      localStorage.removeItem('token')
      localStorage.removeItem('user')
      window.location.href = '/login'
    }
    return Promise.reject(error)
  }
)

// ── API methods ────────────────────────────────────────────────

export const api = {
  // Auth
  register: (data)        => client.post('/auth/register', data),
  login:    (data)        => client.post('/auth/login', data),
  getMe:    ()            => client.get('/auth/me'),

  // Resume
  uploadResume:  (formData) => client.post('/resume/upload', formData, {
    headers: { 'Content-Type': 'multipart/form-data' },
  }),
  getMyResume:   ()         => client.get('/resume/my'),
  deleteResume:  ()         => client.delete('/resume/my'),
  buildPdf:      (data)     => client.post('/resume/build-pdf', data, { responseType: 'blob' }),
  analyzeText:   (text)     => client.post('/resume/analyze-text', { text }),

  // Jobs
  getJobRecommendations: ()           => client.get('/jobs/recommendations'),
  getSkillGap:           (targetRole) => client.post('/jobs/skill-gap', { target_role: targetRole }),

  // Chat
  chat: (messages) => client.post('/chat/', { messages }),

  // Interview
  getInterviewQuestions: () => client.get('/interview/questions'),
}

export default client
