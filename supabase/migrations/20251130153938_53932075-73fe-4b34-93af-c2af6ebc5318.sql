-- Add parent_id and notion_url columns to subjects table
ALTER TABLE public.subjects
ADD COLUMN parent_id uuid REFERENCES public.subjects(id) ON DELETE CASCADE,
ADD COLUMN notion_url text;

-- Add index for better query performance
CREATE INDEX idx_subjects_parent_id ON public.subjects(parent_id);

-- Insert main exam categories
INSERT INTO public.subjects (name, description, icon) VALUES
('JEE', 'Joint Entrance Examination for engineering admissions', 'Calculator'),
('GATE', 'Graduate Aptitude Test in Engineering', 'Code'),
('UPSC', 'Union Public Service Commission examinations', 'BookOpen'),
('SET', 'State Eligibility Test for lectureship', 'GraduationCap'),
('NET', 'National Eligibility Test for assistant professor', 'Award');

-- Insert GATE sub-subjects (will need to get parent_id from the GATE subject)
DO $$
DECLARE
  gate_id uuid;
BEGIN
  SELECT id INTO gate_id FROM public.subjects WHERE name = 'GATE';
  
  INSERT INTO public.subjects (name, description, icon, parent_id, notion_url) VALUES
  ('CSE', 'Computer Science Engineering', 'Laptop', gate_id, 'https://www.notion.so/CSE-245b44b19c94801a9cf7c657be158ff8'),
  ('ECE', 'Electronics & Communication Engineering', 'Radio', gate_id, 'https://www.notion.so/ECE-28520c410d3e80a389c2ceecbb04832d'),
  ('EEE', 'Electrical & Electronics Engineering', 'Zap', gate_id, 'https://notion.so/your-eee-page'),
  ('MECH', 'Mechanical Engineering', 'Settings', gate_id, 'https://notion.so/your-mech-page');
END $$;