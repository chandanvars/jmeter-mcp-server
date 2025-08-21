export const patterns = [
  {
    name: 'session_id',
    regex: /^[a-zA-Z0-9]{16,}$/,
    type: 'session'
  },
  {
    name: 'csrf_token',
    regex: /^[a-zA-Z0-9+/=]{20,}$/,
    type: 'csrf'
  },
  {
    name: 'uuid',
    regex: /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i,
    type: 'uuid'
  },
  {
    name: 'jwt_token',
    regex: /^[A-Za-z0-9-_]+\.[A-Za-z0-9-_]+\.[A-Za-z0-9-_]+$/,
    type: 'jwt'
  },
  {
    name: 'numeric_id',
    regex: /^\d{6,}$/,
    type: 'id'
  },
  {
    name: 'timestamp',
    regex: /^\d{10,13}$/,
    type: 'timestamp'
  },
  {
    name: 'hash',
    regex: /^[a-f0-9]{32,64}$/i,
    type: 'hash'
  }
];
