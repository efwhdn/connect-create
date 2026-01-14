import { useState, useEffect } from "react";
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
} from "lucide-react";
import { Button } from "@/components/ui/button";
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

const Meeting = () => {
  const { meetingId } = useParams();
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const isHost = searchParams.get("host") === "true";

  const [isMicOn, setIsMicOn] = useState(true);
  const [isVideoOn, setIsVideoOn] = useState(true);
  const [isScreenSharing, setIsScreenSharing] = useState(false);
  const [isHandRaised, setIsHandRaised] = useState(false);
  const [showParticipants, setShowParticipants] = useState(false);
  const [showChat, setShowChat] = useState(false);
  const [copied, setCopied] = useState(false);
  const [currentTime, setCurrentTime] = useState(new Date());

  useEffect(() => {
    const timer = setInterval(() => setCurrentTime(new Date()), 1000);
    return () => clearInterval(timer);
  }, []);

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

  const handleEndCall = () => {
    toast.success("Toplantıdan ayrıldınız");
    navigate("/");
  };

  const toggleMic = () => {
    setIsMicOn(!isMicOn);
    toast.info(isMicOn ? "Mikrofon kapatıldı" : "Mikrofon açıldı");
  };

  const toggleVideo = () => {
    setIsVideoOn(!isVideoOn);
    toast.info(isVideoOn ? "Kamera kapatıldı" : "Kamera açıldı");
  };

  const toggleScreenShare = () => {
    setIsScreenSharing(!isScreenSharing);
    toast.info(
      isScreenSharing ? "Ekran paylaşımı durduruldu" : "Ekran paylaşımı başladı"
    );
  };

  const toggleHandRaise = () => {
    setIsHandRaised(!isHandRaised);
    toast.info(isHandRaised ? "Elinizi indirdiniz" : "Elinizi kaldırdınız");
  };

  // Simulated participants
  const participants = [
    { id: 1, name: "Siz", isYou: true, isMuted: !isMicOn, hasVideo: isVideoOn },
    { id: 2, name: "Ahmet Yılmaz", isYou: false, isMuted: false, hasVideo: true },
    { id: 3, name: "Ayşe Demir", isYou: false, isMuted: true, hasVideo: true },
    { id: 4, name: "Mehmet Kaya", isYou: false, isMuted: false, hasVideo: false },
  ];

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
            className="h-full grid grid-cols-1 md:grid-cols-2 gap-3"
          >
            {participants.map((participant, index) => (
              <motion.div
                key={participant.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.1 + index * 0.05 }}
                className={`relative rounded-lg overflow-hidden ${
                  participant.hasVideo
                    ? "bg-gradient-to-br from-google-dark-surface to-google-dark"
                    : "bg-google-dark-surface"
                } flex items-center justify-center`}
              >
                {participant.hasVideo ? (
                  <div className="absolute inset-0 bg-gradient-to-br from-google-blue/20 to-google-green/20" />
                ) : (
                  <div className="w-20 h-20 rounded-full bg-google-blue flex items-center justify-center">
                    <span className="text-2xl font-medium text-white">
                      {participant.name.charAt(0)}
                    </span>
                  </div>
                )}

                {/* Participant Info */}
                <div className="absolute bottom-3 left-3 flex items-center gap-2">
                  <span className="text-white text-sm font-medium bg-black/40 px-2 py-1 rounded">
                    {participant.isYou ? "Siz" : participant.name}
                  </span>
                  {participant.isMuted && (
                    <div className="w-6 h-6 rounded-full bg-red-500/80 flex items-center justify-center">
                      <MicOff className="h-3 w-3 text-white" />
                    </div>
                  )}
                </div>

                {/* Pin button */}
                <button className="absolute top-3 right-3 w-8 h-8 rounded-full bg-black/40 flex items-center justify-center opacity-0 hover:opacity-100 transition-opacity">
                  <Maximize2 className="h-4 w-4 text-white" />
                </button>
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
            <div className="flex-1 overflow-y-auto p-2">
              {participants.map((p) => (
                <div
                  key={p.id}
                  className="flex items-center gap-3 p-3 rounded-lg hover:bg-white/5"
                >
                  <div className="w-8 h-8 rounded-full bg-google-blue flex items-center justify-center">
                    <span className="text-sm text-white">
                      {p.name.charAt(0)}
                    </span>
                  </div>
                  <span className="text-white/90 text-sm flex-1">
                    {p.name} {p.isYou && "(Siz)"}
                  </span>
                  {p.isMuted && <MicOff className="h-4 w-4 text-white/50" />}
                </div>
              ))}
            </div>
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
            <div className="flex-1 flex items-center justify-center">
              <p className="text-white/50 text-sm text-center px-4">
                Mesajlar herkese görünür ve toplantı bittiğinde silinir
              </p>
            </div>
            <div className="p-3 border-t border-white/5">
              <input
                type="text"
                placeholder="Herkese mesaj gönder"
                className="w-full bg-white/5 border border-white/10 rounded-full px-4 py-2 text-white text-sm placeholder:text-white/40 focus:outline-none focus:border-google-blue"
              />
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

export default Meeting;
