'use client';

import { useState } from 'react';
import DashboardLayout from '../../../components/layout/dashboard-layout';
import { useAuthStore } from '../../../store/auth-store';
import { api } from '../../../lib/api';
import { UploadCloud, FileText, CheckCircle, AlertCircle, Trash2 } from 'lucide-react';

export default function ProcessSurveysPage() {
  const user = useAuthStore((state) => state.user);
  const [file, setFile] = useState<File | null>(null);
  const [isProcessing, setIsProcessing] = useState(false);
  const [result, setResult] = useState<any>(null);
  const [error, setError] = useState('');

  // Handle file select
  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      setFile(e.target.files[0]);
      setResult(null);
      setError('');
    }
  };

  // Handle upload and process
  const handleUpload = async () => {
    if (!file) return;

    setIsProcessing(true);
    setError('');
    
    // Create form data
    const formData = new FormData();
    formData.append('document', file);
    formData.append('title', `Survey Upload: ${file.name}`);

    try {
      const response = await api.post('/surveys/upload', formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      });

      if (response.data.success) {
        setResult(response.data.data);
      }
    } catch (err: any) {
      setError(err.response?.data?.error || 'Failed to process the survey. Please try again.');
    } finally {
      setIsProcessing(false);
    }
  };

  if (user?.role !== 'ngo_coordinator' && user?.role !== 'admin') {
    return (
      <DashboardLayout>
        <div className="glass-card p-10 text-center rounded-2xl">
          <AlertCircle className="w-12 h-12 text-red-400 mx-auto mb-4" />
          <h2 className="text-xl font-bold text-white mb-2">Access Denied</h2>
          <p className="text-slate-400">Only NGO Coordinators can access the survey processing tool.</p>
        </div>
      </DashboardLayout>
    );
  }

  return (
    <DashboardLayout>
      <div className="space-y-8">
        <div>
          <h1 className="text-2xl font-bold text-slate-100 flex items-center gap-3">
            Process Community Surveys
            <div className="px-3 py-1 text-xs font-semibold rounded-full bg-purple-500/10 text-purple-400 border border-purple-500/20">
              AI NLP Engine
            </div>
          </h1>
          <p className="text-slate-400 mt-1">Upload field reports or survey forms. Our AI will extract key needs and automatically create database entries.</p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          
          {/* Upload Section */}
          <div className="glass-card rounded-2xl p-8 border border-slate-800">
            <h2 className="text-lg font-semibold text-slate-200 mb-6">Upload Document</h2>
            
            {!file ? (
              <label className="flex flex-col items-center justify-center w-full h-64 border-2 border-slate-700/50 border-dashed rounded-xl cursor-pointer bg-slate-900/30 hover:bg-slate-800/40 transition-colors">
                <div className="flex flex-col items-center justify-center pt-5 pb-6">
                  <div className="p-4 bg-indigo-500/10 rounded-full mb-4">
                    <UploadCloud className="w-8 h-8 text-indigo-400" />
                  </div>
                  <p className="mb-2 text-sm text-slate-300 font-medium">Click to upload or drag and drop</p>
                  <p className="text-xs text-slate-500">PDF, JPG, PNG, or TXT (MAX. 10MB)</p>
                </div>
                <input type="file" className="hidden" accept=".pdf,.jpg,.jpeg,.png,.txt" onChange={handleFileChange} />
              </label>
            ) : (
              <div className="w-full flex items-center justify-between p-4 border border-slate-700/50 rounded-xl bg-slate-900/50 mb-6">
                <div className="flex items-center gap-4">
                  <div className="p-3 bg-indigo-500/10 rounded-lg">
                    <FileText className="w-6 h-6 text-indigo-400" />
                  </div>
                  <div>
                    <h3 className="text-sm font-medium text-slate-200 truncate max-w-[200px] sm:max-w-xs">{file.name}</h3>
                    <p className="text-xs text-slate-400">{(file.size / 1024 / 1024).toFixed(2)} MB</p>
                  </div>
                </div>
                <button 
                  onClick={() => setFile(null)}
                  disabled={isProcessing}
                  className="p-2 text-slate-400 hover:text-red-400 hover:bg-slate-800 rounded-lg transition-colors disabled:opacity-50"
                >
                  <Trash2 className="w-5 h-5" />
                </button>
              </div>
            )}

            {error && (
              <div className="mt-4 p-4 rounded-xl bg-red-500/10 border border-red-500/20 flex gap-3 text-sm text-red-400">
                <AlertCircle className="w-5 h-5 shrink-0" />
                {error}
              </div>
            )}

            <button
              onClick={handleUpload}
              disabled={!file || isProcessing}
              className={`w-full mt-6 py-4 rounded-xl font-medium flex items-center justify-center gap-2 transition-all ${
                !file 
                  ? 'bg-slate-800 text-slate-500 cursor-not-allowed' 
                  : 'bg-indigo-600 hover:bg-indigo-500 text-white shadow-[0_0_15px_rgba(79,70,229,0.4)]'
              }`}
            >
              {isProcessing ? (
                <>
                  <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
                  Processing via AI...
                </>
              ) : (
                <>
                  <CheckCircle className="w-5 h-5" />
                  Process & Extract Insights
                </>
              )}
            </button>
          </div>

          {/* Results Section */}
          <div className="glass-card rounded-2xl p-8 border border-slate-800 flex flex-col h-[500px]">
            <h2 className="text-lg font-semibold text-slate-200 mb-6 border-b border-slate-700/50 pb-4">Extraction Results</h2>
            
            <div className="flex-1 overflow-y-auto pr-2 custom-scrollbar">
              {!result && !isProcessing && (
                <div className="h-full flex flex-col items-center justify-center text-slate-500 text-center">
                  <FileText className="w-12 h-12 mb-4 opacity-50" />
                  <p>Upload a survey document to see AI-extracted community needs here.</p>
                </div>
              )}

              {isProcessing && (
                <div className="h-full flex flex-col items-center justify-center text-indigo-400">
                  <div className="w-12 h-12 border-4 border-indigo-500/30 border-t-indigo-500 rounded-full animate-spin mb-6"></div>
                  <p className="font-medium animate-pulse">Analyzing document text...</p>
                  <p className="text-xs text-slate-500 mt-2">Running natural language processing</p>
                </div>
              )}

              {result && (
                <div className="space-y-6 animate-fade-in">
                  <div className="p-4 rounded-xl bg-emerald-500/10 border border-emerald-500/20">
                    <div className="flex items-start gap-3">
                      <CheckCircle className="w-5 h-5 text-emerald-400 shrink-0 mt-0.5" />
                      <div>
                        <h3 className="text-sm font-medium text-emerald-400">Processing Complete</h3>
                        <p className="text-xs text-slate-300 mt-1">{result.summary || 'Needs extracted successfully.'}</p>
                      </div>
                    </div>
                  </div>

                  {result.extractedNeeds && result.extractedNeeds.length > 0 ? (
                    <div className="space-y-4">
                      <h3 className="font-medium text-slate-300 text-sm">Created Platform Needs:</h3>
                      {result.extractedNeeds.map((need: any, idx: number) => (
                        <div key={idx} className="p-4 rounded-xl bg-slate-800/50 border border-slate-700/50">
                          <div className="flex items-center justify-between mb-2">
                            <span className={`text-xs font-semibold px-2 py-1 rounded border ${
                              need.urgency === 'critical' ? 'bg-red-500/20 text-red-400 border-red-500/30' :
                              need.urgency === 'high' ? 'bg-orange-500/20 text-orange-400 border-orange-500/30' :
                              'bg-indigo-500/20 text-indigo-400 border-indigo-500/30'
                            }`}>
                              {need.urgency.toUpperCase()}
                            </span>
                            <span className="text-xs text-slate-500 capitalize">{need.category.replace('_', ' ')}</span>
                          </div>
                          <h4 className="font-medium text-slate-200 text-sm mb-1">{need.title}</h4>
                          <p className="text-xs text-slate-400 line-clamp-2">{need.description}</p>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <div className="text-center p-6 bg-slate-800/30 rounded-xl border border-slate-700/50">
                      <p className="text-slate-400 text-sm">No actionable needs could be extracted from this document.</p>
                    </div>
                  )}
                </div>
              )}
            </div>
          </div>

        </div>
      </div>
    </DashboardLayout>
  );
}
