import { useState, useEffect, useRef } from 'react';
import { Link } from 'react-router-dom';
import { useLanguage } from '@/contexts/LanguageContext';
import { useAuth } from '@/contexts/AuthContext';
import { supabase } from '@/integrations/supabase/client';
import { Lock, Send, Plus, Users, EyeOff, ArrowLeft, Search, MessageCircle, Check, CheckCheck } from 'lucide-react';
import { toast } from 'sonner';
import { motion, AnimatePresence } from 'framer-motion';

const Chat = () => {
  const { t } = useLanguage();
  const { user, profile } = useAuth();
  const [rooms, setRooms] = useState<any[]>([]);
  const [currentRoom, setCurrentRoom] = useState<any>(null);
  const [messages, setMessages] = useState<any[]>([]);
  const [newMsg, setNewMsg] = useState('');
  const [newRoomName, setNewRoomName] = useState('');
  const [isAnon, setIsAnon] = useState(false);
  const [showCreate, setShowCreate] = useState(false);
  const [friendEmail, setFriendEmail] = useState('');
  const [searchQuery, setSearchQuery] = useState('');
  const [showSidebar, setShowSidebar] = useState(true);
  const bottomRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!user) return;
    fetchRooms();
    ensureAnonRoom();
  }, [user]);

  useEffect(() => {
    if (!currentRoom) return;
    fetchMessages(currentRoom.id);
    const channel = supabase.channel(`room-${currentRoom.id}`)
      .on('postgres_changes', { event: 'INSERT', schema: 'public', table: 'chat_messages', filter: `room_id=eq.${currentRoom.id}` },
        (payload) => setMessages(prev => [...prev, payload.new]))
      .subscribe();
    return () => { supabase.removeChannel(channel); };
  }, [currentRoom?.id]);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const ensureAnonRoom = async () => {
    const { data: existing } = await supabase.from('chat_rooms').select('*').eq('is_anonymous', true).limit(1);
    if (!existing?.length) {
      const { data: newRoom } = await supabase.from('chat_rooms').insert({ name: 'Anonymous Support', is_anonymous: true, created_by: user!.id }).select().single();
      if (newRoom) await supabase.from('chat_members').insert({ room_id: newRoom.id, user_id: user!.id });
    } else {
      const { data: membership } = await supabase.from('chat_members').select('id').eq('room_id', existing[0].id).eq('user_id', user!.id);
      if (!membership?.length) await supabase.from('chat_members').insert({ room_id: existing[0].id, user_id: user!.id });
    }
    fetchRooms();
  };

  const fetchRooms = async () => {
    const { data } = await supabase.from('chat_rooms').select('*').order('created_at', { ascending: false });
    if (data) setRooms(data);
  };

  const fetchMessages = async (roomId: string) => {
    const { data } = await supabase.from('chat_messages').select('*').eq('room_id', roomId).order('created_at', { ascending: true }).limit(200);
    if (data) setMessages(data);
  };

  const sendMessage = async () => {
    if (!newMsg.trim() || !currentRoom || !user) return;
    await supabase.from('chat_messages').insert({ room_id: currentRoom.id, user_id: user.id, content: newMsg.trim() });
    setNewMsg('');
  };

  const createRoom = async () => {
    if (!newRoomName.trim() || !user) return;
    const { data: room } = await supabase.from('chat_rooms')
      .insert({ name: newRoomName.trim(), is_anonymous: isAnon, created_by: user.id })
      .select().single();
    if (room) {
      await supabase.from('chat_members').insert({ room_id: room.id, user_id: user.id });
      if (friendEmail.trim()) toast.info(t('chat.inviteSent'));
      setNewRoomName('');
      setFriendEmail('');
      setShowCreate(false);
      fetchRooms();
      setCurrentRoom(room);
      setShowSidebar(false);
    }
  };

  const selectRoom = (room: any) => {
    setCurrentRoom(room);
    setShowSidebar(false);
  };

  const filteredRooms = rooms.filter(r => 
    !searchQuery || (r.name || '').toLowerCase().includes(searchQuery.toLowerCase())
  );

  const formatTime = (dateStr: string) => {
    const d = new Date(dateStr);
    return d.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
  };

  const formatDate = (dateStr: string) => {
    const d = new Date(dateStr);
    const today = new Date();
    if (d.toDateString() === today.toDateString()) return null;
    const yesterday = new Date(today);
    yesterday.setDate(today.getDate() - 1);
    if (d.toDateString() === yesterday.toDateString()) return t('chat.yesterday') || 'Вчера';
    return d.toLocaleDateString();
  };

  // Group messages by date
  const groupedMessages: { date: string | null; msgs: any[] }[] = [];
  let lastDate = '';
  messages.forEach(msg => {
    const dateStr = new Date(msg.created_at).toDateString();
    if (dateStr !== lastDate) {
      lastDate = dateStr;
      groupedMessages.push({ date: formatDate(msg.created_at), msgs: [msg] });
    } else {
      groupedMessages[groupedMessages.length - 1].msgs.push(msg);
    }
  });

  if (!user) {
    return (
      <div className="min-h-screen pt-24 pb-16 flex items-center justify-center">
        <div className="text-center max-w-md mx-auto px-4">
          <Lock className="w-16 h-16 text-muted-foreground mx-auto mb-4" />
          <h2 className="text-2xl font-bold text-foreground mb-3">{t('chat.needAuth')}</h2>
          <Link to="/auth" className="inline-flex hero-gradient px-6 py-3 rounded-xl font-semibold text-primary-foreground">
            {t('chart.register')}
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen pt-16 bg-background">
      <div className="h-[calc(100vh-4rem)] flex">
        {/* Sidebar - WhatsApp style */}
        <div className={`${showSidebar || !currentRoom ? 'flex' : 'hidden md:flex'} w-full md:w-96 flex-shrink-0 flex-col border-r border-border bg-card`}>
          {/* Header */}
          <div className="px-4 py-3 bg-muted/50 flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-full bg-primary/20 flex items-center justify-center">
                <MessageCircle className="w-5 h-5 text-primary" />
              </div>
              <h2 className="font-bold text-foreground text-lg">{t('chat.rooms')}</h2>
            </div>
            <button onClick={() => setShowCreate(!showCreate)} className="w-10 h-10 rounded-full hover:bg-muted flex items-center justify-center transition-colors">
              <Plus className="w-5 h-5 text-muted-foreground" />
            </button>
          </div>

          {/* Search */}
          <div className="px-3 py-2">
            <div className="flex items-center bg-muted rounded-lg px-3 py-2 gap-2">
              <Search className="w-4 h-4 text-muted-foreground" />
              <input value={searchQuery} onChange={e => setSearchQuery(e.target.value)}
                className="flex-1 bg-transparent text-sm text-foreground placeholder:text-muted-foreground focus:outline-none"
                placeholder={t('chat.search') || 'Поиск...'} />
            </div>
          </div>

          {/* Create room panel */}
          <AnimatePresence>
            {showCreate && (
              <motion.div initial={{ height: 0, opacity: 0 }} animate={{ height: "auto", opacity: 1 }} exit={{ height: 0, opacity: 0 }}
                transition={{ duration: 0.2 }} className="overflow-hidden">
                <div className="p-3 border-b border-border space-y-2">
                  <input value={newRoomName} onChange={e => setNewRoomName(e.target.value)}
                    className="w-full px-3 py-2.5 bg-muted border border-border rounded-lg text-foreground text-sm" placeholder={t('chat.roomName')} />
                  <input value={friendEmail} onChange={e => setFriendEmail(e.target.value)}
                    className="w-full px-3 py-2.5 bg-muted border border-border rounded-lg text-foreground text-sm" placeholder={t('chat.friendEmail')} />
                  <label className="flex items-center gap-2 text-sm text-muted-foreground cursor-pointer">
                    <input type="checkbox" checked={isAnon} onChange={e => setIsAnon(e.target.checked)} className="rounded" />
                    {t('chat.anonymous')}
                  </label>
                  <button onClick={createRoom} className="w-full hero-gradient text-primary-foreground py-2.5 rounded-lg text-sm font-semibold">
                    {t('chat.create')}
                  </button>
                </div>
              </motion.div>
            )}
          </AnimatePresence>

          {/* Room list */}
          <div className="flex-1 overflow-y-auto">
            {filteredRooms.map(room => (
              <button key={room.id} onClick={() => selectRoom(room)}
                className={`w-full text-left px-4 py-3 flex items-center gap-3 border-b border-border/50 transition-colors ${
                  currentRoom?.id === room.id ? 'bg-primary/10' : 'hover:bg-muted/50'
                }`}>
                <div className={`w-12 h-12 rounded-full flex items-center justify-center flex-shrink-0 ${
                  room.is_anonymous ? 'bg-accent/20' : 'bg-primary/20'
                }`}>
                  {room.is_anonymous ? <EyeOff className="w-5 h-5 text-accent" /> : <Users className="w-5 h-5 text-primary" />}
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center justify-between">
                    <span className="font-semibold text-foreground text-sm truncate">{room.name || 'Chat'}</span>
                    <span className="text-[11px] text-muted-foreground">{formatTime(room.created_at)}</span>
                  </div>
                  <p className="text-xs text-muted-foreground truncate mt-0.5">
                    {room.is_anonymous ? t('chat.anonMode') : t('chat.rooms')}
                  </p>
                </div>
              </button>
            ))}
          </div>
        </div>

        {/* Messages area */}
        <div className={`${!showSidebar || currentRoom ? 'flex' : 'hidden md:flex'} flex-1 flex-col bg-[hsl(var(--background))]`}>
          {currentRoom ? (
            <>
              {/* Chat header */}
              <div className="px-4 py-3 bg-muted/50 border-b border-border flex items-center gap-3">
                <button onClick={() => setShowSidebar(true)} className="md:hidden p-1">
                  <ArrowLeft className="w-5 h-5 text-muted-foreground" />
                </button>
                <div className={`w-10 h-10 rounded-full flex items-center justify-center ${
                  currentRoom.is_anonymous ? 'bg-accent/20' : 'bg-primary/20'
                }`}>
                  {currentRoom.is_anonymous ? <EyeOff className="w-5 h-5 text-accent" /> : <Users className="w-5 h-5 text-primary" />}
                </div>
                <div>
                  <h3 className="font-bold text-foreground text-sm">{currentRoom.name}</h3>
                  {currentRoom.is_anonymous && <span className="text-[11px] text-muted-foreground">{t('chat.anonMode')}</span>}
                </div>
              </div>

              {/* Messages */}
              <div className="flex-1 overflow-y-auto px-4 py-3 space-y-1" style={{ backgroundImage: 'radial-gradient(circle at 50% 50%, hsl(var(--muted) / 0.3) 0%, transparent 100%)' }}>
                {groupedMessages.map((group, gi) => (
                  <div key={gi}>
                    {group.date && (
                      <div className="flex justify-center my-3">
                        <span className="bg-muted/80 text-muted-foreground text-[11px] px-3 py-1 rounded-full">{group.date}</span>
                      </div>
                    )}
                    {group.msgs.map((msg: any) => {
                      const isMine = msg.user_id === user.id;
                      return (
                        <motion.div key={msg.id} initial={{ opacity: 0, y: 10, scale: 0.95 }} animate={{ opacity: 1, y: 0, scale: 1 }}
                          transition={{ duration: 0.2 }}
                          className={`flex ${isMine ? 'justify-end' : 'justify-start'} mb-1`}>
                          <div className={`max-w-[75%] px-3 py-2 rounded-lg text-sm relative ${
                            isMine
                              ? 'bg-primary text-primary-foreground rounded-br-sm'
                              : 'bg-card text-foreground border border-border rounded-bl-sm'
                          }`}>
                            {currentRoom.is_anonymous && !isMine && (
                              <p className="text-[11px] opacity-70 font-medium mb-0.5">{t('chat.anonUser')}</p>
                            )}
                            <span>{msg.content}</span>
                            <span className={`text-[10px] ml-2 inline-flex items-center gap-0.5 ${isMine ? 'opacity-70' : 'text-muted-foreground'}`}>
                              {formatTime(msg.created_at)}
                              {isMine && <CheckCheck className="w-3 h-3" />}
                            </span>
                          </div>
                        </motion.div>
                      );
                    })}
                  </div>
                ))}
                <div ref={bottomRef} />
              </div>

              {/* Input */}
              <div className="px-3 py-2 bg-muted/50 border-t border-border flex items-center gap-2">
                <input value={newMsg} onChange={e => setNewMsg(e.target.value)}
                  onKeyDown={e => e.key === 'Enter' && sendMessage()}
                  className="flex-1 px-4 py-2.5 bg-card border border-border rounded-full text-foreground text-sm focus:outline-none focus:ring-1 focus:ring-ring"
                  placeholder={t('chat.typePlaceholder')} />
                <button onClick={sendMessage} className="w-10 h-10 rounded-full hero-gradient flex items-center justify-center text-primary-foreground hover:opacity-90 transition-opacity">
                  <Send className="w-4 h-4" />
                </button>
              </div>
            </>
          ) : (
            <div className="flex-1 flex items-center justify-center">
              <div className="text-center">
                <MessageCircle className="w-16 h-16 text-muted-foreground/30 mx-auto mb-4" />
                <p className="text-muted-foreground">{t('chat.selectRoom')}</p>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default Chat;
