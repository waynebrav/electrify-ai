-- Create admin_notifications table
CREATE TABLE public.admin_notifications (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  title TEXT NOT NULL,
  message TEXT NOT NULL,
  type TEXT NOT NULL DEFAULT 'info' CHECK (type IN ('info', 'warning', 'success', 'error')),
  is_active BOOLEAN NOT NULL DEFAULT true,
  start_date TIMESTAMP WITH TIME ZONE,
  end_date TIMESTAMP WITH TIME ZONE,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.admin_notifications ENABLE ROW LEVEL SECURITY;

-- Create policies
CREATE POLICY "Admins can manage all notifications" 
ON public.admin_notifications 
FOR ALL 
USING (is_admin(auth.uid()));

CREATE POLICY "Anyone can view active notifications" 
ON public.admin_notifications 
FOR SELECT 
USING (is_active = true OR is_admin(auth.uid()));

-- Add trigger for timestamps
CREATE TRIGGER update_admin_notifications_updated_at
BEFORE UPDATE ON public.admin_notifications
FOR EACH ROW
EXECUTE FUNCTION public.update_timestamp();