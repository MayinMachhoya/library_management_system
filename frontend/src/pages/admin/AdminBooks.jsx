import React, { useState, useEffect } from 'react';
import api from '../../utils/api';
import { useToast } from '../../components/Toast';
import Pagination from '../../components/Pagination';
import { Search, Plus, Trash2, Library } from 'lucide-react';

export default function AdminBooks() {
    const [books, setBooks] = useState([]);
    const [meta, setMeta] = useState(null);
    const [loading, setLoading] = useState(true);
    const [search, setSearch] = useState('');
    const [page, setPage] = useState(1);
    const { showToast } = useToast();

    const [showAddModal, setShowAddModal] = useState(false);
    const [newBook, setNewBook] = useState({ name: '', author: '', isbn: '', category: '', quantity: 1 });

    const fetchBooks = async () => {
        setLoading(true);
        try {
            const { data } = await api.get(`/books?page=${page}&search=${search}`);
            setBooks(data.data);
            setMeta(data.meta);
        } catch (err) {
            showToast('Failed to load books.', 'error');
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        const delayDebounce = setTimeout(() => {
            fetchBooks();
        }, 300);
        return () => clearTimeout(delayDebounce);
    }, [page, search]);

    const handleAddSubmit = async (e) => {
        e.preventDefault();
        try {
            await api.post('/books', newBook);
            showToast('Book added successfully!', 'success');
            setShowAddModal(false);
            setNewBook({ name: '', author: '', isbn: '', category: '', quantity: 1 });
            fetchBooks();
        } catch (err) {
            showToast(err.response?.data?.message || 'Failed to add book', 'error');
        }
    };

    const handleDelete = async (id) => {
        if (!window.confirm("Are you sure you want to delete this book?")) return;
        try {
            await api.delete(`/books/${id}`);
            showToast('Book deleted.', 'success');
            fetchBooks();
        } catch (err) {
            showToast('Failed to delete book.', 'error');
        }
    };

    return (
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
            <div className="sm:flex sm:items-center sm:justify-between mb-8">
                <div>
                    <h1 className="text-2xl font-bold leading-7 text-gray-900 sm:truncate sm:text-3xl sm:tracking-tight flex items-center gap-2">
                        <Library className="h-8 w-8 text-indigo-600" />
                        Book Inventory
                    </h1>
                    <p className="mt-1 text-sm text-gray-500">Manage all books available in the library.</p>
                </div>
                <div className="mt-4 sm:ml-16 sm:mt-0 sm:flex-none">
                    <button
                        onClick={() => setShowAddModal(true)}
                        className="inline-flex items-center gap-2 rounded-md bg-indigo-600 px-3 py-2 text-sm font-semibold text-white shadow-sm hover:bg-indigo-500 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-indigo-600 transition-colors"
                    >
                        <Plus className="h-4 w-4" /> Add Book
                    </button>
                </div>
            </div>

            <div className="mb-6 flex">
                <div className="relative rounded-md shadow-sm w-full max-w-md">
                    <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3">
                        <Search className="h-5 w-5 text-gray-400" />
                    </div>
                    <input
                        type="text"
                        className="block w-full rounded-md border-0 py-2 pl-10 text-gray-900 ring-1 ring-inset ring-gray-300 placeholder:text-gray-400 focus:ring-2 focus:ring-inset focus:ring-indigo-600 sm:text-sm sm:leading-6"
                        placeholder="Search books by name, author, or ISBN..."
                        value={search}
                        onChange={(e) => setSearch(e.target.value)}
                    />
                </div>
            </div>

            <div className="bg-white shadow-sm ring-1 ring-gray-300 sm:rounded-lg overflow-hidden">
                <div className="overflow-x-auto">
                    <table className="min-w-full divide-y divide-gray-300">
                        <thead className="bg-gray-50">
                            <tr>
                                <th className="py-3.5 pl-4 pr-3 text-left text-sm font-semibold text-gray-900 sm:pl-6">Book Name</th>
                                <th className="px-3 py-3.5 text-left text-sm font-semibold text-gray-900">Author</th>
                                <th className="px-3 py-3.5 text-left text-sm font-semibold text-gray-900">ISBN</th>
                                <th className="px-3 py-3.5 text-left text-sm font-semibold text-gray-900">Category</th>
                                <th className="px-3 py-3.5 text-left text-sm font-semibold text-gray-900">Qty</th>
                                <th className="relative py-3.5 pl-3 pr-4 sm:pr-6"><span className="sr-only">Actions</span></th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-200 bg-white">
                            {books.map((book) => (
                                <tr key={book.id} className="hover:bg-gray-50 transition-colors">
                                    <td className="whitespace-nowrap py-4 pl-4 pr-3 text-sm font-medium text-gray-900 sm:pl-6">{book.name}</td>
                                    <td className="whitespace-nowrap px-3 py-4 text-sm text-gray-500">{book.author}</td>
                                    <td className="whitespace-nowrap px-3 py-4 text-sm text-gray-500">{book.isbn}</td>
                                    <td className="whitespace-nowrap px-3 py-4 text-sm text-gray-500">
                                        <span className="inline-flex items-center rounded-md bg-blue-50 px-2 py-1 text-xs font-medium text-blue-700 ring-1 ring-inset ring-blue-700/10">
                                            {book.category}
                                        </span>
                                    </td>
                                    <td className="whitespace-nowrap px-3 py-4 text-sm text-gray-500">
                                        <span className={`inline-flex items-center rounded-full px-2 py-1 text-xs font-medium ${book.quantity > 0 ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'}`}>
                                            {book.quantity} left
                                        </span>
                                    </td>
                                    <td className="relative whitespace-nowrap py-4 pl-3 pr-4 text-right text-sm font-medium sm:pr-6">
                                        <button onClick={() => handleDelete(book.id)} className="text-red-600 hover:text-red-900 p-2 rounded-full hover:bg-red-50 transition-colors">
                                            <Trash2 className="h-4 w-4" />
                                        </button>
                                    </td>
                                </tr>
                            ))}
                            {books.length === 0 && !loading && (
                                <tr>
                                    <td colSpan="6" className="py-8 text-center text-sm text-gray-500">No books found matching your criteria.</td>
                                </tr>
                            )}
                        </tbody>
                    </table>
                </div>
                <Pagination meta={meta} onPageChange={setPage} />
            </div>

            {/* Add Book Modal */}
            {showAddModal && (
                <div className="fixed inset-0 bg-gray-500 bg-opacity-75 flex items-center justify-center z-50">
                    <div className="bg-white rounded-lg p-8 max-w-md w-full m-4 shadow-xl">
                        <h3 className="text-lg font-medium leading-6 text-gray-900 mb-6 border-b pb-4">Add New Book</h3>
                        <form onSubmit={handleAddSubmit} className="space-y-4">
                            <div>
                                <label className="block text-sm font-medium text-gray-700">Name</label>
                                <input required type="text" className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm border py-2 px-3"
                                    value={newBook.name} onChange={e => setNewBook({ ...newBook, name: e.target.value })} />
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-gray-700">Author</label>
                                <input required type="text" className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm border py-2 px-3"
                                    value={newBook.author} onChange={e => setNewBook({ ...newBook, author: e.target.value })} />
                            </div>
                            <div className="grid grid-cols-2 gap-4">
                                <div>
                                    <label className="block text-sm font-medium text-gray-700">ISBN</label>
                                    <input required type="text" className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm border py-2 px-3"
                                        value={newBook.isbn} onChange={e => setNewBook({ ...newBook, isbn: e.target.value })} />
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-gray-700">Quantity</label>
                                    <input required min="1" type="number" className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm border py-2 px-3"
                                        value={newBook.quantity} onChange={e => setNewBook({ ...newBook, quantity: parseInt(e.target.value) })} />
                                </div>
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-gray-700">Category</label>
                                <input required type="text" className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm border py-2 px-3"
                                    value={newBook.category} onChange={e => setNewBook({ ...newBook, category: e.target.value })} />
                            </div>
                            <div className="mt-6 flex justify-end gap-3 pt-4 border-t">
                                <button type="button" onClick={() => setShowAddModal(false)} className="rounded-md border border-gray-300 bg-white py-2 px-4 text-sm font-medium text-gray-700 shadow-sm hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2 transition-colors">
                                    Cancel
                                </button>
                                <button type="submit" className="inline-flex justify-center rounded-md border border-transparent bg-indigo-600 py-2 px-4 text-sm font-medium text-white shadow-sm hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2 transition-colors">
                                    Save Book
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
        </div>
    );
}
