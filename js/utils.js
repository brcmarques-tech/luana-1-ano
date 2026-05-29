// Util compartilhados entre módulos.

export const wait = (ms) => new Promise((r) => setTimeout(r, ms));

export const imgBase = () => {
  const u = localStorage.getItem('luana_api_url');
  return u ? `${u}/assets/img` : 'assets/img';
};
