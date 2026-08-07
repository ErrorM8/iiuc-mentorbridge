'use client';
import { useEffect, useState, useCallback } from 'react';
import axios from 'axios';
import { useRouter } from 'next/navigation';
import { Plus, Search, ShoppingBag, Tag, X, Upload, Trash2, MessageSquare, Check, Share2, ChevronLeft, ChevronRight } from 'lucide-react';
import Navbar from '../components/Navbar';
import Footer from '../components/Footer';
import Avatar from '../components/Avatar';

const CATEGORIES = ['All', 'Books', 'Electronics', 'Clothes', 'Furniture', 'Stationery', 'Other'];
const CONDITIONS = ['All', 'New', 'Like New', 'Good', 'Fair', 'Poor'];

export default function MarketPage() {
  const router = useRouter();
  const [user, setUser] = useState(null);
  const [token, setToken] = useState('');
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [tab, setTab] = useState('browse');
  const [myItems, setMyItems] = useState([]);
  const [search, setSearch] = useState('');
  const [category, setCategory] = useState('all');
  const [condition, setCondition] = useState('all');
  const [showSell, setShowSell] = useState(false);
  const [showDetail, setShowDetail] = useState(null);
  const [buyMsg, setBuyMsg] = useState('');
  const [buyDone, setBuyDone] = useState({});
  const [selling, setSelling] = useState(false);
  const [buying, setBuying] = useState(false);
  const [sellForm, setSellForm] = useState({ title:'', description:'', price:'', condition:'New', category:'Books' });
  const [sellImages, setSellImages] = useState([]);
  const [sellPreviews, setSellPreviews] = useState([]);
  const [selectedImg, setSelectedImg] = useState(0);
  const [showShare, setShowShare] = useState(false);
  const [shareCopied, setShareCopied] = useState(false);

  const fetchItems = useCallback(async (tkn) => {
    try {
      const params = {};
      if (category !== 'all') params.category = category;
      if (condition !== 'all') params.condition = condition;
      if (search) params.search = search;
      const res = await axios.get(`${process.env.NEXT_PUBLIC_API_URL}/market`, {
        headers: { Authorization: `Bearer ${tkn}` }, params
      });
      setItems(res.data);
    } catch (err) { console.error(err); } finally { setLoading(false); }
  }, [category, condition, search]);

  const fetchMyItems = useCallback(async (tkn) => {
    try {
      const res = await axios.get(`${process.env.NEXT_PUBLIC_API_URL}/market/my`, {
        headers: { Authorization: `Bearer ${tkn}` }
      });
      setMyItems(res.data);
    } catch (err) { console.error(err); }
  }, []);

  useEffect(() => {
    const tkn = localStorage.getItem('token');
    const userData = localStorage.getItem('user');
    if (!tkn) { router.push('/login'); return; }
    setToken(tkn);
    if (userData) setUser(JSON.parse(userData));
    fetchItems(tkn);
    fetchMyItems(tkn);
  }, [router, fetchItems, fetchMyItems]);

  const handleImageSelect = (e) => {
    const files = Array.from(e.target.files);
    if (files.length > 5) { alert('Max 5 images'); return; }
    setSellImages(files);
    setSellPreviews(files.map(f => URL.createObjectURL(f)));
  };

  const handleSell = async (e) => {
    e.preventDefault();
    if (!sellForm.title || !sellForm.price) return;
    setSelling(true);
    try {
      const formData = new FormData();
      Object.entries(sellForm).forEach(([k, v]) => formData.append(k, v));
      sellImages.forEach(img => formData.append('images', img));
      const res = await axios.post(`${process.env.NEXT_PUBLIC_API_URL}/market`, formData, {
        headers: { Authorization: `Bearer ${token}`, 'Content-Type': 'multipart/form-data' }
      });
      setItems(prev => [res.data, ...prev]);
      setMyItems(prev => [{ ...res.data, buyRequests: [] }, ...prev]);
      setSellForm({ title:'', description:'', price:'', condition:'New', category:'Books' });
      setSellImages([]);
      setSellPreviews([]);
      setShowSell(false);
    } catch (err) { alert('Failed to post'); } finally { setSelling(false); }
  };

  const handleBuy = async (itemId) => {
    if (buying) return;
    setBuying(true);
    try {
      await axios.post(
        `${process.env.NEXT_PUBLIC_API_URL}/market/${itemId}/buy`,
        { message: buyMsg },
        { headers: { Authorization: `Bearer ${token}` } }
      );
      setBuyDone(prev => ({ ...prev, [itemId]: true }));
      setBuyMsg('');
      setTimeout(() => {
        router.push(`/messages?userId=${showDetail?.user?.id}&userName=${showDetail?.user?.name}`);
        setShowDetail(null);
      }, 1500);
    } catch (err) {
      alert(err.response?.data?.message || 'Failed');
    } finally { setBuying(false); }
  };

  const handleDelete = async (itemId) => {
    if (!confirm('Delete this listing?')) return;
    try {
      await axios.delete(`${process.env.NEXT_PUBLIC_API_URL}/market/${itemId}`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      setMyItems(prev => prev.filter(i => i.id !== itemId));
      setItems(prev => prev.filter(i => i.id !== itemId));
    } catch (err) { alert('Failed to delete'); }
  };

  const handleMarkSold = async (itemId) => {
    try {
      await axios.put(`${process.env.NEXT_PUBLIC_API_URL}/market/${itemId}/sold`, {}, {
        headers: { Authorization: `Bearer ${token}` }
      });
      setMyItems(prev => prev.map(i => i.id === itemId ? { ...i, status: 'sold' } : i));
      setItems(prev => prev.filter(i => i.id !== itemId));
    } catch (err) { alert('Failed'); }
  };

  const handleShare = (item) => {
    setShowShare(item);
    setShareCopied(false);
  };

  const handleCopyLink = () => {
    const link = `${window.location.origin}/market`;
    const text = `Check out this item on IIUC MentorBridge Market:\n\n📦 ${showShare.title}\n💰 ৳${showShare.price}\n📋 Condition: ${showShare.condition}\n\n${link}`;
    navigator.clipboard.writeText(text);
    setShareCopied(true);
    setTimeout(() => setShareCopied(false), 2000);
  };

  const handleShareWhatsApp = () => {
    const text = `Check out this item on IIUC MentorBridge Market!\n\n📦 ${showShare.title}\n💰 ৳${showShare.price}\n📋 Condition: ${showShare.condition}\n\nVisit: ${window.location.origin}/market`;
    window.open(`https://wa.me/?text=${encodeURIComponent(text)}`, '_blank');
  };

  const handleShareFacebook = () => {
    window.open(`https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(window.location.origin + '/market')}`, '_blank');
  };

  const conditionColor = (c) => {
    const map = { 'New': '#22c55e', 'Like New': '#60a5fa', 'Good': '#f59e0b', 'Fair': '#f97316', 'Poor': '#ef4444' };
    return map[c] || '#22c55e';
  };

  // Image Carousel Component
  const ImageCarousel = ({ images, height = '260px' }) => {
    const [current, setCurrent] = useState(0);
    if (!images || images.length === 0) return (
      <div style={{height, display:'flex', alignItems:'center', justifyContent:'center', background:'rgba(0,0,0,0.2)'}}>
        <ShoppingBag size={60} color="rgba(255,255,255,0.1)"/>
      </div>
    );
    return (
      <div style={{position:'relative', height, background:'rgba(0,0,0,0.3)', overflow:'hidden'}}>
        <img src={images[current].url} alt="item"
          style={{width:'100%', height:'100%', objectFit:'contain', transition:'opacity 0.2s'}}/>

        {/* Prev/Next arrows */}
        {images.length > 1 && (
          <>
            <button onClick={(e) => { e.stopPropagation(); setCurrent(p => p === 0 ? images.length-1 : p-1); }}
              style={{position:'absolute', left:'0.5rem', top:'50%', transform:'translateY(-50%)', background:'rgba(0,0,0,0.55)', border:'none', color:'white', borderRadius:'50%', width:'32px', height:'32px', cursor:'pointer', display:'flex', alignItems:'center', justifyContent:'center'}}>
              <ChevronLeft size={16}/>
            </button>
            <button onClick={(e) => { e.stopPropagation(); setCurrent(p => p === images.length-1 ? 0 : p+1); }}
              style={{position:'absolute', right:'0.5rem', top:'50%', transform:'translateY(-50%)', background:'rgba(0,0,0,0.55)', border:'none', color:'white', borderRadius:'50%', width:'32px', height:'32px', cursor:'pointer', display:'flex', alignItems:'center', justifyContent:'center'}}>
              <ChevronRight size={16}/>
            </button>
          </>
        )}

        {/* Dots */}
        {images.length > 1 && (
          <div style={{position:'absolute', bottom:'0.65rem', left:'50%', transform:'translateX(-50%)', display:'flex', gap:'0.35rem'}}>
            {images.map((_, i) => (
              <button key={i} onClick={(e) => { e.stopPropagation(); setCurrent(i); }} style={{
                width: i === current ? '20px' : '7px', height:'7px',
                borderRadius:'999px', background: i === current ? '#22c55e' : 'rgba(255,255,255,0.4)',
                border:'none', cursor:'pointer', padding:0, transition:'all 0.2s'
              }}/>
            ))}
          </div>
        )}

        {/* Counter badge */}
        {images.length > 1 && (
          <div style={{position:'absolute', top:'0.65rem', right:'0.65rem', background:'rgba(0,0,0,0.6)', borderRadius:'999px', padding:'2px 8px', fontSize:'0.7rem', color:'white'}}>
            {current + 1}/{images.length}
          </div>
        )}
      </div>
    );
  };

  const ItemCard = ({ item }) => (
    <div onClick={() => { setShowDetail(item); setSelectedImg(0); setBuyMsg(''); }} className="glass-card"
      style={{padding:0, overflow:'hidden', cursor:'pointer', transition:'transform 0.2s'}}
      onMouseEnter={e => e.currentTarget.style.transform='translateY(-3px)'}
      onMouseLeave={e => e.currentTarget.style.transform='translateY(0)'}>
      <div style={{position:'relative', height:'180px', background:'rgba(0,0,0,0.2)', overflow:'hidden'}}>
        {item.images?.length > 0 ? (
          <img src={item.images[0].url} alt={item.title} style={{width:'100%', height:'100%', objectFit:'cover'}}/>
        ) : (
          <div style={{display:'flex', alignItems:'center', justifyContent:'center', height:'100%'}}>
            <ShoppingBag size={40} color="rgba(255,255,255,0.15)"/>
          </div>
        )}
        {item.status === 'sold' && (
          <div style={{position:'absolute', inset:0, background:'rgba(0,0,0,0.6)', display:'flex', alignItems:'center', justifyContent:'center'}}>
            <span style={{background:'#ef4444', color:'white', padding:'0.35rem 0.875rem', borderRadius:'999px', fontWeight:700, fontSize:'0.85rem'}}>SOLD</span>
          </div>
        )}
        <div style={{position:'absolute', top:'0.5rem', left:'0.5rem', background:`${conditionColor(item.condition)}22`, border:`1px solid ${conditionColor(item.condition)}`, borderRadius:'999px', padding:'2px 8px', fontSize:'0.68rem', fontWeight:600, color:conditionColor(item.condition)}}>
          {item.condition}
        </div>
        {item.images?.length > 1 && (
          <div style={{position:'absolute', bottom:'0.5rem', right:'0.5rem', background:'rgba(0,0,0,0.6)', borderRadius:'999px', padding:'2px 8px', fontSize:'0.65rem', color:'white'}}>
            📷 {item.images.length}
          </div>
        )}
      </div>
      <div style={{padding:'0.75rem'}}>
        <p style={{fontWeight:600, color:'white', fontSize:'0.875rem', marginBottom:'0.25rem', overflow:'hidden', textOverflow:'ellipsis', whiteSpace:'nowrap'}}>{item.title}</p>
        <div style={{display:'flex', alignItems:'center', justifyContent:'space-between', marginBottom:'0.5rem'}}>
          <span style={{color:'#22c55e', fontWeight:800, fontSize:'1.1rem'}}>৳{item.price.toLocaleString()}</span>
          <span style={{background:'rgba(34,197,94,0.1)', color:'#22c55e', border:'1px solid rgba(34,197,94,0.2)', padding:'2px 7px', borderRadius:'999px', fontSize:'0.68rem'}}>{item.category}</span>
        </div>
        <div style={{display:'flex', alignItems:'center', gap:'0.4rem'}}>
          <Avatar user={item.user} size={18} radius="50%"/>
          <span style={{color:'rgba(255,255,255,0.4)', fontSize:'0.72rem', flex:1, overflow:'hidden', textOverflow:'ellipsis', whiteSpace:'nowrap'}}>{item.user?.name}</span>
          <button onClick={(e) => { e.stopPropagation(); handleShare(item); }}
            style={{background:'transparent', border:'none', color:'rgba(255,255,255,0.3)', cursor:'pointer', padding:'0.2rem', display:'flex', alignItems:'center'}}
            onMouseEnter={e => e.currentTarget.style.color='#22c55e'}
            onMouseLeave={e => e.currentTarget.style.color='rgba(255,255,255,0.3)'}>
            <Share2 size={13}/>
          </button>
        </div>
      </div>
    </div>
  );

  return (
    <div className="page-bg">
      <Navbar user={user}/>
      <div className="center-wrap" style={{flex:1, paddingTop:'1.25rem', paddingBottom:'2rem'}}>

        {/* Header */}
        <div style={{display:'flex', justifyContent:'space-between', alignItems:'center', marginBottom:'1rem', flexWrap:'wrap', gap:'0.5rem'}}>
          <div>
            <h2 className="heading-text" style={{fontSize:'1.25rem', marginBottom:'0.15rem'}}>🛒 IIUC Marketplace</h2>
            <p style={{color:'rgba(255,255,255,0.35)', fontSize:'0.78rem'}}>Buy and sell within the IIUC community</p>
          </div>
          <button onClick={() => setShowSell(true)} className="btn-primary" style={{padding:'0.5rem 1.1rem', fontSize:'0.85rem', display:'flex', alignItems:'center', gap:'0.4rem'}}>
            <Plus size={15}/> Sell Something
          </button>
        </div>

        {/* Tabs */}
        <div style={{display:'flex', gap:'0.4rem', marginBottom:'1rem', borderBottom:'1px solid rgba(255,255,255,0.08)', paddingBottom:'0.5rem'}}>
          {['browse', 'my listings'].map(t => (
            <button key={t} onClick={() => setTab(t)} style={{
              background: tab === t ? 'rgba(34,197,94,0.1)' : 'transparent',
              border:'none', cursor:'pointer', padding:'0.4rem 0.875rem', borderRadius:'8px',
              fontSize:'0.82rem', fontWeight: tab === t ? 600 : 400,
              color: tab === t ? '#22c55e' : 'rgba(255,255,255,0.45)',
              textTransform:'capitalize'
            }}>
              {t} {t === 'my listings' && `(${myItems.length})`}
            </button>
          ))}
        </div>

        {tab === 'browse' && (
          <>
            <div className="post-card" style={{display:'flex', flexWrap:'wrap', gap:'0.6rem', marginBottom:'1rem', padding:'0.75rem 1rem'}}>
              <div style={{position:'relative', flex:1, minWidth:'160px'}}>
                <Search size={13} style={{position:'absolute', left:'0.75rem', top:'50%', transform:'translateY(-50%)', color:'rgba(255,255,255,0.3)'}}/>
                <input type="text" placeholder="Search items..." value={search}
                  onChange={e => setSearch(e.target.value)} className="input-field" style={{paddingLeft:'2rem'}}/>
              </div>
              <select value={category} onChange={e => setCategory(e.target.value)} className="input-field" style={{width:'130px'}}>
                {CATEGORIES.map(c => <option key={c} value={c.toLowerCase()}>{c}</option>)}
              </select>
              <select value={condition} onChange={e => setCondition(e.target.value)} className="input-field" style={{width:'130px'}}>
                {CONDITIONS.map(c => <option key={c} value={c.toLowerCase()}>{c}</option>)}
              </select>
            </div>

            {loading ? (
              <p style={{color:'rgba(255,255,255,0.3)', textAlign:'center', padding:'2rem'}}>Loading...</p>
            ) : items.length === 0 ? (
              <div style={{textAlign:'center', padding:'3rem'}}>
                <ShoppingBag size={48} style={{color:'rgba(255,255,255,0.1)', margin:'0 auto 0.75rem', display:'block'}}/>
                <p style={{color:'rgba(255,255,255,0.3)', marginBottom:'1rem'}}>No items found</p>
                <button onClick={() => setShowSell(true)} className="btn-primary" style={{padding:'0.5rem 1.25rem'}}>
                  Be the first to sell!
                </button>
              </div>
            ) : (
              <div style={{display:'grid', gridTemplateColumns:'repeat(auto-fill, minmax(220px,1fr))', gap:'0.75rem'}}>
                {items.map(item => <ItemCard key={item.id} item={item}/>)}
              </div>
            )}
          </>
        )}

        {tab === 'my listings' && (
          <div style={{display:'flex', flexDirection:'column', gap:'0.75rem'}}>
            {myItems.length === 0 ? (
              <div style={{textAlign:'center', padding:'3rem'}}>
                <Tag size={40} style={{color:'rgba(255,255,255,0.1)', margin:'0 auto 0.75rem', display:'block'}}/>
                <p style={{color:'rgba(255,255,255,0.3)', marginBottom:'1rem'}}>No listings yet</p>
                <button onClick={() => setShowSell(true)} className="btn-primary" style={{padding:'0.5rem 1.25rem'}}>Post your first item</button>
              </div>
            ) : myItems.map(item => (
              <div key={item.id} className="feed-card">
                <div style={{display:'flex', gap:'0.75rem'}}>
                  <div style={{width:'90px', height:'90px', borderRadius:'10px', overflow:'hidden', flexShrink:0, background:'rgba(0,0,0,0.2)', position:'relative'}}>
                    {item.images?.length > 0 ? (
                      <img src={item.images[0].url} alt={item.title} style={{width:'100%', height:'100%', objectFit:'cover'}}/>
                    ) : (
                      <div style={{width:'100%', height:'100%', display:'flex', alignItems:'center', justifyContent:'center'}}>
                        <ShoppingBag size={24} color="rgba(255,255,255,0.2)"/>
                      </div>
                    )}
                    {item.images?.length > 1 && (
                      <div style={{position:'absolute', bottom:'3px', right:'3px', background:'rgba(0,0,0,0.7)', borderRadius:'4px', padding:'1px 4px', fontSize:'0.6rem', color:'white'}}>
                        📷{item.images.length}
                      </div>
                    )}
                  </div>
                  <div style={{flex:1, minWidth:0}}>
                    <div style={{display:'flex', justifyContent:'space-between', alignItems:'flex-start'}}>
                      <div>
                        <p style={{fontWeight:600, color:'white', fontSize:'0.9rem'}}>{item.title}</p>
                        <p style={{color:'#22c55e', fontWeight:700, fontSize:'1rem'}}>৳{item.price.toLocaleString()}</p>
                        <div style={{display:'flex', gap:'0.4rem', marginTop:'0.25rem', flexWrap:'wrap'}}>
                          <span style={{background:'rgba(34,197,94,0.1)', color:'#22c55e', border:'1px solid rgba(34,197,94,0.2)', padding:'1px 7px', borderRadius:'999px', fontSize:'0.68rem'}}>{item.category}</span>
                          <span style={{background: item.status === 'sold' ? 'rgba(239,68,68,0.1)' : 'rgba(34,197,94,0.08)', color: item.status === 'sold' ? '#f87171' : 'rgba(255,255,255,0.5)', border:`1px solid ${item.status === 'sold' ? 'rgba(239,68,68,0.2)' : 'rgba(255,255,255,0.1)'}`, padding:'1px 7px', borderRadius:'999px', fontSize:'0.68rem'}}>
                            {item.status === 'sold' ? 'Sold' : 'Available'}
                          </span>
                        </div>
                      </div>
                      <div style={{display:'flex', gap:'0.4rem', flexShrink:0}}>
                        <button onClick={() => handleShare(item)} className="btn-ghost" style={{padding:'0.35rem 0.6rem', fontSize:'0.75rem'}}>
                          <Share2 size={12}/>
                        </button>
                        {item.status !== 'sold' && (
                          <button onClick={() => handleMarkSold(item.id)} className="btn-outline" style={{padding:'0.35rem 0.65rem', fontSize:'0.75rem', display:'flex', alignItems:'center', gap:'0.25rem'}}>
                            <Check size={12}/> Sold
                          </button>
                        )}
                        <button onClick={() => handleDelete(item.id)} className="btn-danger" style={{padding:'0.35rem 0.6rem', fontSize:'0.75rem'}}>
                          <Trash2 size={12}/>
                        </button>
                      </div>
                    </div>
                    {item.buyRequests?.length > 0 && (
                      <div style={{marginTop:'0.65rem', borderTop:'1px solid rgba(255,255,255,0.06)', paddingTop:'0.5rem'}}>
                        <p style={{color:'rgba(255,255,255,0.4)', fontSize:'0.72rem', marginBottom:'0.4rem'}}>
                          {item.buyRequests.length} buyer request{item.buyRequests.length > 1 ? 's' : ''}
                        </p>
                        <div style={{display:'flex', flexDirection:'column', gap:'0.3rem'}}>
                          {item.buyRequests.map(req => (
                            <div key={req.id} style={{display:'flex', alignItems:'center', gap:'0.5rem', background:'rgba(34,197,94,0.05)', borderRadius:'8px', padding:'0.4rem 0.65rem'}}>
                              <Avatar user={req.buyer} size={24} radius="50%"/>
                              <span style={{color:'rgba(255,255,255,0.75)', fontSize:'0.78rem', flex:1}}>{req.buyer?.name}</span>
                              {req.message && <span style={{color:'rgba(255,255,255,0.4)', fontSize:'0.72rem', fontStyle:'italic'}}>"{req.message}"</span>}
                              <button onClick={() => router.push(`/messages?userId=${req.buyer?.id}&userName=${req.buyer?.name}`)}
                                className="btn-primary" style={{padding:'0.25rem 0.6rem', fontSize:'0.72rem', flexShrink:0, display:'flex', alignItems:'center', gap:'0.2rem'}}>
                                <MessageSquare size={11}/> Chat
                              </button>
                            </div>
                          ))}
                        </div>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Sell Modal */}
      {showSell && (
        <div style={{position:'fixed', inset:0, background:'rgba(0,0,0,0.75)', display:'flex', alignItems:'center', justifyContent:'center', zIndex:100, padding:'1rem'}}>
          <div className="glass-card" style={{width:'100%', maxWidth:'500px', padding:'1.5rem', maxHeight:'90vh', overflowY:'auto'}}>
            <div style={{display:'flex', justifyContent:'space-between', alignItems:'center', marginBottom:'1rem'}}>
              <h3 style={{color:'#22c55e', fontWeight:700, fontSize:'1rem'}}>📦 Post an Item</h3>
              <button onClick={() => setShowSell(false)} style={{background:'transparent', border:'none', color:'rgba(255,255,255,0.5)', cursor:'pointer'}}><X size={18}/></button>
            </div>
            <form onSubmit={handleSell} style={{display:'flex', flexDirection:'column', gap:'0.75rem'}}>
              <div>
                <label style={{color:'rgba(255,255,255,0.6)', fontSize:'0.78rem', display:'block', marginBottom:'0.3rem'}}>Title *</label>
                <input type="text" value={sellForm.title} onChange={e => setSellForm(p => ({...p, title:e.target.value}))}
                  className="input-field" placeholder="e.g. Engineering Mathematics Book"/>
              </div>
              <div>
                <label style={{color:'rgba(255,255,255,0.6)', fontSize:'0.78rem', display:'block', marginBottom:'0.3rem'}}>Description</label>
                <textarea value={sellForm.description} onChange={e => setSellForm(p => ({...p, description:e.target.value}))}
                  className="input-field" rows={3} style={{resize:'none'}} placeholder="Describe your item..."/>
              </div>
              <div style={{display:'grid', gridTemplateColumns:'1fr 1fr 1fr', gap:'0.6rem'}}>
                <div>
                  <label style={{color:'rgba(255,255,255,0.6)', fontSize:'0.78rem', display:'block', marginBottom:'0.3rem'}}>Price (৳) *</label>
                  <input type="number" value={sellForm.price} onChange={e => setSellForm(p => ({...p, price:e.target.value}))}
                    className="input-field" placeholder="500"/>
                </div>
                <div>
                  <label style={{color:'rgba(255,255,255,0.6)', fontSize:'0.78rem', display:'block', marginBottom:'0.3rem'}}>Condition</label>
                  <select value={sellForm.condition} onChange={e => setSellForm(p => ({...p, condition:e.target.value}))} className="input-field">
                    {CONDITIONS.filter(c => c !== 'All').map(c => <option key={c}>{c}</option>)}
                  </select>
                </div>
                <div>
                  <label style={{color:'rgba(255,255,255,0.6)', fontSize:'0.78rem', display:'block', marginBottom:'0.3rem'}}>Category</label>
                  <select value={sellForm.category} onChange={e => setSellForm(p => ({...p, category:e.target.value}))} className="input-field">
                    {CATEGORIES.filter(c => c !== 'All').map(c => <option key={c}>{c}</option>)}
                  </select>
                </div>
              </div>
              <div>
                <label style={{color:'rgba(255,255,255,0.6)', fontSize:'0.78rem', display:'block', marginBottom:'0.3rem'}}>Photos (max 5)</label>
                <label style={{display:'flex', alignItems:'center', gap:'0.65rem', background:'rgba(255,255,255,0.04)', border:'1px dashed rgba(34,197,94,0.3)', borderRadius:'10px', padding:'0.75rem 1rem', cursor:'pointer'}}>
                  <Upload size={18} color="#22c55e"/>
                  <span style={{color: sellImages.length > 0 ? '#22c55e' : 'rgba(255,255,255,0.35)', fontSize:'0.82rem'}}>
                    {sellImages.length > 0 ? `${sellImages.length} photo(s) selected` : 'Click to add photos'}
                  </span>
                  <input type="file" accept="image/*" multiple onChange={handleImageSelect} style={{display:'none'}}/>
                </label>
                {sellPreviews.length > 0 && (
                  <div style={{display:'flex', gap:'0.4rem', marginTop:'0.5rem', flexWrap:'wrap'}}>
                    {sellPreviews.map((src, i) => (
                      <div key={i} style={{position:'relative'}}>
                        <img src={src} alt="" style={{width:'65px', height:'65px', objectFit:'cover', borderRadius:'8px', border:'1px solid rgba(34,197,94,0.3)'}}/>
                        <button type="button" onClick={() => {
                          setSellImages(p => p.filter((_,idx) => idx!==i));
                          setSellPreviews(p => p.filter((_,idx) => idx!==i));
                        }} style={{position:'absolute', top:'-5px', right:'-5px', background:'#ef4444', border:'none', color:'white', borderRadius:'50%', width:'17px', height:'17px', cursor:'pointer', fontSize:'0.65rem', display:'flex', alignItems:'center', justifyContent:'center'}}>×</button>
                      </div>
                    ))}
                  </div>
                )}
              </div>
              <button type="submit" disabled={selling} className="btn-primary" style={{width:'100%', padding:'0.65rem', fontSize:'0.875rem'}}>
                {selling ? 'Posting...' : '🚀 Post Item'}
              </button>
            </form>
          </div>
        </div>
      )}

      {/* Detail Modal */}
      {showDetail && (
        <div style={{position:'fixed', inset:0, background:'rgba(0,0,0,0.85)', display:'flex', alignItems:'center', justifyContent:'center', zIndex:100, padding:'1rem'}}>
          <div className="glass-card" style={{width:'100%', maxWidth:'580px', padding:0, overflow:'hidden', maxHeight:'92vh', display:'flex', flexDirection:'column'}}>

            {/* Image Carousel */}
            <div style={{position:'relative', flexShrink:0}}>
              <ImageCarousel images={showDetail.images} height="280px"/>
              <button onClick={() => { setShowDetail(null); setBuyMsg(''); }}
                style={{position:'absolute', top:'0.75rem', right:'0.75rem', background:'rgba(0,0,0,0.65)', border:'none', color:'white', borderRadius:'50%', width:'34px', height:'34px', cursor:'pointer', display:'flex', alignItems:'center', justifyContent:'center', zIndex:10}}>
                <X size={16}/>
              </button>
              {showDetail.status === 'sold' && (
                <div style={{position:'absolute', inset:0, background:'rgba(0,0,0,0.55)', display:'flex', alignItems:'center', justifyContent:'center', zIndex:5}}>
                  <span style={{background:'#ef4444', color:'white', padding:'0.5rem 1.5rem', borderRadius:'999px', fontWeight:700, fontSize:'1rem'}}>SOLD</span>
                </div>
              )}
            </div>

            {/* Content */}
            <div style={{padding:'1.25rem', overflowY:'auto', flex:1}}>
              <div style={{display:'flex', justifyContent:'space-between', alignItems:'flex-start', marginBottom:'0.75rem'}}>
                <div style={{flex:1}}>
                  <h3 style={{color:'white', fontWeight:700, fontSize:'1.1rem', marginBottom:'0.35rem'}}>{showDetail.title}</h3>
                  <div style={{display:'flex', gap:'0.4rem', flexWrap:'wrap', alignItems:'center'}}>
                    <span style={{background:'rgba(34,197,94,0.1)', color:'#22c55e', border:'1px solid rgba(34,197,94,0.2)', padding:'2px 8px', borderRadius:'999px', fontSize:'0.72rem'}}>{showDetail.category}</span>
                    <span style={{background:`${conditionColor(showDetail.condition)}18`, color:conditionColor(showDetail.condition), border:`1px solid ${conditionColor(showDetail.condition)}44`, padding:'2px 8px', borderRadius:'999px', fontSize:'0.72rem'}}>{showDetail.condition}</span>
                    {showDetail.images?.length > 1 && (
                      <span style={{color:'rgba(255,255,255,0.35)', fontSize:'0.7rem'}}>📷 {showDetail.images.length} photos</span>
                    )}
                  </div>
                </div>
                <div style={{textAlign:'right', flexShrink:0, marginLeft:'0.75rem'}}>
                  <p style={{color:'#22c55e', fontWeight:800, fontSize:'1.5rem', lineHeight:1}}>৳{showDetail.price.toLocaleString()}</p>
                </div>
              </div>

              {showDetail.description && (
                <p style={{color:'rgba(255,255,255,0.6)', fontSize:'0.85rem', lineHeight:'1.6', marginBottom:'0.875rem', background:'rgba(255,255,255,0.03)', padding:'0.65rem', borderRadius:'8px'}}>
                  {showDetail.description}
                </p>
              )}

              {/* Seller Info */}
              <div style={{display:'flex', alignItems:'center', gap:'0.65rem', padding:'0.65rem', background:'rgba(255,255,255,0.04)', borderRadius:'10px', marginBottom:'0.875rem', border:'1px solid rgba(255,255,255,0.06)'}}>
                <Avatar user={showDetail.user} size={40} radius="10px"/>
                <div style={{flex:1}}>
                  <p style={{color:'white', fontWeight:600, fontSize:'0.875rem'}}>{showDetail.user?.name}</p>
                  <p style={{color:'rgba(255,255,255,0.35)', fontSize:'0.72rem'}}>{showDetail.user?.department} • {new Date(showDetail.createdAt).toLocaleDateString()}</p>
                </div>
                <div style={{display:'flex', gap:'0.4rem'}}>
                  <button onClick={() => handleShare(showDetail)}
                    className="btn-ghost" style={{padding:'0.4rem 0.65rem', fontSize:'0.78rem', display:'flex', alignItems:'center', gap:'0.3rem'}}>
                    <Share2 size={13}/> Share
                  </button>
                  <button onClick={() => { router.push(`/messages?userId=${showDetail.user?.id}&userName=${showDetail.user?.name}`); setShowDetail(null); }}
                    className="btn-outline" style={{padding:'0.4rem 0.75rem', fontSize:'0.78rem', display:'flex', alignItems:'center', gap:'0.3rem'}}>
                    <MessageSquare size={13}/> Message
                  </button>
                </div>
              </div>

              {/* Buy Section */}
              {showDetail.userId !== user?.id && showDetail.status !== 'sold' && (
                <div style={{borderTop:'1px solid rgba(255,255,255,0.08)', paddingTop:'0.875rem'}}>
                  {buyDone[showDetail.id] ? (
                    <div style={{textAlign:'center', padding:'1rem', background:'rgba(34,197,94,0.08)', borderRadius:'10px', border:'1px solid rgba(34,197,94,0.2)'}}>
                      <Check size={24} color="#22c55e" style={{margin:'0 auto 0.5rem', display:'block'}}/>
                      <p style={{color:'#22c55e', fontWeight:600, fontSize:'0.9rem'}}>Message Sent to Seller!</p>
                      <p style={{color:'rgba(255,255,255,0.4)', fontSize:'0.78rem', marginTop:'0.25rem'}}>Taking you to the conversation...</p>
                    </div>
                  ) : (
                    <>
                      <p style={{color:'rgba(255,255,255,0.5)', fontSize:'0.78rem', marginBottom:'0.5rem'}}>
                        💬 Add a message to the seller (optional)
                      </p>
                      <textarea value={buyMsg} onChange={e => setBuyMsg(e.target.value)}
                        className="input-field" rows={2} style={{resize:'none', marginBottom:'0.65rem', fontSize:'0.85rem'}}
                        placeholder="e.g. Is the price negotiable? Can we meet on campus?"/>
                      <button onClick={() => handleBuy(showDetail.id)} disabled={buying} className="btn-primary"
                        style={{width:'100%', padding:'0.75rem', fontSize:'0.9rem', display:'flex', alignItems:'center', justifyContent:'center', gap:'0.5rem'}}>
                        <ShoppingBag size={17}/> {buying ? 'Sending...' : 'I Want to Buy This'}
                      </button>
                      <p style={{color:'rgba(255,255,255,0.25)', fontSize:'0.72rem', textAlign:'center', marginTop:'0.5rem'}}>
                        Seller will receive your message automatically
                      </p>
                    </>
                  )}
                </div>
              )}

              {showDetail.status === 'sold' && (
                <div style={{textAlign:'center', padding:'0.75rem', background:'rgba(239,68,68,0.08)', borderRadius:'10px', border:'1px solid rgba(239,68,68,0.2)'}}>
                  <p style={{color:'#f87171', fontWeight:600}}>This item has been sold</p>
                </div>
              )}

              {showDetail.userId === user?.id && (
                <div style={{textAlign:'center', padding:'0.5rem', background:'rgba(255,255,255,0.04)', borderRadius:'10px'}}>
                  <p style={{color:'rgba(255,255,255,0.4)', fontSize:'0.78rem'}}>This is your listing</p>
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {/* Share Modal */}
      {showShare && (
        <div style={{position:'fixed', inset:0, background:'rgba(0,0,0,0.75)', display:'flex', alignItems:'center', justifyContent:'center', zIndex:200, padding:'1rem'}}>
          <div className="glass-card" style={{width:'100%', maxWidth:'380px', padding:'1.5rem'}}>
            <div style={{display:'flex', justifyContent:'space-between', alignItems:'center', marginBottom:'1rem'}}>
              <h3 style={{color:'#22c55e', fontWeight:700, fontSize:'0.95rem'}}>Share this item</h3>
              <button onClick={() => setShowShare(false)} style={{background:'transparent', border:'none', color:'rgba(255,255,255,0.5)', cursor:'pointer'}}><X size={18}/></button>
            </div>

            {/* Item preview */}
            <div style={{background:'rgba(255,255,255,0.04)', borderRadius:'10px', padding:'0.75rem', marginBottom:'1rem', display:'flex', gap:'0.65rem', alignItems:'center'}}>
              {showShare.images?.length > 0 ? (
                <img src={showShare.images[0].url} alt={showShare.title} style={{width:'50px', height:'50px', objectFit:'cover', borderRadius:'8px', flexShrink:0}}/>
              ) : (
                <div style={{width:'50px', height:'50px', background:'rgba(34,197,94,0.1)', borderRadius:'8px', display:'flex', alignItems:'center', justifyContent:'center', flexShrink:0}}>
                  <ShoppingBag size={22} color="#22c55e"/>
                </div>
              )}
              <div style={{flex:1, minWidth:0}}>
                <p style={{color:'white', fontWeight:600, fontSize:'0.85rem', overflow:'hidden', textOverflow:'ellipsis', whiteSpace:'nowrap'}}>{showShare.title}</p>
                <p style={{color:'#22c55e', fontWeight:700, fontSize:'0.9rem'}}>৳{showShare.price?.toLocaleString()}</p>
              </div>
            </div>

            {/* Share options */}
            <div style={{display:'flex', flexDirection:'column', gap:'0.5rem'}}>
              <button onClick={handleCopyLink} style={{
                display:'flex', alignItems:'center', gap:'0.75rem',
                padding:'0.75rem 1rem', borderRadius:'10px',
                background: shareCopied ? 'rgba(34,197,94,0.15)' : 'rgba(255,255,255,0.05)',
                border:`1px solid ${shareCopied ? 'rgba(34,197,94,0.4)' : 'rgba(255,255,255,0.1)'}`,
                cursor:'pointer', transition:'all 0.2s', width:'100%', textAlign:'left'
              }}>
                <div style={{width:'36px', height:'36px', borderRadius:'8px', background:'rgba(34,197,94,0.1)', display:'flex', alignItems:'center', justifyContent:'center', flexShrink:0}}>
                  {shareCopied ? <Check size={18} color="#22c55e"/> : <Share2 size={18} color="#22c55e"/>}
                </div>
                <div>
                  <p style={{color:'white', fontSize:'0.85rem', fontWeight:500}}>{shareCopied ? 'Copied!' : 'Copy Link'}</p>
                  <p style={{color:'rgba(255,255,255,0.35)', fontSize:'0.72rem'}}>Share via any platform</p>
                </div>
              </button>

              <button onClick={handleShareWhatsApp} style={{
                display:'flex', alignItems:'center', gap:'0.75rem',
                padding:'0.75rem 1rem', borderRadius:'10px',
                background:'rgba(37,211,102,0.08)', border:'1px solid rgba(37,211,102,0.2)',
                cursor:'pointer', width:'100%', textAlign:'left'
              }}>
                <div style={{width:'36px', height:'36px', borderRadius:'8px', background:'rgba(37,211,102,0.15)', display:'flex', alignItems:'center', justifyContent:'center', flexShrink:0, fontSize:'1.1rem'}}>
                  💬
                </div>
                <div>
                  <p style={{color:'white', fontSize:'0.85rem', fontWeight:500}}>WhatsApp</p>
                  <p style={{color:'rgba(255,255,255,0.35)', fontSize:'0.72rem'}}>Share to WhatsApp</p>
                </div>
              </button>

              <button onClick={handleShareFacebook} style={{
                display:'flex', alignItems:'center', gap:'0.75rem',
                padding:'0.75rem 1rem', borderRadius:'10px',
                background:'rgba(24,119,242,0.08)', border:'1px solid rgba(24,119,242,0.2)',
                cursor:'pointer', width:'100%', textAlign:'left'
              }}>
                <div style={{width:'36px', height:'36px', borderRadius:'8px', background:'rgba(24,119,242,0.15)', display:'flex', alignItems:'center', justifyContent:'center', flexShrink:0, fontSize:'1.1rem'}}>
                  📘
                </div>
                <div>
                  <p style={{color:'white', fontSize:'0.85rem', fontWeight:500}}>Facebook</p>
                  <p style={{color:'rgba(255,255,255,0.35)', fontSize:'0.72rem'}}>Share to Facebook</p>
                </div>
              </button>
            </div>
          </div>
        </div>
      )}

      <Footer/>
    </div>
  );
}