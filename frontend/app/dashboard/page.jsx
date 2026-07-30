'use client';
import { useEffect, useState, useCallback } from 'react';
import axios from 'axios';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { ThumbsUp, MessageCircle, Share2, MoreVertical, Edit2, Trash2, Send, X, CornerDownRight, ImageIcon } from 'lucide-react';
import Navbar from '../components/Navbar';
import Footer from '../components/Footer';
import Avatar from '../components/Avatar';

const EMOJIS = ['👍', '❤️', '😂', '😮', '😢', '🔥'];

function CommentItem({ comment, currentUser, postId, token, depth = 0 }) {
  const [showReactions, setShowReactions] = useState(false);
  const [reactions, setReactions] = useState(comment.reactions || []);
  const [replying, setReplying] = useState(false);
  const [replyText, setReplyText] = useState('');
  const [replies, setReplies] = useState(comment.replies || []);
  const [replyLoading, setReplyLoading] = useState(false);

  const getReactionCounts = () => {
    const counts = {};
    reactions.forEach(r => { counts[r.emoji] = (counts[r.emoji] || 0) + 1; });
    return counts;
  };

  const myReaction = reactions.find(r => r.userId === currentUser?.id);

  const handleReact = async (emoji) => {
    try {
      const res = await axios.post(
        `${process.env.NEXT_PUBLIC_API_URL}/posts/${postId}/comments/${comment.id}/react`,
        { emoji },
        { headers: { Authorization: `Bearer ${token}` } }
      );
      if (res.data.removed) {
        setReactions(prev => prev.filter(r => r.userId !== currentUser?.id));
      } else {
        setReactions(prev => {
          const filtered = prev.filter(r => r.userId !== currentUser?.id);
          return [...filtered, { userId: currentUser?.id, emoji, commentId: comment.id }];
        });
      }
    } catch (err) { console.error(err); }
    setShowReactions(false);
  };

  const handleReply = async (e) => {
    e.preventDefault();
    if (!replyText.trim()) return;
    setReplyLoading(true);
    try {
      const res = await axios.post(
        `${process.env.NEXT_PUBLIC_API_URL}/posts/${postId}/comments`,
        { content: replyText, parentId: comment.id },
        { headers: { Authorization: `Bearer ${token}` } }
      );
      setReplies(prev => [...prev, res.data]);
      setReplyText('');
      setReplying(false);
    } catch (err) { console.error(err); } finally { setReplyLoading(false); }
  };

  const reactionCounts = getReactionCounts();

  return (
    <div style={{marginLeft: depth > 0 ? '1.5rem' : 0}}>
      <div style={{display:'flex', gap:'0.5rem', alignItems:'flex-start'}}>
        <Avatar user={comment.user} size={28} radius="8px"/>
        <div style={{flex:1}}>
          <div style={{background:'rgba(255,255,255,0.04)', borderRadius:'8px', padding:'0.4rem 0.65rem'}}>
            <p style={{color:'#22c55e', fontSize:'0.72rem', fontWeight:600, marginBottom:'0.1rem'}}>{comment.user?.name}</p>
            <p style={{color:'rgba(255,255,255,0.75)', fontSize:'0.8rem', lineHeight:'1.4'}}>{comment.content}</p>
          </div>

          {Object.keys(reactionCounts).length > 0 && (
            <div style={{display:'flex', gap:'0.25rem', marginTop:'0.2rem', flexWrap:'wrap'}}>
              {Object.entries(reactionCounts).map(([emoji, count]) => (
                <span key={emoji} onClick={() => handleReact(emoji)}
                  style={{background:'rgba(255,255,255,0.07)', borderRadius:'999px', padding:'1px 6px', fontSize:'0.72rem', cursor:'pointer',
                  border: myReaction?.emoji === emoji ? '1px solid rgba(34,197,94,0.4)' : '1px solid transparent'}}>
                  {emoji} {count}
                </span>
              ))}
            </div>
          )}

          <div style={{display:'flex', alignItems:'center', gap:'0.5rem', marginTop:'0.2rem'}}>
            <div style={{position:'relative'}}>
              <button onClick={() => setShowReactions(!showReactions)}
                style={{background:'transparent', border:'none', color: myReaction ? '#22c55e' : 'rgba(255,255,255,0.3)', fontSize:'0.7rem', cursor:'pointer', display:'flex', alignItems:'center', gap:'0.2rem', padding:'0.15rem 0.3rem', borderRadius:'4px'}}>
                {myReaction ? myReaction.emoji : '👍'} React
              </button>
              {showReactions && (
                <div style={{position:'absolute', bottom:'1.5rem', left:0, background:'#1e2d1e', border:'1px solid rgba(34,197,94,0.2)', borderRadius:'8px', padding:'0.35rem', display:'flex', gap:'0.25rem', zIndex:30, boxShadow:'0 4px 20px rgba(0,0,0,0.4)'}}>
                  {EMOJIS.map(emoji => (
                    <button key={emoji} onClick={() => handleReact(emoji)}
                      style={{background: myReaction?.emoji === emoji ? 'rgba(34,197,94,0.2)' : 'transparent', border:'none', cursor:'pointer', fontSize:'1rem', padding:'0.2rem', borderRadius:'4px', lineHeight:1}}>
                      {emoji}
                    </button>
                  ))}
                </div>
              )}
            </div>
            {depth === 0 && (
              <button onClick={() => setReplying(!replying)}
                style={{background:'transparent', border:'none', color:'rgba(255,255,255,0.3)', fontSize:'0.7rem', cursor:'pointer', display:'flex', alignItems:'center', gap:'0.2rem', padding:'0.15rem 0.3rem', borderRadius:'4px'}}>
                <CornerDownRight size={10}/> Reply
              </button>
            )}
            <span style={{color:'rgba(255,255,255,0.15)', fontSize:'0.65rem'}}>{new Date(comment.createdAt).toLocaleDateString()}</span>
          </div>

          {replying && (
            <form onSubmit={handleReply} style={{display:'flex', gap:'0.35rem', marginTop:'0.4rem'}}>
              <input type="text" value={replyText} onChange={(e) => setReplyText(e.target.value)}
                placeholder={`Reply to ${comment.user?.name}...`} className="input-field"
                style={{fontSize:'0.75rem', padding:'0.3rem 0.6rem'}} autoFocus/>
              <button type="submit" disabled={replyLoading} className="btn-primary" style={{padding:'0.3rem 0.6rem', flexShrink:0}}>
                <Send size={11}/>
              </button>
              <button type="button" onClick={() => setReplying(false)}
                style={{background:'transparent', border:'none', color:'rgba(255,255,255,0.3)', cursor:'pointer', padding:'0.3rem'}}>
                <X size={13}/>
              </button>
            </form>
          )}

          {replies.length > 0 && (
            <div style={{marginTop:'0.5rem', display:'flex', flexDirection:'column', gap:'0.4rem'}}>
              {replies.map(reply => (
                <CommentItem key={reply.id} comment={reply} currentUser={currentUser} postId={postId} token={token} depth={depth + 1}/>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

export default function DashboardPage() {
  const router = useRouter();
  const [user, setUser] = useState(null);
  const [posts, setPosts] = useState([]);
  const [newPost, setNewPost] = useState('');
  const [postImages, setPostImages] = useState([]);
  const [imagePreview, setImagePreview] = useState([]);
  const [loading, setLoading] = useState(true);
  const [activeMenu, setActiveMenu] = useState(null);
  const [likedPosts, setLikedPosts] = useState({});
  const [likeCounts, setLikeCounts] = useState({});
  const [commentOpen, setCommentOpen] = useState(null);
  const [comments, setComments] = useState({});
  const [newComment, setNewComment] = useState('');
  const [commentLoading, setCommentLoading] = useState(false);
  const [editingPost, setEditingPost] = useState(null);
  const [editContent, setEditContent] = useState('');
  const [token, setToken] = useState('');

  const fetchPosts = useCallback(async (tkn) => {
    try {
      const res = await axios.get(`${process.env.NEXT_PUBLIC_API_URL}/posts`, { headers: { Authorization: `Bearer ${tkn}` } });
      const postsData = res.data.posts;
      setPosts(postsData);
      const liked = {};
      const counts = {};
      const currentUser = JSON.parse(localStorage.getItem('user') || '{}');
      postsData.forEach(p => {
        counts[p.id] = p._count?.likes || 0;
        liked[p.id] = p.likes?.some(l => l.userId === currentUser.id) || false;
      });
      setLikeCounts(counts);
      setLikedPosts(liked);
    } catch (err) { console.error(err); } finally { setLoading(false); }
  }, []);

  useEffect(() => {
    const tkn = localStorage.getItem('token');
    const userData = localStorage.getItem('user');
    if (!tkn) { router.push('/login'); return; }
    setToken(tkn);
    fetchPosts(tkn);
    if (userData) setUser(JSON.parse(userData));
  }, [router, fetchPosts]);

  const handleImageSelect = (e) => {
    const files = Array.from(e.target.files);
    if (files.length > 5) { alert('Maximum 5 images allowed'); return; }
    setPostImages(files);
    setImagePreview(files.map(f => URL.createObjectURL(f)));
  };

  const handlePost = async (e) => {
    e.preventDefault();
    if (!newPost.trim() && postImages.length === 0) return;
    const formData = new FormData();
    formData.append('content', newPost);
    formData.append('type', 'general');
    postImages.forEach(img => formData.append('images', img));
    try {
      const res = await axios.post(
        `${process.env.NEXT_PUBLIC_API_URL}/posts`,
        formData,
        { headers: { Authorization: `Bearer ${token}`, 'Content-Type': 'multipart/form-data' } }
      );
      setPosts(prev => [res.data.post, ...prev]);
      setLikeCounts(prev => ({ ...prev, [res.data.post.id]: 0 }));
      setNewPost('');
      setPostImages([]);
      setImagePreview([]);
    } catch (err) { console.error(err); }
  };

  const handleDeletePost = async (postId) => {
    if (!confirm('Delete this post?')) return;
    try {
      await axios.delete(`${process.env.NEXT_PUBLIC_API_URL}/posts/${postId}`, { headers: { Authorization: `Bearer ${token}` } });
      setPosts(prev => prev.filter(p => p.id !== postId));
      setActiveMenu(null);
    } catch (err) { console.error(err); }
  };

  const handleEditPost = async (postId) => {
    if (!editContent.trim()) return;
    try {
      const res = await axios.put(`${process.env.NEXT_PUBLIC_API_URL}/posts/${postId}`, { content: editContent }, { headers: { Authorization: `Bearer ${token}` } });
      setPosts(prev => prev.map(p => p.id === postId ? { ...p, content: res.data.post.content } : p));
      setEditingPost(null);
      setEditContent('');
      setActiveMenu(null);
    } catch (err) { console.error(err); }
  };

  const handleLike = async (postId) => {
    try {
      const res = await axios.post(`${process.env.NEXT_PUBLIC_API_URL}/posts/${postId}/like`, {}, { headers: { Authorization: `Bearer ${token}` } });
      setLikedPosts(prev => ({ ...prev, [postId]: res.data.liked }));
      setLikeCounts(prev => ({ ...prev, [postId]: res.data.count }));
    } catch (err) { console.error(err); }
  };

  const openComments = async (postId) => {
    if (commentOpen === postId) { setCommentOpen(null); return; }
    setCommentOpen(postId);
    if (comments[postId]) return;
    try {
      const res = await axios.get(`${process.env.NEXT_PUBLIC_API_URL}/posts/${postId}/comments`, { headers: { Authorization: `Bearer ${token}` } });
      setComments(prev => ({ ...prev, [postId]: res.data }));
    } catch (err) { console.error(err); }
  };

  const handleComment = async (e, postId) => {
    e.preventDefault();
    if (!newComment.trim()) return;
    setCommentLoading(true);
    try {
      const res = await axios.post(`${process.env.NEXT_PUBLIC_API_URL}/posts/${postId}/comments`, { content: newComment }, { headers: { Authorization: `Bearer ${token}` } });
      setComments(prev => ({ ...prev, [postId]: [...(prev[postId] || []), { ...res.data, replies: [] }] }));
      setNewComment('');
      setPosts(prev => prev.map(p => p.id === postId ? { ...p, _count: { ...p._count, comments: (p._count?.comments || 0) + 1 } } : p));
    } catch (err) { console.error(err); } finally { setCommentLoading(false); }
  };

  if (loading) return (
    <div className="page-bg" style={{display:'flex', alignItems:'center', justifyContent:'center'}}>
      <p style={{color:'#22c55e', fontWeight:600}}>Loading...</p>
    </div>
  );

  return (
    <div className="page-bg" onClick={() => activeMenu && setActiveMenu(null)}>
      <Navbar user={user}/>
      <div className="center-wrap-sm" style={{flex:1, paddingTop:'1.25rem', paddingBottom:'2rem'}}>

        {/* Welcome */}
        <div className="post-card fade-in" style={{display:'flex', alignItems:'center', gap:'0.75rem', marginBottom:'0.65rem'}}>
          <Avatar user={user} size={42} radius="12px" onClick={() => router.push('/profile')}/>
          <div>
            <p style={{fontWeight:600, color:'white', fontSize:'0.9rem'}}>
              Welcome back, <span style={{color:'#22c55e'}}>{user?.name}</span>! 👋
            </p>
            <p style={{color:'rgba(255,255,255,0.35)', fontSize:'0.72rem'}}>
              {user?.department} • Batch {user?.batch} • <span style={{color:'#22c55e'}}>{user?.role}</span>
            </p>
          </div>
        </div>

        {/* Create Post */}
        <div className="post-card fade-in" style={{marginBottom:'0.65rem'}}>
          <form onSubmit={handlePost}>
            <div style={{display:'flex', gap:'0.65rem', marginBottom:'0.5rem'}}>
              <Avatar user={user} size={34} radius="8px"/>
              <textarea value={newPost} onChange={(e) => setNewPost(e.target.value)}
                placeholder="Share something with the community..."
                className="input-field" style={{resize:'none', fontSize:'0.85rem', flex:1}} rows={3}/>
            </div>

            {imagePreview.length > 0 && (
              <div style={{display:'flex', gap:'0.5rem', flexWrap:'wrap', marginBottom:'0.5rem', paddingLeft:'3rem'}}>
                {imagePreview.map((src, i) => (
                  <div key={i} style={{position:'relative'}}>
                    <img src={src} alt="" style={{width:'80px', height:'80px', objectFit:'cover', borderRadius:'8px', border:'1px solid rgba(34,197,94,0.3)'}}/>
                    <button type="button" onClick={() => {
                      setPostImages(prev => prev.filter((_, idx) => idx !== i));
                      setImagePreview(prev => prev.filter((_, idx) => idx !== i));
                    }} style={{position:'absolute', top:'-6px', right:'-6px', background:'#ef4444', border:'none', color:'white', borderRadius:'50%', width:'18px', height:'18px', cursor:'pointer', fontSize:'0.7rem', display:'flex', alignItems:'center', justifyContent:'center'}}>×</button>
                  </div>
                ))}
              </div>
            )}

            <div style={{display:'flex', justifyContent:'space-between', alignItems:'center', paddingLeft:'3rem'}}>
              <label style={{cursor:'pointer', display:'flex', alignItems:'center', gap:'0.4rem'}}>
                <ImageIcon size={16} color="#22c55e"/>
                <span style={{color:'rgba(255,255,255,0.45)', fontSize:'0.78rem'}}>Add Photos</span>
                <input type="file" accept="image/*" multiple onChange={handleImageSelect} style={{display:'none'}}/>
              </label>
              <button type="submit" className="btn-primary" style={{padding:'0.4rem 1.1rem', fontSize:'0.82rem'}}>Post</button>
            </div>
          </form>
        </div>

        {/* Posts */}
        {posts.length === 0 ? (
          <p style={{textAlign:'center', color:'rgba(255,255,255,0.25)', padding:'2rem 0', fontSize:'0.85rem'}}>No posts yet. Be the first! 🚀</p>
        ) : (
          <>
            {posts.map((post) => (
              <div key={post.id} className="feed-card" style={{marginBottom:'0.65rem'}} onClick={(e) => e.stopPropagation()}>
                <div style={{display:'flex', alignItems:'center', gap:'0.6rem', marginBottom:'0.6rem'}}>
                  <Link href={`/users/${post.user?.id}`}>
                    <Avatar user={post.user} size={36} radius="10px"/>
                  </Link>
                  <div style={{flex:1, minWidth:0}}>
                    <Link href={`/users/${post.user?.id}`} style={{fontWeight:600, color:'white', fontSize:'0.85rem', textDecoration:'none'}}>
                      {post.user?.name}
                    </Link>
                    <p style={{color:'rgba(255,255,255,0.3)', fontSize:'0.7rem'}}>{post.user?.department} • Batch {post.user?.batch} • {new Date(post.createdAt).toLocaleDateString()}</p>
                  </div>
                  {post.userId === user?.id && (
                    <div style={{position:'relative', flexShrink:0}}>
                      <button onClick={(e) => { e.stopPropagation(); setActiveMenu(activeMenu === post.id ? null : post.id); }}
                        style={{background:'transparent', border:'none', color:'rgba(255,255,255,0.3)', cursor:'pointer', padding:'0.25rem', borderRadius:'6px', display:'flex', alignItems:'center'}}
                        onMouseEnter={e => e.currentTarget.style.color='#22c55e'}
                        onMouseLeave={e => e.currentTarget.style.color='rgba(255,255,255,0.3)'}>
                        <MoreVertical size={16}/>
                      </button>
                      {activeMenu === post.id && (
                        <div className="dropdown-menu" style={{position:'absolute', right:0, top:'1.75rem', zIndex:20}}>
                          <button className="dropdown-item" onClick={() => { setEditingPost(post.id); setEditContent(post.content); setActiveMenu(null); }}>
                            <Edit2 size={13}/> Edit
                          </button>
                          <button className="dropdown-item dropdown-item-danger" onClick={() => handleDeletePost(post.id)}>
                            <Trash2 size={13}/> Delete
                          </button>
                        </div>
                      )}
                    </div>
                  )}
                </div>

                {editingPost === post.id ? (
                  <div style={{marginBottom:'0.6rem'}}>
                    <textarea value={editContent} onChange={(e) => setEditContent(e.target.value)}
                      className="input-field" style={{resize:'none', fontSize:'0.85rem', marginBottom:'0.4rem'}} rows={3} autoFocus/>
                    <div style={{display:'flex', gap:'0.4rem'}}>
                      <button onClick={() => handleEditPost(post.id)} className="btn-primary" style={{padding:'0.35rem 0.75rem', fontSize:'0.78rem'}}>
                        <Send size={12}/> Save
                      </button>
                      <button onClick={() => { setEditingPost(null); setEditContent(''); }} className="btn-outline" style={{padding:'0.35rem 0.75rem', fontSize:'0.78rem'}}>
                        <X size={12}/> Cancel
                      </button>
                    </div>
                  </div>
                ) : (
                  <>
                    {post.content && (
                      <p style={{color:'rgba(255,255,255,0.82)', fontSize:'0.875rem', lineHeight:'1.6', marginBottom:'0.6rem'}}>{post.content}</p>
                    )}
                    {post.images && post.images.length > 0 && (
                      <div style={{
                        display:'grid',
                        gridTemplateColumns: post.images.length === 1 ? '1fr' : post.images.length === 2 ? '1fr 1fr' : 'repeat(3, 1fr)',
                        gap:'0.3rem', marginBottom:'0.6rem', borderRadius:'10px', overflow:'hidden'
                      }}>
                        {post.images.map((img, i) => (
                          <img key={i} src={img.url} alt="" style={{
                            width:'100%', aspectRatio: post.images.length === 1 ? '16/9' : '1/1',
                            objectFit:'cover', cursor:'pointer',
                            maxHeight: post.images.length === 1 ? '400px' : '200px'
                          }} onClick={() => window.open(img.url, '_blank')}/>
                        ))}
                      </div>
                    )}
                  </>
                )}

                {(likeCounts[post.id] > 0 || post._count?.comments > 0) && (
                  <div style={{display:'flex', gap:'0.75rem', marginBottom:'0.4rem', paddingBottom:'0.4rem', borderBottom:'1px solid rgba(255,255,255,0.05)'}}>
                    {likeCounts[post.id] > 0 && (
                      <span style={{color:'rgba(255,255,255,0.3)', fontSize:'0.72rem', display:'flex', alignItems:'center', gap:'0.25rem'}}>
                        <ThumbsUp size={11} color="#22c55e"/> {likeCounts[post.id]} {likeCounts[post.id] === 1 ? 'like' : 'likes'}
                      </span>
                    )}
                    {post._count?.comments > 0 && (
                      <span style={{color:'rgba(255,255,255,0.3)', fontSize:'0.72rem', display:'flex', alignItems:'center', gap:'0.25rem'}}>
                        <MessageCircle size={11} color="#60a5fa"/> {post._count.comments} {post._count.comments === 1 ? 'comment' : 'comments'}
                      </span>
                    )}
                  </div>
                )}

                <div style={{display:'flex', alignItems:'center', gap:'0.25rem'}}>
                  <button className={`btn-ghost ${likedPosts[post.id] ? 'active' : ''}`}
                    onClick={() => handleLike(post.id)}
                    style={{color: likedPosts[post.id] ? '#22c55e' : undefined, fontSize:'0.78rem'}}>
                    <ThumbsUp size={13}/> Like
                  </button>
                  <button className="btn-ghost" onClick={() => openComments(post.id)}
                    style={{color: commentOpen === post.id ? '#60a5fa' : undefined, fontSize:'0.78rem'}}>
                    <MessageCircle size={13}/> Comment
                  </button>
                  <button className="btn-ghost" style={{fontSize:'0.78rem'}}
                    onClick={() => { navigator.clipboard.writeText(window.location.origin + '/users/' + post.user?.id); alert('Link copied!'); }}>
                    <Share2 size={13}/> Share
                  </button>
                </div>

                {commentOpen === post.id && (
                  <div style={{marginTop:'0.65rem', borderTop:'1px solid rgba(255,255,255,0.06)', paddingTop:'0.65rem'}}>
                    <div style={{display:'flex', flexDirection:'column', gap:'0.6rem', marginBottom:'0.65rem', maxHeight:'300px', overflowY:'auto'}}>
                      {!comments[post.id] ? (
                        <p style={{color:'rgba(255,255,255,0.25)', fontSize:'0.78rem'}}>Loading...</p>
                      ) : comments[post.id].length === 0 ? (
                        <p style={{color:'rgba(255,255,255,0.25)', fontSize:'0.78rem'}}>No comments yet. Be the first!</p>
                      ) : (
                        comments[post.id].map((comment) => (
                          <CommentItem key={comment.id} comment={comment} currentUser={user} postId={post.id} token={token} depth={0}/>
                        ))
                      )}
                    </div>
                    <form onSubmit={(e) => handleComment(e, post.id)} style={{display:'flex', gap:'0.4rem', alignItems:'center'}}>
                      <Avatar user={user} size={28} radius="8px"/>
                      <input type="text" value={newComment} onChange={(e) => setNewComment(e.target.value)}
                        placeholder="Write a comment..." className="input-field" style={{fontSize:'0.8rem', padding:'0.4rem 0.75rem'}}/>
                      <button type="submit" disabled={commentLoading} className="btn-primary" style={{padding:'0.4rem 0.65rem', flexShrink:0}}>
                        <Send size={13}/>
                      </button>
                    </form>
                  </div>
                )}
              </div>
            ))}
            <p style={{textAlign:'center', color:'rgba(255,255,255,0.18)', fontSize:'0.72rem', padding:'1.25rem 0'}}>
              — No more posts. Invite your friends to join! —
            </p>
          </>
        )}
      </div>
      <Footer/>
    </div>
  );
}