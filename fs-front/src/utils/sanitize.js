import DOMPurify from 'dompurify';

/**
 * Sanitiza cualquier cadena o fragmento HTML previniendo ataques Cross-Site Scripting (XSS).
 * Cumple con directrices OWASP Top 10 (A03:2021 - Injection).
 * 
 * @param {string} dirty Cadena potencialmente insegura proporcionada por el usuario o API externa.
 * @param {object} options Opciones opcionales de configuración de DOMPurify.
 * @returns {string} Cadena sanitizada y segura para el renderizado.
 */
export const sanitizeHtml = (dirty, options = {}) => {
  if (!dirty || typeof dirty !== 'string') {
    return '';
  }
  return DOMPurify.sanitize(dirty, {
    USE_PROFILES: { html: true },
    ...options
  });
};

export default sanitizeHtml;
