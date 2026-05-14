import axios from 'axios'

const BASE_URL = import.meta.env.VITE_API_URL || 'https://placeai-hcio.onrender.com'

const client = axios.create({
  baseURL: `${BASE_URL}/api`,
  timeout: 90000,
})

client.interceptors.request.use((config) => {
  const token = localStorage.getItem('token')
  if (token) {
    config.headers.Authorization = `Bearer ${token}`
  }
  return config
})

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

export const api = {
  // Auth
  register: (data) => client.post('/auth/register', data),
  login:    (data) => client.post('/auth/login', data),
  getMe:    ()     => client.get('/auth/me'),

  // Resume
  uploadResume: (formData) => client.post('/resume/upload', formData, {
    headers: { 'Content-Type': 'multipart/form-data' },
  }),
  getMyResume:  ()     => client.get('/resume/my'),
  deleteResume: ()     => client.delete('/resume/my'),
  buildPdf:     (data) => client.post('/resume/build-pdf', data, { responseType: 'blob' }),
  analyzeText:  (text) => client.post('/resume/analyze-text', { text }),

  // Jobs
  getJobRecommendations: ()           => client.get('/jobs/recommendations'),
  getSkillGap:           (targetRole) => client.post('/jobs/skill-gap', { target_role: targetRole }),

  // Chat
  chat: (messages) => client.post('/chat/', { messages }),

  // Interview
  getInterviewQuestions: () => client.get('/interview/questions'),

  // Mock Interview
  startMockInterview:    (data)      => client.post('/mock-interview/start', data),
  submitMockAnswer:      (data)      => client.post('/mock-interview/answer', data),
  completeMockInterview: (sessionId) => client.post(`/mock-interview/complete/${sessionId}`),
  getMockHistory:        ()          => client.get('/mock-interview/history'),
  getMockSession:        (id)        => client.get(`/mock-interview/session/${id}`),

  // Application Tracker
  getApplications:   ()         => client.get('/applications/'),
  createApplication: (data)     => client.post('/applications/', data),
  updateApplication: (id, data) => client.patch(`/applications/${id}`, data),
  deleteApplication: (id)       => client.delete(`/applications/${id}`),

  // Roadmap
  generateRoadmap: (data) => client.post('/roadmap/generate', data),
  getMyRoadmaps:   ()     => client.get('/roadmap/my'),
  deleteRoadmap:   (id)   => client.delete(`/roadmap/${id}`),

  // Cover Letter
  generateCoverLetter: (data) => client.post('/cover-letter/generate', data),

  // Job Search
  searchJobs: (query, location) => client.get('/job-search/search', {
    params: { query, location }
  }),
}

// ✅ Keep Render free tier alive — pings every 14 minutes
if (typeof window !== 'undefined') {
  const keepAlive = () => {
    fetch(`${BASE_URL}/api/health`)
      .then(() => console.log('[PlaceAI] Keep-alive ping sent ✓'))
      .catch(() => {}) // silently ignore if server is down
  }

  // Ping immediately on load, then every 14 minutes
  keepAlive()
  setInterval(keepAlive, 14 * 60 * 1000)
}

export default client
 