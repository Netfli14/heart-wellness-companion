import { useState, useEffect, useRef } from 'react';
import { Link } from 'react-router-dom';
import { useLanguage } from '@/contexts/LanguageContext';
import { useAuth } from '@/contexts/AuthContext';
import { supabase } from '@/integrations/supabase/client';
import { Lock, Send, Plus, Users, Eye, EyeOff, ArrowLeft } from 'lucide-react';
import { toast } from 'sonner';

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
  const bottomRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!user) return;
    fetchRooms();
    // Join default anonymous room
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
      if (newRoom) {
        await supabase.from('chat_members').insert({ room_id: newRoom.id, user_id: user!.id });
      }
    } else {
      // Join if not already member
      const { data: membership } = await supabase.from('chat_members').select('id').eq('room_id', existing[0].id).eq('user_id', user!.id);
      if (!membership?.length) {
        await supabase.from('chat_members').insert({ room_id: existing[0].id, user_id: user!.id });
      }
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
      if (friendEmail.trim()) {
        // Invite friend (they'll need to be registered)
        toast.info(t('chat.inviteSent'));
      }
      setNewRoomName('');
      setFriendEmail('');
      setShowCreate(false);
      fetchRooms();
      setCurrentRoom(room);
    }
  };

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
    <div className="min-h-screen pt-20 pb-4">
      <div className="max-w-6xl mx-auto px-4 sm:px-6">
        <div className="flex gap-4 h-[calc(100vh-6rem)]">
          {/* Sidebar */}
          <div className="w-72 flex-shrink-0 bg-card rounded-2xl border border-border flex flex-col">
            <div className="p-4 border-b border-border flex items-center justify-between">
              <h2 className="font-bold text-foreground">{t('chat.rooms')}</h2>
              <button onClick={() => setShowCreate(!showCreate)} className="p-2 rounded-lg bg-primary/10 text-primary hover:bg-primary/20">
                <Plus className="w-4 h-4" />
              </button>
            </div>
            {showCreate && (
              <div className="p-3 border-b border-border space-y-2">
                <input value={newRoomName} onChange={e => setNewRoomName(e.target.value)}
                  className="w-full px-3 py-2 bg-muted border border-border rounded-lg text-foreground text-sm" placeholder={t('chat.roomName')} />
                <input value={friendEmail} onChange={e => setFriendEmail(e.target.value)}
                  className="w-full px-3 py-2 bg-muted border border-border rounded-lg text-foreground text-sm" placeholder={t('chat.friendEmail')} />
                <label className="flex items-center gap-2 text-sm text-muted-foreground">
                  <input type="checkbox" checked={isAnon} onChange={e => setIsAnon(e.target.checked)} />
                  {t('chat.anonymous')}
                </label>
                <button onClick={createRoom} className="w-full hero-gradient text-primary-foreground py-2 rounded-lg text-sm font-semibold">
                  {t('chat.create')}
                </button>
              </div>
            )}
            <div className="flex-1 overflow-y-auto p-2 space-y-1">
              {rooms.map(room => (
                <button key={room.id} onClick={() => setCurrentRoom(room)}
                  className={`w-full text-left px-3 py-2.5 rounded-xl text-sm transition-all ${
                    currentRoom?.id === room.id ? 'bg-primary text-primary-foreground' : 'text-foreground hover:bg-muted'
                  }`}>
                  <div className="flex items-center gap-2">
                    {room.is_anonymous ? <EyeOff className="w-4 h-4 flex-shrink-0" /> : <Users className="w-4 h-4 flex-shrink-0" />}
                    <span className="truncate">{room.name || 'Chat'}</span>
                  </div>
                </button>
              ))}
            </div>
          </div>

          {/* Messages */}
          <div className="flex-1 bg-card rounded-2xl border border-border flex flex-col">
            {currentRoom ? (
              <>
                <div className="p-4 border-b border-border flex items-center gap-3">
                  {currentRoom.is_anonymous ? <EyeOff className="w-5 h-5 text-accent" /> : <Users className="w-5 h-5 text-primary" />}
                  <h3 className="font-bold text-foreground">{currentRoom.name}</h3>
                  {currentRoom.is_anonymous && <span className="text-xs text-muted-foreground bg-muted px-2 py-0.5 rounded">{t('chat.anonMode')}</span>}
                </div>
                <div className="flex-1 overflow-y-auto p-4 space-y-3">
                  {messages.map((msg: any) => (
                    <div key={msg.id} className={`flex ${msg.user_id === user.id ? 'justify-end' : 'justify-start'}`}>
                      <div className={`max-w-[70%] px-4 py-2.5 rounded-2xl text-sm ${
                        msg.user_id === user.id ? 'bg-primary text-primary-foreground rounded-br-md' : 'bg-muted text-foreground rounded-bl-md'
                      }`}>
                        {currentRoom.is_anonymous && msg.user_id !== user.id && (
                          <p className="text-xs opacity-60 mb-1">{t('chat.anonUser')}</p>
                        )}
                        {msg.content}
                        <p className="text-[10px] opacity-50 mt-1">{new Date(msg.created_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</p>
                      </div>
                    </div>
                  ))}
                  <div ref={bottomRef} />
                </div>
                <div className="p-3 border-t border-border flex gap-2">
                  <input value={newMsg} onChange={e => setNewMsg(e.target.value)}
                    onKeyDown={e => e.key === 'Enter' && sendMessage()}
                    className="flex-1 px-4 py-2.5 bg-muted border border-border rounded-xl text-foreground text-sm focus:outline-none focus:ring-2 focus:ring-ring"
                    placeholder={t('chat.typePlaceholder')} />
                  <button onClick={sendMessage} className="hero-gradient p-2.5 rounded-xl text-primary-foreground hover:opacity-90">
                    <Send className="w-5 h-5" />
                  </button>
                </div>
              </>
            ) : (
              <div className="flex-1 flex items-center justify-center">
                <p className="text-muted-foreground">{t('chat.selectRoom')}</p>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default Chat;
