import React, { useState, useEffect } from 'react';
import api from '../../utils/api';
import { useToast } from '../../components/Toast';
import Pagination from '../../components/Pagination';
import { Search, Trash2, Users } from 'lucide-react';

export default function AdminStudents() {
    const [students, setStudents] = useState([]);
    const [meta, setMeta] = useState(null);
    const [loading, setLoading] = useState(true);
    const [search, setSearch] = useState('');
    const [page, setPage] = useState(1);
    const { showToast } = useToast();

    const fetchStudents = async () => {
        setLoading(true);
        try {
            const { data } = await api.get(`/students?page=${page}&search=${search}`);
            setStudents(data.data);
            setMeta(data.meta);
        } catch (err) {
            showToast('Failed to load students.', 'error');
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        const delayDebounce = setTimeout(() => {
            fetchStudents();
        }, 300);
        return () => clearTimeout(delayDebounce);
    }, [page, search]);

    const handleDelete = async (id) => {
        if (!window.confirm("Are you sure you want to delete this student account?")) return;
        try {
            await api.delete(`/students/${id}`);
            showToast('Student deleted.', 'success');
            fetchStudents();
        } catch (err) {
            showToast('Failed to delete student.', 'error');
        }
    };

    return (
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
            <div className="sm:flex sm:items-center sm:justify-between mb-8">
                <div>
                    <h1 className="text-2xl font-bold leading-7 text-gray-900 sm:truncate sm:text-3xl sm:tracking-tight flex items-center gap-2">
                        <Users className="h-8 w-8 text-indigo-600" />
                        Student Accounts
                    </h1>
                    <p className="mt-1 text-sm text-gray-500">Manage registered students in the system.</p>
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
                        placeholder="Search students by name, email, or roll no..."
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
                                <th className="py-3.5 pl-4 pr-3 text-left text-sm font-semibold text-gray-900 sm:pl-6">Name</th>
                                <th className="px-3 py-3.5 text-left text-sm font-semibold text-gray-900">Email</th>
                                <th className="px-3 py-3.5 text-left text-sm font-semibold text-gray-900">Branch</th>
                                <th className="px-3 py-3.5 text-left text-sm font-semibold text-gray-900">Classroom</th>
                                <th className="px-3 py-3.5 text-left text-sm font-semibold text-gray-900">Roll No</th>
                                <th className="relative py-3.5 pl-3 pr-4 sm:pr-6"><span className="sr-only">Actions</span></th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-200 bg-white">
                            {students.map((student) => (
                                <tr key={student.id} className="hover:bg-gray-50 transition-colors">
                                    <td className="whitespace-nowrap py-4 pl-4 pr-3 text-sm font-medium text-gray-900 sm:pl-6">{student.name}</td>
                                    <td className="whitespace-nowrap px-3 py-4 text-sm text-gray-500">{student.email}</td>
                                    <td className="whitespace-nowrap px-3 py-4 text-sm text-gray-500">{student.branch}</td>
                                    <td className="whitespace-nowrap px-3 py-4 text-sm text-gray-500">{student.classroom}</td>
                                    <td className="whitespace-nowrap px-3 py-4 text-sm text-gray-500">{student.roll_no}</td>
                                    <td className="relative whitespace-nowrap py-4 pl-3 pr-4 text-right text-sm font-medium sm:pr-6">
                                        <button onClick={() => handleDelete(student.id)} className="text-red-600 hover:text-red-900 p-2 rounded-full hover:bg-red-50 transition-colors">
                                            <Trash2 className="h-4 w-4" />
                                        </button>
                                    </td>
                                </tr>
                            ))}
                            {students.length === 0 && !loading && (
                                <tr>
                                    <td colSpan="6" className="py-8 text-center text-sm text-gray-500">No students found.</td>
                                </tr>
                            )}
                        </tbody>
                    </table>
                </div>
                <Pagination meta={meta} onPageChange={setPage} />
            </div>
        </div>
    );
}
