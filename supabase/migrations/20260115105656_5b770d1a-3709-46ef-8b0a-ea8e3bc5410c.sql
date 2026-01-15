-- First create the helper functions
CREATE OR REPLACE FUNCTION public.is_meeting_host(_user_id uuid, _meeting_id uuid)
RETURNS boolean
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT EXISTS (
    SELECT 1
    FROM public.meetings
    WHERE id = _meeting_id
      AND host_id = _user_id
  )
$$;

CREATE OR REPLACE FUNCTION public.is_meeting_participant(_user_id uuid, _meeting_id uuid)
RETURNS boolean
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT EXISTS (
    SELECT 1
    FROM public.meeting_participants
    WHERE user_id = _user_id
      AND meeting_id = _meeting_id
      AND status = 'approved'
      AND left_at IS NULL
  )
$$;

-- Drop the problematic SELECT policy
DROP POLICY IF EXISTS "Katılımcılar kendilerini ve onaylananları görebilir" ON public.meeting_participants;

-- Create a simpler non-recursive SELECT policy
CREATE POLICY "Select meeting participants"
ON public.meeting_participants
FOR SELECT
USING (
  auth.uid() = user_id 
  OR public.is_meeting_host(auth.uid(), meeting_id)
  OR (status = 'approved' AND public.is_meeting_participant(auth.uid(), meeting_id))
);

-- Drop and recreate UPDATE policy  
DROP POLICY IF EXISTS "Kullanıcılar kendi durumlarını veya host onay verebilir" ON public.meeting_participants;

CREATE POLICY "Update meeting participants"
ON public.meeting_participants
FOR UPDATE
USING (
  auth.uid() = user_id 
  OR public.is_meeting_host(auth.uid(), meeting_id)
);