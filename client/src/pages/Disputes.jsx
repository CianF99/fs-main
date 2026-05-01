import { useState, useEffect } from 'react';
import { ShieldAlert, Check, X, FileText, Send } from 'lucide-react';
import api from '../services/api';

export default function Disputes() {
  const [disputes, setDisputes] = useState([]);
  const [violations, setViolations] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [newDispute, setNewDispute] = useState({ violationId: '', reason: '', proofImageUrl: '' });
  const [user, setUser] = useState(null);

  useEffect(() => {
    const userInfo = JSON.parse(localStorage.getItem('userInfo'));
    setUser(userInfo);
    fetchData(userInfo);
  }, []);

  const fetchData = async (userInfo) => {
    try {
      setLoading(true);
      const [disputesRes, violationsRes] = await Promise.all([
        api.get('/disputes'),
        api.get('/violations')
      ]);
      setDisputes(disputesRes.data);
      // Filter out paid violations for disputing
      setViolations(violationsRes.data.filter(v => v.status !== 'Paid'));
    } catch (error) {
      console.error('Error fetching data:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleRaiseDispute = async (e) => {
    e.preventDefault();
    try {
      await api.post('/disputes', newDispute);
      setShowForm(false);
      setNewDispute({ violationId: '', reason: '', proofImageUrl: '' });
      fetchData(user);
    } catch (error) {
      alert(error.response?.data?.message || 'Error raising dispute');
    }
  };

  const handleUpdateStatus = async (id, status) => {
    try {
      await api.put(`/disputes/${id}`, { status, adminComments: 'Reviewed by admin' });
      fetchData(user);
    } catch (error) {
      alert('Error updating dispute');
    }
  };

  if (loading) {
    return <div className="text-center py-10">Loading disputes...</div>;
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Dispute System</h1>
          <p className="text-slate-500 dark:text-gray-400 mt-1">Manage and resolve traffic violation disputes.</p>
        </div>
        {user?.role === 'User' && (
          <button
            onClick={() => setShowForm(!showForm)}
            className="flex items-center space-x-2 bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-xl transition-colors"
          >
            <ShieldAlert className="w-5 h-5" />
            <span>Raise Dispute</span>
          </button>
        )}
      </div>

      {showForm && (
        <div className="bg-white dark:bg-gray-900 p-6 rounded-2xl shadow-sm border border-slate-200 dark:border-gray-800">
          <h2 className="text-lg font-semibold mb-4">File a New Dispute</h2>
          <form onSubmit={handleRaiseDispute} className="space-y-4 max-w-lg">
            <div>
              <label className="block text-sm font-medium mb-1">Select Violation</label>
              <select
                required
                value={newDispute.violationId}
                onChange={(e) => setNewDispute({ ...newDispute, violationId: e.target.value })}
                className="w-full bg-slate-50 dark:bg-gray-800 border border-slate-200 dark:border-gray-700 rounded-xl px-4 py-3"
              >
                <option value="">Select a violation to dispute</option>
                {violations.map(v => (
                  <option key={v._id} value={v._id}>
                    {v.violationType} - {v.vehicleNumber} ({v.location})
                  </option>
                ))}
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium mb-1">Reason</label>
              <textarea
                required
                rows={3}
                value={newDispute.reason}
                onChange={(e) => setNewDispute({ ...newDispute, reason: e.target.value })}
                className="w-full bg-slate-50 dark:bg-gray-800 border border-slate-200 dark:border-gray-700 rounded-xl px-4 py-3"
                placeholder="Explain why this violation is incorrect..."
              />
            </div>
            <div>
              <label className="block text-sm font-medium mb-1">Proof Image URL (Optional)</label>
              <input
                type="text"
                value={newDispute.proofImageUrl}
                onChange={(e) => setNewDispute({ ...newDispute, proofImageUrl: e.target.value })}
                className="w-full bg-slate-50 dark:bg-gray-800 border border-slate-200 dark:border-gray-700 rounded-xl px-4 py-3"
                placeholder="https://example.com/proof.jpg"
              />
            </div>
            <button
              type="submit"
              className="w-full flex justify-center items-center space-x-2 bg-blue-600 hover:bg-blue-700 text-white px-4 py-3 rounded-xl font-medium transition-colors"
            >
              <Send className="w-5 h-5" />
              <span>Submit Dispute</span>
            </button>
          </form>
        </div>
      )}

      <div className="grid gap-6">
        {disputes.length === 0 ? (
          <div className="bg-white dark:bg-gray-900 p-8 rounded-2xl shadow-sm border border-slate-200 dark:border-gray-800 text-center">
            <FileText className="w-12 h-12 text-slate-300 dark:text-gray-600 mx-auto mb-3" />
            <p className="text-slate-500 dark:text-gray-400">No disputes found.</p>
          </div>
        ) : (
          disputes.map((dispute) => (
            <div key={dispute._id} className="bg-white dark:bg-gray-900 p-6 rounded-2xl shadow-sm border border-slate-200 dark:border-gray-800">
              <div className="flex flex-col md:flex-row justify-between gap-4">
                <div className="space-y-3 flex-1">
                  <div className="flex items-center space-x-3">
                    <span className={`px-3 py-1 rounded-full text-sm font-medium ${
                      dispute.status === 'Accepted' ? 'bg-green-100 text-green-700 dark:bg-green-500/10 dark:text-green-400' :
                      dispute.status === 'Rejected' ? 'bg-red-100 text-red-700 dark:bg-red-500/10 dark:text-red-400' :
                      'bg-yellow-100 text-yellow-700 dark:bg-yellow-500/10 dark:text-yellow-400'
                    }`}>
                      {dispute.status}
                    </span>
                    <span className="text-sm text-slate-500 dark:text-gray-400">
                      Disputed by {dispute.userId?.name || 'Unknown'}
                    </span>
                  </div>
                  
                  <div className="bg-slate-50 dark:bg-gray-800/50 p-4 rounded-xl border border-slate-100 dark:border-gray-800">
                    <h3 className="font-medium text-sm text-slate-500 dark:text-gray-400 mb-1">Violation Details</h3>
                    <p className="font-semibold">{dispute.violationId?.violationType} - {dispute.violationId?.vehicleNumber}</p>
                    <p className="text-sm">Location: {dispute.violationId?.location}</p>
                  </div>

                  <div>
                    <h3 className="font-medium text-sm text-slate-500 dark:text-gray-400 mb-1">Reason</h3>
                    <p>{dispute.reason}</p>
                  </div>
                  
                  {dispute.proofImageUrl && (
                    <div>
                      <a href={dispute.proofImageUrl} target="_blank" rel="noreferrer" className="text-blue-600 hover:underline text-sm font-medium">
                        View Uploaded Proof
                      </a>
                    </div>
                  )}
                </div>

                {(user?.role === 'Admin' || user?.role === 'Police') && dispute.status === 'Pending' && (
                  <div className="flex flex-col space-y-2 min-w-[140px]">
                    <button
                      onClick={() => handleUpdateStatus(dispute._id, 'Accepted')}
                      className="flex items-center justify-center space-x-2 bg-green-50 hover:bg-green-100 text-green-700 dark:bg-green-500/10 dark:hover:bg-green-500/20 dark:text-green-400 px-4 py-2 rounded-xl transition-colors font-medium"
                    >
                      <Check className="w-4 h-4" />
                      <span>Accept</span>
                    </button>
                    <button
                      onClick={() => handleUpdateStatus(dispute._id, 'Rejected')}
                      className="flex items-center justify-center space-x-2 bg-red-50 hover:bg-red-100 text-red-700 dark:bg-red-500/10 dark:hover:bg-red-500/20 dark:text-red-400 px-4 py-2 rounded-xl transition-colors font-medium"
                    >
                      <X className="w-4 h-4" />
                      <span>Reject</span>
                    </button>
                  </div>
                )}
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
}
