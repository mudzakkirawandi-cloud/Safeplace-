ALTER TABLE reports
ADD COLUMN incident_date DATE,
ADD COLUMN is_ongoing BOOLEAN DEFAULT FALSE,
ADD COLUMN location VARCHAR(100),
ADD COLUMN location_detail TEXT,
ADD COLUMN perpetrator_relationship VARCHAR(100),
ADD COLUMN safety_status VARCHAR(50);
