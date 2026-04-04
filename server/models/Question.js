const { pool, isDBConnected } = require('../config/db');

// Fallback questions if MySQL is not set up yet
const fallbackQuestions = [
    { id: 1, question_text: 'What is the closest planet to the Sun?', option_a: 'Venus', option_b: 'Earth', option_c: 'Mercury', option_d: 'Mars', correct_option: 'C' },
    { id: 2, question_text: 'What gas makes up the majority of Earths atmosphere?', option_a: 'Oxygen', option_b: 'Nitrogen', option_c: 'Carbon Dioxide', option_d: 'Hydrogen', correct_option: 'B' },
    { id: 3, question_text: 'Which JavaScript framework was created by Facebook?', option_a: 'Angular', option_b: 'Vue', option_c: 'React', option_d: 'Svelte', correct_option: 'C' },
    { id: 4, question_text: 'What is the massive black hole at the center of the Milky Way called?', option_a: 'Sagittarius A*', option_b: 'Andromeda', option_c: 'Alpha Centauri', option_d: 'Sirius', correct_option: 'A' },
    { id: 5, question_text: 'In computing, what does "CPU" stand for?', option_a: 'Central Process Unit', option_b: 'Computer Personal Unit', option_c: 'Central Processing Unit', option_d: 'Control Process Unit', correct_option: 'C' },
    { id: 6, question_text: 'Which force keeps planets in orbit around the Sun?', option_a: 'Electro-Magnetism', option_b: 'Gravity', option_c: 'Strong Nuclear', option_d: 'Friction', correct_option: 'B' },
    { id: 7, question_text: 'What does CSS stand for?', option_a: 'Cascading Style Sheets', option_b: 'Creative Style System', option_c: 'Computer Style Syntax', option_d: 'Cascading Sheet Styles', correct_option: 'A' },
    { id: 8, question_text: 'Which planet is known for its prominent ring system?', option_a: 'Jupiter', option_b: 'Saturn', option_c: 'Uranus', option_d: 'Neptune', correct_option: 'B' },
    { id: 9, question_text: 'Who is regarded as the first computer programmer?', option_a: 'Alan Turing', option_b: 'Charles Babbage', option_c: 'Ada Lovelace', option_d: 'Steve Wozniak', correct_option: 'C' },
    { id: 10, question_text: 'What is the speed of light in a vacuum?', option_a: '300,000 km/s', option_b: '150,000 km/s', option_c: '1,000,000 km/s', option_d: '50,000 km/s', correct_option: 'A' },
    { id: 11, question_text: 'Which language is primarily used for Android app development?', option_a: 'Swift', option_b: 'Kotlin', option_c: 'Objective-C', option_d: 'Ruby', correct_option: 'B' },
    { id: 12, question_text: 'What is the largest organ in the human body?', option_a: 'Heart', option_b: 'Liver', option_c: 'Skin', option_d: 'Lungs', correct_option: 'C' },
    { id: 13, question_text: 'What does HTTP stand for?', option_a: 'HyperText Transfer Protocol', option_b: 'Hyperlink Transfer Technology', option_c: 'HyperText Transmission Protocol', option_d: 'HyperTech Text Proc', correct_option: 'A' },
    { id: 14, question_text: 'Who founded SpaceX?', option_a: 'Jeff Bezos', option_b: 'Elon Musk', option_c: 'Richard Branson', option_d: 'Bill Gates', correct_option: 'B' },
    { id: 15, question_text: 'What is the chemical symbol for Gold?', option_a: 'Go', option_b: 'Ag', option_c: 'Au', option_d: 'Gd', correct_option: 'C' },
    { id: 16, question_text: 'What does API stand for?', option_a: 'Application Programming Interface', option_b: 'Applied Primary Index', option_c: 'Application Process Integration', option_d: 'Auto Program Interface', correct_option: 'A' },
    { id: 17, question_text: 'The concept of gravity was discovered by which famous physicist?', option_a: 'Albert Einstein', option_b: 'Isaac Newton', option_c: 'Galileo Galilei', option_d: 'Nikola Tesla', correct_option: 'B' },
    { id: 18, question_text: 'What is the most widely used version control system?', option_a: 'SVN', option_b: 'Mercurial', option_c: 'Git', option_d: 'TFS', correct_option: 'C' },
    { id: 19, question_text: 'Which company developed the Python language?', option_a: 'Microsoft', option_b: 'Google', option_c: 'CWI Institute', option_d: 'Apple', correct_option: 'C' }, // Designed by Guido van Rossum at CWI
    { id: 20, question_text: 'What part of the cell is known as the powerhouse?', option_a: 'Nucleus', option_b: 'Mitochondria', option_c: 'Ribosome', option_d: 'Cell Membrane', correct_option: 'B' },
    { id: 21, question_text: 'What does SQL stand for?', option_a: 'Structured Query Language', option_b: 'System Query Library', option_c: 'Standard Question Logic', option_d: 'Simple Query Language', correct_option: 'A' },
    { id: 22, question_text: 'What galaxy is Earth located in?', option_a: 'Andromeda', option_b: 'Whirlpool', option_c: 'Milky Way', option_d: 'Sombrero', correct_option: 'C' },
    { id: 23, question_text: 'What is the main function of a DNS server?', option_a: 'Host website files', option_b: 'Translate domains to IP addresses', option_c: 'Encrypt web traffic', option_d: 'Send emails', correct_option: 'B' },
    { id: 24, question_text: 'What is the boiling point of water in Celsius?', option_a: '0', option_b: '50', option_c: '100', option_d: '212', correct_option: 'C' },
    { id: 25, question_text: 'Which data structure follows the LIFO principle?', option_a: 'Queue', option_b: 'Stack', option_c: 'Linked List', option_d: 'Tree', correct_option: 'B' },
    { id: 26, question_text: 'What does JSON stand for?', option_a: 'Java Standard Object Notation', option_b: 'JavaScript Object Network', option_c: 'JavaScript Optional Naming', option_d: 'JavaScript Object Notation', correct_option: 'D' },
    { id: 27, question_text: 'Who developed the theory of relativity?', option_a: 'Stephen Hawking', option_b: 'Isaac Newton', option_c: 'Albert Einstein', option_d: 'Niels Bohr', correct_option: 'C' },
    { id: 28, question_text: 'Which of the following is a completely NoSQL database?', option_a: 'PostgreSQL', option_b: 'MongoDB', option_c: 'MySQL', option_d: 'SQLite', correct_option: 'B' },
    { id: 29, question_text: 'What gas do plants absorb during photosynthesis?', option_a: 'Oxygen', option_b: 'Nitrogen', option_c: 'Carbon Dioxide', option_d: 'Helium', correct_option: 'C' },
    { id: 30, question_text: 'What is the hardest natural substance on Earth?', option_a: 'Gold', option_b: 'Iron', option_c: 'Diamond', option_d: 'Platinum', correct_option: 'C' },
    { id: 31, question_text: 'What company originally created Java?', option_a: 'Microsoft', option_b: 'Apple', option_c: 'Oracle', option_d: 'Sun Microsystems', correct_option: 'D' },
    { id: 32, question_text: 'What was the first commercially successful graphical web browser?', option_a: 'Internet Explorer', option_b: 'Firefox', option_c: 'Netscape Navigator', option_d: 'Google Chrome', correct_option: 'C' },
    { id: 33, question_text: 'Which planet is the hottest in the solar system?', option_a: 'Mercury', option_b: 'Venus', option_c: 'Mars', option_d: 'Jupiter', correct_option: 'B' },
    { id: 34, question_text: 'What does SSD stand for?', option_a: 'Solid State Drive', option_b: 'Super Speed Disk', option_c: 'Solid System Disk', option_d: 'Secure Storage Drive', correct_option: 'A' },
    { id: 35, question_text: 'Which HTML tag is used for the largest heading?', option_a: '<heading>', option_b: '<h6>', option_c: '<head>', option_d: '<h1>', correct_option: 'D' }
];

class Question {
    static async getRandomQuestions(limit = 3) {
        if (!isDBConnected()) {
            // Shuffle fallback
            return fallbackQuestions.sort(() => 0.5 - Math.random()).slice(0, limit);
        }

        try {
            const [rows] = await pool.query('SELECT * FROM questions ORDER BY RAND() LIMIT ?', [limit]);
            if (rows.length === 0) return fallbackQuestions.slice(0, limit);
            return rows;
        } catch (error) {
            console.error('Error fetching questions from DB:', error);
            return fallbackQuestions.slice(0, limit);
        }
    }
}

module.exports = Question;
