'use client';

import { useEffect, useState, Suspense } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import Link from 'next/link';

function VerifyToken() {
  const [status, setStatus] = useState('Verificando, por favor espera...');
  const [error, setError] = useState(false);
  const router = useRouter();
  const searchParams = useSearchParams();

  useEffect(() => {
    const token = searchParams.get('token');

    if (!token) {
      setStatus('Token no encontrado.');
      setError(true);
      return;
    }

    const verifyToken = async () => {
      try {
        const res = await fetch('/api/auth/verify-token', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ token }),
        });

        const data = await res.json();

        if (!res.ok) {
          throw new Error(data.message || 'Error en la verificación');
        }

        localStorage.setItem('authToken', data.token);
        setStatus('¡Verificación exitosa! Redirigiendo...');
        
        // Redirect to dashboard after a short delay
        setTimeout(() => {
          router.push('/');
        }, 1500);

      } catch (err: any) {
        setStatus(`Error: ${err.message}. El enlace puede haber expirado.`);
        setError(true);
      }
    };

    verifyToken();
  }, [searchParams, router]);

  return (
    <div className="min-h-screen bg-gray-100 flex items-center justify-center">
      <div className="bg-white p-8 rounded-lg shadow-md w-full max-w-md text-center">
        <h1 className="text-2xl font-bold mb-6 text-gray-800">Verificación de Acceso</h1>
        <p className={error ? 'text-red-500' : 'text-gray-600'}>
          {status}
        </p>
        {error && (
          <Link href="/login">
            <span className="mt-4 inline-block bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded">
              Volver a la página de acceso
            </span>
          </Link>
        )}
      </div>
    </div>
  );
}

// Wrap the component in Suspense because useSearchParams requires it.
export default function VerifyPage() {
  return (
    <Suspense fallback={<div>Cargando...</div>}>
      <VerifyToken />
    </Suspense>
  );
}
