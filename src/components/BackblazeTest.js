import React, { useState, useEffect } from 'react';
import axios from 'axios';

const BackblazeTest = () => {
  const [status, setStatus] = useState('Iniciando prueba...');
  const [error, setError] = useState(null);
  const [results, setResults] = useState(null);

  useEffect(() => {
    testConnection();
  }, []);

  const testConnection = async () => {
    try {
      setStatus('Probando autorización directa con Backblaze B2...');
      
      // Usar las credenciales directamente para este test
      const keyId = process.env.REACT_APP_B2_ACCOUNT_ID;
      const appKey = process.env.REACT_APP_B2_APPLICATION_KEY;
      
      console.log('Usando credenciales:', {
        keyId: keyId,
        bucketName: process.env.REACT_APP_B2_BUCKET_NAME
      });
      
      // Test 1: Autorizar con B2
      const authString = `${keyId}:${appKey}`;
      const authHeader = `Basic ${btoa(authString)}`;
      
      try {
        setStatus('Enviando solicitud de autorización...');
        
        const auth = await axios({
          method: 'post',
          url: 'https://api.backblazeb2.com/b2api/v2/b2_authorize_account',
          headers: {
            'Authorization': authHeader
          }
        });
        
        console.log('Respuesta de autorización:', auth.data);
        setStatus('Autorización exitosa, obteniendo información del bucket...');
        
        // Test 2: Listar buckets
        const buckets = await axios({
          method: 'post',
          url: `${auth.data.apiUrl}/b2api/v2/b2_list_buckets`,
          headers: {
            'Authorization': auth.data.authorizationToken
          },
          data: {
            accountId: keyId
          }
        });
        
        console.log('Respuesta de buckets:', buckets.data);
        setStatus('Lista de buckets obtenida correctamente');
        
        // Guardar resultados
        setResults({
          auth: auth.data,
          buckets: buckets.data
        });
      } catch (err) {
        console.error('Error en Test 1 o 2:', err);
        setError(err.message || 'Error desconocido');
        
        // Más información sobre el error
        if (err.response) {
          console.error('Datos de respuesta:', err.response.data);
          console.error('Estado:', err.response.status);
          console.error('Cabeceras:', err.response.headers);
        } else if (err.request) {
          console.error('Sin respuesta recibida:', err.request);
        } else {
          console.error('Error de configuración:', err.message);
        }
      }
    } catch (err) {
      console.error('Error general:', err);
      setError(err.message || 'Error desconocido');
    }
  };

  return (
    <div style={{ padding: '20px' }}>
      <h2>Prueba de Conexión con Backblaze B2</h2>
      
      <div style={{ marginBottom: '20px' }}>
        <strong>Estado: </strong>
        <span style={{ color: error ? 'red' : 'green' }}>{error || status}</span>
      </div>
      
      {results && (
        <div>
          <h3>Resultados:</h3>
          <pre style={{ 
            background: '#f5f5f5', 
            padding: '10px', 
            border: '1px solid #ddd',
            borderRadius: '5px',
            overflow: 'auto'
          }}>
            {JSON.stringify(results, null, 2)}
          </pre>
        </div>
      )}
      
      <button 
        onClick={testConnection}
        style={{
          padding: '8px 16px',
          background: '#0066cc',
          color: 'white',
          border: 'none',
          borderRadius: '4px',
          cursor: 'pointer'
        }}
      >
        Reintentar Prueba
      </button>
    </div>
  );
};

export default BackblazeTest;