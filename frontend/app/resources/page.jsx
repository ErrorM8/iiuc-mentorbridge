'use client';
import { useEffect, useState, useCallback } from 'react';
import axios from 'axios';
import { useRouter } from 'next/navigation';
import {
  BookOpen, FolderOpen, FileText, Upload, Search,
  ChevronRight, Bot, X, Loader, Download, Trash2,
  Plus, FolderPlus
} from 'lucide-react';
import Sidebar from '../components/Sidebar';
// import Footer from '../components/Footer';

const EXAM_TYPES = ['MID', 'FINAL'];

export default function ResourcesPage() {
  const router = useRouter();
  const [user, setUser] = useState(null);
  const [token, setToken] = useState('');
  const [loading, setLoading] = useState(true);

  const [examType, setExamType] = useState(null);
  const [departments, setDepartments] = useState([]);
  const [selectedDept, setSelectedDept] = useState(null);
  const [courses, setCourses] = useState([]);
  const [selectedCourse, setSelectedCourse] = useState(null);
  const [resources, setResources] = useState([]);
  const [searchResults, setSearchResults] = useState([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [searching, setSearching] = useState(false);

  const [showUpload, setShowUpload] = useState(false);
  const [showCreateCourse, setShowCreateCourse] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [creatingCourse, setCreatingCourse] = useState(false);
  const [uploadForm, setUploadForm] = useState({ title: '' });
  const [uploadFile, setUploadFile] = useState(null);
  const [newCourseName, setNewCourseName] = useState('');
  const [newCourseCode, setNewCourseCode] = useState('');

  const [summary, setSummary] = useState({});
  const [summaryLoading, setSummaryLoading] = useState({});

  const fetchDepartments = useCallback(async (tkn) => {
    try {
      const res = await axios.get(`${process.env.NEXT_PUBLIC_API_URL}/resources/departments`, {
        headers: { Authorization: `Bearer ${tkn}` }
      });
      setDepartments(res.data);
    } catch (err) { console.error(err); }
  }, []);

  useEffect(() => {
    const tkn = localStorage.getItem('token');
    const userData = localStorage.getItem('user');
    if (!tkn) { router.push('/login'); return; }
    setToken(tkn);
    if (userData) setUser(JSON.parse(userData));
    fetchDepartments(tkn).finally(() => setLoading(false));
  }, [router, fetchDepartments]);

  const selectExamType = (type) => {
    setExamType(type);
    setSelectedDept(null);
    setSelectedCourse(null);
    setResources([]);
    setCourses([]);
    setSearchResults([]);
    setSearchQuery('');
  };

  const selectDepartment = async (dept) => {
    setSelectedDept(dept);
    setSelectedCourse(null);
    setResources([]);
    try {
      const res = await axios.get(
        `${process.env.NEXT_PUBLIC_API_URL}/resources/courses?departmentId=${dept.id}&examType=${examType}`,
        { headers: { Authorization: `Bearer ${token}` } }
      );
      setCourses(res.data);
    } catch (err) { console.error(err); }
  };

  const selectCourse = async (course) => {
    setSelectedCourse(course);
    try {
      const res = await axios.get(
        `${process.env.NEXT_PUBLIC_API_URL}/resources?courseId=${course.id}`,
        { headers: { Authorization: `Bearer ${token}` } }
      );
      setResources(res.data);
    } catch (err) { console.error(err); }
  };

  const handleSearch = async (q) => {
    setSearchQuery(q);
    if (!q.trim()) { setSearchResults([]); return; }
    setSearching(true);
    try {
      const res = await axios.get(
        `${process.env.NEXT_PUBLIC_API_URL}/resources/search?q=${q}`,
        { headers: { Authorization: `Bearer ${token}` } }
      );
      setSearchResults(res.data);
    } catch (err) { console.error(err); } finally { setSearching(false); }
  };

  const handleCreateCourse = async (e) => {
    e.preventDefault();
    if (!newCourseName.trim()) return;
    setCreatingCourse(true);
    try {
      const res = await axios.post(
        `${process.env.NEXT_PUBLIC_API_URL}/resources/courses`,
        {
          name: newCourseName,
          code: newCourseCode || null,
          departmentId: selectedDept.id,
          examType: examType
        },
        { headers: { Authorization: `Bearer ${token}` } }
      );
      setCourses(prev => [...prev, res.data]);
      setShowCreateCourse(false);
      setNewCourseName('');
      setNewCourseCode('');
    } catch (err) {
      alert(err.response?.data?.message || 'Failed to create folder');
    } finally { setCreatingCourse(false); }
  };

  const handleUpload = async (e) => {
    e.preventDefault();
    if (!uploadFile) { alert('Please select a PDF file'); return; }
    setUploading(true);
    const formData = new FormData();
    formData.append('file', uploadFile);
    formData.append('title', uploadForm.title);
    formData.append('courseId', selectedCourse?.id);
    try {
      const res = await axios.post(
        `${process.env.NEXT_PUBLIC_API_URL}/resources/upload`,
        formData,
        { headers: { Authorization: `Bearer ${token}`, 'Content-Type': 'multipart/form-data' } }
      );
      setResources(prev => [res.data, ...prev]);
      setShowUpload(false);
      setUploadForm({ title: '' });
      setUploadFile(null);
    } catch (err) { alert('Upload failed'); } finally { setUploading(false); }
  };

  const handleDelete = async (id) => {
    if (!confirm('Delete?')) return;
    try {
      await axios.delete(
        `${process.env.NEXT_PUBLIC_API_URL}/resources/${id}`,
        { headers: { Authorization: `Bearer ${token}` } }
      );
      setResources(prev => prev.filter(r => r.id !== id));
    } catch (err) { console.error(err); }
  };

  const getSummary = async (resourceId) => {
    if (summary[resourceId]) return;
    setSummaryLoading(prev => ({ ...prev, [resourceId]: true }));
    try {
      const res = await axios.get(
        `${process.env.NEXT_PUBLIC_API_URL}/resources/${resourceId}/summary`,
        { headers: { Authorization: `Bearer ${token}` } }
      );
      setSummary(prev => ({ ...prev, [resourceId]: res.data.summary }));
    } catch (err) { console.error(err); } finally {
      setSummaryLoading(prev => ({ ...prev, [resourceId]: false }));
    }
  };

  const Breadcrumb = () => (
    <div style={{display:'flex',alignItems:'center',gap:'0.4rem',fontSize:'0.8rem',color:'var(--text3)',marginBottom:'1.25rem',flexWrap:'wrap'}}>
      <button onClick={()=>{setExamType(null);setSelectedDept(null);setSelectedCourse(null);setResources([]);setCourses([]);}}
        style={{background:'transparent',border:'none',color:!examType?'#22c55e':'var(--text3)',cursor:'pointer',padding:0,fontSize:'0.8rem',fontWeight:!examType?700:400}}>
        Resources
      </button>
      {examType && (
        <>
          <ChevronRight size={13}/>
          <button onClick={()=>{setSelectedDept(null);setSelectedCourse(null);setResources([]);setCourses([]);}}
            style={{background:'transparent',border:'none',color:!selectedDept?'#22c55e':'var(--text3)',cursor:'pointer',padding:0,fontSize:'0.8rem',fontWeight:!selectedDept?700:400}}>
            {examType}
          </button>
        </>
      )}
      {selectedDept && (
        <>
          <ChevronRight size={13}/>
          <button onClick={()=>{setSelectedCourse(null);setResources([]);}}
            style={{background:'transparent',border:'none',color:!selectedCourse?'#22c55e':'var(--text3)',cursor:'pointer',padding:0,fontSize:'0.8rem',fontWeight:!selectedCourse?700:400}}>
            {selectedDept.name}
          </button>
        </>
      )}
      {selectedCourse && (
        <>
          <ChevronRight size={13}/>
          <span style={{color:'#22c55e',fontWeight:700}}>{selectedCourse.name}</span>
        </>
      )}
    </div>
  );

  if (loading) return (
    <div className="page-bg" style={{display:'flex',alignItems:'center',justifyContent:'center'}}>
      <div style={{width:'40px',height:'40px',border:'3px solid rgba(34,197,94,0.2)',borderTop:'3px solid #22c55e',borderRadius:'50%',animation:'spin 0.8s linear infinite'}}/>
      <style>{`@keyframes spin{to{transform:rotate(360deg)}}`}</style>
    </div>
  );

  return (
    <div className="page-bg">
      <Sidebar user={user}/>
      <div className="main-with-sidebar">
        <div className="center-wrap" style={{flex:1,paddingTop:'2rem',paddingBottom:'3rem'}}>

          {/* Header */}
          <div style={{display:'flex',justifyContent:'space-between',alignItems:'flex-start',marginBottom:'1.5rem',flexWrap:'wrap',gap:'0.75rem'}}>
            <div>
              <h2 style={{fontFamily:"'Plus Jakarta Sans',sans-serif",fontWeight:800,fontSize:'1.6rem',color:'white',marginBottom:'0.3rem',display:'flex',alignItems:'center',gap:'0.5rem'}}>
                <BookOpen size={26} color="#22c55e"/> Resources
              </h2>
              <p style={{color:'var(--text2)',fontSize:'0.875rem'}}>Study materials organized by exam type, department, and course</p>
            </div>
            <div style={{display:'flex',gap:'0.5rem'}}>
              {/* Show "New Folder" when department is selected but course is not */}
              {selectedDept && !selectedCourse && (
                <button onClick={()=>setShowCreateCourse(true)} className="btn-outline"
                  style={{padding:'0.55rem 1.1rem',fontSize:'0.875rem',display:'flex',alignItems:'center',gap:'0.4rem'}}>
                  <FolderPlus size={16}/> New Folder
                </button>
              )}
              {/* Show "Upload PDF" when course is selected */}
              {selectedCourse && (
                <button onClick={()=>setShowUpload(true)} className="btn-primary"
                  style={{padding:'0.55rem 1.25rem',fontSize:'0.875rem',display:'flex',alignItems:'center',gap:'0.4rem'}}>
                  <Upload size={16}/> Upload PDF
                </button>
              )}
            </div>
          </div>

          {/* Search */}
          <div style={{position:'relative',marginBottom:'1.5rem'}}>
            <Search size={16} style={{position:'absolute',left:'1rem',top:'50%',transform:'translateY(-50%)',color:'var(--text3)'}}/>
            <input type="text" placeholder="Search resources across all departments..."
              value={searchQuery} onChange={e=>handleSearch(e.target.value)}
              className="input-field" style={{paddingLeft:'2.75rem',fontSize:'0.875rem',borderRadius:'999px'}}/>
            {searching && <Loader size={15} style={{position:'absolute',right:'1rem',top:'50%',transform:'translateY(-50%)',color:'#22c55e',animation:'spin 0.8s linear infinite'}}/>}
          </div>

          {/* Search Results */}
          {searchQuery && (
            <div style={{marginBottom:'1.5rem'}}>
              <p style={{color:'var(--text3)',fontSize:'0.75rem',fontWeight:700,textTransform:'uppercase',letterSpacing:'0.06em',marginBottom:'0.6rem'}}>
                Search Results ({searchResults.length})
              </p>
              {searchResults.length === 0 && !searching ? (
                <p style={{color:'var(--text3)',fontSize:'0.875rem'}}>No results found</p>
              ) : searchResults.map(r => (
                <ResourceCard key={r.id} resource={r} token={token} user={user}
                  onDelete={handleDelete} onSummary={getSummary}
                  summary={summary} summaryLoading={summaryLoading}/>
              ))}
            </div>
          )}

          {!searchQuery && (
            <>
              <Breadcrumb/>

              {/* Level 1: Exam Type */}
              {!examType && (
                <div style={{display:'grid',gridTemplateColumns:'repeat(auto-fill,minmax(220px,1fr))',gap:'0.875rem'}} className="stagger-children">
                  {EXAM_TYPES.map(type => (
                    <button key={type} onClick={()=>selectExamType(type)} style={{
                      padding:'2rem',borderRadius:'12px',background:'rgba(255,255,255,0.04)',
                      border:'1px solid rgba(34,197,94,0.2)',cursor:'pointer',textAlign:'left',
                      transition:'all 0.25s',display:'flex',flexDirection:'column',gap:'0.5rem'
                    }}
                      onMouseEnter={e=>{e.currentTarget.style.background='rgba(34,197,94,0.08)';e.currentTarget.style.borderColor='rgba(34,197,94,0.45)';e.currentTarget.style.transform='translateY(-3px)';}}
                      onMouseLeave={e=>{e.currentTarget.style.background='rgba(255,255,255,0.04)';e.currentTarget.style.borderColor='rgba(34,197,94,0.2)';e.currentTarget.style.transform='translateY(0)';}}>
                      <div style={{width:'48px',height:'48px',borderRadius:'12px',background:'rgba(34,197,94,0.12)',border:'1px solid rgba(34,197,94,0.2)',display:'flex',alignItems:'center',justifyContent:'center'}}>
                        <FileText size={24} color="#22c55e"/>
                      </div>
                      <p style={{color:'white',fontWeight:700,fontSize:'1.2rem',fontFamily:"'Plus Jakarta Sans',sans-serif"}}>{type} Exam</p>
                      <p style={{color:'var(--text3)',fontSize:'0.78rem'}}>Browse {type} study materials</p>
                    </button>
                  ))}
                </div>
              )}

              {/* Level 2: Departments */}
              {examType && !selectedDept && (
                <div style={{display:'grid',gridTemplateColumns:'repeat(auto-fill,minmax(200px,1fr))',gap:'0.75rem'}} className="stagger-children">
                  {departments.length === 0 ? (
                    <p style={{color:'var(--text3)',gridColumn:'1/-1'}}>No departments found</p>
                  ) : departments.map(dept => (
                    <button key={dept.id} onClick={()=>selectDepartment(dept)} style={{
                      padding:'1.25rem',borderRadius:'12px',background:'rgba(255,255,255,0.04)',
                      border:'1px solid rgba(34,197,94,0.15)',cursor:'pointer',textAlign:'left',
                      transition:'all 0.2s',display:'flex',alignItems:'center',gap:'0.75rem'
                    }}
                      onMouseEnter={e=>{e.currentTarget.style.background='rgba(34,197,94,0.08)';e.currentTarget.style.borderColor='rgba(34,197,94,0.35)';}}
                      onMouseLeave={e=>{e.currentTarget.style.background='rgba(255,255,255,0.04)';e.currentTarget.style.borderColor='rgba(34,197,94,0.15)';}}>
                      <div style={{width:'40px',height:'40px',borderRadius:'10px',background:'rgba(34,197,94,0.1)',display:'flex',alignItems:'center',justifyContent:'center',flexShrink:0}}>
                        <FolderOpen size={20} color="#22c55e"/>
                      </div>
                      <span style={{color:'white',fontWeight:600,fontSize:'0.875rem'}}>{dept.name}</span>
                    </button>
                  ))}
                </div>
              )}

              {/* Level 3: Courses/Folders */}
              {selectedDept && !selectedCourse && (
                <>
                <div style={{display:'flex',gap:'0.5rem'}}>
                  {/* New Folder button — show when dept selected but no course yet */}
                  {examType && selectedDept && !selectedCourse && (
                    <button onClick={()=>setShowCreateCourse(true)} className="btn-outline"
                      style={{padding:'0.55rem 1.1rem',fontSize:'0.875rem',display:'flex',alignItems:'center',gap:'0.4rem'}}>
                      <FolderPlus size={16}/> New Folder
                    </button>
                  )}
                  {selectedCourse && (
                    <button onClick={()=>setShowUpload(true)} className="btn-primary"
                      style={{padding:'0.55rem 1.25rem',fontSize:'0.875rem',display:'flex',alignItems:'center',gap:'0.4rem'}}>
                      <Upload size={16}/> Upload PDF
                    </button>
                  )}
                </div>
                  {courses.length === 0 ? (
                    <div className="glass-card" style={{padding:'3rem',textAlign:'center'}}>
                      <FolderOpen size={48} style={{color:'rgba(255,255,255,0.08)',margin:'0 auto 0.75rem',display:'block'}}/>
                      <p style={{color:'var(--text2)',fontSize:'0.875rem',marginBottom:'0.5rem'}}>No course folders yet</p>
                      <p style={{color:'var(--text3)',fontSize:'0.8rem',marginBottom:'1rem'}}>Create a folder for each course to organize materials</p>
                      <button onClick={()=>setShowCreateCourse(true)} className="btn-primary" style={{padding:'0.5rem 1.25rem',fontSize:'0.85rem',display:'inline-flex',alignItems:'center',gap:'0.4rem'}}>
                        <FolderPlus size={15}/> Create First Folder
                      </button>
                    </div>
                  ) : (
                    <div style={{display:'grid',gridTemplateColumns:'repeat(auto-fill,minmax(220px,1fr))',gap:'0.75rem'}} className="stagger-children">
                      {courses.map(course => (
                        <button key={course.id} onClick={()=>selectCourse(course)} style={{
                          padding:'1.25rem',borderRadius:'12px',background:'rgba(255,255,255,0.04)',
                          border:'1px solid rgba(34,197,94,0.15)',cursor:'pointer',textAlign:'left',
                          transition:'all 0.2s',display:'flex',alignItems:'center',gap:'0.75rem'
                        }}
                          onMouseEnter={e=>{e.currentTarget.style.background='rgba(34,197,94,0.08)';e.currentTarget.style.borderColor='rgba(34,197,94,0.35)';}}
                          onMouseLeave={e=>{e.currentTarget.style.background='rgba(255,255,255,0.04)';e.currentTarget.style.borderColor='rgba(34,197,94,0.15)';}}>
                          <div style={{width:'40px',height:'40px',borderRadius:'10px',background:'rgba(96,165,250,0.1)',display:'flex',alignItems:'center',justifyContent:'center',flexShrink:0}}>
                            <FolderOpen size={20} color="#60a5fa"/>
                          </div>
                          <div style={{minWidth:0,textAlign:'left'}}>
                            <p style={{color:'white',fontWeight:600,fontSize:'0.875rem',overflow:'hidden',textOverflow:'ellipsis',whiteSpace:'nowrap'}}>{course.name}</p>
                            {course.code && <p style={{color:'var(--text3)',fontSize:'0.72rem'}}>{course.code}</p>}
                          </div>
                        </button>
                      ))}
                    </div>
                  )}
                </>
              )}

              {/* Level 4: Resources/PDFs */}
              {selectedCourse && (
                <div>
                  <div style={{display:'flex',justifyContent:'space-between',alignItems:'center',marginBottom:'0.875rem'}}>
                    <p style={{color:'var(--text2)',fontSize:'0.85rem'}}>{resources.length} file{resources.length!==1?'s':''} in {selectedCourse.name}</p>
                    <button onClick={()=>setShowUpload(true)} className="btn-outline"
                      style={{padding:'0.4rem 0.875rem',fontSize:'0.8rem',display:'flex',alignItems:'center',gap:'0.35rem'}}>
                      <Plus size={14}/> Upload PDF
                    </button>
                  </div>
                  {resources.length === 0 ? (
                    <div className="glass-card" style={{padding:'3rem',textAlign:'center'}}>
                      <FileText size={44} style={{color:'rgba(255,255,255,0.08)',margin:'0 auto 0.75rem',display:'block'}}/>
                      <p style={{color:'var(--text2)',fontSize:'0.875rem',marginBottom:'0.5rem'}}>No PDFs uploaded yet</p>
                      <button onClick={()=>setShowUpload(true)} className="btn-primary"
                        style={{padding:'0.5rem 1.25rem',fontSize:'0.85rem',display:'inline-flex',alignItems:'center',gap:'0.4rem'}}>
                        <Upload size={15}/> Upload First PDF
                      </button>
                    </div>
                  ) : (
                    <div style={{display:'flex',flexDirection:'column',gap:'0.65rem'}} className="stagger-children">
                      {resources.map(r => (
                        <ResourceCard key={r.id} resource={r} token={token} user={user}
                          onDelete={handleDelete} onSummary={getSummary}
                          summary={summary} summaryLoading={summaryLoading}/>
                      ))}
                    </div>
                  )}
                </div>
              )}
            </>
          )}
        </div>
        {/* <Footer/> */}
      </div>

      {/* Create Course/Folder Modal */}
      {showCreateCourse && (
        <div className="modal-overlay" onClick={()=>setShowCreateCourse(false)}>
          <div className="glass-card modal-content" style={{width:'100%',maxWidth:'420px',padding:'1.5rem'}} onClick={e=>e.stopPropagation()}>
            <div style={{display:'flex',justifyContent:'space-between',alignItems:'center',marginBottom:'1rem'}}>
              <h3 style={{color:'white',fontWeight:700,fontSize:'1.05rem',fontFamily:"'Plus Jakarta Sans',sans-serif",display:'flex',alignItems:'center',gap:'0.4rem'}}>
                <FolderPlus size={18} color="#22c55e"/> Create Course Folder
              </h3>
              <button onClick={()=>setShowCreateCourse(false)} style={{background:'transparent',border:'none',color:'var(--text3)',cursor:'pointer'}}><X size={18}/></button>
            </div>

            <div style={{padding:'0.65rem',background:'rgba(34,197,94,0.06)',borderRadius:'10px',border:'1px solid rgba(34,197,94,0.15)',marginBottom:'1rem'}}>
              <p style={{color:'var(--text3)',fontSize:'0.72rem',marginBottom:'0.1rem'}}>Creating folder in</p>
              <p style={{color:'#22c55e',fontWeight:600,fontSize:'0.85rem'}}>{selectedDept?.name} → {examType} Exam</p>
            </div>

            <form onSubmit={handleCreateCourse} style={{display:'flex',flexDirection:'column',gap:'0.75rem'}}>
              <div>
                <label style={{color:'var(--text3)',fontSize:'0.72rem',fontWeight:600,display:'block',marginBottom:'0.3rem',textTransform:'uppercase',letterSpacing:'0.04em'}}>
                  Course Name *
                </label>
                <input type="text" value={newCourseName} onChange={e=>setNewCourseName(e.target.value)}
                  required className="input-field" placeholder="e.g. Data Structures & Algorithms" autoFocus/>
              </div>
              <div>
                <label style={{color:'var(--text3)',fontSize:'0.72rem',fontWeight:600,display:'block',marginBottom:'0.3rem',textTransform:'uppercase',letterSpacing:'0.04em'}}>
                  Course Code (optional)
                </label>
                <input type="text" value={newCourseCode} onChange={e=>setNewCourseCode(e.target.value)}
                  className="input-field" placeholder="e.g. CSE 301"/>
              </div>
              <button type="submit" disabled={creatingCourse||!newCourseName.trim()} className="btn-primary"
                style={{width:'100%',padding:'0.65rem',fontSize:'0.875rem',display:'flex',alignItems:'center',justifyContent:'center',gap:'0.4rem'}}>
                {creatingCourse ? <><Loader size={15} style={{animation:'spin 0.8s linear infinite'}}/> Creating...</> : <><FolderPlus size={15}/> Create Folder</>}
              </button>
            </form>
          </div>
        </div>
      )}

      {/* Upload PDF Modal */}
      {showUpload && (
        <div className="modal-overlay" onClick={()=>setShowUpload(false)}>
          <div className="glass-card modal-content" style={{width:'100%',maxWidth:'460px',padding:'1.5rem'}} onClick={e=>e.stopPropagation()}>
            <div style={{display:'flex',justifyContent:'space-between',alignItems:'center',marginBottom:'1rem'}}>
              <h3 style={{color:'white',fontWeight:700,fontSize:'1.05rem',fontFamily:"'Plus Jakarta Sans',sans-serif"}}>📤 Upload Resource</h3>
              <button onClick={()=>setShowUpload(false)} style={{background:'transparent',border:'none',color:'var(--text3)',cursor:'pointer'}}><X size={18}/></button>
            </div>

            {selectedCourse && (
              <div style={{padding:'0.65rem',background:'rgba(34,197,94,0.06)',borderRadius:'10px',border:'1px solid rgba(34,197,94,0.15)',marginBottom:'0.875rem'}}>
                <p style={{color:'var(--text3)',fontSize:'0.72rem',marginBottom:'0.1rem'}}>Uploading to</p>
                <p style={{color:'#22c55e',fontWeight:600,fontSize:'0.85rem'}}>{selectedDept?.name} → {examType} → {selectedCourse.name}</p>
              </div>
            )}

            <form onSubmit={handleUpload} style={{display:'flex',flexDirection:'column',gap:'0.75rem'}}>
              <div>
                <label style={{color:'var(--text3)',fontSize:'0.72rem',fontWeight:600,display:'block',marginBottom:'0.3rem',textTransform:'uppercase',letterSpacing:'0.04em'}}>Title *</label>
                <input type="text" value={uploadForm.title} onChange={e=>setUploadForm(p=>({...p,title:e.target.value}))}
                  required className="input-field" placeholder="e.g. Chapter 5 Notes — Binary Trees"/>
              </div>
              <div>
                <label style={{color:'var(--text3)',fontSize:'0.72rem',fontWeight:600,display:'block',marginBottom:'0.3rem',textTransform:'uppercase',letterSpacing:'0.04em'}}>PDF File *</label>
                <label style={{
                  display:'flex',alignItems:'center',gap:'0.5rem',padding:'0.875rem',
                  borderRadius:'10px',border:'1px dashed rgba(34,197,94,0.25)',
                  cursor:'pointer',background:'rgba(34,197,94,0.04)',transition:'all 0.2s'
                }}
                  onMouseEnter={e=>e.currentTarget.style.borderColor='rgba(34,197,94,0.5)'}
                  onMouseLeave={e=>e.currentTarget.style.borderColor='rgba(34,197,94,0.25)'}>
                  <Upload size={16} color="#22c55e"/>
                  <span style={{color:uploadFile?'#22c55e':'var(--text2)',fontSize:'0.85rem'}}>
                    {uploadFile ? uploadFile.name : 'Choose PDF file'}
                  </span>
                  <input type="file" accept=".pdf" onChange={e=>setUploadFile(e.target.files[0])} style={{display:'none'}}/>
                </label>
              </div>
              <button type="submit" disabled={uploading||!uploadFile} className="btn-primary"
                style={{width:'100%',padding:'0.65rem',fontSize:'0.875rem',display:'flex',alignItems:'center',justifyContent:'center',gap:'0.4rem'}}>
                {uploading ? <><Loader size={15} style={{animation:'spin 0.8s linear infinite'}}/> Uploading...</> : '📤 Upload Resource'}
              </button>
            </form>
          </div>
        </div>
      )}

      <style>{`@keyframes spin{to{transform:rotate(360deg)}}`}</style>
    </div>
  );
}

function ResourceCard({ resource, token, user, onDelete, onSummary, summary, summaryLoading }) {
  const [showSummary, setShowSummary] = useState(false);

  return (
    <div className="glass-card pulse-hover" style={{padding:'1rem'}}>
      <div style={{display:'flex',alignItems:'center',gap:'0.75rem'}}>
        <div style={{width:'42px',height:'42px',borderRadius:'10px',background:'rgba(239,68,68,0.1)',border:'1px solid rgba(239,68,68,0.2)',display:'flex',alignItems:'center',justifyContent:'center',flexShrink:0}}>
          <FileText size={20} color="#f87171"/>
        </div>
        <div style={{flex:1,minWidth:0}}>
          <p style={{color:'white',fontWeight:600,fontSize:'0.875rem',overflow:'hidden',textOverflow:'ellipsis',whiteSpace:'nowrap'}}>{resource.title}</p>
          <p style={{color:'var(--text3)',fontSize:'0.72rem'}}>
            {resource.course?.name} • {new Date(resource.createdAt).toLocaleDateString('en-US',{month:'short',day:'numeric',year:'numeric'})}
          </p>
        </div>
        <div style={{display:'flex',gap:'0.35rem',flexShrink:0}}>
          <button onClick={async()=>{setShowSummary(!showSummary);if(!showSummary)await onSummary(resource.id);}}
            style={{padding:'0.4rem 0.7rem',borderRadius:'8px',background:'rgba(167,139,250,0.1)',border:'1px solid rgba(167,139,250,0.25)',color:'#a78bfa',cursor:'pointer',fontSize:'0.75rem',display:'flex',alignItems:'center',gap:'0.3rem',transition:'all 0.2s'}}
            onMouseEnter={e=>e.currentTarget.style.background='rgba(167,139,250,0.2)'}
            onMouseLeave={e=>e.currentTarget.style.background='rgba(167,139,250,0.1)'}>
            <Bot size={13}/> AI
          </button>
          <a href={resource.fileUrl} target="_blank" rel="noreferrer"
            style={{padding:'0.4rem 0.7rem',borderRadius:'8px',background:'rgba(34,197,94,0.1)',border:'1px solid rgba(34,197,94,0.25)',color:'#22c55e',cursor:'pointer',fontSize:'0.75rem',display:'flex',alignItems:'center',gap:'0.3rem',textDecoration:'none',transition:'all 0.2s'}}
            onMouseEnter={e=>e.currentTarget.style.background='rgba(34,197,94,0.2)'}
            onMouseLeave={e=>e.currentTarget.style.background='rgba(34,197,94,0.1)'}>
            <Download size={13}/> PDF
          </a>
          {resource.userId === user?.id && (
            <button onClick={()=>onDelete(resource.id)}
              style={{padding:'0.4rem',borderRadius:'8px',background:'rgba(239,68,68,0.08)',border:'1px solid rgba(239,68,68,0.2)',color:'rgba(239,68,68,0.7)',cursor:'pointer',display:'flex',alignItems:'center',transition:'all 0.2s'}}
              onMouseEnter={e=>{e.currentTarget.style.background='rgba(239,68,68,0.15)';e.currentTarget.style.color='#f87171';}}
              onMouseLeave={e=>{e.currentTarget.style.background='rgba(239,68,68,0.08)';e.currentTarget.style.color='rgba(239,68,68,0.7)';}}>
              <Trash2 size={13}/>
            </button>
          )}
        </div>
      </div>
      {showSummary && (
        <div style={{marginTop:'0.75rem',padding:'0.875rem',background:'rgba(167,139,250,0.05)',borderRadius:'10px',border:'1px solid rgba(167,139,250,0.15)',animation:'fadeIn 0.3s ease'}}>
          <p style={{color:'#a78bfa',fontSize:'0.72rem',fontWeight:700,textTransform:'uppercase',letterSpacing:'0.06em',marginBottom:'0.4rem',display:'flex',alignItems:'center',gap:'0.35rem'}}>
            <Bot size={13}/> AI Summary
          </p>
          {summaryLoading[resource.id] ? (
            <div style={{display:'flex',alignItems:'center',gap:'0.5rem',color:'var(--text3)',fontSize:'0.82rem'}}>
              <Loader size={14} style={{animation:'spin 0.8s linear infinite'}}/> Generating...
            </div>
          ) : summary[resource.id] ? (
            <p style={{color:'var(--text2)',fontSize:'0.82rem',lineHeight:'1.65'}}>{summary[resource.id]}</p>
          ) : (
            <p style={{color:'var(--text3)',fontSize:'0.82rem'}}>Click AI to generate summary</p>
          )}
        </div>
      )}
    </div>
  );
}