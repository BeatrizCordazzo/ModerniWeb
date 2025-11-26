CREATE TABLE IF NOT EXISTS custom_furniture_options (
    id INT AUTO_INCREMENT PRIMARY KEY,
    service VARCHAR(50) NOT NULL,
    name VARCHAR(150) NOT NULL,
    type VARCHAR(100) NOT NULL,
    base_price DECIMAL(10,2) NOT NULL,
    image_url VARCHAR(255),
    min_width INT,
    max_width INT,
    min_height INT,
    max_height INT,
    depth INT,
    colors_json TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    INDEX idx_service (service)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;
