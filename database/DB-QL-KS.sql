CREATE TABLE users (
    id SERIAL PRIMARY KEY,
    full_name VARCHAR(100) NOT NULL,
    email VARCHAR(100) UNIQUE NOT NULL,
    password VARCHAR(255) NOT NULL,
    phone VARCHAR(20),
    role VARCHAR(20) NOT NULL, -- CUSTOMER / RECEPTION / ADMIN
    hotel_id INT, -- null n?u là admin h? th?ng
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE hotels (
    id SERIAL PRIMARY KEY,
    name VARCHAR(150) NOT NULL,
    address TEXT NOT NULL,
    city VARCHAR(100),
    description TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE room_types (
    id SERIAL PRIMARY KEY,
    hotel_id INT REFERENCES hotels(id) ON DELETE CASCADE,
    name VARCHAR(100) NOT NULL,
    capacity INT NOT NULL,
    base_price NUMERIC(12,2) NOT NULL,
    description TEXT
);

CREATE TABLE rooms (
    id SERIAL PRIMARY KEY,
    hotel_id INT REFERENCES hotels(id) ON DELETE CASCADE,
    room_type_id INT REFERENCES room_types(id),
    room_number VARCHAR(20) NOT NULL,
    status VARCHAR(20) DEFAULT 'AVAILABLE', 
    -- AVAILABLE / OCCUPIED / CLEANING / MAINTENANCE
    UNIQUE (hotel_id, room_number)
);

CREATE TABLE bookings (
    id SERIAL PRIMARY KEY,
    user_id INT REFERENCES users(id),
    hotel_id INT REFERENCES hotels(id),
    room_id INT REFERENCES rooms(id),
    check_in DATE NOT NULL,
    check_out DATE NOT NULL,
    total_price NUMERIC(12,2),
    status VARCHAR(20) DEFAULT 'PENDING', 
    -- PENDING / CONFIRMED / CHECKED_IN / COMPLETED / CANCELLED
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE payments (
    id SERIAL PRIMARY KEY,
    booking_id INT REFERENCES bookings(id) ON DELETE CASCADE,
    amount NUMERIC(12,2) NOT NULL,
    payment_method VARCHAR(50), -- CARD / CASH / BANK
    status VARCHAR(20) DEFAULT 'PENDING',
    paid_at TIMESTAMP
);

CREATE TABLE reviews (
    id SERIAL PRIMARY KEY,
    booking_id INT REFERENCES bookings(id),
    user_id INT REFERENCES users(id),
    rating INT CHECK (rating BETWEEN 1 AND 5),
    comment TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE services (
    id SERIAL PRIMARY KEY,
    hotel_id INT REFERENCES hotels(id),
    name VARCHAR(100),
    price NUMERIC(12,2)
);

CREATE TABLE service_usages (
    id SERIAL PRIMARY KEY,
    booking_id INT REFERENCES bookings(id),
    service_id INT REFERENCES services(id),
    quantity INT DEFAULT 1,
    total_price NUMERIC(12,2)
);

CREATE TABLE pricing_policies (
    id SERIAL PRIMARY KEY,
    hotel_id INT REFERENCES hotels(id),
    room_type_id INT REFERENCES room_types(id),
    start_date DATE,
    end_date DATE,
    price NUMERIC(12,2)
);

CREATE INDEX idx_booking_dates ON bookings(check_in, check_out);
CREATE INDEX idx_room_status ON rooms(status);
CREATE INDEX idx_user_role ON users(role);
