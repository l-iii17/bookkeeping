import axios from 'axios'

const api = axios.create({
  baseURL: '/api',
  headers: {
    'Content-Type': 'application/json',
  },
})

export const getRecords = (userId) => {
  return api.get('/records.php', { params: { user_id: userId } })
}

export const addRecord = (data) => {
  return api.post('/records.php', data)
}

export const updateRecord = (data) => {
  return api.put('/records.php', data)
}

export const deleteRecord = (id, userId) => {
  return api.delete('/records.php', { data: { id, user_id: userId } })
}
