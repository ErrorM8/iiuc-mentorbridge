'use client';
import { useEffect, useState, useCallback } from 'react';
import axios from 'axios';
import { useRouter } from 'next/navigation';
import { Plus, X, Search, ShoppingBag, Tag, Trash2, Check, Share2, ChevronLeft, ChevronRight, MessageSquare, Filter } from 'lucide-react';
import Sidebar from '../components/Sidebar';
// import Footer from '../components/Footer';
import Avatar from '../components/Avatar';
import Link from 'next/link';

const CATEGORIES = ['All','Books','Electronics','Clothing','Stationery','Food','Services','Other'];

function ImageCarousel({ images, onImageClick }) {
  const [current, setCurrent] = useState(0);
  if (!images || images.length === 0) return null;
  return (
    <div style={{position:'relative',borderRadius:'10px 10px 0 0',overflow:'hidden',background:'rgba(0,0,0,0.3)'}}>
      <img src={images[current].url} alt="" style={{width:'100%',height:'180px',objectFit:'cover',display:'block',cursor:'zoom-in'}} onClick={()=>onImageClick?.(current)}/>
      {images.length > 1 && (
        <>
          <button onClick={e=>{e.stopPropagation();setCurrent(p=>(p-1+images.length)%images.length);}} style={{position:'absolute',left:'0.4rem',top:'50%',transform:'translateY(-50%)',background:'rgba(0,0,0,0.6)',border:'none',color:'white',borderRadius:'50%',width:'26px',height:'26px',cursor:'pointer',display:'flex',alignItems:'center',justifyContent:'center'}}><ChevronLeft size={13}/></button>
          <button onClick={e=>{e.stopPropagation();setCurrent(p=>(p+1)%images.length);}} style={{position:'absolute',right:'0.4rem',top:'50%',transform:'translateY(-50%)',background:'rgba(0,0,0,0.6)',border:'none',color:'white',borderRadius:'50%',width:'26px',height:'26px',cursor:'pointer',display:'flex',alignItems:'center',justifyContent:'center'}}><ChevronRight size={13}/></button>
          <div style={{position:'absolute',bottom:'0.4rem',left:'50%',transform:'translateX(-50%)',display:'flex',gap:'0.25rem'}}>
            {images.map((_,i)=>(
              <button key={i} onClick={e=>{e.stopPropagation();setCurrent(i);}} style={{width:i===current?'16px':'5px',height:'5px',borderRadius:'999px',background:i===current?'#22c55e':'rgba(255,255,255,0.5)',border:'none',cursor:'pointer',padding:0,transition:'all 0.2s'}}/>
            ))}
          </div>
        </>
      )}
    </div>
  );
}

export default function MarketPage() {
  const router = useRouter();
  const [user, setUser] = useState(null);
  const [token, setToken] = useState('');
  const [items, setItems] = useState([]);
  const [myItems, setMyItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [tab, setTab] = useState('browse');
  const [search, setSearch] = useState('');
  const [category, setCategory] = useState('All');
  const [showForm, setShowForm] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [lightbox, setLightbox] = useState(null);
  const [form, setForm] = useState({ title:'', description:'', price:'', category:'Other' });
  const [images, setImages] = useState([]);
  const [previews, setPreviews] = useState([]);

  const fetchItems = useCallback(async (tkn) => {
    try {
      const [allRes, myRes] = await Promise.all([
        axios.get(`${process.env.NEXT_PUBLIC_API_URL}/market`, { headers: { Authorization: `Bearer ${tkn}` } }),
        axios.get(`${process.env.NEXT_PUBLIC_API_URL}/market/my`, { headers: { Authorization: `Bearer ${tkn}` } }),
      ]);
      setItems(allRes.data);
      setMyItems(myRes.data);
    } catch (err) { console.error(err); } finally { setLoading(false); }
  }, []);

  useEffect(() => {
    const tkn = localStorage.getItem('token');
    const userData = localStorage.getItem('user');
    if (!tkn) { router.push('/login'); return; }
    setToken(tkn);
    if (userData) setUser(JSON.parse(userData));
    fetchItems(tkn);
  }, [router, fetchItems]);

  const handleImageSelect = (e) => {
    const files = Array.from(e.target.files);
    if (files.length > 5) { alert('Max 5 images'); return; }
    setImages(files);
    setPreviews(files.map(f => URL.createObjectURL(f)));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSubmitting(true);
    const formData = new FormData();
    Object.entries(form).forEach(([k,v]) => formData.append(k, v));
    images.forEach(img => formData.append('images', img));
    try {
      const res = await axios.post(`${process.env.NEXT_PUBLIC_API_URL}/market`, formData, {
        headers: { Authorization: `Bearer ${token}`, 'Content-Type': 'multipart/form-data' }
      });
      setItems(prev => [res.data, ...prev]);
      setMyItems(prev => [res.data, ...prev]);
      setShowForm(false);
      setForm({ title:'', description:'', price:'', category:'Other' });
      setImages([]); setPreviews([]);
    } catch (err) { alert('Failed to post'); } finally { setSubmitting(false); }
  };

  const handleDelete = async (id) => {
    if (!confirm('Delete?')) return;
    try {
      await axios.delete(`${process.env.NEXT_PUBLIC_API_URL}/market/${id}`, { headers: { Authorization: `Bearer ${token}` } });
      setItems(prev => prev.filter(i => i.id !== id));
      setMyItems(prev => prev.filter(i => i.id !== id));
    } catch (err) { console.error(err); }
  };

  const handleMarkSold = async (id) => {
    try {
      await axios.put(`${process.env.NEXT_PUBLIC_API_URL}/market/${id}/sold`, {}, { headers: { Authorization: `Bearer ${token}` } });
      setMyItems(prev => prev.map(i => i.id===id ? { ...i, status:'sold' } : i));
      setItems(prev => prev.map(i => i.id===id ? { ...i, status:'sold' } : i));
    } catch (err) { console.error(err); }
  };

  const handleBuy = async (item) => {
    try {
      await axios.post(`${process.env.NEXT_PUBLIC_API_URL}/market/${item.id}/buy`, {}, { headers: { Authorization: `Bearer ${token}` } });
      router.push(`/messages?userId=${item.seller?.id}&userName=${encodeURIComponent(item.seller?.name)}`);
    } catch (err) { console.error(err); }
  };

  const filtered = (tab==='my' ? myItems : items).filter(item => {
    const matchSearch = item.title?.toLowerCase().includes(search.toLowerCase()) || item.description?.toLowerCase().includes(search.toLowerCase());
    const matchCat = category==='All' || item.category===category;
    return matchSearch && matchCat;
  });

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
                <ShoppingBag size={26} color="#22c55e"/> Marketplace
              </h2>
              <p style={{color:'var(--text2)',fontSize:'0.875rem'}}>Buy and sell within the IIUC community</p>
            </div>
            <button onClick={()=>setShowForm(true)} className="btn-primary" style={{padding:'0.55rem 1.25rem',fontSize:'0.875rem',display:'flex',alignItems:'center',gap:'0.4rem'}}>
              <Plus size={16}/> Sell Item
            </button>
          </div>

          {/* Tabs */}
          <div style={{display:'flex',gap:'0.35rem',marginBottom:'1.25rem',borderBottom:'1px solid rgba(34,197,94,0.1)',paddingBottom:'0.5rem'}}>
            {[
              {key:'browse',label:'Browse',count:items.length},
              {key:'my',label:'My Listings',count:myItems.length},
            ].map(t => (
              <button key={t.key} onClick={()=>setTab(t.key)} style={{
                display:'flex',alignItems:'center',gap:'0.35rem',
                background:tab===t.key?'rgba(34,197,94,0.12)':'transparent',
                border:'none',cursor:'pointer',padding:'0.4rem 0.875rem',borderRadius:'8px',
                fontSize:'0.82rem',fontWeight:tab===t.key?700:400,
                color:tab===t.key?'#22c55e':'var(--text2)',transition:'all 0.2s'
              }}>
                {t.label}
                <span style={{background:tab===t.key?'rgba(34,197,94,0.25)':'rgba(255,255,255,0.08)',color:tab===t.key?'#22c55e':'var(--text3)',borderRadius:'999px',padding:'0 6px',fontSize:'0.7rem',fontWeight:700}}>
                  {t.count}
                </span>
              </button>
            ))}
          </div>

          {/* Filters */}
          <div style={{display:'flex',gap:'0.6rem',marginBottom:'1.25rem',flexWrap:'wrap',alignItems:'center'}}>
            <div style={{position:'relative',flex:1,minWidth:'180px'}}>
              <Search size={14} style={{position:'absolute',left:'0.75rem',top:'50%',transform:'translateY(-50%)',color:'var(--text3)'}}/>
              <input type="text" placeholder="Search items..." value={search} onChange={e=>setSearch(e.target.value)} className="input-field" style={{paddingLeft:'2.25rem',borderRadius:'999px'}}/>
            </div>
            <div style={{display:'flex',gap:'0.4rem',flexWrap:'wrap'}}>
              {CATEGORIES.map(cat => (
                <button key={cat} onClick={()=>setCategory(cat)} style={{
                  padding:'0.35rem 0.75rem',borderRadius:'999px',border:`1px solid ${category===cat?'#22c55e':'rgba(255,255,255,0.1)'}`,
                  cursor:'pointer',fontSize:'0.78rem',fontWeight:category===cat?600:400,transition:'all 0.2s',
                  background:category===cat?'rgba(34,197,94,0.12)':'rgba(255,255,255,0.03)',
                  color:category===cat?'#22c55e':'var(--text2)'
                }}>{cat}</button>
              ))}
            </div>
          </div>

          {/* Items Grid */}
          {filtered.length === 0 ? (
            <div style={{textAlign:'center',padding:'4rem 1rem'}}>
              <ShoppingBag size={48} style={{color:'rgba(255,255,255,0.08)',margin:'0 auto 0.75rem',display:'block'}}/>
              <p style={{color:'var(--text2)',fontSize:'0.9rem',marginBottom:'0.5rem'}}>No items found</p>
              <button onClick={()=>setShowForm(true)} className="btn-primary" style={{padding:'0.5rem 1.25rem',fontSize:'0.85rem'}}>Post an Item</button>
            </div>
          ) : (
            <div style={{display:'grid',gridTemplateColumns:'repeat(auto-fill,minmax(260px,1fr))',gap:'0.875rem'}} className="stagger-children">
              {filtered.map((item,idx) => (
                <div key={item.id} className="glass-card pulse-hover" style={{overflow:'hidden',display:'flex',flexDirection:'column',animationDelay:`${idx*0.04}s`,position:'relative'}}>
                  {item.status==='sold' && (
                    <div style={{position:'absolute',top:'0.6rem',left:'0.6rem',zIndex:5,background:'rgba(239,68,68,0.9)',color:'white',borderRadius:'999px',padding:'2px 10px',fontSize:'0.7rem',fontWeight:700}}>SOLD</div>
                  )}
                  {item.images && item.images.length > 0 ? (
                    <ImageCarousel images={item.images} onImageClick={(i)=>setLightbox({images:item.images,index:i})}/>
                  ) : (
                    <div style={{height:'140px',background:'rgba(34,197,94,0.06)',display:'flex',alignItems:'center',justifyContent:'center',borderRadius:'10px 10px 0 0'}}>
                      <ShoppingBag size={36} color="rgba(34,197,94,0.25)"/>
                    </div>
                  )}
                  <div style={{padding:'0.875rem',flex:1,display:'flex',flexDirection:'column'}}>
                    <div style={{display:'flex',alignItems:'flex-start',justifyContent:'space-between',gap:'0.5rem',marginBottom:'0.4rem'}}>
                      <p style={{color:'white',fontWeight:700,fontSize:'0.9rem',fontFamily:"'Plus Jakarta Sans',sans-serif",flex:1,minWidth:0}}>{item.title}</p>
                      <p style={{color:'#22c55e',fontWeight:800,fontSize:'1rem',flexShrink:0}}>৳{item.price}</p>
                    </div>
                    <span style={{background:'rgba(34,197,94,0.1)',border:'1px solid rgba(34,197,94,0.2)',color:'#22c55e',borderRadius:'999px',padding:'1px 8px',fontSize:'0.68rem',fontWeight:600,display:'inline-block',marginBottom:'0.4rem',width:'fit-content'}}>
                      {item.category}
                    </span>
                    {item.description && (
                      <p style={{color:'var(--text2)',fontSize:'0.78rem',lineHeight:'1.5',flex:1,marginBottom:'0.75rem',overflow:'hidden',display:'-webkit-box',WebkitLineClamp:2,WebkitBoxOrient:'vertical'}}>
                        {item.description}
                      </p>
                    )}
                    <div style={{display:'flex',alignItems:'center',gap:'0.5rem',marginBottom:'0.65rem'}}>
                      <Link href={`/users/${item.seller?.id}`} style={{textDecoration:'none',display:'flex',alignItems:'center',gap:'0.4rem'}}>
                        <Avatar user={item.seller} size={22} radius="50%"/>
                        <span style={{color:'var(--text3)',fontSize:'0.72rem'}}>{item.seller?.name}</span>
                      </Link>
                    </div>
                    {item.seller?.id === user?.id ? (
                      <div style={{display:'flex',gap:'0.4rem'}}>
                        {item.status !== 'sold' && (
                          <button onClick={()=>handleMarkSold(item.id)} className="btn-outline" style={{flex:1,padding:'0.4rem',fontSize:'0.75rem',display:'flex',alignItems:'center',justifyContent:'center',gap:'0.3rem'}}>
                            <Check size={12}/> Mark Sold
                          </button>
                        )}
                        <button onClick={()=>handleDelete(item.id)} className="btn-danger" style={{padding:'0.4rem 0.65rem',fontSize:'0.75rem'}}>
                          <Trash2 size={13}/>
                        </button>
                      </div>
                    ) : item.status !== 'sold' && (
                      <div style={{display:'flex',gap:'0.4rem'}}>
                        <button onClick={()=>handleBuy(item)} className="btn-primary" style={{flex:1,padding:'0.45rem',fontSize:'0.8rem',display:'flex',alignItems:'center',justifyContent:'center',gap:'0.35rem'}}>
                          <MessageSquare size={13}/> Buy
                        </button>
                        <button onClick={()=>{ const text=`Check this on IIUC MentorBridge!\n${item.title} — ৳${item.price}`; navigator.clipboard.writeText(text); alert('Link copied!'); }} style={{padding:'0.45rem',borderRadius:'8px',background:'rgba(255,255,255,0.05)',border:'1px solid rgba(255,255,255,0.1)',color:'var(--text2)',cursor:'pointer',display:'flex',alignItems:'center'}}>
                          <Share2 size={13}/>
                        </button>
                      </div>
                    )}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
        {/* <Footer/> */}
      </div>

      {/* Sell Form Modal */}
      {showForm && (
        <div className="modal-overlay" onClick={()=>setShowForm(false)}>
          <div className="glass-card modal-content" style={{width:'100%',maxWidth:'520px',padding:'1.5rem',maxHeight:'90vh',overflowY:'auto'}} onClick={e=>e.stopPropagation()}>
            <div style={{display:'flex',justifyContent:'space-between',alignItems:'center',marginBottom:'1rem'}}>
              <h3 style={{color:'white',fontWeight:700,fontSize:'1.05rem',fontFamily:"'Plus Jakarta Sans',sans-serif"}}>📦 List an Item</h3>
              <button onClick={()=>setShowForm(false)} style={{background:'transparent',border:'none',color:'var(--text3)',cursor:'pointer'}}><X size={18}/></button>
            </div>
            <form onSubmit={handleSubmit} style={{display:'flex',flexDirection:'column',gap:'0.75rem'}}>
              <div>
                <label style={{color:'var(--text3)',fontSize:'0.72rem',fontWeight:600,display:'block',marginBottom:'0.3rem',textTransform:'uppercase',letterSpacing:'0.04em'}}>Title *</label>
                <input type="text" value={form.title} onChange={e=>setForm(p=>({...p,title:e.target.value}))} required className="input-field" placeholder="What are you selling?"/>
              </div>
              <div style={{display:'grid',gridTemplateColumns:'1fr 1fr',gap:'0.65rem'}}>
                <div>
                  <label style={{color:'var(--text3)',fontSize:'0.72rem',fontWeight:600,display:'block',marginBottom:'0.3rem',textTransform:'uppercase',letterSpacing:'0.04em'}}>Price (৳) *</label>
                  <input type="number" value={form.price} onChange={e=>setForm(p=>({...p,price:e.target.value}))} required className="input-field" placeholder="0"/>
                </div>
                <div>
                  <label style={{color:'var(--text3)',fontSize:'0.72rem',fontWeight:600,display:'block',marginBottom:'0.3rem',textTransform:'uppercase',letterSpacing:'0.04em'}}>Category</label>
                  <select value={form.category} onChange={e=>setForm(p=>({...p,category:e.target.value}))} className="input-field">
                    {CATEGORIES.filter(c=>c!=='All').map(c=><option key={c} value={c}>{c}</option>)}
                  </select>
                </div>
              </div>
              <div>
                <label style={{color:'var(--text3)',fontSize:'0.72rem',fontWeight:600,display:'block',marginBottom:'0.3rem',textTransform:'uppercase',letterSpacing:'0.04em'}}>Description</label>
                <textarea value={form.description} onChange={e=>setForm(p=>({...p,description:e.target.value}))} className="input-field" rows={3} style={{resize:'none'}} placeholder="Describe your item..."/>
              </div>
              <div>
                <label style={{color:'var(--text3)',fontSize:'0.72rem',fontWeight:600,display:'block',marginBottom:'0.3rem',textTransform:'uppercase',letterSpacing:'0.04em'}}>Photos (max 5)</label>
                <label style={{display:'flex',alignItems:'center',gap:'0.5rem',padding:'0.65rem',borderRadius:'10px',border:'1px dashed rgba(34,197,94,0.25)',cursor:'pointer',background:'rgba(34,197,94,0.04)',transition:'all 0.2s'}}
                  onMouseEnter={e=>e.currentTarget.style.borderColor='rgba(34,197,94,0.5)'}
                  onMouseLeave={e=>e.currentTarget.style.borderColor='rgba(34,197,94,0.25)'}>
                  <Plus size={16} color="#22c55e"/>
                  <span style={{color:'var(--text2)',fontSize:'0.82rem'}}>Add Photos</span>
                  <input type="file" accept="image/*" multiple onChange={handleImageSelect} style={{display:'none'}}/>
                </label>
                {previews.length > 0 && (
                  <div style={{display:'flex',gap:'0.4rem',flexWrap:'wrap',marginTop:'0.5rem'}}>
                    {previews.map((src,i) => (
                      <div key={i} style={{position:'relative'}}>
                        <img src={src} alt="" style={{width:'68px',height:'68px',objectFit:'cover',borderRadius:'8px',border:'1px solid rgba(34,197,94,0.25)'}}/>
                        <button type="button" onClick={()=>{ setImages(p=>p.filter((_,idx)=>idx!==i)); setPreviews(p=>p.filter((_,idx)=>idx!==i)); }} style={{position:'absolute',top:'-5px',right:'-5px',background:'#ef4444',border:'none',color:'white',borderRadius:'50%',width:'16px',height:'16px',cursor:'pointer',fontSize:'0.65rem',display:'flex',alignItems:'center',justifyContent:'center'}}>×</button>
                      </div>
                    ))}
                  </div>
                )}
              </div>
              <button type="submit" disabled={submitting} className="btn-primary" style={{width:'100%',padding:'0.65rem',fontSize:'0.875rem'}}>
                {submitting ? 'Posting...' : '📦 List Item for Sale'}
              </button>
            </form>
          </div>
        </div>
      )}

      {lightbox && (
        <div onClick={()=>setLightbox(null)} style={{position:'fixed',inset:0,background:'rgba(0,0,0,0.96)',zIndex:2000,display:'flex',alignItems:'center',justifyContent:'center'}}>
          <button onClick={()=>setLightbox(null)} style={{position:'absolute',top:'1rem',right:'1rem',background:'rgba(255,255,255,0.1)',border:'none',color:'white',borderRadius:'50%',width:'38px',height:'38px',cursor:'pointer',display:'flex',alignItems:'center',justifyContent:'center'}}><X size={18}/></button>
          <img src={lightbox.images[lightbox.index].url} alt="" onClick={e=>e.stopPropagation()} style={{maxWidth:'92vw',maxHeight:'88vh',objectFit:'contain',borderRadius:'10px'}}/>
        </div>
      )}
      <style>{`@keyframes spin{to{transform:rotate(360deg)}}`}</style>
    </div>
  );
}