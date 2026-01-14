-- Kullanıcı profilleri tablosu
CREATE TABLE public.profiles (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL UNIQUE,
  display_name TEXT NOT NULL,
  avatar_url TEXT,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- RLS etkinleştir
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;

-- Profil politikaları
CREATE POLICY "Herkes profilleri görebilir"
ON public.profiles FOR SELECT
USING (true);

CREATE POLICY "Kullanıcılar kendi profillerini oluşturabilir"
ON public.profiles FOR INSERT
WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Kullanıcılar kendi profillerini güncelleyebilir"
ON public.profiles FOR UPDATE
USING (auth.uid() = user_id);

-- Toplantı odaları tablosu
CREATE TABLE public.meetings (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  meeting_code TEXT NOT NULL UNIQUE,
  host_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  title TEXT,
  is_active BOOLEAN NOT NULL DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  ended_at TIMESTAMP WITH TIME ZONE
);

-- RLS etkinleştir
ALTER TABLE public.meetings ENABLE ROW LEVEL SECURITY;

-- Toplantı politikaları
CREATE POLICY "Herkes aktif toplantıları görebilir"
ON public.meetings FOR SELECT
USING (is_active = true);

CREATE POLICY "Kullanıcılar toplantı oluşturabilir"
ON public.meetings FOR INSERT
WITH CHECK (auth.uid() = host_id);

CREATE POLICY "Ev sahipleri toplantıyı güncelleyebilir"
ON public.meetings FOR UPDATE
USING (auth.uid() = host_id);

-- Toplantı katılımcıları tablosu
CREATE TABLE public.meeting_participants (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  meeting_id UUID REFERENCES public.meetings(id) ON DELETE CASCADE NOT NULL,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  is_muted BOOLEAN NOT NULL DEFAULT false,
  is_video_on BOOLEAN NOT NULL DEFAULT true,
  is_hand_raised BOOLEAN NOT NULL DEFAULT false,
  joined_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  left_at TIMESTAMP WITH TIME ZONE,
  UNIQUE(meeting_id, user_id)
);

-- RLS etkinleştir
ALTER TABLE public.meeting_participants ENABLE ROW LEVEL SECURITY;

-- Katılımcı politikaları
CREATE POLICY "Toplantıdaki herkes katılımcıları görebilir"
ON public.meeting_participants FOR SELECT
USING (true);

CREATE POLICY "Kullanıcılar toplantıya katılabilir"
ON public.meeting_participants FOR INSERT
WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Kullanıcılar kendi durumlarını güncelleyebilir"
ON public.meeting_participants FOR UPDATE
USING (auth.uid() = user_id);

CREATE POLICY "Kullanıcılar toplantıdan ayrılabilir"
ON public.meeting_participants FOR DELETE
USING (auth.uid() = user_id);

-- WebRTC sinyalizasyon için mesajlar tablosu
CREATE TABLE public.signaling_messages (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  meeting_id UUID REFERENCES public.meetings(id) ON DELETE CASCADE NOT NULL,
  sender_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  receiver_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  message_type TEXT NOT NULL, -- 'offer', 'answer', 'ice-candidate'
  payload JSONB NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- RLS etkinleştir
ALTER TABLE public.signaling_messages ENABLE ROW LEVEL SECURITY;

-- Sinyalizasyon politikaları
CREATE POLICY "Toplantıdaki kullanıcılar sinyalleri görebilir"
ON public.signaling_messages FOR SELECT
USING (
  EXISTS (
    SELECT 1 FROM public.meeting_participants mp
    WHERE mp.meeting_id = signaling_messages.meeting_id
    AND mp.user_id = auth.uid()
    AND mp.left_at IS NULL
  )
);

CREATE POLICY "Katılımcılar sinyal gönderebilir"
ON public.signaling_messages FOR INSERT
WITH CHECK (
  auth.uid() = sender_id AND
  EXISTS (
    SELECT 1 FROM public.meeting_participants mp
    WHERE mp.meeting_id = signaling_messages.meeting_id
    AND mp.user_id = auth.uid()
    AND mp.left_at IS NULL
  )
);

-- Toplantı içi mesajlar tablosu
CREATE TABLE public.chat_messages (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  meeting_id UUID REFERENCES public.meetings(id) ON DELETE CASCADE NOT NULL,
  sender_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  content TEXT NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- RLS etkinleştir
ALTER TABLE public.chat_messages ENABLE ROW LEVEL SECURITY;

-- Sohbet politikaları
CREATE POLICY "Toplantıdaki kullanıcılar mesajları görebilir"
ON public.chat_messages FOR SELECT
USING (
  EXISTS (
    SELECT 1 FROM public.meeting_participants mp
    WHERE mp.meeting_id = chat_messages.meeting_id
    AND mp.user_id = auth.uid()
    AND mp.left_at IS NULL
  )
);

CREATE POLICY "Katılımcılar mesaj gönderebilir"
ON public.chat_messages FOR INSERT
WITH CHECK (
  auth.uid() = sender_id AND
  EXISTS (
    SELECT 1 FROM public.meeting_participants mp
    WHERE mp.meeting_id = chat_messages.meeting_id
    AND mp.user_id = auth.uid()
    AND mp.left_at IS NULL
  )
);

-- Realtime etkinleştir
ALTER PUBLICATION supabase_realtime ADD TABLE public.meeting_participants;
ALTER PUBLICATION supabase_realtime ADD TABLE public.signaling_messages;
ALTER PUBLICATION supabase_realtime ADD TABLE public.chat_messages;

-- Profil oluşturma trigger'ı
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO public.profiles (user_id, display_name, avatar_url)
  VALUES (
    NEW.id,
    COALESCE(NEW.raw_user_meta_data->>'full_name', NEW.email),
    NEW.raw_user_meta_data->>'avatar_url'
  );
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER SET search_path = public;

CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- Updated at trigger
CREATE OR REPLACE FUNCTION public.update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SET search_path = public;

CREATE TRIGGER update_profiles_updated_at
  BEFORE UPDATE ON public.profiles
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();