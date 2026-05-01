import { useState, useEffect } from 'react';
import { useOutletContext, Link } from 'react-router-dom';
import api from '../services/api';
import { Search, Filter, Plus, FileText, IndianRupee, DownloadCloud } from 'lucide-react';
import { motion } from 'framer-motion';

export default function Violations() {
  const { user } = useOutletContext();
  const [violations, setViolations] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');

  useEffect(() => {
    fetchViolations();
  }, []);

  const fetchViolations = async () => {
    try {
      const { data } = await api.get('/violations');
      setViolations(data);
    } catch (error) {
      console.error('Failed to fetch violations', error);
    } finally {
      setLoading(false);
    }
  };

  const filteredViolations = violations.filter(v => 
    v.vehicleNumber.toLowerCase().includes(searchTerm.toLowerCase()) ||
    v.violationType.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const exportToCSV = () => {
    if (violations.length === 0) return;
    
    // Define headers
    const headers = ['Vehicle Number', 'Owner Name', 'Wheeler Type', 'Violation Type', 'Location', 'Fine Amount', 'Status', 'Date'];
    
    // Map data to rows
    const csvRows = violations.map(v => [
      v.vehicleNumber,
      `"${v.ownerName}"`, // Handle names with commas
      v.wheelerType || '4-Wheeler',
      v.violationType,
      `"${v.location}"`,
      v.fineAmount,
      v.status,
      new Date(v.createdAt).toLocaleDateString()
    ].join(','));
    
    // Combine headers and rows
    const csvContent = [headers.join(','), ...csvRows].join('\n');
    
    // Create blob and download link
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.setAttribute('href', url);
    link.setAttribute('download', `violations_export_${new Date().toISOString().split('T')[0]}.csv`);
    link.style.visibility = 'hidden';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-3xl font-bold tracking-tight text-slate-900 dark:text-white">Violations</h1>
          <p className="mt-1 text-slate-500 dark:text-gray-400">Manage and track traffic violations</p>
        </div>
        
        {(user?.role === 'Admin' || user?.role === 'Police') && (
          <Link
            to="/add-violation"
            className="flex items-center space-x-2 bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-xl transition-colors font-medium shadow-lg shadow-blue-500/20"
          >
            <Plus className="w-5 h-5" />
            <span>Add Violation</span>
          </Link>
        )}
      </div>

      <div className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm dark:border-gray-800 dark:bg-gray-900">
        <div className="flex flex-col items-center justify-between gap-4 border-b border-slate-200 bg-slate-50/70 p-4 dark:border-gray-800 dark:bg-gray-900/50 sm:flex-row">
          <div className="relative w-full sm:w-96">
            <Search className="absolute left-3 top-1/2 h-5 w-5 -translate-y-1/2 text-slate-400 dark:text-gray-500" />
            <input
              type="text"
              placeholder="Search by vehicle number or type..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full rounded-xl border border-slate-200 bg-white pl-10 pr-4 py-2 text-slate-900 placeholder-slate-400 transition-colors focus:border-blue-500 focus:outline-none dark:border-gray-700 dark:bg-gray-800 dark:text-white dark:placeholder-gray-500"
            />
          </div>
          <div className="flex gap-2 w-full sm:w-auto">
            <button 
              onClick={exportToCSV}
              className="flex items-center space-x-2 text-green-400 hover:text-green-300 px-4 py-2 rounded-xl border border-green-500/30 hover:bg-green-500/10 transition-colors flex-1 sm:flex-none justify-center"
            >
              <DownloadCloud className="w-4 h-4" />
              <span>Export CSV</span>
            </button>
            <button className="flex flex-1 items-center justify-center space-x-2 rounded-xl border border-slate-200 px-4 py-2 text-slate-600 transition-colors hover:bg-slate-100 hover:text-slate-900 dark:border-gray-800 dark:text-gray-400 dark:hover:bg-gray-800 dark:hover:text-white sm:flex-none">
              <Filter className="w-4 h-4" />
              <span>Filter</span>
            </button>
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm text-slate-500 dark:text-gray-400">
            <thead className="bg-slate-100 text-xs uppercase text-slate-500 dark:bg-gray-800/50 dark:text-gray-500">
              <tr>
                <th className="px-6 py-4 font-medium">Vehicle</th>
                <th className="px-6 py-4 font-medium">Wheeler Type</th>
                <th className="px-6 py-4 font-medium">Type</th>
                <th className="px-6 py-4 font-medium">Location</th>
                <th className="px-6 py-4 font-medium">Fine</th>
                <th className="px-6 py-4 font-medium">Status</th>
                <th className="px-6 py-4 font-medium">Date</th>
              </tr>
            </thead>
            <tbody>
              {loading ? (
                <tr>
                  <td colSpan="6" className="px-6 py-8 text-center text-slate-500 dark:text-gray-500">
                    <div className="flex justify-center mb-2">
                      <div className="w-6 h-6 border-2 border-blue-500 border-t-transparent rounded-full animate-spin"></div>
                    </div>
                    Loading violations...
                  </td>
                </tr>
              ) : filteredViolations.length === 0 ? (
                <tr>
                  <td colSpan="6" className="px-6 py-12 text-center text-slate-500 dark:text-gray-500">
                    <FileText className="w-12 h-12 mx-auto mb-3 opacity-20" />
                    No violations found
                  </td>
                </tr>
              ) : (
                filteredViolations.map((violation, index) => (
                  <motion.tr 
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: index * 0.05 }}
                    key={violation._id} 
                    className="border-b border-slate-200 transition-colors hover:bg-slate-50 dark:border-gray-800/50 dark:hover:bg-gray-800/50"
                  >
                    <td className="px-6 py-4 font-medium text-slate-900 dark:text-white">
                      <div className="flex flex-col">
                        <span>{violation.vehicleNumber}</span>
                        <span className="text-xs text-slate-500 dark:text-gray-500">{violation.ownerName}</span>
                      </div>
                    </td>
                    <td className="px-6 py-4 text-slate-600 dark:text-gray-300">
                      {violation.wheelerType || '4-Wheeler'}
                    </td>
                    <td className="px-6 py-4">
                      <span className="inline-flex items-center rounded-full border border-slate-200 bg-slate-100 px-2.5 py-0.5 text-xs font-medium text-slate-700 dark:border-gray-700 dark:bg-gray-800 dark:text-gray-300">
                        {violation.violationType}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-slate-600 dark:text-gray-300">{violation.location}</td>
                    <td className="flex items-center px-6 py-4 font-medium text-slate-900 dark:text-white">
                      <IndianRupee className="mr-1 h-3 w-3 text-slate-400 dark:text-gray-500" />
                      {violation.fineAmount}
                    </td>
                    <td className="px-6 py-4">
                      <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium border ${
                        violation.status === 'Paid' 
                          ? 'bg-green-500/10 text-green-400 border-green-500/20' 
                          : 'bg-orange-500/10 text-orange-400 border-orange-500/20'
                      }`}>
                        {violation.status}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-slate-500 dark:text-gray-500">
                      {new Date(violation.createdAt).toLocaleDateString()}
                    </td>
                  </motion.tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
