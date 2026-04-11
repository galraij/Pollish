import axios from 'axios';

const API_BASE = import.meta.env.VITE_API_URL || 'http://localhost:3001/api';

const api = axios.create({
  baseURL: API_BASE,
  headers: { 'Content-Type': 'application/json' },
});

// ── Voter ID (anonymous, stored in localStorage) ──
export function getVoterId() {
  let id = localStorage.getItem('pollish_voter_id');
  if (!id) {
    id = crypto.randomUUID();
    localStorage.setItem('pollish_voter_id', id);
  }
  return id;
}

// ── Poll API ──
export const pollService = {
  create: (data) => api.post('/polls', data).then((r) => r.data),
  getAll: () => api.get('/polls').then((r) => r.data),
  getById: (id) => api.get(`/polls/${id}`).then((r) => r.data),
};

// ── Vote API ──
export const voteService = {
  cast: ({ pollId, optionId }) =>
    api.post('/votes', { pollId, optionId, voterId: getVoterId() }).then((r) => r.data),
  check: (pollId) =>
    api.get(`/votes/check/${pollId}/${getVoterId()}`).then((r) => r.data),
};

export default api;
