
-- Create SECURITY DEFINER function to check room membership without recursion
CREATE OR REPLACE FUNCTION public.is_room_member(_room_id uuid, _user_id uuid)
RETURNS boolean
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT EXISTS (
    SELECT 1 FROM public.chat_members
    WHERE room_id = _room_id AND user_id = _user_id
  )
$$;

-- Create function to check if room is anonymous
CREATE OR REPLACE FUNCTION public.is_anonymous_room(_room_id uuid)
RETURNS boolean
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT EXISTS (
    SELECT 1 FROM public.chat_rooms
    WHERE id = _room_id AND is_anonymous = true
  )
$$;

-- Drop old policies
DROP POLICY IF EXISTS "Members can view membership" ON chat_members;
DROP POLICY IF EXISTS "Members can view their rooms" ON chat_rooms;
DROP POLICY IF EXISTS "Members can view messages" ON chat_messages;
DROP POLICY IF EXISTS "Members can send messages" ON chat_messages;

-- Recreate chat_members SELECT policy without recursion
CREATE POLICY "Members can view membership" ON chat_members
FOR SELECT TO authenticated
USING (user_id = auth.uid());

-- Recreate chat_rooms SELECT policy using function
CREATE POLICY "Members can view their rooms" ON chat_rooms
FOR SELECT TO authenticated
USING (
  public.is_room_member(id, auth.uid()) OR is_anonymous = true
);

-- Recreate chat_messages SELECT policy using function
CREATE POLICY "Members can view messages" ON chat_messages
FOR SELECT TO authenticated
USING (
  public.is_room_member(room_id, auth.uid()) OR public.is_anonymous_room(room_id)
);

-- Recreate chat_messages INSERT policy using function
CREATE POLICY "Members can send messages" ON chat_messages
FOR INSERT TO authenticated
WITH CHECK (
  auth.uid() = user_id AND (
    public.is_room_member(room_id, auth.uid()) OR public.is_anonymous_room(room_id)
  )
);
