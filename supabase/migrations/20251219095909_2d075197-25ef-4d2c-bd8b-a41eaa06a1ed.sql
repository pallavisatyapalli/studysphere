-- Make subject_id nullable to support AI-generated quizzes
ALTER TABLE public.quiz_attempts 
ALTER COLUMN subject_id DROP NOT NULL;

-- Add a quiz_type column to distinguish between subject-based and AI-generated quizzes
ALTER TABLE public.quiz_attempts 
ADD COLUMN IF NOT EXISTS quiz_type TEXT DEFAULT 'subject' CHECK (quiz_type IN ('subject', 'ai_generated'));

-- Add a topic column for AI-generated quizzes to track what they're about
ALTER TABLE public.quiz_attempts 
ADD COLUMN IF NOT EXISTS topic TEXT;