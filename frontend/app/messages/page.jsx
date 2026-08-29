'use client';
export const dynamic = 'force-dynamic';

import { Suspense } from 'react';
import { useEffect, useState, useCallback, useRef, memo } from 'react';
import axios from 'axios';
import { useRouter, useSearchParams } from 'next/navigation';
import { Send, Search, MessageCircle, MessageSquare, ArrowLeft, X, Smile } from 'lucide-react';
import io from 'socket.io-client';
import Sidebar from '../components/Sidebar';
import Avatar from '../components/Avatar';
import Link from 'next/link';

const MSG_EMOJIS = ['👍','❤️','😂','😮','😢','🔥'];

const MessageBubble = memo(({ msg, currentUser, selectedUser, reactions, onReact, onImageClick }) => {
  const isMe = msg.senderId === currentUser?.id;
  const [hovered, setHovered] = useState(false);
  const [showPicker, setShowPicker] = useState(false);
  const reactionCounts = (reactions || []).reduce((acc, r) => {
    acc[r.emoji] = (acc[r.emoji] || 0) + 1;
    return acc;
  }, {});
  const myReaction = (reactions || []).find(r => r.userId === currentUser?.id);

  return (
    <div style={{display:'flex',justifyContent:isMe?'flex-end':'flex-start',alignItems:'flex-end',gap:'0.4rem',marginBottom:'0.4rem'}}>
      {!isMe && <Avatar user={selectedUser} size={26} radius="7px"/>}
      <div style={{maxWidth:'70%',position:'relative'}}
        onMouseEnter={()=>setHovered(true)}
        onMouseLeave={()=>{setHovered(false);setShowPicker(false);}}>
        {showPicker && (
          <div style={{position:'absolute',bottom:'calc(100% + 6px)',[isMe?'right':'left']:0,background:'rgba(10,18,10,0.98)',border:'1px solid rgba(34,197,94,0.25)',borderRadius:'14px',padding:'0.5rem',display:'flex',gap:'0.3rem',zIndex:50,boxShadow:'0 8px 32px rgba(0,0,0,0.7)'}}>
            {MSG_EMOJIS.map(emoji => (
              <button key={emoji}
                onMouseDown={e=>{e.preventDefault();onReact(msg.id,emoji);setShowPicker(false);}}
                style={{background:myReaction?.emoji===emoji?'rgba(34,197,94,0.2)':'transparent',border:'none',cursor:'pointer',fontSize:'1.25rem',padding:'0.3rem',borderRadius:'8px',lineHeight:1}}>
                {emoji}
              </button>
            ))}
          </div>
        )}
        <div style={{borderRadius:isMe?'14px 14px 3px 14px':'14px 14px 14px 3px',background:isMe?'linear-gradient(135deg,#16a34a,#0f3d2e)':'rgba(255,255,255,0.07)',border:isMe?'none':'1px solid rgba(34,197,94,0.12)',overflow:'hidden'}}>
          {msg.fileType==='image'&&msg.fileUrl&&(
            <img src={msg.fileUrl} alt="img" style={{width:'100%',maxWidth:'280px',display:'block',cursor:'zoom-in'}} onClick={()=>onImageClick(msg.fileUrl)}/>
          )}
          {msg.content&&(
            <div style={{padding:'0.65rem 0.9rem'}}>
              <p style={{fontSize:'0.875rem',lineHeight:'1.55',color:'white',whiteSpace:'pre-wrap',wordBreak:'break-word'}}>{msg.content}</p>
            </div>
          )}
          <div style={{padding:'0 0.9rem 0.35rem',display:'flex',alignItems:'center',justifyContent:'flex-end',gap:'0.5rem'}}>
            {hovered&&(
              <button onMouseDown={e=>{e.preventDefault();setShowPicker(p=>!p);}}
                style={{background:'transparent',border:'none',cursor:'pointer',color:'rgba(255,255,255,0.5)',padding:'0',display:'flex',alignItems:'center'}}>
                <Smile size={13}/>
              </button>
            )}
            <span style={{fontSize:'0.62rem',color:isMe?'rgba(255,255,255,0.4)':'rgba(255,255,255,0.25)'}}>
              {new Date(msg.createdAt).toLocaleTimeString([],{hour:'2-digit',minute:'2-digit'})}
            </span>
          </div>
        </div>
        {Object.keys(reactionCounts).length>0&&(
          <div style={{display:'flex',gap:'0.2rem',flexWrap:'wrap',marginTop:'0.25rem',justifyContent:isMe?'flex-end':'flex-start'}}>
            {Object.entries(reactionCounts).map(([emoji,count])=>(
              <button key={emoji} onMouseDown={e=>{e.preventDefault();onReact(msg.id,emoji);}}
                style={{background:myReaction?.emoji===emoji?'rgba(34,197,94,0.15)':'rgba(255,255,255,0.07)',border:myReaction?.emoji===emoji?'1px solid rgba(34,197,94,0.4)':'1px solid rgba(255,255,255,0.08)',borderRadius:'999px',padding:'2px 7px',fontSize:'0.73rem',cursor:'pointer',display:'flex',alignItems:'center',gap:'0.2rem'}}>
                {emoji}{count>1&&<span style={{color:'rgba(255,255,255,0.55)',fontSize:'0.68rem'}}>{count}</span>}
              </button>
            ))}
          </div>
        )}
      </div>
      {isMe&&<Avatar user={currentUser} size={26} radius="7px"/>}
    </div>
  );
});
MessageBubble.displayName='MessageBubble';

function MessagesContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [user, setUser] = useState(null);
  const [conversations, setConversations] = useState([]);
  const [connectedUsers, setConnectedUsers] = useState([]);
  const [selectedUser, setSelectedUser] = useState(null);
  const [messages, setMessages] = useState([]);
  const [newMessage, setNewMessage] = useState('');
  const [loading, setLoading] = useState(true);
  const [msgLoading, setMsgLoading] = useState(false);
  const [search, setSearch] = useState('');
  const [token, setToken] = useState('');
  const [showChat, setShowChat] = useState(false);
  const [sending, setSending] = useState(false);
  const [lightboxImg, setLightboxImg] = useState(null);
  const [msgReactions, setMsgReactions] = useState({});
  const socketRef = useRef(null);
  const bottomRef = useRef(null);
  const inputRef = useRef(null);
  const selectedUserRef = useRef(null);
  const tokenRef = useRef('');

  useEffect(()=>{selectedUserRef.current=selectedUser;},[selectedUser]);
  useEffect(()=>{tokenRef.current=token;},[token]);

  const fetchConversations = useCallback(async(tkn)=>{
    try {
      const res = await axios.get(`${process.env.NEXT_PUBLIC_API_URL}/messages/conversations`,{headers:{Authorization:`Bearer ${tkn}`}});
      setConversations(res.data);
    } catch {}
  },[]);

  const fetchConnectedUsers = useCallback(async(tkn,currentUser)=>{
    try {
      const res = await axios.get(`${process.env.NEXT_PUBLIC_API_URL}/connections/my`,{headers:{Authorization:`Bearer ${tkn}`}});
      setConnectedUsers(res.data.map(conn=>conn.senderId===currentUser.id?conn.receiver:conn.sender));
    } catch {} finally{setLoading(false);}
  },[]);

  useEffect(()=>{
    const tkn = localStorage.getItem('token');
    const userData = localStorage.getItem('user');
    if(!tkn){router.push('/login');return;}
    setToken(tkn);
    tokenRef.current=tkn;
    const parsedUser = JSON.parse(userData||'{}');
    setUser(parsedUser);
    fetchConversations(tkn);
    fetchConnectedUsers(tkn,parsedUser);
    try{const saved=JSON.parse(localStorage.getItem('mb_msg_reactions')||'{}');setMsgReactions(saved);}catch{}
    socketRef.current = io(process.env.NEXT_PUBLIC_API_URL?.replace('/api',''), {transports:['websocket','polling'],reconnection:true});
    socketRef.current.emit('join',String(parsedUser.id));
    socketRef.current.on('receiveMessage',(data)=>{
      const cur=selectedUserRef.current;
      if(cur&&(data.senderId===cur.id||data.receiverId===cur.id)){setMessages(prev=>[...prev,data]);}
      fetchConversations(tokenRef.current);
    });
    return()=>{socketRef.current?.disconnect();};
  },[router,fetchConversations,fetchConnectedUsers]);

  useEffect(()=>{
    const urlUserId=searchParams.get('userId');
    const urlUserName=searchParams.get('userName');
    if(!urlUserId)return;
    const fromConv=conversations.find(c=>c.user.id===parseInt(urlUserId));
    if(fromConv){setSelectedUser(fromConv.user);setShowChat(true);return;}
    const fromConn=connectedUsers.find(u=>u.id===parseInt(urlUserId));
    if(fromConn){setSelectedUser(fromConn);setShowChat(true);return;}
    if(urlUserName){setSelectedUser({id:parseInt(urlUserId),name:decodeURIComponent(urlUserName),avatar:null});setShowChat(true);}
  },[searchParams,conversations,connectedUsers]);

  useEffect(()=>{
    if(selectedUser&&token){
      setMsgLoading(true);setMessages([]);
      axios.get(`${process.env.NEXT_PUBLIC_API_URL}/messages/${selectedUser.id}`,{headers:{Authorization:`Bearer ${token}`}})
        .then(res=>setMessages(res.data)).catch(()=>{}).finally(()=>setMsgLoading(false));
    }
  },[selectedUser,token]);

  useEffect(()=>{bottomRef.current?.scrollIntoView({behavior:'smooth'});},[messages]);

  const handleReact = useCallback((msgId,emoji)=>{
    setMsgReactions(prev=>{
      const existing=prev[msgId]||[];
      const myUserId=JSON.parse(localStorage.getItem('user')||'{}').id;
      const myReaction=existing.find(r=>r.userId===myUserId);
      let updated;
      if(myReaction){
        if(myReaction.emoji===emoji){updated={...prev,[msgId]:existing.filter(r=>r.userId!==myUserId)};}
        else{updated={...prev,[msgId]:existing.map(r=>r.userId===myUserId?{...r,emoji}:r)};}
      } else{updated={...prev,[msgId]:[...existing,{userId:myUserId,emoji}]};}
      try{localStorage.setItem('mb_msg_reactions',JSON.stringify(updated));}catch{}
      return updated;
    });
    setTimeout(()=>inputRef.current?.focus(),10);
  },[]);

  const sendMessage = useCallback(async()=>{
    const msg=newMessage.trim();
    if(!msg||!selectedUser||sending)return;
    setSending(true);setNewMessage('');
    try{
      const formData=new FormData();
      formData.append('content',msg);
      formData.append('receiverId',selectedUser.id);
      const res=await axios.post(`${process.env.NEXT_PUBLIC_API_URL}/messages/send`,formData,{headers:{Authorization:`Bearer ${token}`,'Content-Type':'multipart/form-data'}});
      setMessages(prev=>[...prev,res.data]);
      socketRef.current?.emit('sendMessage',res.data);
      fetchConversations(token);
    }catch{setNewMessage(msg);}
    finally{setSending(false);setTimeout(()=>inputRef.current?.focus(),0);}
  },[newMessage,selectedUser,sending,token,fetchConversations]);

  const convUserIds=new Set(conversations.map(c=>c.user.id));
  const filteredContacts=[
    ...conversations.map(c=>({user:connectedUsers.find(u=>u.id===c.user.id)||c.user,lastMessage:c.lastMessage,unread:c.unread})),
    ...connectedUsers.filter(u=>!convUserIds.has(u.id)).map(u=>({user:u,lastMessage:null,unread:0}))
  ].filter(c=>c.user.name.toLowerCase().includes(search.toLowerCase()));

  const getPreview=(msg)=>{
    if(!msg)return'Say hi! 👋';
    if(msg.fileType==='image')return'📷 Image';
    return msg.content||'';
  };

  return (
    <div className="page-bg">
      <Sidebar user={user}/>
      <div className="main-with-sidebar" style={{height:'100vh',overflow:'hidden'}}>
        {/* Desktop */}
        <div className="hidden-mobile" style={{display:'flex',height:'100%',overflow:'hidden'}}>
          {/* Contact List */}
          <div style={{width:'320px',flexShrink:0,height:'100%',overflow:'hidden',display:'flex',flexDirection:'column',background:'rgba(21,28,20,0.95)',borderRight:'1px solid rgba(34,197,94,0.1)'}}>
            <div style={{padding:'1.25rem 1rem',borderBottom:'1px solid rgba(34,197,94,0.1)',flexShrink:0}}>
              <h2 style={{fontFamily:"'Plus Jakarta Sans',sans-serif",fontWeight:800,fontSize:'1.4rem',color:'white',marginBottom:'0.875rem'}}>Messages</h2>
              <div style={{position:'relative'}}>
                <Search size={14} style={{position:'absolute',left:'0.75rem',top:'50%',transform:'translateY(-50%)',color:'var(--text3)'}}/>
                <input type="text" placeholder="Search..." value={search} onChange={e=>setSearch(e.target.value)}
                  className="input-field" style={{paddingLeft:'2.25rem',fontSize:'0.82rem',borderRadius:'999px'}}/>
              </div>
            </div>
            <div style={{overflowY:'auto',flex:1}}>
              {loading?<p style={{color:'var(--text3)',padding:'1.5rem',textAlign:'center'}}>Loading...</p>
              :filteredContacts.length===0?(
                <div style={{padding:'3rem 1rem',textAlign:'center'}}>
                  <MessageCircle size={36} style={{color:'rgba(255,255,255,0.08)',margin:'0 auto 0.75rem',display:'block'}}/>
                  <p style={{color:'var(--text3)',fontSize:'0.82rem'}}>No conversations yet</p>
                </div>
              ):filteredContacts.map(conv=>(
                <div key={conv.user.id} onClick={()=>{setSelectedUser(conv.user);setShowChat(true);}}
                  style={{display:'flex',alignItems:'center',gap:'0.75rem',padding:'0.875rem 1rem',cursor:'pointer',background:selectedUser?.id===conv.user.id?'rgba(34,197,94,0.1)':'transparent',borderBottom:'1px solid rgba(255,255,255,0.04)',transition:'background 0.2s'}}
                  onMouseEnter={e=>{if(selectedUser?.id!==conv.user.id)e.currentTarget.style.background='rgba(255,255,255,0.04)';}}
                  onMouseLeave={e=>{if(selectedUser?.id!==conv.user.id)e.currentTarget.style.background='transparent';}}>
                  <div style={{position:'relative',flexShrink:0}}>
                    <Avatar user={conv.user} size={42} radius="10px"/>
                    <span style={{position:'absolute',bottom:'-1px',right:'-1px',width:'10px',height:'10px',borderRadius:'50%',background:'#22c55e',border:'2px solid #151c14'}}/>
                  </div>
                  <div style={{flex:1,minWidth:0}}>
                    <div style={{display:'flex',justifyContent:'space-between',alignItems:'center'}}>
                      <p style={{fontWeight:600,color:'white',fontSize:'0.875rem'}}>{conv.user.name}</p>
                      {conv.unread>0&&<span style={{background:'#22c55e',color:'white',borderRadius:'999px',fontSize:'0.62rem',padding:'1px 6px',fontWeight:800}}>{conv.unread}</span>}
                    </div>
                    <p style={{color:'var(--text3)',fontSize:'0.73rem',overflow:'hidden',textOverflow:'ellipsis',whiteSpace:'nowrap'}}>{getPreview(conv.lastMessage)}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Chat Window */}
          <div style={{flex:1,display:'flex',flexDirection:'column',height:'100%',background:'rgba(15,21,13,0.8)'}}>
            {!selectedUser?(
              <div style={{flex:1,display:'flex',alignItems:'center',justifyContent:'center',flexDirection:'column',gap:'0.875rem'}}>
                <MessageSquare size={52} style={{color:'rgba(255,255,255,0.07)'}}/>
                <p style={{color:'var(--text2)',fontSize:'0.9rem'}}>Select a contact to start chatting</p>
              </div>
            ):(
              <>
                <div style={{padding:'0.875rem 1.25rem',borderBottom:'1px solid rgba(34,197,94,0.1)',display:'flex',alignItems:'center',gap:'0.65rem',background:'rgba(21,28,20,0.95)',flexShrink:0}}>
                  <Link href={`/users/${selectedUser.id}`} style={{textDecoration:'none',display:'flex',alignItems:'center',gap:'0.65rem',flex:1,minWidth:0}}>
                    <Avatar user={selectedUser} size={38} radius="10px"/>
                    <div>
                      <p style={{fontWeight:700,color:'white',fontSize:'0.9rem',fontFamily:"'Plus Jakarta Sans',sans-serif"}}>{selectedUser.name}</p>
                      <p style={{color:'#22c55e',fontSize:'0.7rem',fontWeight:500}}>● Active now</p>
                    </div>
                  </Link>
                </div>
                <div style={{flex:1,overflowY:'auto',padding:'1.25rem',display:'flex',flexDirection:'column',gap:'0.25rem'}}>
                  {msgLoading?(
                    <div style={{display:'flex',justifyContent:'center',padding:'2rem'}}>
                      <div style={{width:'28px',height:'28px',border:'2px solid rgba(34,197,94,0.2)',borderTop:'2px solid #22c55e',borderRadius:'50%',animation:'spin 0.8s linear infinite'}}/>
                    </div>
                  ):messages.length===0?(
                    <div style={{flex:1,display:'flex',flexDirection:'column',alignItems:'center',justifyContent:'center'}}>
                      <div style={{fontSize:'2.5rem',marginBottom:'0.5rem'}}>👋</div>
                      <p style={{color:'var(--text2)',fontSize:'0.85rem'}}>Say hi to {selectedUser.name}!</p>
                    </div>
                  ):messages.map((msg,i)=>(
                    <MessageBubble key={msg.id||i} msg={msg} currentUser={user} selectedUser={selectedUser}
                      reactions={msgReactions[msg.id]} onReact={handleReact} onImageClick={setLightboxImg}/>
                  ))}
                  <div ref={bottomRef}/>
                </div>
                <div style={{padding:'1rem 1.25rem',borderTop:'1px solid rgba(34,197,94,0.1)',background:'rgba(21,28,20,0.95)',flexShrink:0}}>
                  <div style={{display:'flex',gap:'0.5rem',alignItems:'center'}}>
                    <Avatar user={user} size={30} radius="8px"/>
                    <input ref={inputRef} type="text" value={newMessage}
                      onChange={e=>setNewMessage(e.target.value)}
                      onKeyDown={e=>{if(e.key==='Enter'&&!e.shiftKey){e.preventDefault();sendMessage();}}}
                      placeholder={`Message ${selectedUser.name}...`}
                      className="input-field" style={{fontSize:'0.875rem',borderRadius:'999px'}} autoComplete="off"/>
                    <button onMouseDown={e=>{e.preventDefault();sendMessage();}} disabled={!newMessage.trim()||sending}
                      className="btn-primary" style={{padding:'0.5rem 1rem',flexShrink:0,borderRadius:'999px'}}>
                      {sending?'...':<Send size={15}/>}
                    </button>
                  </div>
                </div>
              </>
            )}
          </div>
        </div>

        {/* Mobile */}
        <div className="show-mobile" style={{height:'100%',flexDirection:'column',overflow:'hidden'}}>
          {!showChat?(
            <div style={{height:'100%',display:'flex',flexDirection:'column',background:'rgba(21,28,20,0.95)'}}>
              <div style={{padding:'1rem',borderBottom:'1px solid rgba(34,197,94,0.1)'}}>
                <h2 style={{color:'white',fontWeight:800,marginBottom:'0.75rem'}}>Messages</h2>
                <div style={{position:'relative'}}>
                  <Search size={14} style={{position:'absolute',left:'0.75rem',top:'50%',transform:'translateY(-50%)',color:'var(--text3)'}}/>
                  <input type="text" placeholder="Search..." value={search} onChange={e=>setSearch(e.target.value)}
                    className="input-field" style={{paddingLeft:'2.25rem',borderRadius:'999px'}}/>
                </div>
              </div>
              <div style={{overflowY:'auto',flex:1}}>
                {filteredContacts.map(conv=>(
                  <div key={conv.user.id} onClick={()=>{setSelectedUser(conv.user);setShowChat(true);}}
                    style={{display:'flex',alignItems:'center',gap:'0.75rem',padding:'0.875rem 1rem',cursor:'pointer',borderBottom:'1px solid rgba(255,255,255,0.04)'}}>
                    <Avatar user={conv.user} size={42} radius="10px"/>
                    <div style={{flex:1,minWidth:0}}>
                      <p style={{fontWeight:600,color:'white',fontSize:'0.875rem'}}>{conv.user.name}</p>
                      <p style={{color:'var(--text3)',fontSize:'0.73rem',overflow:'hidden',textOverflow:'ellipsis',whiteSpace:'nowrap'}}>{getPreview(conv.lastMessage)}</p>
                    </div>
                    {conv.unread>0&&<span style={{background:'#22c55e',color:'white',borderRadius:'999px',fontSize:'0.62rem',padding:'1px 6px',fontWeight:800}}>{conv.unread}</span>}
                  </div>
                ))}
              </div>
            </div>
          ):(
            <div style={{height:'100%',display:'flex',flexDirection:'column',background:'rgba(15,21,13,0.8)'}}>
              <div style={{padding:'0.875rem 1rem',borderBottom:'1px solid rgba(34,197,94,0.1)',display:'flex',alignItems:'center',gap:'0.65rem',background:'rgba(21,28,20,0.95)',flexShrink:0}}>
                <button onClick={()=>setShowChat(false)} style={{background:'transparent',border:'none',color:'#22c55e',cursor:'pointer',display:'flex',alignItems:'center'}}>
                  <ArrowLeft size={18}/>
                </button>
                <Avatar user={selectedUser} size={34} radius="9px"/>
                <p style={{fontWeight:700,color:'white',fontSize:'0.9rem'}}>{selectedUser?.name}</p>
              </div>
              <div style={{flex:1,overflowY:'auto',padding:'1rem',display:'flex',flexDirection:'column',gap:'0.25rem'}}>
                {messages.map((msg,i)=>(
                  <MessageBubble key={msg.id||i} msg={msg} currentUser={user} selectedUser={selectedUser}
                    reactions={msgReactions[msg.id]} onReact={handleReact} onImageClick={setLightboxImg}/>
                ))}
                <div ref={bottomRef}/>
              </div>
              <div style={{padding:'0.875rem',borderTop:'1px solid rgba(34,197,94,0.1)',background:'rgba(21,28,20,0.95)'}}>
                <div style={{display:'flex',gap:'0.5rem',alignItems:'center'}}>
                  <input ref={inputRef} type="text" value={newMessage}
                    onChange={e=>setNewMessage(e.target.value)}
                    onKeyDown={e=>{if(e.key==='Enter'&&!e.shiftKey){e.preventDefault();sendMessage();}}}
                    placeholder="Message..." className="input-field" style={{borderRadius:'999px'}} autoComplete="off"/>
                  <button onMouseDown={e=>{e.preventDefault();sendMessage();}} disabled={!newMessage.trim()||sending}
                    className="btn-primary" style={{padding:'0.5rem 0.875rem',borderRadius:'999px'}}>
                    <Send size={14}/>
                  </button>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>

      {lightboxImg&&(
        <div onClick={()=>setLightboxImg(null)} style={{position:'fixed',inset:0,background:'rgba(0,0,0,0.93)',zIndex:1000,display:'flex',alignItems:'center',justifyContent:'center'}}>
          <button onClick={()=>setLightboxImg(null)} style={{position:'absolute',top:'1rem',right:'1rem',background:'rgba(255,255,255,0.1)',border:'none',color:'white',borderRadius:'50%',width:'40px',height:'40px',cursor:'pointer',display:'flex',alignItems:'center',justifyContent:'center'}}>
            <X size={20}/>
          </button>
          <img src={lightboxImg} alt="full" onClick={e=>e.stopPropagation()} style={{maxWidth:'92vw',maxHeight:'88vh',objectFit:'contain',borderRadius:'8px'}}/>
        </div>
      )}
      <style>{`@keyframes spin{to{transform:rotate(360deg)}}`}</style>
    </div>
  );
}

export default function MessagesPage() {
  return (
    <Suspense fallback={
      <div className="page-bg" style={{display:'flex',alignItems:'center',justifyContent:'center'}}>
        <div style={{width:'40px',height:'40px',border:'3px solid rgba(34,197,94,0.2)',borderTop:'3px solid #22c55e',borderRadius:'50%',animation:'spin 0.8s linear infinite'}}/>
        <style>{`@keyframes spin{to{transform:rotate(360deg)}}`}</style>
      </div>
    }>
      <MessagesContent/>
    </Suspense>
  );
}