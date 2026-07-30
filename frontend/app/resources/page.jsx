'use client';
import { useEffect, useState, useCallback } from 'react';
import axios from 'axios';
import { useRouter } from 'next/navigation';
import { BookOpen, FolderPlus, Upload, Brain, Download, ChevronRight, X, Plus, Trash2, FileText, Sparkles } from 'lucide-react';
import Navbar from '../components/Navbar';
import Footer from '../components/Footer';

export default function ResourcesPage() {
  const router = useRouter();
  const [user, setUser] = useState(null);
  const [token, setToken] = useState('');
  const [step, setStep] = useState('exam');
  const [examType, setExamType] = useState('');
  const [departments, setDepartments] = useState([]);
  const [selectedDept, setSelectedDept] = useState(null);
  const [courses, setCourses] = useState([]);
  const [selectedCourse, setSelectedCourse] = useState(null);
  const [resources, setResources] = useState([]);
  const [loading, setLoading] = useState(false);
  const [showNewCourse, setShowNewCourse] = useState(false);
  const [showUpload, setShowUpload] = useState(false);
  const [showSummary, setShowSummary] = useState(null);
  const [newCourseCode, setNewCourseCode] = useState('');
  const [newCourseName, setNewCourseName] = useState('');
  const [uploadFile, setUploadFile] = useState(null);
  const [uploadTitle, setUploadTitle] = useState('');
  const [uploading, setUploading] = useState(false);

  useEffect(() => {
    const tkn = localStorage.getItem('token');
    const userData = localStorage.getItem('user');
    if (!tkn) { router.push('/login'); return; }
    setToken(tkn);
    if (userData) setUser(JSON.parse(userData));
  }, [router]);

  const fetchDepartments = useCallback(async () => {
    setLoading(true);
    try {
      await axios.post(`${process.env.NEXT_PUBLIC_API_URL}/resources/departments/init`, {}, { headers: { Authorization: `Bearer ${token}` } });
      const res = await axios.get(`${process.env.NEXT_PUBLIC_API_URL}/resources/departments`, { headers: { Authorization: `Bearer ${token}` } });
      setDepartments(res.data);
    } catch (err) { console.error(err); } finally { setLoading(false); }
  }, [token]);

  const fetchCourses = useCallback(async (deptId) => {
    setLoading(true);
    try {
      const res = await axios.get(`${process.env.NEXT_PUBLIC_API_URL}/resources/courses?departmentId=${deptId}&examType=${examType}`, { headers: { Authorization: `Bearer ${token}` } });
      setCourses(res.data);
    } catch (err) { console.error(err); } finally { setLoading(false); }
  }, [token, examType]);

  const fetchResources = useCallback(async (courseId) => {
    setLoading(true);
    try {
      const res = await axios.get(`${process.env.NEXT_PUBLIC_API_URL}/resources?courseId=${courseId}&examType=${examType}`, { headers: { Authorization: `Bearer ${token}` } });
      setResources(res.data);
    } catch (err) { console.error(err); } finally { setLoading(false); }
  }, [token, examType]);

  const handleExamSelect = (type) => {
    setExamType(type);
    setStep('department');
    fetchDepartments();
  };

  const handleDeptSelect = (dept) => {
    setSelectedDept(dept);
    setStep('courses');
    fetchCourses(dept.id);
  };

  const handleCourseSelect = (course) => {
    setSelectedCourse(course);
    setStep('files');
    fetchResources(course.id);
  };

  const handleCreateCourse = async () => {
    if (!newCourseCode.trim()) return;
    try {
      await axios.post(`${process.env.NEXT_PUBLIC_API_URL}/resources/courses`, {
        code: newCourseCode,
        name: newCourseName || newCourseCode,
        departmentId: selectedDept.id,
      }, { headers: { Authorization: `Bearer ${token}` } });
      setNewCourseCode('');
      setNewCourseName('');
      setShowNewCourse(false);
      fetchCourses(selectedDept.id);
    } catch (err) { alert(err.response?.data?.message || 'Something went wrong'); }
  };

  const handleUpload = async () => {
    if (!uploadFile || !uploadTitle) return;
    setUploading(true);
    try {
      const formData = new FormData();
      formData.append('file', uploadFile);
      formData.append('title', uploadTitle);
      formData.append('courseId', selectedCourse.id);
      formData.append('examType', examType);
      await axios.post(`${process.env.NEXT_PUBLIC_API_URL}/resources/upload`, formData, {
        headers: { Authorization: `Bearer ${token}`, 'Content-Type': 'multipart/form-data' }
      });
      setUploadFile(null);
      setUploadTitle('');
      setShowUpload(false);
      fetchResources(selectedCourse.id);
    } catch (err) { alert('Upload failed'); } finally { setUploading(false); }
  };

  const handleDelete = async (resourceId) => {
    if (!confirm('Delete this resource?')) return;
    try {
      await axios.delete(`${process.env.NEXT_PUBLIC_API_URL}/resources/${resourceId}`, { headers: { Authorization: `Bearer ${token}` } });
      fetchResources(selectedCourse.id);
    } catch (err) { alert('Delete failed'); }
  };

  const Breadcrumb = () => (
    <div style={{display:'flex', alignItems:'center', gap:'0.4rem', marginBottom:'1rem', fontSize:'0.82rem', color:'rgba(255,255,255,0.45)', flexWrap:'wrap'}}>
      <span style={{cursor:'pointer'}} onClick={() => setStep('exam')}>Resources</span>
      {examType && <><ChevronRight size={12}/><span style={{cursor:'pointer'}} onClick={() => setStep('department')}>{examType}</span></>}
      {selectedDept && <><ChevronRight size={12}/><span style={{cursor:'pointer'}} onClick={() => { setStep('courses'); fetchCourses(selectedDept.id); }}>{selectedDept.name}</span></>}
      {selectedCourse && <><ChevronRight size={12}/><span style={{color:'#22c55e'}}>{selectedCourse.code}</span></>}
    </div>
  );

  return (
    <div className="page-bg">
      <Navbar user={user}/>
      <div className="center-wrap" style={{flex:1, paddingTop:'1.25rem', paddingBottom:'2rem'}}>
        <Breadcrumb/>

        {/* Step 1: Exam Type */}
        {step === 'exam' && (
          <div>
            <h2 className="heading-text" style={{fontSize:'1.25rem', marginBottom:'0.4rem'}}>📚 Resources</h2>
            <p style={{color:'rgba(255,255,255,0.4)', fontSize:'0.82rem', marginBottom:'1.5rem'}}>
              Browse study materials by exam type. Upload PDFs and get instant AI analysis!
            </p>
            <div style={{display:'grid', gridTemplateColumns:'1fr 1fr', gap:'1rem', maxWidth:'480px'}}>
              {[
                { type:'MID', icon:'📝', desc:'Midterm exam resources' },
                { type:'FINAL', icon:'📖', desc:'Final exam resources' }
              ].map(({type, icon, desc}) => (
                <div key={type} onClick={() => handleExamSelect(type)} className="glass-card"
                  style={{padding:'2rem', textAlign:'center', cursor:'pointer'}}>
                  <div style={{fontSize:'3rem', marginBottom:'0.75rem'}}>{icon}</div>
                  <h3 style={{color:'#22c55e', fontWeight:700, fontSize:'1.1rem'}}>{type}</h3>
                  <p style={{color:'rgba(255,255,255,0.4)', fontSize:'0.78rem', marginTop:'0.25rem'}}>{desc}</p>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Step 2: Departments */}
        {step === 'department' && (
          <div>
            <h2 className="heading-text" style={{fontSize:'1.1rem', marginBottom:'1rem'}}>Select Department</h2>
            {loading ? <p style={{color:'rgba(255,255,255,0.3)'}}>Loading...</p> : (
              <div style={{display:'grid', gridTemplateColumns:'repeat(auto-fill, minmax(150px,1fr))', gap:'0.65rem'}}>
                {departments.map(dept => (
                  <div key={dept.id} onClick={() => handleDeptSelect(dept)} className="glass-card"
                    style={{padding:'1.25rem', textAlign:'center', cursor:'pointer'}}>
                    <div style={{fontSize:'2rem', marginBottom:'0.5rem'}}>🏛️</div>
                    <h3 style={{color:'white', fontWeight:600, fontSize:'0.9rem'}}>{dept.name}</h3>
                    <p style={{color:'rgba(255,255,255,0.3)', fontSize:'0.72rem', marginTop:'0.2rem'}}>{dept._count.courses} courses</p>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {/* Step 3: Courses */}
        {step === 'courses' && (
          <div>
            <div style={{display:'flex', justifyContent:'space-between', alignItems:'center', marginBottom:'1rem'}}>
              <h2 className="heading-text" style={{fontSize:'1.1rem'}}>{selectedDept?.name} — {examType}</h2>
              <button onClick={() => setShowNewCourse(true)} className="btn-primary" style={{padding:'0.45rem 1rem', fontSize:'0.82rem'}}>
                <FolderPlus size={14}/> New Course
              </button>
            </div>
            {loading ? <p style={{color:'rgba(255,255,255,0.3)'}}>Loading...</p> : courses.length === 0 ? (
              <div style={{textAlign:'center', padding:'3rem'}}>
                <BookOpen size={40} style={{color:'rgba(255,255,255,0.1)', margin:'0 auto 0.75rem', display:'block'}}/>
                <p style={{color:'rgba(255,255,255,0.3)', marginBottom:'1rem'}}>No courses yet. Create the first folder!</p>
                <button onClick={() => setShowNewCourse(true)} className="btn-primary" style={{padding:'0.5rem 1.25rem'}}>
                  <Plus size={14}/> Create Course Folder
                </button>
              </div>
            ) : (
              <div style={{display:'grid', gridTemplateColumns:'repeat(auto-fill, minmax(170px,1fr))', gap:'0.65rem'}}>
                {courses.map(course => (
                  <div key={course.id} onClick={() => handleCourseSelect(course)} className="glass-card"
                    style={{padding:'1.25rem', cursor:'pointer'}}>
                    <div style={{fontSize:'1.75rem', marginBottom:'0.5rem'}}>📁</div>
                    <h3 style={{color:'#22c55e', fontWeight:700, fontSize:'0.95rem'}}>{course.code}</h3>
                    <p style={{color:'rgba(255,255,255,0.5)', fontSize:'0.75rem', marginTop:'0.2rem'}}>{course.name}</p>
                    <p style={{color:'rgba(255,255,255,0.25)', fontSize:'0.7rem', marginTop:'0.35rem'}}>
                      {course._count.resources} files
                    </p>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {/* Step 4: Files */}
        {step === 'files' && (
          <div>
            <div style={{display:'flex', justifyContent:'space-between', alignItems:'center', marginBottom:'1rem', flexWrap:'wrap', gap:'0.5rem'}}>
              <div>
                <h2 className="heading-text" style={{fontSize:'1.1rem'}}>{selectedCourse?.code}</h2>
                <p style={{color:'rgba(255,255,255,0.35)', fontSize:'0.78rem'}}>{selectedCourse?.name} — {examType}</p>
              </div>
              <button onClick={() => setShowUpload(true)} className="btn-primary" style={{padding:'0.45rem 1rem', fontSize:'0.82rem'}}>
                <Upload size={14}/> Upload PDF
              </button>
            </div>

            {loading ? <p style={{color:'rgba(255,255,255,0.3)'}}>Loading...</p> : resources.length === 0 ? (
              <div style={{textAlign:'center', padding:'3rem'}}>
                <FileText size={40} style={{color:'rgba(255,255,255,0.1)', margin:'0 auto 0.75rem', display:'block'}}/>
                <p style={{color:'rgba(255,255,255,0.3)'}}>No files yet. Be the first to upload!</p>
              </div>
            ) : (
              <div style={{display:'flex', flexDirection:'column', gap:'0.65rem'}}>
                {resources.map(resource => (
                  <div key={resource.id} className="feed-card">
                    <div style={{display:'flex', alignItems:'center', gap:'0.75rem'}}>
                      <div style={{fontSize:'2rem', flexShrink:0}}>📄</div>
                      <div style={{flex:1, minWidth:0}}>
                        <p style={{color:'white', fontWeight:600, fontSize:'0.9rem'}}>{resource.title}</p>
                        <p style={{color:'rgba(255,255,255,0.35)', fontSize:'0.72rem'}}>
                          Uploaded by {resource.user?.name} • {new Date(resource.createdAt).toLocaleDateString()}
                        </p>
                        {resource.aiSummary && (
                          <p style={{color:'rgba(34,197,94,0.7)', fontSize:'0.7rem', marginTop:'0.2rem', display:'flex', alignItems:'center', gap:'0.3rem'}}>
                            <Sparkles size={10}/> AI Analysis available
                          </p>
                        )}
                      </div>
                      <div style={{display:'flex', gap:'0.4rem', flexShrink:0}}>
                        {resource.aiSummary && (
                          <button onClick={() => setShowSummary(resource)} className="btn-outline"
                            style={{padding:'0.4rem 0.6rem', fontSize:'0.75rem'}}>
                            <Brain size={13}/>
                          </button>
                        )}
                        <a href={resource.fileUrl} target="_blank" rel="noreferrer" className="btn-primary"
                          style={{padding:'0.4rem 0.75rem', fontSize:'0.78rem', textDecoration:'none', display:'flex', alignItems:'center', gap:'0.3rem'}}>
                          <Download size={13}/> View
                        </a>
                        {resource.user?.id === user?.id && (
                          <button onClick={() => handleDelete(resource.id)} className="btn-danger"
                            style={{padding:'0.4rem 0.6rem', fontSize:'0.78rem'}}>
                            <Trash2 size={13}/>
                          </button>
                        )}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {/* Modal: New Course */}
        {showNewCourse && (
          <div style={{position:'fixed', inset:0, background:'rgba(0,0,0,0.7)', display:'flex', alignItems:'center', justifyContent:'center', zIndex:50, padding:'1rem'}}>
            <div className="glass-card" style={{width:'100%', maxWidth:'400px', padding:'1.5rem'}}>
              <div style={{display:'flex', justifyContent:'space-between', alignItems:'center', marginBottom:'1rem'}}>
                <h3 style={{color:'#22c55e', fontWeight:700}}>Create Course Folder</h3>
                <button onClick={() => setShowNewCourse(false)} style={{background:'transparent', border:'none', color:'rgba(255,255,255,0.5)', cursor:'pointer'}}><X size={18}/></button>
              </div>
              <div style={{display:'flex', flexDirection:'column', gap:'0.75rem'}}>
                <div>
                  <label style={{color:'rgba(255,255,255,0.6)', fontSize:'0.78rem', display:'block', marginBottom:'0.3rem'}}>Course Code *</label>
                  <input type="text" value={newCourseCode} onChange={(e) => setNewCourseCode(e.target.value.toUpperCase())}
                    className="input-field" placeholder="e.g. CSE-1101" autoFocus/>
                </div>
                <div>
                  <label style={{color:'rgba(255,255,255,0.6)', fontSize:'0.78rem', display:'block', marginBottom:'0.3rem'}}>Course Name (Optional)</label>
                  <input type="text" value={newCourseName} onChange={(e) => setNewCourseName(e.target.value)}
                    className="input-field" placeholder="e.g. Introduction to Programming"/>
                </div>
                <button onClick={handleCreateCourse} className="btn-primary" style={{width:'100%', padding:'0.6rem'}}>
                  <FolderPlus size={14}/> Create Folder
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Modal: Upload */}
        {showUpload && (
          <div style={{position:'fixed', inset:0, background:'rgba(0,0,0,0.7)', display:'flex', alignItems:'center', justifyContent:'center', zIndex:50, padding:'1rem'}}>
            <div className="glass-card" style={{width:'100%', maxWidth:'420px', padding:'1.5rem'}}>
              <div style={{display:'flex', justifyContent:'space-between', alignItems:'center', marginBottom:'0.5rem'}}>
                <h3 style={{color:'#22c55e', fontWeight:700}}>Upload PDF</h3>
                <button onClick={() => setShowUpload(false)} style={{background:'transparent', border:'none', color:'rgba(255,255,255,0.5)', cursor:'pointer'}}><X size={18}/></button>
              </div>
              <p style={{color:'rgba(255,255,255,0.35)', fontSize:'0.75rem', marginBottom:'1rem', display:'flex', alignItems:'center', gap:'0.3rem'}}>
                <Sparkles size={12} color="#22c55e"/> AI will automatically analyze your PDF after upload
              </p>
              <div style={{display:'flex', flexDirection:'column', gap:'0.75rem'}}>
                <div>
                  <label style={{color:'rgba(255,255,255,0.6)', fontSize:'0.78rem', display:'block', marginBottom:'0.3rem'}}>Title *</label>
                  <input type="text" value={uploadTitle} onChange={(e) => setUploadTitle(e.target.value)}
                    className="input-field" placeholder="e.g. Mid 2023 Question Paper"/>
                </div>
                <div>
                  <label style={{color:'rgba(255,255,255,0.6)', fontSize:'0.78rem', display:'block', marginBottom:'0.3rem'}}>PDF File *</label>
                  <label style={{
                    display:'flex', alignItems:'center', gap:'0.65rem',
                    background:'rgba(255,255,255,0.04)', border:'1px dashed rgba(34,197,94,0.3)',
                    borderRadius:'10px', padding:'0.875rem 1rem', cursor:'pointer'
                  }}>
                    <Upload size={18} color="#22c55e"/>
                    <span style={{color: uploadFile ? '#22c55e' : 'rgba(255,255,255,0.35)', fontSize:'0.82rem'}}>
                      {uploadFile ? uploadFile.name : 'Click to select PDF file'}
                    </span>
                    <input type="file" accept=".pdf" onChange={(e) => setUploadFile(e.target.files[0])} style={{display:'none'}}/>
                  </label>
                </div>
                <button onClick={handleUpload} disabled={uploading || !uploadFile || !uploadTitle} className="btn-primary" style={{width:'100%', padding:'0.6rem'}}>
                  {uploading ? '⏳ Uploading & Analyzing...' : <><Upload size={14}/> Upload PDF</>}
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Modal: AI Summary */}
        {showSummary && (
          <div style={{position:'fixed', inset:0, background:'rgba(0,0,0,0.7)', display:'flex', alignItems:'center', justifyContent:'center', zIndex:50, padding:'1rem'}}>
            <div className="glass-card" style={{width:'100%', maxWidth:'560px', padding:'1.5rem', maxHeight:'80vh', overflowY:'auto'}}>
              <div style={{display:'flex', justifyContent:'space-between', alignItems:'center', marginBottom:'1rem'}}>
                <div>
                  <h3 style={{color:'#22c55e', fontWeight:700, display:'flex', alignItems:'center', gap:'0.4rem'}}>
                    <Brain size={16}/> AI Analysis
                  </h3>
                  <p style={{color:'rgba(255,255,255,0.4)', fontSize:'0.75rem'}}>{showSummary.title}</p>
                </div>
                <button onClick={() => setShowSummary(null)} style={{background:'transparent', border:'none', color:'rgba(255,255,255,0.5)', cursor:'pointer'}}><X size={18}/></button>
              </div>
              <div style={{background:'rgba(34,197,94,0.06)', border:'1px solid rgba(34,197,94,0.15)', borderRadius:'12px', padding:'1rem'}}>
                <p style={{color:'rgba(255,255,255,0.82)', fontSize:'0.85rem', lineHeight:'1.7', whiteSpace:'pre-line'}}>
                  {showSummary.aiSummary}
                </p>
              </div>
              <p style={{color:'rgba(255,255,255,0.2)', fontSize:'0.72rem', marginTop:'0.75rem', textAlign:'center'}}>
                💡 Ask more questions about this course in AI Mentor!
              </p>
            </div>
          </div>
        )}

      </div>
      <Footer/>
    </div>
  );
}