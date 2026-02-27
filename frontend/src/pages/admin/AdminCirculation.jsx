import React, { useState, useEffect } from 'react';
import api from '../../utils/api';
import { useToast } from '../../components/Toast';
import Pagination from '../../components/Pagination';
import { RefreshCcw, HandCoins, BookMarked, Search } from 'lucide-react';

export default function AdminCirculation() {
    const [issues, setIssues] = useState([]);
    const [meta, setMeta] = useState(null);
    const [loading, setLoading] = useState(true);
    const [statusFilter, setStatusFilter] = useState('active'); // active, returned, all
    const [page, setPage] = useState(1);
    const { showToast } = useToast();

    const [showIssueModal, setShowIssueModal] = useState(false);
    const [issueForm, setIssueForm] = useState({ student_id: '', isbns: [] });
    const [allStudents, setAllStudents] = useState([]);
    const [allBooks, setAllBooks] = useState([]);

    useEffect(() => {
        if (showIssueModal) {
            api.get('/students?limit=1000').then(res => setAllStudents(res.data.data)).catch(console.error);
            api.get('/books?limit=1000').then(res => setAllBooks(res.data.data.filter(b => b.quantity > 0))).catch(console.error);
        }
    }, [showIssueModal]);

    const fetchIssues = async () => {
        setLoading(true);
        try {
            const { data } = await api.get(`/circulation?page=${page}&status=${statusFilter}`);
            setIssues(data.data);
            setMeta(data.meta);
        } catch (err) {
            showToast('Failed to load circulation records.', 'error');
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchIssues();
    }, [page, statusFilter]);

    const handleIssueSubmit = async (e) => {
        e.preventDefault();
        if (!issueForm.student_id) {
            showToast('Please select a student', 'error');
            return;
        }
        if (issueForm.isbns.length === 0) {
            showToast('Please select at least one book', 'error');
            return;
        }

        try {
            const results = await Promise.allSettled(
                issueForm.isbns.map(isbn => api.post('/circulation/issue', { student_id: issueForm.student_id, isbn }))
            );

            const succeeded = results.filter(r => r.status === 'fulfilled').length;
            const failed = results.filter(r => r.status === 'rejected').length;

            if (succeeded > 0) {
                showToast(`Successfully issued ${succeeded} book(s)`, 'success');
            }
            if (failed > 0) {
                showToast(`Failed to issue ${failed} book(s)`, 'error');
            }

            setShowIssueModal(false);
            setIssueForm({ student_id: '', isbns: [] });
            fetchIssues();
        } catch (err) {
            showToast('Error issuing books', 'error');
        }
    };

    const handleReturnAction = async (issueId) => {
        if (!window.confirm("Confirm return of this book?")) return;
        try {
            const { data } = await api.post(`/circulation/return/${issueId}`);
            showToast(`Book returned. Fine incurred: $${data.details.fine_incurred}`, 'success');
            fetchIssues();
        } catch (err) {
            showToast('Failed to return book.', 'error');
        }
    };

    const handlePayFine = async (issueId) => {
        if (!window.confirm("Mark fine as paid?")) return;
        try {
            await api.post(`/circulation/pay-fine/${issueId}`);
            showToast('Fine marked as paid.', 'success');
            fetchIssues();
        } catch (err) {
            showToast('Failed to update fine status.', 'error');
        }
    };

    return (
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
            <div className="sm:flex sm:items-center sm:justify-between mb-8">
                <div>
                    <h1 className="text-2xl font-bold leading-7 text-gray-900 sm:truncate sm:text-3xl sm:tracking-tight flex items-center gap-2">
                        <BookMarked className="h-8 w-8 text-indigo-600" />
                        Circulation Management
                    </h1>
                    <p className="mt-1 text-sm text-gray-500">Issue books, process returns, and manage fines.</p>
                </div>
                <div className="mt-4 sm:ml-16 sm:mt-0 sm:flex-none">
                    <button
                        onClick={() => setShowIssueModal(true)}
                        className="inline-flex items-center gap-2 rounded-md bg-indigo-600 px-3 py-2 text-sm font-semibold text-white shadow-sm hover:bg-indigo-500 transition-colors"
                    >
                        Issue Book
                    </button>
                </div>
            </div>

            <div className="mb-6 flex justify-between items-center">
                <div className="flex bg-gray-100 p-1 rounded-lg">
                    {['active', 'returned', 'all'].map((status) => (
                        <button
                            key={status}
                            onClick={() => { setStatusFilter(status); setPage(1); }}
                            className={`px-4 py-2 text-sm font-medium rounded-md capitalize transition-colors ${statusFilter === status ? 'bg-white shadow-sm text-indigo-700' : 'text-gray-500 hover:text-gray-700'
                                }`}
                        >
                            {status}
                        </button>
                    ))}
                </div>
            </div>

            <div className="bg-white shadow-sm ring-1 ring-gray-300 sm:rounded-lg overflow-hidden">
                <div className="overflow-x-auto">
                    <table className="min-w-full divide-y divide-gray-300">
                        <thead className="bg-gray-50">
                            <tr>
                                <th className="py-3.5 pl-4 pr-3 text-left text-sm font-semibold text-gray-900 sm:pl-6">Book</th>
                                <th className="px-3 py-3.5 text-left text-sm font-semibold text-gray-900">Student</th>
                                <th className="px-3 py-3.5 text-left text-sm font-semibold text-gray-900">Dates</th>
                                <th className="px-3 py-3.5 text-left text-sm font-semibold text-gray-900">Fine Status</th>
                                <th className="relative py-3.5 pl-3 pr-4 sm:pr-6"><span className="sr-only">Actions</span></th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-200 bg-white">
                            {issues.map((issue) => (
                                <tr key={issue.issue_id} className="hover:bg-gray-50 transition-colors">
                                    <td className="whitespace-nowrap py-4 pl-4 pr-3 text-sm font-medium text-gray-900 sm:pl-6">
                                        {issue.book_name} <br /><span className="text-gray-500 text-xs font-normal">ISBN: {issue.isbn}</span>
                                    </td>
                                    <td className="whitespace-nowrap px-3 py-4 text-sm text-gray-700">
                                        {issue.student_name} <br /><span className="text-gray-500 text-xs text-normal">ID: {issue.user_id}</span>
                                    </td>
                                    <td className="whitespace-nowrap px-3 py-4 text-sm text-gray-500">
                                        <div>Issued: {issue.issue_date}</div>
                                        <div className={new Date(issue.due_date) < new Date() && issue.status === 'active' ? 'text-red-600 font-medium' : ''}>
                                            Due: {issue.due_date}
                                        </div>
                                    </td>
                                    <td className="whitespace-nowrap px-3 py-4 text-sm">
                                        {issue.current_fine > 0 ? (
                                            <span className={`inline-flex items-center rounded-md px-2 py-1 text-xs font-medium ${issue.fine_paid ? 'bg-green-50 text-green-700' : 'bg-red-50 text-red-700'}`}>
                                                ${issue.current_fine.toFixed(2)} {issue.fine_paid ? '(Paid)' : '(Unpaid)'}
                                            </span>
                                        ) : (
                                            <span className="text-gray-500 text-xs">No Fine</span>
                                        )}
                                    </td>
                                    <td className="relative whitespace-nowrap py-4 pl-3 pr-4 text-right text-sm font-medium sm:pr-6">
                                        <div className="flex justify-end gap-2">
                                            {issue.status === 'active' && (
                                                <button onClick={() => handleReturnAction(issue.issue_id)} className="text-indigo-600 hover:text-indigo-900 p-2 rounded-full hover:bg-indigo-50" title="Process Return">
                                                    <RefreshCcw className="h-4 w-4" />
                                                </button>
                                            )}
                                            {issue.current_fine > 0 && !issue.fine_paid && (
                                                <button onClick={() => handlePayFine(issue.issue_id)} className="text-green-600 hover:text-green-900 p-2 rounded-full hover:bg-green-50" title="Mark Fine Paid">
                                                    <HandCoins className="h-4 w-4" />
                                                </button>
                                            )}
                                        </div>
                                    </td>
                                </tr>
                            ))}
                            {issues.length === 0 && !loading && (
                                <tr>
                                    <td colSpan="5" className="py-8 text-center text-sm text-gray-500">No circulation records found.</td>
                                </tr>
                            )}
                        </tbody>
                    </table>
                </div>
                <Pagination meta={meta} onPageChange={setPage} />
            </div>

            {/* Add Issue Modal */}
            {showIssueModal && (
                <div className="fixed inset-0 bg-gray-500 bg-opacity-75 flex items-center justify-center z-50">
                    <div className="bg-white rounded-lg p-8 max-w-md w-full m-4 shadow-xl">
                        <h3 className="text-lg font-medium leading-6 text-gray-900 mb-6 border-b pb-4">Issue a Book</h3>
                        <form onSubmit={handleIssueSubmit} className="space-y-4">
                            <div>
                                <label className="block text-sm font-medium text-gray-700">Select Student</label>
                                <select required className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm border py-2 px-3 bg-white"
                                    value={issueForm.student_id} onChange={e => setIssueForm({ ...issueForm, student_id: parseInt(e.target.value) })}>
                                    <option value="" disabled>-- Choose a Student --</option>
                                    {allStudents.map(student => (
                                        <option key={student.id} value={student.id}>{student.name} ({student.roll_no})</option>
                                    ))}
                                </select>
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-2">Select Books</label>
                                <div className="mt-1 max-h-48 overflow-y-auto border border-gray-300 rounded-md p-2 space-y-2 bg-gray-50">
                                    {allBooks.length === 0 ? (
                                        <p className="text-sm text-gray-500 p-2">No books currently available.</p>
                                    ) : (
                                        allBooks.map(book => (
                                            <div key={book.isbn} className="flex items-center">
                                                <input
                                                    type="checkbox"
                                                    id={`book-${book.isbn}`}
                                                    className="h-4 w-4 rounded border-gray-300 text-indigo-600 focus:ring-indigo-600 cursor-pointer"
                                                    checked={issueForm.isbns.includes(book.isbn)}
                                                    onChange={(e) => {
                                                        const newIsbns = e.target.checked
                                                            ? [...issueForm.isbns, book.isbn]
                                                            : issueForm.isbns.filter(i => i !== book.isbn);
                                                        setIssueForm({ ...issueForm, isbns: newIsbns });
                                                    }}
                                                />
                                                <label htmlFor={`book-${book.isbn}`} className="ml-3 block text-sm font-medium text-gray-700 cursor-pointer">
                                                    {book.name} <span className="text-gray-500 font-normal">({book.author}) - {book.quantity} left</span>
                                                </label>
                                            </div>
                                        ))
                                    )}
                                </div>
                            </div>
                            <div className="mt-6 flex justify-end gap-3 pt-4 border-t">
                                <button type="button" onClick={() => setShowIssueModal(false)} className="rounded-md border border-gray-300 bg-white py-2 px-4 text-sm font-medium text-gray-700 shadow-sm hover:bg-gray-50 transition-colors">
                                    Cancel
                                </button>
                                <button type="submit" className="inline-flex justify-center rounded-md border border-transparent bg-indigo-600 py-2 px-4 text-sm font-medium text-white shadow-sm hover:bg-indigo-700 transition-colors">
                                    Issue Book
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
        </div>
    );
}
