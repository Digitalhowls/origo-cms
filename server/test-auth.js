/**
 * Script para probar la autenticación
 */
const fetch = require('node-fetch');

async function testAuth() {
  try {
    console.log('Probando sistema de autenticación...');

    // 1. Intentar login con credenciales válidas
    console.log('\n1. Intentando login...');
    const loginResponse = await fetch('http://localhost:5000/api/auth/login', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        email: 'admin@origo.com',
        password: 'password123'
      }),
      credentials: 'include'
    });

    const loginData = await loginResponse.json();
    console.log('Estado de respuesta:', loginResponse.status);
    console.log('Headers de respuesta:', loginResponse.headers);
    console.log('Cuerpo de respuesta:', JSON.stringify(loginData, null, 2));

    // Almacenar las cookies para usarlas en peticiones posteriores
    const cookies = loginResponse.headers.get('set-cookie');
    console.log('Cookies recibidas:', cookies);

    if (loginResponse.ok) {
      // 2. Verificar usuario actual (me)
      console.log('\n2. Verificando usuario actual...');
      const meResponse = await fetch('http://localhost:5000/api/auth/me', {
        headers: {
          Cookie: cookies,
          'Content-Type': 'application/json'
        },
        credentials: 'include'
      });

      const meData = await meResponse.json();
      console.log('Estado de respuesta:', meResponse.status);
      console.log('Cuerpo de respuesta:', JSON.stringify(meData, null, 2));

      // 3. Probar una ruta protegida (organizaciones)
      console.log('\n3. Probando ruta protegida...');
      const orgsResponse = await fetch('http://localhost:5000/api/organizations', {
        headers: {
          Cookie: cookies,
          'Content-Type': 'application/json'
        },
        credentials: 'include'
      });

      const orgsData = await orgsResponse.json();
      console.log('Estado de respuesta:', orgsResponse.status);
      console.log('Cuerpo de respuesta:', JSON.stringify(orgsData, null, 2));

      // 4. Cerrar sesión
      console.log('\n4. Cerrando sesión...');
      const logoutResponse = await fetch('http://localhost:5000/api/auth/logout', {
        method: 'POST',
        headers: {
          Cookie: cookies,
          'Content-Type': 'application/json'
        },
        credentials: 'include'
      });

      const logoutData = await logoutResponse.json();
      console.log('Estado de respuesta:', logoutResponse.status);
      console.log('Cuerpo de respuesta:', JSON.stringify(logoutData, null, 2));
    }

  } catch (error) {
    console.error('Error en la prueba de autenticación:', error);
  }
}

testAuth();