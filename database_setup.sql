-- Script para criar o banco de dados AppEnem no MySQL
-- Execute este script no phpMyAdmin

-- Criar o banco de dados
CREATE DATABASE IF NOT EXISTS appenem_db CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- Usar o banco de dados
USE appenem_db;

-- Tabela de usuários
CREATE TABLE IF NOT EXISTS users (
  id INT AUTO_INCREMENT PRIMARY KEY,
  name VARCHAR(255) NOT NULL,
  email VARCHAR(255) UNIQUE NOT NULL,
  birth_date DATE NOT NULL,
  password_hash VARCHAR(255) NOT NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
);

-- Tabela de simulações
CREATE TABLE IF NOT EXISTS simulations (
  id INT AUTO_INCREMENT PRIMARY KEY,
  user_id INT NOT NULL,
  total_questions INT NOT NULL,
  correct_answers INT NOT NULL,
  time_elapsed INT NOT NULL,
  score_percentage DECIMAL(5,2) NOT NULL,
  subject VARCHAR(100) NOT NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
);

-- Tabela de respostas das simulações
CREATE TABLE IF NOT EXISTS simulation_answers (
  id INT AUTO_INCREMENT PRIMARY KEY,
  simulation_id INT NOT NULL,
  question_index INT NOT NULL,
  user_answer VARCHAR(1) NOT NULL,
  correct_answer VARCHAR(1) NOT NULL,
  is_correct BOOLEAN NOT NULL,
  FOREIGN KEY (simulation_id) REFERENCES simulations(id) ON DELETE CASCADE
);

-- Dados de exemplo (opcional)
INSERT INTO users (name, email, birth_date, password_hash) VALUES 
('Usuário Teste', 'teste@example.com', '2000-01-01', '$2b$10$example_hash_here');

SELECT 'Banco de dados AppEnem criado com sucesso!' as status;