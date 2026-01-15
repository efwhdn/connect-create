-- Add status column to meeting_participants for waiting room functionality
ALTER TABLE public.meeting_participants 
ADD COLUMN status text NOT NULL DEFAULT 'approved';

-- Add constraint to ensure valid status values
ALTER TABLE public.meeting_participants 
ADD CONSTRAINT meeting_participants_status_check 
CHECK (status IN ('waiting', 'approved', 'rejected'));

-- Update RLS policy: participants can only see approved participants or themselves
DROP POLICY IF EXISTS "Toplantıdaki herkes katılımcıları görebilir" ON public.meeting_participants;

CREATE POLICY "Katılımcılar kendilerini ve onaylananları görebilir"
ON public.meeting_participants
FOR SELECT
USING (
  auth.uid() = user_id 
  OR (
    status = 'approved' 
    AND EXISTS (
      SELECT 1 FROM meeting_participants mp 
      WHERE mp.meeting_id = meeting_participants.meeting_id 
      AND mp.user_id = auth.uid() 
      AND mp.status = 'approved'
      AND mp.left_at IS NULL
    )
  )
  OR (
    EXISTS (
      SELECT 1 FROM meetings m 
      WHERE m.id = meeting_participants.meeting_id 
      AND m.host_id = auth.uid()
    )
  )
);

-- Host can update participant status (approve/reject)
DROP POLICY IF EXISTS "Kullanıcılar kendi durumlarını güncelleyebilir" ON public.meeting_participants;

CREATE POLICY "Kullanıcılar kendi durumlarını veya host onay verebilir"
ON public.meeting_participants
FOR UPDATE
USING (
  auth.uid() = user_id 
  OR EXISTS (
    SELECT 1 FROM meetings m 
    WHERE m.id = meeting_participants.meeting_id 
    AND m.host_id = auth.uid()
  )
);

-- Fix meetings table RLS - only authenticated users can see active meetings
DROP POLICY IF EXISTS "Herkes aktif toplantıları görebilir" ON public.meetings;

CREATE POLICY "Authenticated users can see active meetings"
ON public.meetings
FOR SELECT
USING (is_active = true AND auth.uid() IS NOT NULL);

-- Fix profiles table RLS - only authenticated users can see profiles
DROP POLICY IF EXISTS "Herkes profilleri görebilir" ON public.profiles;

CREATE POLICY "Authenticated users can see profiles"
ON public.profiles
FOR SELECT
USING (auth.uid() IS NOT NULL);