import { motion } from "framer-motion";
import { Video, Keyboard, Plus, Link2, Calendar } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { toast } from "sonner";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { generateMeetingId, extractMeetingId, createMeetingLink } from "@/lib/meeting";
import { Check, Copy } from "lucide-react";

const MeetingCard = () => {
  const [meetingCode, setMeetingCode] = useState("");
  const [showLinkDialog, setShowLinkDialog] = useState(false);
  const [generatedLink, setGeneratedLink] = useState("");
  const [copied, setCopied] = useState(false);
  const navigate = useNavigate();

  const handleCreateForLater = () => {
    const meetingId = generateMeetingId();
    const link = createMeetingLink(meetingId);
    setGeneratedLink(link);
    setShowLinkDialog(true);
  };

  const handleStartInstant = () => {
    const meetingId = generateMeetingId();
    toast.success("Toplantı başlatılıyor...");
    navigate(`/meeting/${meetingId}?host=true`);
  };

  const handleSchedule = () => {
    toast.info("Google Takvim entegrasyonu yakında eklenecek!", {
      description: "Şimdilik anlık toplantı başlatabilirsiniz.",
    });
  };

  const handleJoinMeeting = () => {
    if (!meetingCode.trim()) {
      toast.error("Lütfen bir toplantı kodu girin");
      return;
    }

    const meetingId = extractMeetingId(meetingCode.trim());
    if (!meetingId) {
      toast.error("Geçersiz toplantı kodu", {
        description: "Kod formatı: abc-defg-hij veya toplantı linki",
      });
      return;
    }

    toast.success("Toplantıya katılınıyor...");
    navigate(`/meeting/${meetingId}`);
  };

  const handleCopyLink = () => {
    navigator.clipboard.writeText(generatedLink);
    setCopied(true);
    toast.success("Link kopyalandı!");
    setTimeout(() => setCopied(false), 2000);
  };

  const handleStartFromDialog = () => {
    const meetingId = generatedLink.split("/").pop();
    setShowLinkDialog(false);
    navigate(`/meeting/${meetingId}?host=true`);
  };

  return (
    <>
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, delay: 0.2 }}
        className="w-full max-w-md mx-auto"
      >
        <div className="flex flex-col sm:flex-row gap-3 items-stretch">
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button
                size="lg"
                className="h-12 px-6 gap-2 bg-google-blue hover:bg-google-blue-hover text-primary-foreground rounded-md font-medium text-sm shadow-sm transition-all hover:shadow-md"
              >
                <Video className="h-5 w-5" />
                Yeni toplantı
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent
              align="start"
              className="w-64 p-1 rounded-lg google-shadow-lg border-border/50 bg-popover"
            >
              <DropdownMenuItem
                onClick={handleCreateForLater}
                className="flex items-center gap-3 px-3 py-2.5 cursor-pointer rounded-md"
              >
                <Link2 className="h-5 w-5 text-muted-foreground" />
                <span>Daha sonra için toplantı oluştur</span>
              </DropdownMenuItem>
              <DropdownMenuItem
                onClick={handleStartInstant}
                className="flex items-center gap-3 px-3 py-2.5 cursor-pointer rounded-md"
              >
                <Plus className="h-5 w-5 text-muted-foreground" />
                <span>Anlık toplantı başlat</span>
              </DropdownMenuItem>
              <DropdownMenuItem
                onClick={handleSchedule}
                className="flex items-center gap-3 px-3 py-2.5 cursor-pointer rounded-md"
              >
                <Calendar className="h-5 w-5 text-muted-foreground" />
                <span>Google Takvim'de planla</span>
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>

          <div className="flex items-center gap-2 flex-1">
            <div className="relative flex-1">
              <Keyboard className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-muted-foreground" />
              <Input
                type="text"
                placeholder="Kod veya link girin"
                value={meetingCode}
                onChange={(e) => setMeetingCode(e.target.value)}
                onKeyDown={(e) => e.key === "Enter" && handleJoinMeeting()}
                className="h-12 pl-11 pr-4 rounded-md border-border bg-background text-foreground placeholder:text-muted-foreground focus:border-google-blue focus:ring-google-blue/20"
              />
            </div>
            <Button
              variant="ghost"
              onClick={handleJoinMeeting}
              disabled={!meetingCode.trim()}
              className="h-12 px-4 text-google-blue hover:bg-google-blue/5 font-medium disabled:text-muted-foreground disabled:hover:bg-transparent"
            >
              Katıl
            </Button>
          </div>
        </div>
      </motion.div>

      {/* Meeting Link Dialog */}
      <Dialog open={showLinkDialog} onOpenChange={setShowLinkDialog}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle className="text-xl">Toplantı linkiniz hazır</DialogTitle>
          </DialogHeader>
          <div className="space-y-4 pt-2">
            <p className="text-sm text-muted-foreground">
              Bu linki toplantıya davet etmek istediğiniz kişilerle paylaşın.
              Google hesabına sahip olmayan kişilere de erişim vermek için
              kopyalayıp gönderebilirsiniz.
            </p>
            <div className="flex items-center gap-2">
              <Input
                readOnly
                value={generatedLink}
                className="flex-1 bg-muted/50"
              />
              <Button
                variant="outline"
                size="icon"
                onClick={handleCopyLink}
                className="shrink-0"
              >
                {copied ? (
                  <Check className="h-4 w-4 text-google-green" />
                ) : (
                  <Copy className="h-4 w-4" />
                )}
              </Button>
            </div>
            <div className="flex gap-2 pt-2">
              <Button
                variant="outline"
                onClick={() => setShowLinkDialog(false)}
                className="flex-1"
              >
                Kapat
              </Button>
              <Button
                onClick={handleStartFromDialog}
                className="flex-1 bg-google-blue hover:bg-google-blue-hover"
              >
                Şimdi başlat
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </>
  );
};

export default MeetingCard;
