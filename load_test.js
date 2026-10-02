import http from 'k6/http';
import { check, sleep } from 'k6';

// Configuración de la prueba
export const options = {
  stages: [
    { duration: '30s', target: 50 }, // Ramp-up: 30 segundos para llegar a 50 usuarios
    { duration: '1m', target: 50 },  // Mantener 50 usuarios por 1 minuto
    { duration: '30s', target: 0 },  // Ramp-down: 30 segundos para bajar a 0
  ],
  thresholds: {
    http_req_duration: ['p(90)<1500'], // El 90% de las peticiones debe ser < 1.5s
    http_req_failed: ['rate<0.01'],    // Menos del 1% de errores
  },
};

// Token de autenticación (reemplázalo con uno real de tu sistema)
const AUTH_TOKEN = 'f11ac0c52ffba9fe7a5a9a83429e42c093881be0';

export default function () {
  // Endpoint del Dashboard (Top Productos)
  const url = 'http://localhost:8000/fs/dashboard/top-products/';
  
  const params = {
    headers: {
      'Authorization': `Token ${AUTH_TOKEN}`,
      'Content-Type': 'application/json',
    },
  };

  const response = http.get(url, params);

  // Verificar que la respuesta sea exitosa
  check(response, {
    'status is 200': (r) => r.status === 200,
    'response time < 1.5s': (r) => r.timings.duration < 1500,
  });

  sleep(1); // Pausa de 1 segundo entre peticiones
}