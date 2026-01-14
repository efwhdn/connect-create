import { useState, useEffect, useRef } from "react";
import { useParams, useNavigate, useSearchParams } from "react-router-dom";
import { motion } from "framer-motion";
import {
  Mic,
  MicOff,
  Video,
  VideoOff,
  Monitor,
  Users,
  MessageSquare,
  MoreVertical,
  Phone,
  Hand,
  Smile,
  Grid3X3,
  Maximize2,
  Settings,
  Copy,
  Check,
  Send,
  Loader2,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { toast } from "sonner";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { useAuth } from "@/contexts/AuthContext";
import { useMeeting } from "@/hooks/useMeeting";
import { ScrollArea } from "@/components/ui/scroll-area";

const Meeting = () => {
  const { meetingId } = useParams();
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const isHost = searchParams.get("host") === "true";
  const { user, profile, loading: authLoading } = useAuth();

  const {
    meeting,
    participants,
    chatMessages,
    localStream,
    isConnected,
    error,
    initializeMedia,
    joinMeeting,
    leaveMeeting,
    updateStatus,
    sendMessage,
  } = useMeeting(meetingId || "", user?.id);

  const [isMicOn, setIsMicOn] = useState(true);
  const [isVideoOn, setIsVideoOn] = useState(true);
  const [isScreenSharing, setIsScreenSharing] = useState(false);
  const [isHandRaised, setIsHandRaised] = useState(false);
  const [showParticipants, setShowParticipants] = useState(false);
  const [showChat, setShowChat] = useState(false);
  const [copied, setCopied] = useState(false);
  const [currentTime, setCurrentTime] = useState(new Date());
  const [chatInput, setChatInput] = useState("");
  const [isJoining, setIsJoining] = useState(false);

  const localVideoRef = useRef<HTMLVideoElement>(null);
  const chatScrollRef = useRef<HTMLDivElement>(null);

  // Redirect to auth if not logged in
  useEffect(() => {
    if (!authLoading && !user) {
      toast.error("Toplantıya katılmak için giriş yapmalısınız");
      navigate(`/auth?redirect=/meeting/${meetingId}${isHost ? "?host=true" : ""}`);
    }
  }, [authLoading, user, navigate, meetingId, isHost]);

  // Initialize media and join meeting
  useEffect(() => {
    if (!user || isConnected || isJoining) return;

    const init = async () => {
      setIsJoining(true);
      const stream = await initializeMedia(true, true);
      if (stream) {
        await joinMeeting(isHost);
      }
      setIsJoining(false);
    };

    init();
  }, [user, isConnected, isJoining, initializeMedia, joinMeeting, isHost]);

  // Set local video stream
  useEffect(() => {
    if (localVideoRef.current && localStream) {
      localVideoRef.current.srcObject = localStream;
    }
  }, [localStream]);

  // Update time
  useEffect(() => {
    const timer = setInterval(() => setCurrentTime(new Date()), 1000);
    return () => clearInterval(timer);
  }, []);

  // Scroll chat to bottom
  useEffect(() => {
    if (chatScrollRef.current) {
      chatScrollRef.current.scrollTop = chatScrollRef.current.scrollHeight;
    }
  }, [chatMessages]);

  // Handle errors
  useEffect(() => {
    if (error) {
      toast.error(error);
    }
  }, [error]);

  const formatTime = (date: Date) => {
    return date.toLocaleTimeString("tr-TR", {
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  const handleCopyLink = () => {
    const meetingLink = `${window.location.origin}/meeting/${meetingId}`;
    navigator.clipboard.writeText(meetingLink);
    setCopied(true);
    toast.success("Toplantı linki kopyalandı!");
    setTimeout(() => setCopied(false), 2000);
  };

  const handleEndCall = async () => {
    await leaveMeeting();
    toast.success("Toplantıdan ayrıldınız");
    navigate("/");
  };

  const toggleMic = async () => {
    const newState = !isMicOn;
    setIsMicOn(newState);
    
    // Mute/unmute local audio track
    if (localStream) {
      localStream.getAudioTracks().forEach((track) => {
        track.enabled = newState;
      });
    }

    await updateStatus({ is_muted: !newState });
    toast.info(newState ? "Mikrofon açıldı" : "Mikrofon kapatıldı");
  };

  const toggleVideo = async () => {
    const newState = !isVideoOn;
    setIsVideoOn(newState);

    // Enable/disable local video track
    if (localStream) {
      localStream.getVideoTracks().forEach((track) => {
        track.enabled = newState;
      });
    }

    await updateStatus({ is_video_on: newState });
    toast.info(newState ? "Kamera açıldı" : "Kamera kapatıldı");
  };

  const toggleScreenShare = () => {
    setIsScreenSharing(!isScreenSharing);
    toast.info(
      isScreenSharing ? "Ekran paylaşımı durduruldu" : "Ekran paylaşımı başladı"
    );
  };

  const toggleHandRaise = async () => {
    const newState = !isHandRaised;
    setIsHandRaised(newState);
    await updateStatus({ is_hand_raised: newState });
    toast.info(newState ? "Elinizi kaldırdınız" : "Elinizi indirdiniz");
  };

  const handleSendMessage = async () => {
    if (!chatInput.trim()) return;
    await sendMessage(chatInput);
    setChatInput("");
  };

  if (authLoading || isJoining) {
    return (
      <div className="h-screen bg-google-dark flex items-center justify-center">
        <div className="text-center">
          <Loader2 className="h-12 w-12 animate-spin text-google-blue mx-auto mb-4" />
          <p className="text-white/70">
            {authLoading ? "Oturum kontrol ediliyor..." : "Toplantıya bağlanılıyor..."}
          </p>
        </div>
      </div>
    );
  }

  // Get current user as participant for display
  const currentUserParticipant = participants.find((p) => p.user_id === user?.id);
  const otherParticipants = participants.filter((p) => p.user_id !== user?.id);

  return (
    <div className="h-screen bg-google-dark flex flex-col overflow-hidden">
      {/* Top Bar */}
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        className="h-14 px-4 flex items-center justify-between bg-google-dark-elevated border-b border-white/5"
      >
        <div className="flex items-center gap-4">
          <span className="text-white/90 text-sm font-medium">
            {formatTime(currentTime)}
          </span>
          <span className="text-white/50 text-sm">|</span>
          <span className="text-white/70 text-sm">{meetingId}</span>
          {isConnected && (
            <span className="text-green-400 text-xs flex items-center gap-1">
              <span className="w-2 h-2 bg-green-400 rounded-full animate-pulse" />
              Bağlı
            </span>
          )}
        </div>

        <div className="flex items-center gap-2">
          <Button
            variant="ghost"
            size="sm"
            onClick={handleCopyLink}
            className="text-white/70 hover:text-white hover:bg-white/10 gap-2"
          >
            {copied ? (
              <Check className="h-4 w-4" />
            ) : (
              <Copy className="h-4 w-4" />
            )}
            <span className="hidden sm:inline">Toplantı detayları</span>
          </Button>
        </div>
      </motion.div>

      {/* Main Content */}
      <div className="flex-1 flex overflow-hidden">
        {/* Video Grid */}
        <div className="flex-1 p-4">
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: 0.1 }}
            className={`h-full grid gap-3 ${
              participants.length <= 1
                ? "grid-cols-1"
                : participants.length <= 4
                ? "grid-cols-1 md:grid-cols-2"
                : "grid-cols-2 md:grid-cols-3"
            }`}
          >
            {/* Local Video (You) */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="relative rounded-lg overflow-hidden bg-google-dark-surface flex items-center justify-center"
            >
              {isVideoOn && localStream ? (
                <video
                  ref={localVideoRef}
                  autoPlay
                  muted
                  playsInline
                  className="absolute inset-0 w-full h-full object-cover"
                />
              ) : (
                <div className="w-20 h-20 rounded-full bg-google-blue flex items-center justify-center">
                  <span className="text-2xl font-medium text-white">
                    {profile?.display_name?.charAt(0) || "?"}
                  </span>
                </div>
              )}

              {/* Participant Info */}
              <div className="absolute bottom-3 left-3 flex items-center gap-2 z-10">
                <span className="text-white text-sm font-medium bg-black/40 px-2 py-1 rounded">
                  Siz
                </span>
                {!isMicOn && (
                  <div className="w-6 h-6 rounded-full bg-red-500/80 flex items-center justify-center">
                    <MicOff className="h-3 w-3 text-white" />
                  </div>
                )}
              </div>
            </motion.div>

            {/* Remote Participants */}
            {otherParticipants.map((participant, index) => (
              <motion.div
                key={participant.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.1 + (index + 1) * 0.05 }}
                className="relative rounded-lg overflow-hidden bg-google-dark-surface flex items-center justify-center"
              >
                {participant.stream && participant.is_video_on ? (
                  <VideoStream stream={participant.stream} />
                ) : (
                  <div className="w-20 h-20 rounded-full bg-google-blue flex items-center justify-center">
                    <span className="text-2xl font-medium text-white">
                      {participant.display_name?.charAt(0) || "?"}
                    </span>
                  </div>
                )}

                {/* Participant Info */}
                <div className="absolute bottom-3 left-3 flex items-center gap-2 z-10">
                  <span className="text-white text-sm font-medium bg-black/40 px-2 py-1 rounded">
                    {participant.display_name}
                  </span>
                  {participant.is_muted && (
                    <div className="w-6 h-6 rounded-full bg-red-500/80 flex items-center justify-center">
                      <MicOff className="h-3 w-3 text-white" />
                    </div>
                  )}
                  {participant.is_hand_raised && (
                    <div className="w-6 h-6 rounded-full bg-google-yellow flex items-center justify-center">
                      <Hand className="h-3 w-3 text-google-dark" />
                    </div>
                  )}
                </div>
              </motion.div>
            ))}
          </motion.div>
        </div>

        {/* Side Panel - Participants */}
        {showParticipants && (
          <motion.div
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: 20 }}
            className="w-80 bg-google-dark-elevated border-l border-white/5 flex flex-col"
          >
            <div className="p-4 border-b border-white/5">
              <h3 className="text-white font-medium">
                Katılımcılar ({participants.length})
              </h3>
            </div>
            <ScrollArea className="flex-1">
              <div className="p-2">
                {participants.map((p) => (
                  <div
                    key={p.id}
                    className="flex items-center gap-3 p-3 rounded-lg hover:bg-white/5"
                  >
                    <div className="w-8 h-8 rounded-full bg-google-blue flex items-center justify-center">
                      <span className="text-sm text-white">
                        {p.display_name?.charAt(0) || "?"}
                      </span>
                    </div>
                    <span className="text-white/90 text-sm flex-1">
                      {p.display_name} {p.user_id === user?.id && "(Siz)"}
                    </span>
                    {p.is_muted && <MicOff className="h-4 w-4 text-white/50" />}
                    {p.is_hand_raised && <Hand className="h-4 w-4 text-google-yellow" />}
                  </div>
                ))}
              </div>
            </ScrollArea>
          </motion.div>
        )}

        {/* Side Panel - Chat */}
        {showChat && (
          <motion.div
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: 20 }}
            className="w-80 bg-google-dark-elevated border-l border-white/5 flex flex-col"
          >
            <div className="p-4 border-b border-white/5">
              <h3 className="text-white font-medium">Toplantı içi mesajlar</h3>
            </div>
            <div ref={chatScrollRef} className="flex-1 overflow-y-auto p-3 space-y-3">
              {chatMessages.length === 0 ? (
                <p className="text-white/50 text-sm text-center py-8">
                  Mesajlar herkese görünür ve toplantı bittiğinde silinir
                </p>
              ) : (
                chatMessages.map((msg) => (
                  <div key={msg.id} className="space-y-1">
                    <div className="flex items-center gap-2">
                      <span className="text-white/90 text-sm font-medium">
                        {msg.sender_id === user?.id ? "Siz" : msg.sender_name}
                      </span>
                      <span className="text-white/40 text-xs">
                        {new Date(msg.created_at).toLocaleTimeString("tr-TR", {
                          hour: "2-digit",
                          minute: "2-digit",
                        })}
                      </span>
                    </div>
                    <p className="text-white/80 text-sm">{msg.content}</p>
                  </div>
                ))
              )}
            </div>
            <div className="p-3 border-t border-white/5">
              <div className="flex gap-2">
                <Input
                  type="text"
                  placeholder="Herkese mesaj gönder"
                  value={chatInput}
                  onChange={(e) => setChatInput(e.target.value)}
                  onKeyDown={(e) => e.key === "Enter" && handleSendMessage()}
                  className="flex-1 bg-white/5 border-white/10 text-white placeholder:text-white/40"
                />
                <Button
                  size="icon"
                  onClick={handleSendMessage}
                  disabled={!chatInput.trim()}
                  className="bg-google-blue hover:bg-google-blue-hover"
                >
                  <Send className="h-4 w-4" />
                </Button>
              </div>
            </div>
          </motion.div>
        )}
      </div>

      {/* Bottom Controls */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="h-20 px-4 flex items-center justify-center gap-2 bg-google-dark-elevated border-t border-white/5"
      >
        <TooltipProvider>
          {/* Mic Button */}
          <Tooltip>
            <TooltipTrigger asChild>
              <Button
                variant="ghost"
                size="icon"
                onClick={toggleMic}
                className={`w-12 h-12 rounded-full ${
                  isMicOn
                    ? "bg-google-dark-surface hover:bg-white/10 text-white"
                    : "bg-red-500 hover:bg-red-600 text-white"
                }`}
              >
                {isMicOn ? (
                  <Mic className="h-5 w-5" />
                ) : (
                  <MicOff className="h-5 w-5" />
                )}
              </Button>
            </TooltipTrigger>
            <TooltipContent>
              {isMicOn ? "Mikrofonu kapat" : "Mikrofonu aç"}
            </TooltipContent>
          </Tooltip>

          {/* Video Button */}
          <Tooltip>
            <TooltipTrigger asChild>
              <Button
                variant="ghost"
                size="icon"
                onClick={toggleVideo}
                className={`w-12 h-12 rounded-full ${
                  isVideoOn
                    ? "bg-google-dark-surface hover:bg-white/10 text-white"
                    : "bg-red-500 hover:bg-red-600 text-white"
                }`}
              >
                {isVideoOn ? (
                  <Video className="h-5 w-5" />
                ) : (
                  <VideoOff className="h-5 w-5" />
                )}
              </Button>
            </TooltipTrigger>
            <TooltipContent>
              {isVideoOn ? "Kamerayı kapat" : "Kamerayı aç"}
            </TooltipContent>
          </Tooltip>

          {/* Screen Share */}
          <Tooltip>
            <TooltipTrigger asChild>
              <Button
                variant="ghost"
                size="icon"
                onClick={toggleScreenShare}
                className={`w-12 h-12 rounded-full ${
                  isScreenSharing
                    ? "bg-google-blue hover:bg-google-blue-hover text-white"
                    : "bg-google-dark-surface hover:bg-white/10 text-white"
                }`}
              >
                <Monitor className="h-5 w-5" />
              </Button>
            </TooltipTrigger>
            <TooltipContent>
              {isScreenSharing ? "Paylaşımı durdur" : "Ekranını paylaş"}
            </TooltipContent>
          </Tooltip>

          {/* Raise Hand */}
          <Tooltip>
            <TooltipTrigger asChild>
              <Button
                variant="ghost"
                size="icon"
                onClick={toggleHandRaise}
                className={`w-12 h-12 rounded-full ${
                  isHandRaised
                    ? "bg-google-yellow hover:bg-google-yellow/80 text-google-dark"
                    : "bg-google-dark-surface hover:bg-white/10 text-white"
                }`}
              >
                <Hand className="h-5 w-5" />
              </Button>
            </TooltipTrigger>
            <TooltipContent>
              {isHandRaised ? "Elini indir" : "Elini kaldır"}
            </TooltipContent>
          </Tooltip>

          {/* Reactions */}
          <Tooltip>
            <TooltipTrigger asChild>
              <Button
                variant="ghost"
                size="icon"
                className="w-12 h-12 rounded-full bg-google-dark-surface hover:bg-white/10 text-white"
              >
                <Smile className="h-5 w-5" />
              </Button>
            </TooltipTrigger>
            <TooltipContent>Tepki gönder</TooltipContent>
          </Tooltip>

          <div className="w-px h-8 bg-white/10 mx-2" />

          {/* Participants */}
          <Tooltip>
            <TooltipTrigger asChild>
              <Button
                variant="ghost"
                size="icon"
                onClick={() => {
                  setShowParticipants(!showParticipants);
                  setShowChat(false);
                }}
                className={`w-12 h-12 rounded-full ${
                  showParticipants
                    ? "bg-google-blue hover:bg-google-blue-hover text-white"
                    : "bg-google-dark-surface hover:bg-white/10 text-white"
                }`}
              >
                <Users className="h-5 w-5" />
              </Button>
            </TooltipTrigger>
            <TooltipContent>Katılımcılar</TooltipContent>
          </Tooltip>

          {/* Chat */}
          <Tooltip>
            <TooltipTrigger asChild>
              <Button
                variant="ghost"
                size="icon"
                onClick={() => {
                  setShowChat(!showChat);
                  setShowParticipants(false);
                }}
                className={`w-12 h-12 rounded-full ${
                  showChat
                    ? "bg-google-blue hover:bg-google-blue-hover text-white"
                    : "bg-google-dark-surface hover:bg-white/10 text-white"
                }`}
              >
                <MessageSquare className="h-5 w-5" />
              </Button>
            </TooltipTrigger>
            <TooltipContent>Mesajlar</TooltipContent>
          </Tooltip>

          <div className="w-px h-8 bg-white/10 mx-2" />

          {/* More Options */}
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button
                variant="ghost"
                size="icon"
                className="w-12 h-12 rounded-full bg-google-dark-surface hover:bg-white/10 text-white"
              >
                <MoreVertical className="h-5 w-5" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent
              align="center"
              className="w-56 bg-google-dark-elevated border-white/10"
            >
              <DropdownMenuItem className="text-white/90 focus:bg-white/10 focus:text-white cursor-pointer">
                <Grid3X3 className="h-4 w-4 mr-3" />
                Düzeni değiştir
              </DropdownMenuItem>
              <DropdownMenuItem className="text-white/90 focus:bg-white/10 focus:text-white cursor-pointer">
                <Maximize2 className="h-4 w-4 mr-3" />
                Tam ekran
              </DropdownMenuItem>
              <DropdownMenuItem className="text-white/90 focus:bg-white/10 focus:text-white cursor-pointer">
                <Settings className="h-4 w-4 mr-3" />
                Ayarlar
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>

          {/* End Call */}
          <Tooltip>
            <TooltipTrigger asChild>
              <Button
                onClick={handleEndCall}
                className="w-14 h-12 rounded-full bg-red-500 hover:bg-red-600 text-white ml-2"
              >
                <Phone className="h-5 w-5 rotate-[135deg]" />
              </Button>
            </TooltipTrigger>
            <TooltipContent>Toplantıdan ayrıl</TooltipContent>
          </Tooltip>
        </TooltipProvider>
      </motion.div>
    </div>
  );
};

// Video stream component for remote participants
const VideoStream = ({ stream }: { stream: MediaStream }) => {
  const videoRef = useRef<HTMLVideoElement>(null);

  useEffect(() => {
    if (videoRef.current) {
      videoRef.current.srcObject = stream;
    }
  }, [stream]);

  return (
    <video
      ref={videoRef}
      autoPlay
      playsInline
      className="absolute inset-0 w-full h-full object-cover"
    />
  );
};

export default Meeting;
