import { useState, useEffect, useCallback, useRef } from "react";
import { supabase } from "@/integrations/supabase/client";
import { RealtimeChannel } from "@supabase/supabase-js";
import { Json } from "@/integrations/supabase/types";

interface Participant {
  id: string;
  user_id: string;
  display_name: string;
  avatar_url: string | null;
  is_muted: boolean;
  is_video_on: boolean;
  is_hand_raised: boolean;
  status: 'waiting' | 'approved' | 'rejected';
  stream?: MediaStream;
}

interface ChatMessage {
  id: string;
  sender_id: string;
  sender_name: string;
  content: string;
  created_at: string;
}

interface Meeting {
  id: string;
  meeting_code: string;
  host_id: string;
  title: string | null;
  is_active: boolean;
}

export const useMeeting = (meetingCode: string, userId: string | undefined) => {
  const [meeting, setMeeting] = useState<Meeting | null>(null);
  const [participants, setParticipants] = useState<Participant[]>([]);
  const [waitingParticipants, setWaitingParticipants] = useState<Participant[]>([]);
  const [chatMessages, setChatMessages] = useState<ChatMessage[]>([]);
  const [localStream, setLocalStream] = useState<MediaStream | null>(null);
  const [isConnected, setIsConnected] = useState(false);
  const [myStatus, setMyStatus] = useState<'waiting' | 'approved' | 'rejected' | null>(null);
  const [error, setError] = useState<string | null>(null);

  const peerConnections = useRef<Map<string, RTCPeerConnection>>(new Map());
  const channelRef = useRef<RealtimeChannel | null>(null);

  // ICE Servers for WebRTC
  const iceServers = {
    iceServers: [
      { urls: "stun:stun.l.google.com:19302" },
      { urls: "stun:stun1.l.google.com:19302" },
    ],
  };

  // Initialize local media stream
  const initializeMedia = useCallback(async (video: boolean = true, audio: boolean = true) => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({
        video: video ? { width: 1280, height: 720 } : false,
        audio: audio,
      });
      setLocalStream(stream);
      return stream;
    } catch (err) {
      console.error("Error accessing media devices:", err);
      setError("Kamera veya mikrofon erişimi reddedildi");
      return null;
    }
  }, []);

  // Create or get meeting
  const joinMeeting = useCallback(async (isHost: boolean = false) => {
    if (!userId) return null;

    try {
      // Check if meeting exists
      let { data: existingMeeting, error: fetchError } = await supabase
        .from("meetings")
        .select("*")
        .eq("meeting_code", meetingCode)
        .eq("is_active", true)
        .maybeSingle();

      if (fetchError) throw fetchError;

      // If host and meeting doesn't exist, create it
      if (!existingMeeting && isHost) {
        const { data: newMeeting, error: createError } = await supabase
          .from("meetings")
          .insert({
            meeting_code: meetingCode,
            host_id: userId,
          })
          .select()
          .single();

        if (createError) throw createError;
        existingMeeting = newMeeting;
      }

      if (!existingMeeting) {
        setError("Toplantı bulunamadı");
        return null;
      }

      setMeeting(existingMeeting);

      // Determine status based on whether user is host
      const isUserHost = existingMeeting.host_id === userId;
      const participantStatus = isUserHost ? 'approved' : 'waiting';

      // Join as participant
      const { error: joinError } = await supabase
        .from("meeting_participants")
        .upsert({
          meeting_id: existingMeeting.id,
          user_id: userId,
          is_muted: false,
          is_video_on: true,
          is_hand_raised: false,
          left_at: null,
          status: participantStatus,
        }, {
          onConflict: 'meeting_id,user_id'
        });

      if (joinError) throw joinError;

      setMyStatus(participantStatus);
      setIsConnected(true);
      return existingMeeting;
    } catch (err: any) {
      console.error("Error joining meeting:", err);
      setError(err.message);
      return null;
    }
  }, [meetingCode, userId]);

  // Leave meeting
  const leaveMeeting = useCallback(async () => {
    if (!meeting || !userId) return;

    try {
      // Update participant left_at
      await supabase
        .from("meeting_participants")
        .update({ left_at: new Date().toISOString() })
        .eq("meeting_id", meeting.id)
        .eq("user_id", userId);

      // Close all peer connections
      peerConnections.current.forEach((pc) => pc.close());
      peerConnections.current.clear();

      // Stop local stream
      localStream?.getTracks().forEach((track) => track.stop());

      // Unsubscribe from channel
      channelRef.current?.unsubscribe();

      setIsConnected(false);
      setMeeting(null);
      setParticipants([]);
    } catch (err) {
      console.error("Error leaving meeting:", err);
    }
  }, [meeting, userId, localStream]);

  // Update participant status
  const updateStatus = useCallback(async (updates: {
    is_muted?: boolean;
    is_video_on?: boolean;
    is_hand_raised?: boolean;
  }) => {
    if (!meeting || !userId) return;

    await supabase
      .from("meeting_participants")
      .update(updates)
      .eq("meeting_id", meeting.id)
      .eq("user_id", userId);
  }, [meeting, userId]);

  // Send chat message
  const sendMessage = useCallback(async (content: string) => {
    if (!meeting || !userId || !content.trim()) return;

    await supabase.from("chat_messages").insert({
      meeting_id: meeting.id,
      sender_id: userId,
      content: content.trim(),
    });
  }, [meeting, userId]);

  // Approve participant (host only)
  const approveParticipant = useCallback(async (participantUserId: string) => {
    if (!meeting || !userId) return;

    await supabase
      .from("meeting_participants")
      .update({ status: 'approved' })
      .eq("meeting_id", meeting.id)
      .eq("user_id", participantUserId);
  }, [meeting, userId]);

  // Reject participant (host only)
  const rejectParticipant = useCallback(async (participantUserId: string) => {
    if (!meeting || !userId) return;

    await supabase
      .from("meeting_participants")
      .update({ status: 'rejected' })
      .eq("meeting_id", meeting.id)
      .eq("user_id", participantUserId);
  }, [meeting, userId]);

  // Create peer connection for a participant
  const createPeerConnection = useCallback((participantId: string, stream: MediaStream) => {
    const pc = new RTCPeerConnection(iceServers);

    // Add local tracks
    stream.getTracks().forEach((track) => {
      pc.addTrack(track, stream);
    });

    // Handle ICE candidates
    pc.onicecandidate = async (event) => {
      if (event.candidate && meeting) {
        await supabase.from("signaling_messages").insert({
          meeting_id: meeting.id,
          sender_id: userId!,
          receiver_id: participantId,
          message_type: "ice-candidate",
          payload: JSON.parse(JSON.stringify({ candidate: event.candidate })) as Json,
        });
      }
    };

    // Handle remote stream
    pc.ontrack = (event) => {
      setParticipants((prev) =>
        prev.map((p) =>
          p.user_id === participantId
            ? { ...p, stream: event.streams[0] }
            : p
        )
      );
    };

    peerConnections.current.set(participantId, pc);
    return pc;
  }, [meeting, userId, iceServers]);

  // Handle incoming signaling message
  const handleSignalingMessage = useCallback(async (
    senderId: string,
    messageType: string,
    payload: any
  ) => {
    let pc = peerConnections.current.get(senderId);

    if (!pc && localStream) {
      pc = createPeerConnection(senderId, localStream);
    }

    if (!pc) return;

    try {
      if (messageType === "offer") {
        await pc.setRemoteDescription(new RTCSessionDescription(payload.offer));
        const answer = await pc.createAnswer();
        await pc.setLocalDescription(answer);

        if (meeting) {
          await supabase.from("signaling_messages").insert({
            meeting_id: meeting.id,
            sender_id: userId!,
            receiver_id: senderId,
            message_type: "answer",
            payload: JSON.parse(JSON.stringify({ answer })) as Json,
          });
        }
      } else if (messageType === "answer") {
        await pc.setRemoteDescription(new RTCSessionDescription(payload.answer));
      } else if (messageType === "ice-candidate") {
        await pc.addIceCandidate(new RTCIceCandidate(payload.candidate));
      }
    } catch (err) {
      console.error("Error handling signaling message:", err);
    }
  }, [meeting, userId, localStream, createPeerConnection]);

  // Subscribe to realtime updates
  useEffect(() => {
    if (!meeting || !userId) return;

    const channel = supabase.channel(`meeting:${meeting.id}`);
    channelRef.current = channel;

    // Listen for participant changes
    channel.on(
      "postgres_changes",
      {
        event: "*",
        schema: "public",
        table: "meeting_participants",
        filter: `meeting_id=eq.${meeting.id}`,
      },
      async (payload) => {
        // Fetch updated participants with profiles
        const { data } = await supabase
          .from("meeting_participants")
          .select(`
            id,
            user_id,
            is_muted,
            is_video_on,
            is_hand_raised,
            profiles:user_id (display_name, avatar_url)
          `)
          .eq("meeting_id", meeting.id)
          .is("left_at", null);

        if (data) {
          const formattedParticipants = data.map((p: any) => ({
            id: p.id,
            user_id: p.user_id,
            display_name: p.profiles?.display_name || "Bilinmeyen",
            avatar_url: p.profiles?.avatar_url,
            is_muted: p.is_muted,
            is_video_on: p.is_video_on,
            is_hand_raised: p.is_hand_raised,
            status: p.status as 'waiting' | 'approved' | 'rejected',
            stream: peerConnections.current.get(p.user_id)
              ? participants.find((pp) => pp.user_id === p.user_id)?.stream
              : undefined,
          }));

          // Separate approved and waiting participants
          const approved = formattedParticipants.filter((p: Participant) => p.status === 'approved');
          const waiting = formattedParticipants.filter((p: Participant) => p.status === 'waiting');
          
          setParticipants(approved);
          setWaitingParticipants(waiting);

          // Check if current user's status changed
          const myParticipant = formattedParticipants.find((p: Participant) => p.user_id === userId);
          if (myParticipant) {
            setMyStatus(myParticipant.status);
          }

          // Create offers for new approved participants
          if (payload.eventType === "INSERT" || payload.eventType === "UPDATE") {
            const newParticipant = payload.new as any;
            if (newParticipant.user_id !== userId && newParticipant.status === 'approved' && localStream) {
              const existingPc = peerConnections.current.get(newParticipant.user_id);
              if (!existingPc) {
                const pc = createPeerConnection(newParticipant.user_id, localStream);
                const offer = await pc.createOffer();
                await pc.setLocalDescription(offer);

                await supabase.from("signaling_messages").insert({
                  meeting_id: meeting.id,
                  sender_id: userId,
                  receiver_id: newParticipant.user_id,
                  message_type: "offer",
                  payload: JSON.parse(JSON.stringify({ offer })) as Json,
                });
              }
            }
          }
        }
      }
    );

    // Listen for signaling messages
    channel.on(
      "postgres_changes",
      {
        event: "INSERT",
        schema: "public",
        table: "signaling_messages",
        filter: `meeting_id=eq.${meeting.id}`,
      },
      (payload: any) => {
        const msg = payload.new;
        if (msg.receiver_id === userId || !msg.receiver_id) {
          handleSignalingMessage(msg.sender_id, msg.message_type, msg.payload);
        }
      }
    );

    // Listen for chat messages
    channel.on(
      "postgres_changes",
      {
        event: "INSERT",
        schema: "public",
        table: "chat_messages",
        filter: `meeting_id=eq.${meeting.id}`,
      },
      async (payload: any) => {
        const msg = payload.new;
        const { data: profile } = await supabase
          .from("profiles")
          .select("display_name")
          .eq("user_id", msg.sender_id)
          .single();

        setChatMessages((prev) => [
          ...prev,
          {
            id: msg.id,
            sender_id: msg.sender_id,
            sender_name: profile?.display_name || "Bilinmeyen",
            content: msg.content,
            created_at: msg.created_at,
          },
        ]);
      }
    );

    channel.subscribe();

    // Fetch initial participants
    (async () => {
      const { data } = await supabase
        .from("meeting_participants")
        .select(`
          id,
          user_id,
          is_muted,
          is_video_on,
          is_hand_raised,
          status,
          profiles:user_id (display_name, avatar_url)
        `)
        .eq("meeting_id", meeting.id)
        .is("left_at", null);

      if (data) {
        const formattedParticipants = data.map((p: any) => ({
          id: p.id,
          user_id: p.user_id,
          display_name: p.profiles?.display_name || "Bilinmeyen",
          avatar_url: p.profiles?.avatar_url,
          is_muted: p.is_muted,
          is_video_on: p.is_video_on,
          is_hand_raised: p.is_hand_raised,
          status: p.status as 'waiting' | 'approved' | 'rejected',
        }));

        const approved = formattedParticipants.filter((p) => p.status === 'approved');
        const waiting = formattedParticipants.filter((p) => p.status === 'waiting');
        
        setParticipants(approved);
        setWaitingParticipants(waiting);

        // Check current user's status
        const myParticipant = formattedParticipants.find((p) => p.user_id === userId);
        if (myParticipant) {
          setMyStatus(myParticipant.status);
        }
      }
    })();

    return () => {
      channel.unsubscribe();
    };
  }, [meeting, userId, localStream, handleSignalingMessage, createPeerConnection, participants]);

  return {
    meeting,
    participants,
    waitingParticipants,
    chatMessages,
    localStream,
    isConnected,
    myStatus,
    error,
    initializeMedia,
    joinMeeting,
    leaveMeeting,
    updateStatus,
    sendMessage,
    approveParticipant,
    rejectParticipant,
  };
};
