-- PostgreSQL Forward Engineering Script
-- Converted from MySQL Workbench output
-- Date: 2025-11-08

-- Create schema
CREATE SCHEMA IF NOT EXISTS mydb;

SET search_path TO mydb;

-- Table: user
CREATE TABLE "user" (
    id SERIAL PRIMARY KEY,
    name VARCHAR(100) NOT NULL,
    surname VARCHAR(100) NOT NULL,
    lastname VARCHAR(100),
    country VARCHAR(200),
    city VARCHAR(200),
    date_of_birth DATE,
    email VARCHAR(100) NOT NULL,
    hashed_password VARCHAR(45) NOT NULL,
    phone_number VARCHAR(100) NOT NULL,
    is_active BOOLEAN NOT NULL,
    created_at TIMESTAMP NOT NULL,
    updated_at TIMESTAMP NOT NULL
);

-- Table: drivers_license
CREATE TABLE drivers_license (
    id SERIAL PRIMARY KEY,
    name VARCHAR(100) NOT NULL,
    surname VARCHAR(100) NOT NULL,
    lastname VARCHAR(100),
    series VARCHAR(100) NOT NULL,
    doc_number VARCHAR(100) NOT NULL,
    date_of_birth DATE NOT NULL,
    place_of_birth VARCHAR(100) NOT NULL,
    date_of_issue DATE NOT NULL, -- changed from VARCHAR to DATE
    valid_until DATE NOT NULL, -- changed from VARCHAR to DATE
    residence VARCHAR(100) NOT NULL,
    issued_unit VARCHAR(300) NOT NULL,
    created_at TIMESTAMP NOT NULL,
    updated_at TIMESTAMP NOT NULL
);

-- Table: service_category
CREATE TABLE service_category (
    id SERIAL PRIMARY KEY,
    name VARCHAR(45),
    description VARCHAR(400)
);

-- Table: insurance
CREATE TABLE insurance (
    id SERIAL PRIMARY KEY,
    insurance_from DATE NOT NULL,
    insurance_until DATE NOT NULL,
    insurance_number VARCHAR(200) NOT NULL,
    insurance_verified BOOLEAN NOT NULL,
    created_at TIMESTAMP NOT NULL
);

-- Table: car
CREATE TABLE car (
    id SERIAL PRIMARY KEY,
    service_category_id INT,
    brand VARCHAR(200) NOT NULL,
    model VARCHAR(200) NOT NULL,
    government_number VARCHAR(100) NOT NULL,
    vin VARCHAR(200) NOT NULL,
    insurance_id INT NOT NULL, -- was VARCHAR(45) — must reference insurance.id (INT)
    color VARCHAR(100),
    passport VARCHAR(100) NOT NULL,
    sts_verified BOOLEAN NOT NULL,
    created_at TIMESTAMP NOT NULL,
    updated_at TIMESTAMP NOT NULL,
    CONSTRAINT fk_car_service_category FOREIGN KEY (service_category_id) REFERENCES service_category (id) ON DELETE CASCADE ON UPDATE CASCADE,
    CONSTRAINT fk_car_insurance FOREIGN KEY (insurance_id) REFERENCES insurance (id) ON DELETE CASCADE ON UPDATE CASCADE
);

-- Table: driver
CREATE TABLE driver (
    id SERIAL PRIMARY KEY,
    name VARCHAR(100) NOT NULL,
    surname VARCHAR(100) NOT NULL,
    lastname VARCHAR(100),
    email VARCHAR(100) NOT NULL,
    hashed_password VARCHAR(100) NOT NULL,
    phone_number VARCHAR(100) NOT NULL,
    verified BOOLEAN NOT NULL,
    document_id INT NOT NULL,
    car_id INT,
    is_active BOOLEAN NOT NULL,
    created_at TIMESTAMP NOT NULL,
    updated_at TIMESTAMP NOT NULL,
    CONSTRAINT fk_driver_document FOREIGN KEY (document_id) REFERENCES drivers_license (id) ON DELETE NO ACTION ON UPDATE NO ACTION,
    CONSTRAINT fk_driver_car FOREIGN KEY (car_id) REFERENCES car (id) ON DELETE SET NULL ON UPDATE CASCADE
);

-- Table: license_category
CREATE TABLE license_category (
    id SERIAL PRIMARY KEY,
    name VARCHAR(5),
    description VARCHAR(100)
);

-- Table: driver_license_category
CREATE TABLE driver_license_category (
    id SERIAL PRIMARY KEY,
    driver_license_id INT NOT NULL,
    category_id INT NOT NULL,
    CONSTRAINT fk_dll_driver_license FOREIGN KEY (driver_license_id) REFERENCES drivers_license (id) ON DELETE CASCADE ON UPDATE CASCADE,
    CONSTRAINT fk_dll_category FOREIGN KEY (category_id) REFERENCES license_category (id) ON DELETE CASCADE ON UPDATE CASCADE
);

-- Table: service
CREATE TABLE service (
    id SERIAL PRIMARY KEY,
    name VARCHAR(100),
    description VARCHAR(300)
);

-- Table: service_category_service
CREATE TABLE service_category_service (
    id SERIAL PRIMARY KEY,
    service_category_id INT NOT NULL,
    service_id INT NOT NULL,
    CONSTRAINT fk_scs_service_category FOREIGN KEY (service_category_id) REFERENCES service_category (id) ON DELETE CASCADE ON UPDATE CASCADE,
    CONSTRAINT fk_scs_service FOREIGN KEY (service_id) REFERENCES service (id) ON DELETE CASCADE ON UPDATE CASCADE
);

-- Table: "order" (quoted because ORDER is reserved word)
CREATE TABLE "order" (
    id SERIAL PRIMARY KEY,
    city VARCHAR(100) NOT NULL,
    start_trip_street VARCHAR(100) NOT NULL,
    start_trip_house VARCHAR(100) NOT NULL,
    start_trip_build VARCHAR(5),
    destination_street VARCHAR(100) NOT NULL,
    destination_house VARCHAR(100) NOT NULL,
    destination_build VARCHAR(100),
    service_category_id INT,
    status VARCHAR(50) NOT NULL,
    price NUMERIC, -- better than FLOAT for monetary values
    user_id INT NOT NULL,
    driver_id INT NOT NULL,
    created_at TIMESTAMP NOT NULL,
    updated_at TIMESTAMP NOT NULL,
    CONSTRAINT fk_order_user FOREIGN KEY (user_id) REFERENCES "user" (id) ON DELETE CASCADE ON UPDATE CASCADE,
    CONSTRAINT fk_order_driver FOREIGN KEY (driver_id) REFERENCES driver (id) ON DELETE CASCADE ON UPDATE CASCADE,
    CONSTRAINT fk_order_service_category FOREIGN KEY (service_category_id) REFERENCES service_category (id) ON DELETE SET NULL ON UPDATE SET NULL
);

-- Table: order_service
CREATE TABLE order_service (
    id SERIAL PRIMARY KEY,
    order_id INT NOT NULL,
    service_id INT NOT NULL,
    CONSTRAINT fk_os_order FOREIGN KEY (order_id) REFERENCES "order" (id) ON DELETE CASCADE ON UPDATE CASCADE,
    CONSTRAINT fk_os_service FOREIGN KEY (service_id) REFERENCES service (id) ON DELETE CASCADE ON UPDATE CASCADE
);

-- Table: payment
CREATE TABLE payment (
    id SERIAL PRIMARY KEY,
    order_id INT NOT NULL,
    payd_driver BOOLEAN, -- typo preserved: "payd" → should be "paid"?
    drivers_percent NUMERIC NOT NULL,
    amount NUMERIC NOT NULL,
    type VARCHAR(100),
    status VARCHAR(100) NOT NULL,
    created_at TIMESTAMP NOT NULL,
    updated_at TIMESTAMP NOT NULL,
    CONSTRAINT fk_payment_order FOREIGN KEY (order_id) REFERENCES "order" (id) ON DELETE CASCADE ON UPDATE CASCADE
);

-- Table: payment_info
CREATE TABLE payment_info (
    id SERIAL PRIMARY KEY,
    bank_name VARCHAR(200),
    card_holder_name VARCHAR(100),
    card_holder_surname VARCHAR(100),
    card_number VARCHAR(100),
    valid_until DATE,
    cvv_code_hashed VARCHAR(200),
    verified BOOLEAN,
    created_at TIMESTAMP,
    updated_at TIMESTAMP
);

-- Table: user_payment_info
CREATE TABLE user_payment_info (
    id SERIAL PRIMARY KEY,
    user_id INT NOT NULL,
    payment_info_id INT NOT NULL,
    CONSTRAINT fk_upi_user FOREIGN KEY (user_id) REFERENCES "user" (id) ON DELETE CASCADE ON UPDATE CASCADE,
    CONSTRAINT fk_upi_payment_info FOREIGN KEY (payment_info_id) REFERENCES payment_info (id) ON DELETE CASCADE ON UPDATE CASCADE
);

-- Table: driver_payment_info
CREATE TABLE driver_payment_info (
    id SERIAL PRIMARY KEY,
    driver_id INT NOT NULL,
    payment_info_id INT NOT NULL,
    CONSTRAINT fk_dpi_driver FOREIGN KEY (driver_id) REFERENCES driver (id) ON DELETE CASCADE ON UPDATE CASCADE,
    CONSTRAINT fk_dpi_payment_info FOREIGN KEY (payment_info_id) REFERENCES payment_info (id) ON DELETE CASCADE ON UPDATE CASCADE
);

-- Table: work_shift
CREATE TABLE work_shift (
    id SERIAL PRIMARY KEY,
    date DATE NOT NULL, -- changed from DATETIME to DATE (only date part used)
    start_time TIME NOT NULL,
    end_time TIME NOT NULL,
    total_amount NUMERIC,
    driver_id INT NOT NULL,
    created_at TIMESTAMP NOT NULL,
    updated_at TIMESTAMP NOT NULL,
    CONSTRAINT fk_ws_driver FOREIGN KEY (driver_id) REFERENCES driver (id) ON DELETE CASCADE ON UPDATE CASCADE
);

-- Table: order_work_shift
CREATE TABLE order_work_shift (
    id SERIAL PRIMARY KEY,
    order_id INT NOT NULL,
    work_shift_id INT NOT NULL,
    CONSTRAINT fk_ows_order FOREIGN KEY (order_id) REFERENCES "order" (id) ON DELETE CASCADE ON UPDATE CASCADE,
    CONSTRAINT fk_ows_work_shift FOREIGN KEY (work_shift_id) REFERENCES work_shift (id) ON DELETE CASCADE ON UPDATE CASCADE
);

-- Table: stuff
CREATE TABLE stuff (
    id SERIAL PRIMARY KEY,
    name VARCHAR(100) NOT NULL,
    surname VARCHAR(100) NOT NULL,
    lastname VARCHAR(100),
    post VARCHAR(100) NOT NULL,
    status VARCHAR(100) NOT NULL,
    created_at TIMESTAMP NOT NULL,
    updated_at TIMESTAMP NOT NULL
);

-- Table: ticket
CREATE TABLE ticket (
    id SERIAL PRIMARY KEY,
    issue VARCHAR(300) NOT NULL,
    details TEXT,
    order_id INT NOT NULL,
    claiment_driver BOOLEAN NOT NULL, -- typo: "claiment" → should be "claimant"?
    stuff_id INT NOT NULL,
    status VARCHAR(100) NOT NULL,
    solution VARCHAR(200) NOT NULL,
    created_at TIMESTAMP NOT NULL,
    updated_at TIMESTAMP NOT NULL,
    CONSTRAINT fk_ticket_order FOREIGN KEY (order_id) REFERENCES "order" (id) ON DELETE CASCADE ON UPDATE CASCADE,
    CONSTRAINT fk_ticket_stuff FOREIGN KEY (stuff_id) REFERENCES stuff (id) ON DELETE CASCADE ON UPDATE CASCADE
);