-- Formula Info Database Initialization
-- This script sets up the initial database structure

-- Create extensions
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
CREATE EXTENSION IF NOT EXISTS "pg_trgm";

-- Create users table
CREATE TABLE IF NOT EXISTS users (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    email VARCHAR(255) UNIQUE NOT NULL,
    username VARCHAR(50) UNIQUE NOT NULL,
    password_hash VARCHAR(255) NOT NULL,
    first_name VARCHAR(100),
    last_name VARCHAR(100),
    avatar_url TEXT,
    favorite_driver_id INTEGER,
    favorite_team_id INTEGER,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create drivers table (cache from OpenF1 API)
CREATE TABLE IF NOT EXISTS drivers (
    id SERIAL PRIMARY KEY,
    driver_number INTEGER UNIQUE,
    full_name VARCHAR(255) NOT NULL,
    first_name VARCHAR(100),
    last_name VARCHAR(100),
    nationality VARCHAR(100),
    team_name VARCHAR(100),
    birth_date DATE,
    bio TEXT,
    image_url TEXT,
    is_active BOOLEAN DEFAULT true,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create teams table
CREATE TABLE IF NOT EXISTS teams (
    id SERIAL PRIMARY KEY,
    name VARCHAR(255) NOT NULL,
    full_name VARCHAR(255),
    nationality VARCHAR(100),
    base VARCHAR(255),
    team_chief VARCHAR(255),
    technical_chief VARCHAR(255),
    chassis VARCHAR(100),
    power_unit VARCHAR(100),
    first_team_entry INTEGER,
    world_championships INTEGER DEFAULT 0,
    highest_race_finish INTEGER,
    pole_positions INTEGER DEFAULT 0,
    fastest_laps INTEGER DEFAULT 0,
    logo_url TEXT,
    car_image_url TEXT,
    color_primary VARCHAR(7),
    color_secondary VARCHAR(7),
    is_active BOOLEAN DEFAULT true,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create races table
CREATE TABLE IF NOT EXISTS races (
    id SERIAL PRIMARY KEY,
    year INTEGER NOT NULL,
    round INTEGER NOT NULL,
    race_name VARCHAR(255) NOT NULL,
    circuit_name VARCHAR(255),
    location VARCHAR(255),
    country VARCHAR(100),
    date DATE,
    time TIME,
    url TEXT,
    fp1_date DATE,
    fp1_time TIME,
    fp2_date DATE,
    fp2_time TIME,
    fp3_date DATE,
    fp3_time TIME,
    qualifying_date DATE,
    qualifying_time TIME,
    sprint_date DATE,
    sprint_time TIME,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    UNIQUE(year, round)
);

-- Create race_results table
CREATE TABLE IF NOT EXISTS race_results (
    id SERIAL PRIMARY KEY,
    race_id INTEGER REFERENCES races(id),
    driver_id INTEGER REFERENCES drivers(id),
    team_id INTEGER REFERENCES teams(id),
    position INTEGER,
    position_text VARCHAR(10),
    points DECIMAL(5,1) DEFAULT 0,
    laps INTEGER,
    time_or_retired TEXT,
    milliseconds BIGINT,
    fastest_lap INTEGER,
    fastest_lap_rank INTEGER,
    fastest_lap_time VARCHAR(20),
    fastest_lap_speed DECIMAL(6,3),
    status_id INTEGER,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    UNIQUE(race_id, driver_id)
);

-- Create user_favorites table
CREATE TABLE IF NOT EXISTS user_favorites (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID REFERENCES users(id) ON DELETE CASCADE,
    favorite_type VARCHAR(20) NOT NULL CHECK (favorite_type IN ('driver', 'team', 'race')),
    favorite_id INTEGER NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    UNIQUE(user_id, favorite_type, favorite_id)
);

-- Create user_predictions table (for future features)
CREATE TABLE IF NOT EXISTS user_predictions (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID REFERENCES users(id) ON DELETE CASCADE,
    race_id INTEGER REFERENCES races(id),
    predicted_winner_id INTEGER REFERENCES drivers(id),
    predicted_podium JSONB, -- [driver_id_1st, driver_id_2nd, driver_id_3rd]
    points_earned INTEGER DEFAULT 0,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    UNIQUE(user_id, race_id)
);

-- Create indexes for better performance
CREATE INDEX IF NOT EXISTS idx_users_email ON users(email);
CREATE INDEX IF NOT EXISTS idx_users_username ON users(username);
CREATE INDEX IF NOT EXISTS idx_drivers_number ON drivers(driver_number);
CREATE INDEX IF NOT EXISTS idx_drivers_active ON drivers(is_active);
CREATE INDEX IF NOT EXISTS idx_teams_active ON teams(is_active);
CREATE INDEX IF NOT EXISTS idx_races_year ON races(year);
CREATE INDEX IF NOT EXISTS idx_races_date ON races(date);
CREATE INDEX IF NOT EXISTS idx_race_results_race_id ON race_results(race_id);
CREATE INDEX IF NOT EXISTS idx_race_results_driver_id ON race_results(driver_id);
CREATE INDEX IF NOT EXISTS idx_user_favorites_user_id ON user_favorites(user_id);
CREATE INDEX IF NOT EXISTS idx_user_predictions_user_id ON user_predictions(user_id);

-- Create updated_at trigger function
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ language 'plpgsql';

-- Create triggers for updated_at
CREATE TRIGGER update_users_updated_at BEFORE UPDATE ON users
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_drivers_updated_at BEFORE UPDATE ON drivers
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_teams_updated_at BEFORE UPDATE ON teams
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_races_updated_at BEFORE UPDATE ON races
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_user_predictions_updated_at BEFORE UPDATE ON user_predictions
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- Insert some sample data
INSERT INTO teams (name, full_name, nationality, color_primary, color_secondary) VALUES
('Red Bull Racing', 'Oracle Red Bull Racing', 'Austria', '#1E41FF', '#FF8000'),
('Mercedes', 'Mercedes-AMG Petronas F1 Team', 'Germany', '#00D2BE', '#000000'),
('Ferrari', 'Scuderia Ferrari', 'Italy', '#DC143C', '#FFFF00'),
('McLaren', 'McLaren F1 Team', 'United Kingdom', '#FF8700', '#000000'),
('Alpine', 'BWT Alpine F1 Team', 'France', '#0090FF', '#FF007F'),
('Aston Martin', 'Aston Martin Aramco Cognizant F1 Team', 'United Kingdom', '#006F62', '#BDFF00')
ON CONFLICT DO NOTHING;

-- Create a view for driver standings
CREATE OR REPLACE VIEW driver_standings_current AS
SELECT 
    d.id,
    d.full_name,
    d.driver_number,
    t.name as team_name,
    COALESCE(SUM(rr.points), 0) as total_points,
    COUNT(rr.race_id) as races_completed,
    COUNT(CASE WHEN rr.position = 1 THEN 1 END) as wins,
    COUNT(CASE WHEN rr.position <= 3 THEN 1 END) as podiums
FROM drivers d
LEFT JOIN teams t ON d.team_name = t.name
LEFT JOIN race_results rr ON d.id = rr.driver_id
LEFT JOIN races r ON rr.race_id = r.id
WHERE d.is_active = true 
  AND (r.year = EXTRACT(YEAR FROM CURRENT_DATE) OR r.year IS NULL)
GROUP BY d.id, d.full_name, d.driver_number, t.name
ORDER BY total_points DESC, wins DESC, podiums DESC;

COMMENT ON DATABASE formula_info IS 'Formula Info - Database for F1 fan platform';
