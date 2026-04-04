CREATE DATABASE IF NOT EXISTS quiz_arena;

USE quiz_arena;

CREATE TABLE IF NOT EXISTS questions (
    id INT AUTO_INCREMENT PRIMARY KEY,
    question_text TEXT NOT NULL,
    option_a VARCHAR(255) NOT NULL,
    option_b VARCHAR(255) NOT NULL,
    option_c VARCHAR(255) NOT NULL,
    option_d VARCHAR(255) NOT NULL,
    correct_option CHAR(1) NOT NULL -- Expected to be 'A', 'B', 'C', or 'D'
);

-- Seed Data
INSERT INTO questions (question_text, option_a, option_b, option_c, option_d, correct_option) VALUES 
('What is the capital of France?', 'London', 'Berlin', 'Paris', 'Madrid', 'C'),
('Which programming language is known as the language of the web?', 'Python', 'Java', 'C++', 'JavaScript', 'D'),
('What is the speed of light?', '300,000 km/s', '150,000 km/s', '1,000,000 km/s', '50,000 km/s', 'A'),
('Who wrote "Romeo and Juliet"?', 'Charles Dickens', 'William Shakespeare', 'Mark Twain', 'Jane Austen', 'B'),
('Which planet is known as the Red Planet?', 'Venus', 'Mars', 'Jupiter', 'Saturn', 'B');
