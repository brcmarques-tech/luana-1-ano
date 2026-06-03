// URL da luana-api. Auto-detecta: localhost em dev, Render em produção.
const isLocal = ['localhost', '127.0.0.1', '0.0.0.0'].includes(location.hostname)
  || location.hostname.startsWith('192.168.');

export const API_URL = isLocal
  ? 'http://127.0.0.1:3003'
  : 'https://luana-api-88aw.onrender.com';
