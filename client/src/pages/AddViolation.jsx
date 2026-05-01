import { useState, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../services/api';
import { Camera, CarFront, MapPin, User, AlertTriangle, UploadCloud, CheckCircle, IndianRupee } from 'lucide-react';
import { motion } from 'framer-motion';

const ACCEPTED_IMAGE_TYPES = ['image/jpeg', 'image/png', 'image/webp'];
const ACCEPTED_IMAGE_EXTENSIONS = ['.jpg', '.jpeg', '.png', '.webp'];
const MAX_IMAGE_SIZE_BYTES = 5 * 1024 * 1024;

export default function AddViolation() {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [formData, setFormData] = useState({
    vehicleNumber: '',
    ownerName: '',
    violationType: 'No Helmet',
    wheelerType: '4-Wheeler',
    location: '',
    imageUrl: '',
  });

  const [file, setFile] = useState(null);
  const [uploading, setUploading] = useState(false);
  const [uploadError, setUploadError] = useState('');
  const [dragActive, setDragActive] = useState(false);
  const fileInputRef = useRef(null);

  const violationTypes = [
    { type: 'No Helmet', fine: 500 },
    { type: 'Signal Jump', fine: 1000 },
    { type: 'Overspeed', fine: 1500 },
    { type: 'Parking', fine: 700 },
  ];

  const currentFine = violationTypes.find((violation) => violation.type === formData.violationType)?.fine || 0;

  const handleDrag = (event) => {
    event.preventDefault();
    event.stopPropagation();

    if (event.type === 'dragenter' || event.type === 'dragover') {
      setDragActive(true);
    } else if (event.type === 'dragleave') {
      setDragActive(false);
    }
  };

  const handleDrop = (event) => {
    event.preventDefault();
    event.stopPropagation();
    setDragActive(false);

    if (event.dataTransfer.files && event.dataTransfer.files[0]) {
      handleFileChange(event.dataTransfer.files[0]);
    }
  };

  const handleFileChange = (selectedFile) => {
    setUploadError('');
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

    const uploadData = new FormData();
    uploadData.append('image', file);

    try {
      const { data } = await api.post('/upload', uploadData, {
        headers: { 'Content-Type': 'multipart/form-data' },
      });

      setFormData((currentFormData) => ({
        ...currentFormData,
        imageUrl: data,
      }));
      setFile(null);
    } catch (err) {
      setUploadError(err.response?.data?.message || 'Failed to upload image');
    } finally {
      setUploading(false);
    }
  };

  const handleSubmit = async (event) => {
    event.preventDefault();
    setLoading(true);
    setError('');

    try {
      await api.post('/violations', formData);
      navigate('/violations');
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to add violation');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="mx-auto max-w-3xl space-y-6 pb-10">
      <div>
        <h1 className="text-3xl font-bold tracking-tight text-slate-900 dark:text-white">Record Violation</h1>
        <p className="mt-1 text-slate-500 dark:text-gray-400">Enter details of the new traffic violation</p>
      </div>

      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm dark:border-gray-800 dark:bg-gray-900 md:p-8"
      >
        {error ? (
          <div className="mb-6 flex items-center rounded-xl border border-red-500/20 bg-red-500/10 p-4 text-sm text-red-600 dark:text-red-400">
            <AlertTriangle className="mr-2 h-5 w-5" />
            {error}
          </div>
        ) : null}

        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
            <div className="space-y-2">
              <label className="flex items-center text-sm font-medium text-slate-700 dark:text-gray-300">
                <CarFront className="mr-2 h-4 w-4 text-blue-500" />
                Vehicle Number
              </label>
              <input
                type="text"
                required
                placeholder="e.g. MH 01 AB 1234"
                className="w-full rounded-xl border border-slate-200 bg-white px-4 py-3 uppercase text-slate-900 placeholder-slate-400 transition-colors focus:border-blue-500 focus:outline-none dark:border-gray-700 dark:bg-gray-800 dark:text-white dark:placeholder-gray-500"
                value={formData.vehicleNumber}
                onChange={(event) => setFormData({ ...formData, vehicleNumber: event.target.value })}
              />
            </div>

            <div className="space-y-2">
              <label className="flex items-center text-sm font-medium text-slate-700 dark:text-gray-300">
                <User className="mr-2 h-4 w-4 text-blue-500" />
                Owner Name
              </label>
              <input
                type="text"
                required
                placeholder="Enter owner name"
                className="w-full rounded-xl border border-slate-200 bg-white px-4 py-3 text-slate-900 placeholder-slate-400 transition-colors focus:border-blue-500 focus:outline-none dark:border-gray-700 dark:bg-gray-800 dark:text-white dark:placeholder-gray-500"
                value={formData.ownerName}
                onChange={(event) => setFormData({ ...formData, ownerName: event.target.value })}
              />
            </div>

            <div className="space-y-2">
              <label className="flex items-center text-sm font-medium text-slate-700 dark:text-gray-300">
                <AlertTriangle className="mr-2 h-4 w-4 text-blue-500" />
                Violation Type
              </label>
              <select
                className="w-full appearance-none rounded-xl border border-slate-200 bg-white px-4 py-3 text-slate-900 transition-colors focus:border-blue-500 focus:outline-none dark:border-gray-700 dark:bg-gray-800 dark:text-white"
                value={formData.violationType}
                onChange={(event) => setFormData({ ...formData, violationType: event.target.value })}
              >
                {violationTypes.map((violation) => (
                  <option key={violation.type} value={violation.type}>
                    {violation.type}
                  </option>
                ))}
              </select>
            </div>

            <div className="space-y-2">
              <label className="flex items-center text-sm font-medium text-slate-700 dark:text-gray-300">
                <CarFront className="mr-2 h-4 w-4 text-blue-500" />
                Type of Wheeler
              </label>
              <select
                className="w-full appearance-none rounded-xl border border-slate-200 bg-white px-4 py-3 text-slate-900 transition-colors focus:border-blue-500 focus:outline-none dark:border-gray-700 dark:bg-gray-800 dark:text-white"
                value={formData.wheelerType}
                onChange={(event) => setFormData({ ...formData, wheelerType: event.target.value })}
              >
                <option value="2-Wheeler">2-Wheeler</option>
                <option value="3-Wheeler">3-Wheeler</option>
                <option value="4-Wheeler">4-Wheeler</option>
                <option value="Heavy Vehicle">Heavy Vehicle</option>
              </select>
            </div>

            <div className="space-y-2">
              <label className="flex items-center text-sm font-medium text-slate-700 dark:text-gray-300">
                <IndianRupee className="mr-2 h-4 w-4 text-green-500" />
                Auto-Detected Fine
              </label>
              <div className="flex w-full items-center rounded-xl border border-green-500/20 bg-green-500/10 px-4 py-3 font-bold text-green-500">
                <span>Rs. {currentFine}</span>
                <span className="ml-2 text-xs font-normal text-green-600/70 dark:text-green-400/70">(Calculated automatically)</span>
              </div>
            </div>

            <div className="space-y-2 md:col-span-2">
              <label className="flex items-center text-sm font-medium text-slate-700 dark:text-gray-300">
                <MapPin className="mr-2 h-4 w-4 text-blue-500" />
                Location
              </label>
              <input
                type="text"
                required
                placeholder="Enter location"
                className="w-full rounded-xl border border-slate-200 bg-white px-4 py-3 text-slate-900 placeholder-slate-400 transition-colors focus:border-blue-500 focus:outline-none dark:border-gray-700 dark:bg-gray-800 dark:text-white dark:placeholder-gray-500"
                value={formData.location}
                onChange={(event) => setFormData({ ...formData, location: event.target.value })}
              />
            </div>
          </div>

          <div className="space-y-4 border-t border-slate-200 pt-6 dark:border-gray-800">
            <label className="flex items-center text-sm font-medium text-slate-700 dark:text-gray-300">
              <Camera className="mr-2 h-4 w-4 text-blue-500" />
              Proof of Violation (Image Upload)
            </label>

            <div
              className={`flex flex-col items-center justify-center rounded-xl border-2 border-dashed p-6 text-center transition-all ${
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
                onChange={(event) => handleFileChange(event.target.files[0])}
              />

              <div className="mb-4 rounded-full bg-blue-500/20 p-4">
                <UploadCloud className="h-8 w-8 text-blue-400" />
              </div>
              <h4 className="mb-1 font-medium text-slate-900 dark:text-white">Drag & drop image</h4>
              <p className="mb-4 text-xs text-slate-500 dark:text-gray-500">Supports JPG, PNG, WEBP (Max 5MB)</p>

              <button
                type="button"
                onClick={() => fileInputRef.current?.click()}
                className="rounded-lg border border-slate-200 bg-white px-4 py-2 text-sm font-medium text-slate-700 transition-colors hover:bg-slate-100 dark:border-gray-700 dark:bg-gray-800 dark:text-white dark:hover:bg-gray-700"
              >
                Browse Files
              </button>
            </div>

            <div className="min-h-[60px]">
              {file ? (
                <div className="flex items-center justify-between rounded-lg border border-slate-200 bg-slate-100/80 p-3 dark:border-gray-700 dark:bg-gray-800/50">
                  <span className="max-w-[250px] truncate text-sm text-slate-700 dark:text-gray-300">{file.name}</span>
                  <button
                    type="button"
                    onClick={uploadImage}
                    disabled={uploading}
                    className="flex items-center rounded-md bg-blue-600 px-3 py-1.5 text-xs font-medium text-white transition-colors hover:bg-blue-700 disabled:opacity-50"
                  >
                    {uploading ? <div className="mr-1 h-3 w-3 rounded-full border-2 border-white border-t-transparent animate-spin"></div> : null}
                    Upload Image
                  </button>
                </div>
              ) : null}

              {uploadError ? <p className="mt-2 text-center text-xs text-red-500">{uploadError}</p> : null}

              {formData.imageUrl ? (
                <motion.div
                  initial={{ opacity: 0, scale: 0.95 }}
                  animate={{ opacity: 1, scale: 1 }}
                  className="mt-4 flex flex-col items-center gap-4 sm:flex-row sm:items-start"
                >
                  <div className="flex w-full flex-1 items-start rounded-lg border border-green-500/20 bg-green-500/10 p-3">
                    <CheckCircle className="mr-3 mt-0.5 h-5 w-5 shrink-0 text-green-500" />
                    <div>
                      <p className="text-sm font-medium text-green-500">Image Uploaded Successfully!</p>
                      <p className="max-w-[200px] truncate break-all text-xs text-green-600/70 sm:max-w-[300px] dark:text-green-400/70">
                        Attached to violation
                      </p>
                    </div>
                  </div>
                  <div className="relative h-20 w-32 shrink-0 overflow-hidden rounded-lg border border-slate-200 bg-white dark:border-gray-700 dark:bg-black/50">
                    <img
                      src={formData.imageUrl}
                      alt="Uploaded preview"
                      className="h-full w-full object-cover"
                    />
                  </div>
                </motion.div>
              ) : null}
            </div>
          </div>

          <div className="flex justify-end border-t border-slate-200 pt-4 dark:border-gray-800">
            <button
              type="button"
              onClick={() => navigate('/violations')}
              className="mr-4 px-6 py-3 font-medium text-slate-500 transition-colors hover:text-slate-900 dark:text-gray-400 dark:hover:text-white"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={loading || (file && !formData.imageUrl)}
              className="flex items-center rounded-xl bg-blue-600 px-8 py-3 font-medium text-white shadow-lg shadow-blue-500/20 transition-colors hover:bg-blue-700 disabled:opacity-50"
            >
              {loading ? <div className="mr-2 h-5 w-5 rounded-full border-2 border-white border-t-transparent animate-spin"></div> : null}
              Submit Record
            </button>
            {file && !formData.imageUrl ? (
              <p className="absolute right-8 mt-14 text-xs text-orange-500 dark:text-orange-400">Please upload the selected image first</p>
            ) : null}
          </div>
        </form>
      </motion.div>
    </div>
  );
}
