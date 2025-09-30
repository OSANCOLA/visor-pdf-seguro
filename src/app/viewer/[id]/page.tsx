'use client';

import { useEffect, useState, useCallback } from 'react';
import { useRouter, useParams } from 'next/navigation';
import { Document, Page, pdfjs } from 'react-pdf';
import 'react-pdf/dist/Page/AnnotationLayer.css';
import 'react-pdf/dist/Page/TextLayer.css';
import Link from 'next/link';

// Configure the PDF.js worker
pdfjs.GlobalWorkerOptions.workerSrc = `//unpkg.com/pdfjs-dist@${pdfjs.version}/build/pdf.worker.min.js`;

interface Book {
  id: number;
  title: string;
  googleDriveLink: string;
}

export default function ViewerPage() {
  const [book, setBook] = useState<Book | null>(null);
  const [numPages, setNumPages] = useState<number | null>(null);
  const [pageNumber, setPageNumber] = useState(1);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const router = useRouter();
  const params = useParams();
  const { id } = params;

  const onDocumentLoadSuccess = ({ numPages }: { numPages: number }) => {
    setNumPages(numPages);
    setIsLoading(false);
  };

  const goToPrevPage = () => setPageNumber(prev => Math.max(prev - 1, 1));
  const goToNextPage = () => setPageNumber(prev => Math.min(prev + 1, numPages || 1));

  useEffect(() => {
    const fetchBookData = async () => {
      const token = localStorage.getItem('authToken');
      if (!token) {
        router.push('/login');
        return;
      }

      try {
        const res = await fetch(`/api/books/${id}`, {
          headers: { Authorization: `Bearer ${token}` },
        });

        if (res.status === 401 || res.status === 403) {
          setError('Acceso denegado. No tienes permiso para ver este libro.');
          setIsLoading(false);
          return;
        }
        if (!res.ok) {
          throw new Error('Failed to fetch book data');
        }

        const bookData: Book = await res.json();
        setBook(bookData);
      } catch (err: any) {
        setError(err.message);
        setIsLoading(false);
      }
    };

    if (id) {
      fetchBookData();
    }
  }, [id, router]);

  // Security measures
  useEffect(() => {
    const handleContextMenu = (e: MouseEvent) => e.preventDefault();
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.ctrlKey || e.metaKey) && e.key === 'p') {
        e.preventDefault();
      }
    };

    document.addEventListener('contextmenu', handleContextMenu);
    document.addEventListener('keydown', handleKeyDown);

    return () => {
      document.removeEventListener('contextmenu', handleContextMenu);
      document.removeEventListener('keydown', handleKeyDown);
    };
  }, []);

  return (
    <div className="min-h-screen bg-gray-800 text-white select-none">
      <header className="bg-gray-900 p-4 flex justify-between items-center shadow-md">
        <Link href="/">
          <span className="text-blue-400 hover:text-blue-300 cursor-pointer">&larr; Volver al Dashboard</span>
        </Link>
        <h1 className="text-xl font-bold">{book?.title || 'Cargando...'}</h1>
        <div></div>
      </header>

      <main className="flex flex-col items-center py-8">
        {isLoading && <p>Cargando libro...</p>}
        {error && <p className="text-red-400">Error: {error}</p>}
        {book && !error && (
          <div className="w-full max-w-4xl">
            <Document
              file={book.googleDriveLink}
              onLoadSuccess={onDocumentLoadSuccess}
              onLoadError={(err) => { setError(`Failed to load PDF file: ${err.message}`); setIsLoading(false); }}
              loading={<p>Cargando documento...</p>}
            >
              <Page pageNumber={pageNumber} />
            </Document>
            
            {numPages && (
              <div className="flex justify-center items-center mt-4 text-white">
                <button onClick={goToPrevPage} disabled={pageNumber <= 1} className="bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded disabled:opacity-50">
                  Anterior
                </button>
                <p className="mx-4">
                  Página {pageNumber} de {numPages}
                </p>
                <button onClick={goToNextPage} disabled={pageNumber >= numPages} className="bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded disabled:opacity-50">
                  Siguiente
                </button>
              </div>
            )}
          </div>
        )}
      </main>
    </div>
  );
}
