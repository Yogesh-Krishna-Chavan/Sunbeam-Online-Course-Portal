CREATE DATABASE IF NOT EXISTS institute_management_db;
USE institute_management_db;

CREATE TABLE IF NOT EXISTS users (
    email VARCHAR(100) NOT NULL UNIQUE,
    password VARCHAR(255) NOT NULL,
    role ENUM('student', 'admin') DEFAULT 'student'
);

CREATE TABLE IF NOT EXISTS courses (
    course_id INT AUTO_INCREMENT PRIMARY KEY,
    course_name VARCHAR(100) NOT NULL,
    description VARCHAR(255) NOT NULL,
    fees INT,
    start_date DATE,
    end_date DATE,
    video_expire_days INT
);

CREATE TABLE IF NOT EXISTS students (
    reg_no INT AUTO_INCREMENT PRIMARY KEY,
    name VARCHAR(100) NOT NULL,
    email VARCHAR(100) NOT NULL,
    course_id INT NOT NULL,
    mobile_no VARCHAR(15),
    profile_pic BLOB,
    FOREIGN KEY (email) REFERENCES users(email),
    FOREIGN KEY (course_id) REFERENCES courses(course_id)
);

CREATE TABLE IF NOT EXISTS videos (
    video_id INT AUTO_INCREMENT PRIMARY KEY,
    course_id INT,
    title VARCHAR(100) NOT NULL,
    youtube_url VARCHAR(255) NOT NULL,
    added_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    description VARCHAR(255) NOT NULL,
    FOREIGN KEY (course_id) REFERENCES courses(course_id) ON DELETE CASCADE
);

