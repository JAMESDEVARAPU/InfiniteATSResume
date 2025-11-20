import React, { useState, useRef } from 'react';
import { AnalysisStage, UserSession } from './types';
import { analyzeResumeWithGemini, generateImprovedResume } from './services/geminiService';
import { Navbar } from './components/Navbar';
import { ScoreGauge } from './components/ScoreGauge';
import { ResumePreview } from './components/ResumePreview';
import { UploadCloud, ArrowRight, CheckCircle, AlertCircle, Sparkles, Download, Printer, ArrowLeft, FileText, Play, RefreshCw, FileType, Briefcase, Edit, Save, X, Code, Zap, ChevronRight } from 'lucide-react';

const INITIAL_SESSION: UserSession = {
  originalResumeText: '',
  resumeFile: null,
  jobDescription: '',
  targetRole: '',
  analysis: null,
  improvedResume: null,
};

const COMMON_ROLES = [
  "Full Stack Developer",
  "Frontend Developer",
  "Backend Developer",
  "Data Scientist",
  "Product Manager",
  "UI/UX Designer",
  "DevOps Engineer",
  "QA Engineer",
  "Business Analyst",
  "Fresher / Entry Level"
];

const App: React.FC = () => {
  const [stage, setStage] = useState<AnalysisStage>(AnalysisStage.LANDING);
  const [session, setSession] = useState<UserSession>(INITIAL_SESSION);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [inputType, setInputType] = useState<'file' | 'text'>('file');
  const [jdType, setJdType] = useState<'text' | 'role'>('text');
  const [isEditing, setIsEditing] = useState(false);

  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      if (file.type !== 'application/pdf') {
        setError("Please upload a PDF file.");
        return;
      }
      
      const reader = new FileReader();
      reader.onloadend = () => {
        const base64String = reader.result as string;
        const base64Data = base64String.split(',')[1];
        
        setSession(prev => ({
          ...prev,
          resumeFile: {
            data: base64Data,
            mimeType: file.type,
            name: file.name
          },
          originalResumeText: '' 
        }));
        setError(null);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleStartAnalysis = async () => {
    const hasResume = session.resumeFile || session.originalResumeText.trim();
    const hasJd = session.jobDescription.trim() || session.targetRole;

    if (!hasResume) {
      setError("Please provide your resume (Upload PDF or Paste Text).");
      return;
    }
    if (!hasJd) {
      setError("Please provide a Job Description or select a Target Role.");
      return;
    }

    setError(null);
    setIsLoading(true);
    setStage(AnalysisStage.ANALYZING);

    try {
      const resumeInput = {
        text: session.originalResumeText,
        file: session.resumeFile ? { data: session.resumeFile.data, mimeType: session.resumeFile.mimeType } : null
      };
      
      const jobContext = {
        description: session.jobDescription,
        role: session.targetRole
      };

      const analysis = await analyzeResumeWithGemini(resumeInput, jobContext);
      setSession(prev => ({ ...prev, analysis }));
      setStage(AnalysisStage.RESULTS);
    } catch (e: any) {
      setError(e.message || "An unexpected error occurred during analysis.");
      setStage(AnalysisStage.UPLOAD);
    } finally {
      setIsLoading(false);
    }
  };

  const handleGenerateImproved = async () => {
    if (!session.analysis) return;
    setIsLoading(true);
    setStage(AnalysisStage.GENERATING);
    
    try {
      const resumeInput = {
        text: session.originalResumeText,
        file: session.resumeFile ? { data: session.resumeFile.data, mimeType: session.resumeFile.mimeType } : null
      };
      
      const jobContext = {
        description: session.jobDescription,
        role: session.targetRole
      };

      const improved = await generateImprovedResume(resumeInput, jobContext, session.analysis);
      setSession(prev => ({ ...prev, improvedResume: improved }));
      setStage(AnalysisStage.EDIT_PREVIEW);
    } catch (e: any) {
      setError(e.message || "Failed to generate resume.");
      setStage(AnalysisStage.RESULTS);
    } finally {
      setIsLoading(false);
    }
  };

  const handleDownloadPDF = () => {
    // window.print() is the robust method for client-side PDF generation
    // The CSS @media print rules handle the layout
    window.print();
  };

  const handleDownloadJSON = () => {
    if (!session.improvedResume) return;
    const dataStr = JSON.stringify(session.improvedResume, null, 2);
    const blob = new Blob([dataStr], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `${session.improvedResume.fullName.replace(/\s+/g, '_')}_Resume.json`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  const handleUpdateResume = (field: string, value: any, index?: number, subField?: string, subIndex?: number) => {
    if (!session.improvedResume) return;
    
    const newResume = { ...session.improvedResume };

    if (field === 'summary') {
        newResume.summary = value;
    } else if (field === 'experience' && index !== undefined && subField) {
        if (subField === 'details' && subIndex !== undefined) {
             newResume.experience[index].details[subIndex] = value;
        } else if (subField === 'role' || subField === 'company') {
             (newResume.experience[index] as any)[subField] = value;
        }
    } else if (field === 'skills') {
         newResume.skills = value;
    }

    setSession(prev => ({ ...prev, improvedResume: newResume }));
  };

  // --- Render Views ---

  const renderLanding = () => (
    <div className="min-h-[calc(100vh-64px)] bg-[#F8FAFC] flex flex-col items-center justify-center text-center px-4 relative overflow-hidden">
      {/* Abstract Background */}
      <div className="absolute top-[-10%] left-[-10%] w-[40%] h-[40%] bg-primary/10 rounded-full mix-blend-multiply filter blur-[100px] animate-float"></div>
      <div className="absolute bottom-[-10%] right-[-10%] w-[40%] h-[40%] bg-accent/10 rounded-full mix-blend-multiply filter blur-[100px] animate-float" style={{animationDelay: '1.5s'}}></div>

      <div className="max-w-5xl mx-auto space-y-8 relative z-10 animate-slide-up">
        <div className="inline-flex items-center px-4 py-2 rounded-full bg-white border border-gray-200 text-gray-600 font-medium text-xs shadow-sm backdrop-blur-sm hover:border-primary/50 transition-colors">
          <Sparkles className="w-3 h-3 mr-2 text-primary" />
          <span>New AI Model: Gemini 2.5 Integration</span>
        </div>
        
        <h1 className="text-6xl md:text-7xl font-heading font-bold text-gray-900 tracking-tight leading-[1.1] drop-shadow-sm">
          Resume Optimization <br/>
          <span className="text-transparent bg-clip-text bg-gradient-to-r from-primary to-indigo-600">Reimagined.</span>
        </h1>
        
        <p className="text-xl text-gray-500 max-w-2xl mx-auto leading-relaxed font-light">
           Transform your resume into an ATS-beating machine. Upload your PDF, pick your target role, and let our AI refine your professional story.
        </p>
        
        <div className="flex flex-col sm:flex-row gap-4 justify-center mt-10">
          <button 
            onClick={() => setStage(AnalysisStage.UPLOAD)}
            className="px-8 py-4 bg-gray-900 text-white rounded-2xl font-semibold text-lg shadow-xl hover:shadow-2xl hover:-translate-y-1 transition-all transform flex items-center justify-center group"
          >
            Optimize Resume Now <ArrowRight className="ml-2 w-5 h-5 group-hover:translate-x-1 transition-transform" />
          </button>
          <button 
            onClick={() => setStage(AnalysisStage.DASHBOARD)}
            className="px-8 py-4 bg-white text-gray-700 border border-gray-200 rounded-2xl font-semibold text-lg hover:bg-gray-50 hover:border-gray-300 transition-all flex items-center justify-center shadow-sm"
          >
            View History
          </button>
        </div>
      </div>
      
      <div className="max-w-7xl mx-auto mt-24 grid grid-cols-1 md:grid-cols-3 gap-6 px-4 animate-fade-in" style={{animationDelay: '0.2s'}}>
         {[
           { icon: FileText, color: 'text-blue-600', bg: 'bg-blue-50', title: 'Deep Analysis', desc: 'Parses complex PDF layouts without losing context or structure.' },
           { icon: Zap, color: 'text-yellow-600', bg: 'bg-yellow-50', title: 'Role Match', desc: 'Aligns your experience with specific job descriptions or industry roles.' },
           { icon: CheckCircle, color: 'text-green-600', bg: 'bg-green-50', title: 'ATS Pass', desc: 'Optimizes formatting and keywords to ensure you get past the bots.' }
         ].map((feat, i) => (
           <div key={i} className="bg-white p-8 rounded-3xl border border-gray-100 shadow-sm hover:shadow-md transition-all hover:-translate-y-1 cursor-default">
              <div className={`w-12 h-12 ${feat.bg} rounded-2xl flex items-center justify-center mb-4`}>
                 <feat.icon className={`${feat.color} w-6 h-6`} />
              </div>
              <h3 className="font-bold text-lg text-gray-900 font-heading mb-2">{feat.title}</h3>
              <p className="text-gray-500 text-sm leading-relaxed">{feat.desc}</p>
           </div>
         ))}
      </div>
    </div>
  );

  const renderDashboard = () => (
    <div className="max-w-7xl mx-auto px-4 py-12 animate-fade-in">
       <div className="bg-gray-900 rounded-[2.5rem] shadow-2xl p-12 mb-10 text-white overflow-hidden relative">
          <div className="absolute top-0 right-0 w-96 h-96 bg-blue-500 opacity-20 rounded-full -translate-y-1/2 translate-x-1/4 blur-3xl animate-pulse-slow"></div>
          <div className="relative z-10">
            <h2 className="text-4xl font-bold mb-4 font-heading">Welcome back</h2>
            <p className="text-gray-300 text-lg max-w-xl font-light">Ready to land your next role? Your resume stats are looking good.</p>
            <div className="mt-8 flex gap-6">
                <div className="bg-white/10 backdrop-blur-md rounded-2xl p-5 flex items-center min-w-[160px]">
                    <div>
                        <div className="text-3xl font-bold">12</div>
                        <div className="text-xs uppercase tracking-wider text-gray-400 mt-1">Scans</div>
                    </div>
                </div>
                <div className="bg-white/10 backdrop-blur-md rounded-2xl p-5 flex items-center min-w-[160px]">
                    <div>
                        <div className="text-3xl font-bold text-green-400">85%</div>
                        <div className="text-xs uppercase tracking-wider text-gray-400 mt-1">Avg Score</div>
                    </div>
                </div>
            </div>
          </div>
       </div>
       
       <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          <div onClick={() => setStage(AnalysisStage.UPLOAD)} className="col-span-1 bg-white border-2 border-dashed border-gray-200 rounded-3xl p-8 flex flex-col items-center justify-center text-center cursor-pointer hover:border-primary hover:bg-blue-50/50 transition-all group min-h-[300px]">
             <div className="w-16 h-16 bg-blue-50 rounded-full flex items-center justify-center mb-4 group-hover:scale-110 transition-transform">
                <UploadCloud className="w-8 h-8 text-primary" />
             </div>
             <h3 className="text-xl font-bold text-gray-900">New Analysis</h3>
             <p className="text-gray-500 mt-2 text-sm">Upload PDF or paste text to start</p>
          </div>
          
          <div className="md:col-span-2 bg-white rounded-3xl shadow-sm border border-gray-100 p-8 min-h-[300px]">
             <div className="flex justify-between items-center mb-8">
                <h3 className="text-xl font-bold text-gray-900 font-heading">Recent Scans</h3>
                <button className="text-sm text-primary font-medium hover:underline">View All</button>
             </div>
             <div className="space-y-3">
                {[1, 2, 3].map((_, i) => (
                    <div key={i} className="flex items-center justify-between p-4 hover:bg-gray-50 rounded-2xl transition-colors group cursor-pointer border border-transparent hover:border-gray-100">
                        <div className="flex items-center">
                            <div className="w-12 h-12 rounded-xl bg-gray-100 flex items-center justify-center mr-4 group-hover:bg-white group-hover:shadow-sm transition-all">
                                <FileText className="w-6 h-6 text-gray-400 group-hover:text-primary" />
                            </div>
                            <div>
                                <div className="font-bold text-gray-900">Frontend Developer</div>
                                <div className="text-xs text-gray-400 mt-0.5">Analyzed 2 days ago</div>
                            </div>
                        </div>
                        <div className="flex items-center gap-4">
                            <span className="px-3 py-1 bg-green-100 text-green-700 rounded-full text-xs font-bold">92</span>
                            <ChevronRight className="w-5 h-5 text-gray-300" />
                        </div>
                    </div>
                ))}
             </div>
          </div>
       </div>
    </div>
  );

  const renderUpload = () => (
    <div className="max-w-6xl mx-auto px-4 py-12 animate-slide-up">
      <div className="text-center mb-12">
        <h2 className="text-4xl font-bold text-gray-900 font-heading">Let's Optimize</h2>
        <p className="text-gray-500 mt-3 text-lg">Provide your resume and the job you want.</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Resume Section */}
        <div className="bg-white rounded-3xl p-1 shadow-xl shadow-gray-200/50 border border-gray-100 overflow-hidden">
          <div className="p-6 border-b border-gray-50 flex justify-between items-center bg-gradient-to-r from-gray-50 to-white">
             <h3 className="font-bold text-gray-900 flex items-center gap-3">
                 <span className="w-8 h-8 bg-white text-gray-900 border border-gray-200 rounded-lg flex items-center justify-center text-sm shadow-sm font-heading">1</span> 
                 Upload Resume
             </h3>
             <div className="flex bg-gray-100 rounded-lg p-1">
                <button onClick={() => setInputType('file')} className={`px-4 py-1.5 text-xs rounded-md transition-all font-medium ${inputType === 'file' ? 'bg-white text-primary shadow-sm' : 'text-gray-500'}`}>PDF</button>
                <button onClick={() => setInputType('text')} className={`px-4 py-1.5 text-xs rounded-md transition-all font-medium ${inputType === 'text' ? 'bg-white text-primary shadow-sm' : 'text-gray-500'}`}>Text</button>
             </div>
          </div>
          
          <div className="p-8">
            {inputType === 'file' ? (
                <div 
                className={`w-full h-72 rounded-2xl border-2 border-dashed flex flex-col items-center justify-center cursor-pointer transition-all duration-300 group ${session.resumeFile ? 'border-accent bg-green-50/30' : 'border-gray-200 bg-gray-50/50 hover:border-primary hover:bg-blue-50/30'}`}
                onClick={() => fileInputRef.current?.click()}
                >
                <input type="file" ref={fileInputRef} className="hidden" accept="application/pdf" onChange={handleFileChange} />
                {session.resumeFile ? (
                    <div className="text-center animate-fade-in">
                    <div className="w-20 h-20 bg-white rounded-3xl shadow-sm flex items-center justify-center mx-auto mb-4 border border-green-100">
                        <FileType className="w-10 h-10 text-accent" />
                    </div>
                    <p className="font-bold text-gray-900 text-lg">{session.resumeFile.name}</p>
                    <p className="text-sm text-green-600 mt-1 font-medium flex items-center justify-center gap-1"><CheckCircle className="w-3 h-3"/> Ready</p>
                    <button className="mt-6 px-4 py-2 text-xs text-red-500 bg-red-50 hover:bg-red-100 rounded-xl transition-colors font-medium" onClick={(e) => {
                        e.stopPropagation();
                        setSession(prev => ({ ...prev, resumeFile: null }));
                    }}>Change File</button>
                    </div>
                ) : (
                    <div className="text-center p-6">
                    <div className="w-20 h-20 bg-white rounded-3xl shadow-sm flex items-center justify-center mx-auto mb-6 group-hover:scale-110 transition-transform duration-300 border border-gray-100">
                        <UploadCloud className="w-10 h-10 text-primary" />
                    </div>
                    <p className="font-bold text-gray-900 text-lg">Drop PDF here</p>
                    <p className="text-sm text-gray-400 mt-2">or click to browse (Max 5MB)</p>
                    </div>
                )}
                </div>
            ) : (
                <textarea 
                className="w-full h-72 p-6 rounded-2xl border border-gray-200 focus:border-primary focus:ring-2 focus:ring-primary/20 transition-all resize-none text-sm font-mono bg-gray-50/50"
                placeholder="Paste your resume content here..."
                value={session.originalResumeText}
                onChange={(e) => setSession({ ...session, originalResumeText: e.target.value, resumeFile: null })}
                />
            )}
          </div>
        </div>

        {/* JD Section */}
        <div className="bg-white rounded-3xl p-1 shadow-xl shadow-gray-200/50 border border-gray-100 overflow-hidden">
          <div className="p-6 border-b border-gray-50 flex justify-between items-center bg-gradient-to-r from-gray-50 to-white">
             <h3 className="font-bold text-gray-900 flex items-center gap-3">
                 <span className="w-8 h-8 bg-white text-gray-900 border border-gray-200 rounded-lg flex items-center justify-center text-sm shadow-sm font-heading">2</span> 
                 Target Job
             </h3>
             <div className="flex bg-gray-100 rounded-lg p-1">
                <button onClick={() => setJdType('text')} className={`px-4 py-1.5 text-xs rounded-md transition-all font-medium ${jdType === 'text' ? 'bg-white text-primary shadow-sm' : 'text-gray-500'}`}>Paste JD</button>
                <button onClick={() => setJdType('role')} className={`px-4 py-1.5 text-xs rounded-md transition-all font-medium ${jdType === 'role' ? 'bg-white text-primary shadow-sm' : 'text-gray-500'}`}>Role</button>
             </div>
          </div>

          <div className="p-8">
            {jdType === 'text' ? (
                <div className="relative">
                <textarea 
                    className="w-full h-72 p-6 rounded-2xl border border-gray-200 focus:border-primary focus:ring-2 focus:ring-primary/20 transition-all resize-none text-sm font-mono bg-gray-50/50"
                    placeholder="Paste the job description here..."
                    value={session.jobDescription}
                    onChange={(e) => setSession({ ...session, jobDescription: e.target.value, targetRole: '' })}
                />
                </div>
            ) : (
                <div className="w-full h-72 bg-gray-50/50 rounded-2xl border border-gray-200 p-8 flex flex-col justify-center">
                   <label className="block text-sm font-bold text-gray-700 mb-3 ml-1">Select Target Role</label>
                   <div className="relative">
                        <select 
                            className="w-full p-4 pl-5 rounded-xl border-gray-200 border focus:ring-2 focus:ring-primary/20 focus:border-primary appearance-none bg-white cursor-pointer font-medium text-gray-700"
                            value={session.targetRole}
                            onChange={(e) => setSession({ ...session, targetRole: e.target.value, jobDescription: '' })}
                        >
                            <option value="">-- Choose a Role --</option>
                            {COMMON_ROLES.map(role => (
                            <option key={role} value={role}>{role}</option>
                            ))}
                        </select>
                        <Briefcase className="absolute right-5 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none w-5 h-5" />
                   </div>
                   <div className="mt-6 p-4 bg-blue-50 rounded-xl border border-blue-100">
                      <p className="text-xs text-blue-700 text-center font-medium">
                          We'll optimize your resume based on current industry standards and keywords for this position.
                      </p>
                   </div>
                </div>
            )}
          </div>
        </div>
      </div>

      {error && (
        <div className="mt-8 p-4 bg-red-50 border border-red-100 text-red-700 rounded-2xl flex items-center justify-center animate-pulse mx-auto max-w-2xl">
          <AlertCircle className="w-5 h-5 mr-2" />
          {error}
        </div>
      )}

      <div className="mt-12 flex justify-center">
        <button 
          onClick={handleStartAnalysis}
          disabled={isLoading}
          className="px-12 py-5 bg-gray-900 text-white rounded-2xl font-bold text-lg shadow-xl hover:shadow-2xl hover:-translate-y-1 disabled:opacity-50 disabled:cursor-not-allowed transition-all flex items-center w-full md:w-auto justify-center group"
        >
          {isLoading ? (
            <>
              <RefreshCw className="w-5 h-5 mr-3 animate-spin" /> Analyzing Content...
            </>
          ) : (
            <>
              Analyze Compatibility <ArrowRight className="w-5 h-5 ml-3 group-hover:translate-x-1 transition-transform" />
            </>
          )}
        </button>
      </div>
    </div>
  );

  const renderAnalyzing = () => (
     <div className="min-h-[70vh] flex flex-col items-center justify-center animate-fade-in">
        <div className="relative w-32 h-32">
           <div className="absolute inset-0 border-[6px] border-gray-100 rounded-full"></div>
           <div className="absolute inset-0 border-[6px] border-primary rounded-full border-t-transparent animate-spin"></div>
           <div className="absolute inset-0 flex items-center justify-center">
               <Sparkles className="w-10 h-10 text-primary animate-pulse" />
           </div>
        </div>
        <h3 className="mt-10 text-3xl font-bold text-gray-900 font-heading">Analyzing Resume</h3>
        <p className="text-gray-500 mt-3 text-lg font-light">Extracting insights & comparing keywords...</p>
     </div>
  );

  const renderResults = () => {
    if (!session.analysis) return null;
    
    return (
      <div className="max-w-7xl mx-auto px-4 py-12 animate-slide-up">
        <button onClick={() => setStage(AnalysisStage.UPLOAD)} className="mb-8 text-gray-500 hover:text-gray-900 flex items-center font-medium transition-colors px-4 py-2 rounded-lg hover:bg-gray-100 w-fit">
           <ArrowLeft className="w-4 h-4 mr-2" /> Back to Upload
        </button>
        
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 mb-10">
          {/* Score Card */}
          <div className="bg-white p-10 rounded-[2.5rem] shadow-xl shadow-gray-100 border border-gray-100 flex flex-col items-center text-center col-span-1 relative overflow-hidden">
             <div className="absolute top-0 left-0 w-full h-1.5 bg-gradient-to-r from-primary to-accent"></div>
             <h3 className="text-xl font-bold text-gray-800 mb-8 font-heading uppercase tracking-wide">ATS Score</h3>
             <div className="scale-110 mb-6">
                 <ScoreGauge score={session.analysis.score} size={200} />
             </div>
             <p className="mt-4 text-gray-600 text-sm leading-relaxed px-4 border-t border-gray-100 pt-6">
                {session.analysis.summary}
             </p>
             <button 
                onClick={handleGenerateImproved}
                className="mt-10 w-full py-4 bg-gray-900 text-white rounded-xl font-bold shadow-lg hover:shadow-xl hover:-translate-y-1 transition-all flex items-center justify-center group"
             >
                <Sparkles className="w-5 h-5 mr-2 text-yellow-400 group-hover:animate-pulse" /> AI Optimization
             </button>
          </div>

          {/* Details Grid */}
          <div className="lg:col-span-2 space-y-6">
             {/* Keywords Row */}
             <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="bg-white p-8 rounded-[2.5rem] shadow-sm border border-gray-100 relative overflow-hidden group hover:border-red-100 transition-colors">
                    <div className="absolute top-0 right-0 p-6 opacity-[0.03] group-hover:opacity-[0.06] transition-opacity">
                        <AlertCircle className="w-32 h-32 text-red-500" />
                    </div>
                    <h3 className="font-bold text-gray-900 mb-6 flex items-center relative z-10">
                        <div className="w-10 h-10 bg-red-50 rounded-xl flex items-center justify-center mr-3 border border-red-100">
                            <AlertCircle className="w-5 h-5 text-red-500" />
                        </div>
                        Missing Keywords
                    </h3>
                    <div className="flex flex-wrap gap-2 relative z-10">
                        {session.analysis.missingKeywords.map((kw, i) => (
                            <span key={i} className="px-3 py-1.5 bg-red-50/50 text-red-700 text-sm rounded-lg font-medium border border-red-100">
                                {kw}
                            </span>
                        ))}
                        {session.analysis.missingKeywords.length === 0 && <span className="text-gray-500 italic">Great job! No major keywords missing.</span>}
                    </div>
                </div>

                <div className="bg-white p-8 rounded-[2.5rem] shadow-sm border border-gray-100 relative overflow-hidden group hover:border-green-100 transition-colors">
                    <div className="absolute top-0 right-0 p-6 opacity-[0.03] group-hover:opacity-[0.06] transition-opacity">
                        <CheckCircle className="w-32 h-32 text-green-500" />
                    </div>
                    <h3 className="font-bold text-gray-900 mb-6 flex items-center relative z-10">
                        <div className="w-10 h-10 bg-green-50 rounded-xl flex items-center justify-center mr-3 border border-green-100">
                            <CheckCircle className="w-5 h-5 text-green-500" />
                        </div>
                        Matching Keywords
                    </h3>
                    <div className="flex flex-wrap gap-2 relative z-10">
                        {session.analysis.matchingKeywords.map((kw, i) => (
                            <span key={i} className="px-3 py-1.5 bg-green-50/50 text-green-700 text-sm rounded-lg font-medium border border-green-100">
                                {kw}
                            </span>
                        ))}
                    </div>
                </div>
             </div>

             {/* Recommendations */}
             <div className="bg-white p-8 rounded-[2.5rem] shadow-sm border border-gray-100 h-full">
                <h3 className="font-bold text-gray-900 mb-6 flex items-center">
                    <div className="w-10 h-10 bg-blue-50 rounded-xl flex items-center justify-center mr-3 border border-blue-100">
                        <FileText className="w-5 h-5 text-blue-600" />
                    </div>
                    Strategic Recommendations
                </h3>
                <div className="space-y-4">
                   {session.analysis.contentRecommendations.map((rec, i) => (
                      <div key={i} className="flex items-start bg-gray-50 p-5 rounded-2xl border border-gray-100">
                         <div className="bg-blue-600 rounded-full w-6 h-6 flex items-center justify-center text-white text-xs font-bold mt-0.5 mr-4 flex-shrink-0 shadow-sm">{i+1}</div>
                         <p className="text-gray-700 text-sm leading-relaxed font-medium">{rec}</p>
                      </div>
                   ))}
                </div>
             </div>
          </div>
        </div>
      </div>
    );
  };

  const renderGenerating = () => (
    <div className="min-h-[70vh] flex flex-col items-center justify-center animate-fade-in">
       <div className="relative w-24 h-24 mb-8">
           <div className="absolute inset-0 bg-primary/20 rounded-full animate-ping"></div>
           <div className="relative bg-white p-6 rounded-full shadow-xl border border-gray-100">
              <Sparkles className="w-12 h-12 text-primary animate-pulse" />
           </div>
       </div>
       <h3 className="text-3xl font-bold text-gray-900 font-heading">Optimizing Your Profile</h3>
       <p className="text-gray-500 mt-3 max-w-md text-center text-lg">
         Infusing keywords, restructuring bullets, and formatting for success...
       </p>
    </div>
  );

  const renderEditor = () => {
    if (!session.improvedResume) return null;

    return (
      <div className="bg-gray-50 min-h-screen pb-20">
        {/* Toolbar - Hidden when printing */}
        <div className="bg-white/90 backdrop-blur-md border-b border-gray-200 px-4 py-4 sticky top-16 z-40 shadow-sm no-print">
           <div className="max-w-7xl mx-auto flex flex-col md:flex-row justify-between items-center gap-4">
              <div className="flex items-center">
                 <button onClick={() => setStage(AnalysisStage.RESULTS)} className="text-gray-500 hover:text-gray-900 mr-4 bg-gray-100 p-2 rounded-lg transition-colors hover:bg-gray-200">
                    <ArrowLeft className="w-5 h-5" />
                 </button>
                 <div className="flex flex-col">
                    <div className="flex items-center gap-3">
                        <span className="font-bold text-gray-900 text-lg">Final Review</span>
                        <span className="px-2.5 py-0.5 bg-green-100 text-green-700 text-xs font-bold uppercase rounded-md tracking-wide border border-green-200">
                            Score: {session.analysis?.score ? Math.min(session.analysis.score + 25, 98) : 95}
                        </span>
                    </div>
                    <span className="text-xs text-gray-500 font-medium mt-0.5">Target: {session.targetRole || "Job Description"}</span>
                 </div>
              </div>
              
              <div className="flex items-center bg-gray-100 p-1 rounded-xl">
                  <button 
                     onClick={() => setIsEditing(false)}
                     className={`px-6 py-2 rounded-lg text-sm font-medium transition-all ${!isEditing ? 'bg-white text-primary shadow-sm' : 'text-gray-500 hover:text-gray-900'}`}
                  >
                     Preview
                  </button>
                  <button 
                     onClick={() => setIsEditing(true)}
                     className={`px-6 py-2 rounded-lg text-sm font-medium transition-all flex items-center gap-2 ${isEditing ? 'bg-white text-primary shadow-sm' : 'text-gray-500 hover:text-gray-900'}`}
                  >
                     Edit
                  </button>
              </div>

              <div className="flex gap-3">
                 <button 
                   onClick={handleDownloadJSON}
                   className="px-5 py-2.5 bg-white border border-gray-200 text-gray-700 rounded-xl hover:bg-gray-50 flex items-center text-sm font-bold transition-colors shadow-sm"
                 >
                    <Code className="w-4 h-4 mr-2 text-gray-400" /> JSON
                 </button>
                 <button 
                   onClick={handleDownloadPDF}
                   className="px-6 py-2.5 bg-gray-900 text-white rounded-xl hover:bg-gray-800 flex items-center text-sm font-bold shadow-lg shadow-gray-500/20 transition-all transform active:scale-95"
                 >
                    <Download className="w-4 h-4 mr-2" /> Save PDF
                 </button>
              </div>
           </div>
        </div>

        <div className="max-w-7xl mx-auto px-4 py-8 flex flex-col lg:flex-row gap-8 main-content-wrapper">
           {/* Sidebar (Left) - Hidden in print */}
           <div className="w-full lg:w-[380px] space-y-6 no-print flex-shrink-0 sidebar-container">
              
              {isEditing ? (
                <div className="bg-white rounded-2xl shadow-lg shadow-gray-200/50 border border-gray-100 overflow-hidden flex flex-col max-h-[calc(100vh-140px)] sticky top-32">
                     <div className="p-4 border-b border-gray-100 bg-gray-50/50 flex justify-between items-center">
                        <h3 className="font-bold text-gray-900 flex items-center">
                           <Edit className="w-4 h-4 text-primary mr-2" /> Edit Data
                        </h3>
                        <button onClick={() => setIsEditing(false)} className="text-xs text-white bg-primary px-2 py-1 rounded-md font-medium hover:bg-blue-600">Done</button>
                     </div>
                     <div className="p-4 overflow-y-auto custom-scrollbar space-y-6">
                         {/* Edit Summary */}
                         <div>
                            <label className="block text-xs font-bold text-gray-500 uppercase mb-2">Summary</label>
                            <textarea 
                                className="w-full text-sm p-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-primary/20 focus:border-primary min-h-[150px] leading-relaxed"
                                value={session.improvedResume.summary}
                                onChange={(e) => handleUpdateResume('summary', e.target.value)}
                            />
                         </div>
                         {/* Edit Experience */}
                         <div>
                            <label className="block text-xs font-bold text-gray-500 uppercase mb-2">Experience Details</label>
                            {session.improvedResume.experience.map((exp, i) => (
                                <div key={i} className="mb-6 border-b border-gray-100 pb-6 last:border-0 last:pb-0">
                                    <div className="font-bold text-sm text-gray-900 mb-2">{exp.role} <span className="text-gray-400 font-normal">at</span> {exp.company}</div>
                                    <div className="space-y-3">
                                        {exp.details.map((detail, j) => (
                                            <div key={j} className="relative group">
                                                <textarea
                                                    className="w-full text-xs p-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-primary/20 focus:border-primary min-h-[80px] leading-relaxed bg-gray-50 group-hover:bg-white transition-colors"
                                                    value={detail}
                                                    onChange={(e) => handleUpdateResume('experience', e.target.value, i, 'details', j)}
                                                />
                                            </div>
                                        ))}
                                    </div>
                                </div>
                            ))}
                         </div>
                     </div>
                </div>
              ) : (
                <>
                    {/* KEYWORDS BOX */}
                    <div className="bg-white p-6 rounded-2xl shadow-lg shadow-gray-200/50 border border-gray-100">
                        <h3 className="font-bold text-gray-900 mb-4 flex items-center text-sm uppercase tracking-wider">
                            <CheckCircle className="w-4 h-4 text-green-500 mr-2" /> Optimized Keywords
                        </h3>
                        <div className="flex flex-wrap gap-2">
                            {session.analysis?.missingKeywords.map(k => (
                            <span key={k} className="text-xs bg-green-50 text-green-700 px-2.5 py-1 rounded-md border border-green-100 font-bold shadow-sm">
                                {k}
                            </span>
                            ))}
                            {session.analysis?.matchingKeywords.slice(0, 15).map(k => (
                            <span key={k} className="text-xs bg-gray-50 text-gray-600 px-2.5 py-1 rounded-md border border-gray-100">
                                {k}
                            </span>
                            ))}
                        </div>
                        <div className="mt-4 bg-blue-50 p-3 rounded-xl border border-blue-100">
                            <p className="text-xs text-blue-700 font-medium leading-relaxed">
                                <Sparkles className="w-3 h-3 inline mr-1" />
                                AI has naturally integrated these high-value keywords into your resume to pass ATS filters.
                            </p>
                        </div>
                    </div>

                    {/* HIGHLIGHTS BOX */}
                    <div className="bg-white p-6 rounded-2xl shadow-lg shadow-gray-200/50 border border-gray-100">
                        <h3 className="font-bold text-gray-900 mb-4 flex items-center text-sm uppercase tracking-wider">
                            <Zap className="w-4 h-4 text-amber-500 mr-2" /> Enhancements
                        </h3>
                        <div className="space-y-4">
                            <div className="flex gap-3 items-start">
                                <div className="w-6 h-6 rounded-full bg-purple-50 text-purple-600 flex items-center justify-center text-xs font-bold shrink-0">1</div>
                                <div>
                                    <span className="font-bold text-gray-800 text-sm">Strong Action Verbs</span>
                                    <p className="text-gray-500 text-xs mt-1 leading-relaxed">Replaced passive language with authoritative terms like "Orchestrated" & "Spearheaded".</p>
                                </div>
                            </div>
                            <div className="flex gap-3 items-start">
                                <div className="w-6 h-6 rounded-full bg-purple-50 text-purple-600 flex items-center justify-center text-xs font-bold shrink-0">2</div>
                                <div>
                                    <span className="font-bold text-gray-800 text-sm">Quantifiable Metrics</span>
                                    <p className="text-gray-500 text-xs mt-1 leading-relaxed">Added performance indicators (e.g., "Improved efficiency by 20%") where relevant.</p>
                                </div>
                            </div>
                            
                            <div className="mt-2 pt-4 border-t border-gray-50">
                                <button onClick={() => setIsEditing(true)} className="w-full py-2.5 border border-gray-200 text-gray-600 rounded-xl text-sm font-semibold hover:bg-gray-50 hover:text-primary hover:border-primary/30 transition-colors">
                                    Make Manual Edits
                                </button>
                            </div>
                        </div>
                    </div>
                </>
              )}
           </div>

           {/* Preview (Right/Center) */}
           <div className="flex-1 flex justify-center">
               <div id="resume-preview-area">
                  <ResumePreview data={session.improvedResume} />
               </div>
           </div>
        </div>
      </div>
    );
  };

  return (
    <div className="min-h-screen bg-[#F8FAFC] font-sans text-gray-900 selection:bg-primary/20">
      <Navbar currentStage={stage} setStage={setStage} />
      
      <main>
        {stage === AnalysisStage.LANDING && renderLanding()}
        {stage === AnalysisStage.DASHBOARD && renderDashboard()}
        {stage === AnalysisStage.UPLOAD && renderUpload()}
        {stage === AnalysisStage.ANALYZING && renderAnalyzing()}
        {stage === AnalysisStage.RESULTS && renderResults()}
        {stage === AnalysisStage.GENERATING && renderGenerating()}
        {stage === AnalysisStage.EDIT_PREVIEW && renderEditor()}
      </main>
    </div>
  );
};

export default App;