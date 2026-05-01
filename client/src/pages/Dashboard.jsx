import { useOutletContext, Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { AlertTriangle, CheckCircle, Clock, FileText, UploadCloud, IndianRupee, Image as ImageIcon } from 'lucide-react';
import { useState, useEffect, useRef } from 'react';
import api from '../services/api';

const ACCEPTED_IMAGE_TYPES = ['image/jpeg', 'image/png', 'image/webp'];
const ACCEPTED_IMAGE_EXTENSIONS = ['.jpg', '.jpeg', '.png', '.webp'];
const MAX_IMAGE_SIZE_BYTES = 5 * 1024 * 1024;

export default function Dashboard() {
  const { user } = useOutletContext();
  const [stats, setStats] = useState({ total: 0, paid: 0, pending: 0 });
  const [userProfile, setUserProfile] = useState(null);
  const [recentViolations, setRecentViolations] = useState([]);
  const [loading, setLoading] = useState(true);
  
  // Upload State
  const [file, setFile] = useState(null);
  const [uploading, setUploading] = useState(false);
  const [uploadedImageUrl, setUploadedImageUrl] = useState('');
  const [uploadError, setUploadError] = useState('');
  const [dragActive, setDragActive] = useState(false);
  const fileInputRef = useRef(null);

  useEffect(() => {
    fetchDashboardData();
  }, [user]);

  const fetchDashboardData = async () => {
    try {
      const [violationsRes, profileRes] = await Promise.all([
        api.get('/violations'),
        api.get('/users/profile')
      ]);
      const data = violationsRes.data;
      setStats({
        total: data.length,
        paid: data.filter(v => v.status === 'Paid').length,
        pending: data.filter(v => v.status === 'Pending').length
      });
      setRecentViolations(data.slice(0, 5));
      setUserProfile(profileRes.data);
    } catch (error) {
      console.error('Failed to fetch dashboard data', error);
    } finally {
      setLoading(false);
    }
  };

  // Drag and drop handlers
  const handleDrag = (e) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === "dragenter" || e.type === "dragover") {
      setDragActive(true);
    } else if (e.type === "dragleave") {
      setDragActive(false);
    }
  };

  const handleDrop = (e) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      handleFileChange(e.dataTransfer.files[0]);
    }
  };

  const handleFileChange = (selectedFile) => {
    setUploadError('');
    setUploadedImageUrl('');
    if (!selectedFile) return;

    const fileName = selectedFile.name.toLowerCase();
    const isAcceptedType = ACCEPTED_IMAGE_TYPES.includes(selectedFile.type);
    const hasAcceptedExtension = ACCEPTED_IMAGE_EXTENSIONS.some((extension) => fileName.endsWith(extension));

    if (!isAcceptedType && !hasAcceptedExtension) {
      setUploadError('Please select a JPG, PNG, or WEBP image');
      return;
    }

    if (selectedFile.size > MAX_IMAGE_SIZE_BYTES) {
      setUploadError('Image must be 5MB or smaller');
      return;
    }

    setFile(selectedFile);
  };

  const uploadImage = async () => {
    if (!file) return;
    
    setUploading(true);
    setUploadError('');
    
    const formData = new FormData();
    formData.append('image', file);

    try {
      // Send multipart/form-data request
      const { data } = await api.post('/upload', formData, {
        headers: { 'Content-Type': 'multipart/form-data' }
      });
      
      // data should be the URL path returned by backend
      setUploadedImageUrl(data);
      setFile(null); // Clear file after successful upload
    } catch (err) {
      setUploadError(err.response?.data?.message || 'Failed to upload image');
    } finally {
      setUploading(false);
    }
  };

  const cards = [
    { title: 'Total Violations', value: stats.total, icon: FileText, color: 'text-blue-500', bg: 'bg-blue-500/10' },
    { title: 'Pending Fines', value: stats.pending, icon: Clock, color: 'text-orange-500', bg: 'bg-orange-500/10' },
    { title: 'Resolved Cases', value: stats.paid, icon: CheckCircle, color: 'text-green-500', bg: 'bg-green-500/10' },
    { title: 'Critical Alerts', value: '0', icon: AlertTriangle, color: 'text-red-500', bg: 'bg-red-500/10' },
  ];

  return (
    <div className="space-y-6 pb-10">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold tracking-tight text-slate-900 dark:text-white">Welcome back, {user?.name}</h1>
          <p className="mt-1 text-slate-500 dark:text-gray-400">Here is your traffic system overview.</p>
        </div>
        
        {/* Reward / Penalty Gamification Badge */}
        {userProfile && (
          <div className="flex items-center space-x-3 bg-white dark:bg-gray-900 p-3 rounded-2xl border border-slate-200 dark:border-gray-800 shadow-sm">
            <div className="flex flex-col">
              <span className="text-xs text-slate-500 font-medium uppercase tracking-wider">Driver Score</span>
              <div className="flex items-center space-x-2">
                <span className={`text-2xl font-bold ${userProfile.driverScore <= 50 ? 'text-red-500' : 'text-green-500'}`}>
                  {userProfile.driverScore}
                </span>
                <span className="text-sm text-slate-400">/ 100</span>
              </div>
            </div>
            {userProfile.isFlagged && (
              <div className="bg-red-100 text-red-700 dark:bg-red-500/20 dark:text-red-400 px-3 py-1 rounded-lg text-xs font-bold flex items-center space-x-1">
                <AlertTriangle className="w-3 h-3" />
                <span>FLAGGED: 1.5x Fines</span>
              </div>
            )}
          </div>
        )}
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {cards.map((card, index) => (
          <motion.div
            key={card.title}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: index * 0.1 }}
            className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm transition-colors hover:border-slate-300 dark:border-gray-800 dark:bg-gray-900 dark:hover:border-gray-700"
          >
            <div className="flex justify-between items-start">
              <div>
                <p className="mb-1 text-sm font-medium text-slate-500 dark:text-gray-400">{card.title}</p>
                <h3 className="text-3xl font-bold text-slate-900 dark:text-white">{card.value}</h3>
              </div>
              <div className={`p-3 rounded-xl ${card.bg}`}>
                <card.icon className={`w-6 h-6 ${card.color}`} />
              </div>
            </div>
          </motion.div>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Recent Violations Table */}
        <div className="lg:col-span-2 flex min-h-[400px] flex-col rounded-2xl border border-slate-200 bg-white p-6 shadow-sm dark:border-gray-800 dark:bg-gray-900">
          <div className="flex justify-between items-center mb-6">
            <h3 className="text-xl font-bold text-slate-900 dark:text-white">Recent Violations</h3>
            <Link to="/violations" className="text-blue-500 hover:text-blue-400 text-sm font-medium transition-colors">
              View All
            </Link>
          </div>

          <div className="flex-1 overflow-x-auto">
            {loading ? (
              <div className="flex justify-center items-center h-48">
                <div className="w-8 h-8 border-4 border-blue-500 border-t-transparent rounded-full animate-spin"></div>
              </div>
            ) : recentViolations.length === 0 ? (
              <div className="flex h-48 flex-col items-center justify-center text-slate-400 dark:text-gray-500">
                <Clock className="w-12 h-12 mb-3 opacity-20" />
                <p>No recent violations found</p>
              </div>
            ) : (
              <table className="w-full text-left text-sm text-slate-500 dark:text-gray-400">
                <thead className="bg-slate-100 text-xs uppercase text-slate-500 dark:bg-gray-800/50 dark:text-gray-500">
                  <tr>
                    <th className="px-4 py-3 font-medium rounded-l-lg">Vehicle / Date</th>
                    <th className="px-4 py-3 font-medium">Type</th>
                    <th className="px-4 py-3 font-medium">Status</th>
                    <th className="px-4 py-3 font-medium rounded-r-lg text-center">Proof</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-200 dark:divide-gray-800/50">
                  {recentViolations.map((violation) => (
                    <tr key={violation._id} className="transition-colors hover:bg-slate-50 dark:hover:bg-gray-800/30">
                      <td className="px-4 py-4">
                        <div className="font-bold text-slate-900 dark:text-white">{violation.vehicleNumber}</div>
                        <div className="mt-1 text-xs text-slate-500 dark:text-gray-500">{new Date(violation.createdAt).toLocaleDateString()}</div>
                      </td>
                      <td className="px-4 py-4">
                        <span className="inline-flex items-center rounded-full border border-slate-200 bg-slate-100 px-2.5 py-0.5 text-xs font-medium text-slate-700 dark:border-gray-700 dark:bg-gray-800 dark:text-gray-300">
                          {violation.violationType}
                        </span>
                      </td>
                      <td className="px-4 py-4">
                        <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium border ${
                          violation.status === 'Paid' 
                            ? 'bg-green-500/10 text-green-400 border-green-500/20' 
                            : 'bg-orange-500/10 text-orange-400 border-orange-500/20'
                        }`}>
                          {violation.status}
                        </span>
                      </td>
                      <td className="px-4 py-4 text-center">
                        {violation.imageUrl ? (
                          <a href={violation.imageUrl} target="_blank" rel="noopener noreferrer" className="inline-flex p-2 bg-blue-500/10 text-blue-400 rounded-lg hover:bg-blue-500/20 transition-colors">
                            <ImageIcon className="w-4 h-4" />
                          </a>
                        ) : (
                          <span className="text-slate-300 dark:text-gray-600">-</span>
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            )}
          </div>
        </div>

        {/* Quick Image Upload Tool */}
        <div className="flex flex-col rounded-2xl border border-slate-200 bg-white p-6 shadow-sm dark:border-gray-800 dark:bg-gray-900">
          <h3 className="mb-6 text-xl font-bold text-slate-900 dark:text-white">Quick Upload Proof</h3>
          
          <div 
            className={`flex flex-1 flex-col items-center justify-center rounded-xl border-2 border-dashed p-6 text-center transition-all ${
              dragActive 
                ? 'border-blue-500 bg-blue-500/10' 
                : 'border-slate-300 bg-slate-50/80 hover:border-slate-400 dark:border-gray-700 dark:bg-gray-800/30 dark:hover:border-gray-600'
            }`}
            onDragEnter={handleDrag}
            onDragLeave={handleDrag}
            onDragOver={handleDrag}
            onDrop={handleDrop}
          >
            <input 
              type="file" 
              ref={fileInputRef} 
              className="hidden" 
              accept=".jpg,.jpeg,.png,.webp,image/jpeg,image/png,image/webp"
              onChange={(e) => handleFileChange(e.target.files[0])}
            />
            
            <div className="bg-blue-500/20 p-4 rounded-full mb-4">
              <UploadCloud className="w-8 h-8 text-blue-400" />
            </div>
            <h4 className="mb-1 font-medium text-slate-900 dark:text-white">Drag & drop image</h4>
            <p className="mb-4 text-xs text-slate-500 dark:text-gray-500">Supports JPG, PNG, WEBP (Max 5MB)</p>
            
            <button 
              onClick={() => fileInputRef.current?.click()}
              className="rounded-lg border border-slate-200 bg-white px-4 py-2 text-sm font-medium text-slate-700 transition-colors hover:bg-slate-100 dark:border-gray-700 dark:bg-gray-800 dark:text-white dark:hover:bg-gray-700"
            >
              Browse Files
            </button>
          </div>

          {/* Selected File / Upload Status */}
          <div className="mt-4 min-h-[80px]">
            {file && (
              <div className="flex items-center justify-between rounded-lg border border-slate-200 bg-slate-100/80 p-3 dark:border-gray-700 dark:bg-gray-800/50">
                <span className="max-w-[180px] truncate text-sm text-slate-700 dark:text-gray-300">{file.name}</span>
                <button 
                  onClick={uploadImage}
                  disabled={uploading}
                  className="bg-blue-600 hover:bg-blue-700 text-white px-3 py-1.5 rounded-md text-xs font-medium transition-colors disabled:opacity-50 flex items-center"
                >
                  {uploading ? (
                    <div className="w-3 h-3 border-2 border-white border-t-transparent rounded-full animate-spin mr-1"></div>
                  ) : null}
                  Upload
                </button>
              </div>
            )}

            {uploadError && (
              <p className="text-red-400 text-xs mt-2 text-center">{uploadError}</p>
            )}

            {uploadedImageUrl && (
              <motion.div 
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                className="mt-4"
              >
                <div className="bg-green-500/10 border border-green-500/20 rounded-lg p-3 flex items-start mb-3">
                  <CheckCircle className="w-4 h-4 text-green-500 mr-2 mt-0.5 shrink-0" />
                  <div>
                    <p className="text-xs text-green-400 font-medium">Upload Successful!</p>
                    <p className="text-[10px] text-green-500/70 truncate break-all">URL copied, you can use it in Add Violation form.</p>
                  </div>
                </div>
                <div className="relative aspect-video overflow-hidden rounded-lg border border-slate-200 bg-white dark:border-gray-700 dark:bg-black/50">
                  {/* The backend serves the image at this path directly */}
                  <img 
                    src={uploadedImageUrl}
                    alt="Uploaded preview" 
                    className="object-contain w-full h-full"
                  />
                </div>
              </motion.div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
