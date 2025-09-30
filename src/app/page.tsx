'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { jwtDecode } from 'jwt-decode'; // Corrected import
import Link from 'next/link';

interface Book {
  id: number;
  title: string;
}

interface DecodedToken {
  id: number;
  email: string;
  allowedBooks: number[];
}

export default function DashboardPage() {
  const [userBooks, setUserBooks] = useState<Book[]>([]);
  const [userEmail, setUserEmail] = useState('');
  const router = useRouter();

  useEffect(() => {
    const token = localStorage.getItem('authToken');
    if (!token) {
      router.push('/login');
      return;
    }

    try {
      const decodedToken = jwtDecode<DecodedToken>(token);
      setUserEmail(decodedToken.email);
      const allowedBookIds = decodedToken.allowedBooks || [];

      const fetchBooks = async () => {
        const res = await fetch('/api/books');
        if (!res.ok) {
          throw new Error('Failed to fetch books');
        }
        const allBooks: Book[] = await res.json();
        
        const filteredBooks = allBooks.filter(book => allowedBookIds.includes(book.id));
        setUserBooks(filteredBooks);
      };

      fetchBooks();
    } catch (error) {
      console.error('Invalid token or failed to fetch data:', error);
      localStorage.removeItem('authToken');
      router.push('/login');
    }
  }, [router]);

  const handleLogout = () => {
    localStorage.removeItem('authToken');
    router.push('/login');
  };

  return (
    <div className="min-h-screen bg-gray-100">
      <header className="bg-white shadow-md">
        <nav className="container mx-auto px-6 py-4 flex justify-between items-center">
          <h1 className="text-xl font-bold text-gray-800">Visor de PDF</h1>
          <div className="flex items-center">
            <span className="text-gray-700 mr-4">{userEmail}</span>
            <button
              onClick={handleLogout}
              className="bg-red-500 hover:bg-red-700 text-white font-bold py-2 px-4 rounded focus:outline-none focus:shadow-outline"
            >
              Cerrar Sesión
            </button>
          </div>
        </nav>
      </header>
      <main className="container mx-auto px-6 py-8">
        <h2 className="text-2xl font-semibold text-gray-800 mb-6">Mis Libros Disponibles</h2>
        {userBooks.length > 0 ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
            {userBooks.map(book => (
              <Link key={book.id} href={`/viewer/${book.id}`}>
                <div className="bg-white rounded-lg shadow-md p-6 cursor-pointer hover:shadow-lg transition-shadow duration-200">
                  <h3 className="text-lg font-bold text-blue-600">{book.title}</h3>
                </div>
              </Link>
            ))}
          </div>
        ) : (
          <p className="text-gray-600">No tienes libros asignados.</p>
        )}
      </main>
    </div>
  );
}