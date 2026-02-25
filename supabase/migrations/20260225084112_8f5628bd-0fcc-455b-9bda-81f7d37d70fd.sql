
-- Create feedback table
CREATE TABLE public.feedback (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_name TEXT NOT NULL,
  user_email TEXT NOT NULL,
  message TEXT NOT NULL,
  likes_count INTEGER NOT NULL DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

ALTER TABLE public.feedback ENABLE ROW LEVEL SECURITY;

-- Everyone can read feedback
CREATE POLICY "Anyone can read feedback" ON public.feedback FOR SELECT USING (true);

-- Authenticated users can insert (we'll check via edge function)
CREATE POLICY "Anyone can insert feedback" ON public.feedback FOR INSERT WITH CHECK (true);

-- Create feedback_likes table
CREATE TABLE public.feedback_likes (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  feedback_id UUID NOT NULL REFERENCES public.feedback(id) ON DELETE CASCADE,
  user_email TEXT NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  UNIQUE(feedback_id, user_email)
);

ALTER TABLE public.feedback_likes ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Anyone can read likes" ON public.feedback_likes FOR SELECT USING (true);
CREATE POLICY "Anyone can insert likes" ON public.feedback_likes FOR INSERT WITH CHECK (true);
CREATE POLICY "Anyone can delete own likes" ON public.feedback_likes FOR DELETE USING (true);

-- Function to update likes count
CREATE OR REPLACE FUNCTION public.update_feedback_likes_count()
RETURNS TRIGGER AS $$
BEGIN
  IF TG_OP = 'INSERT' THEN
    UPDATE public.feedback SET likes_count = likes_count + 1 WHERE id = NEW.feedback_id;
    RETURN NEW;
  ELSIF TG_OP = 'DELETE' THEN
    UPDATE public.feedback SET likes_count = likes_count - 1 WHERE id = OLD.feedback_id;
    RETURN OLD;
  END IF;
  RETURN NULL;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER SET search_path = public;

CREATE TRIGGER update_likes_count
AFTER INSERT OR DELETE ON public.feedback_likes
FOR EACH ROW
EXECUTE FUNCTION public.update_feedback_likes_count();
