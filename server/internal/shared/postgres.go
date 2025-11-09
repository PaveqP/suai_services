package shared

import (
	"fmt"

	"github.com/jmoiron/sqlx"
	_ "github.com/lib/pq"
)

type Config struct {
	Host     string
	Port     string
	Username string
	Password string
	DBName   string
	SSLMode  string
}

const DBDriverName = "postgres"

func ConnectPostgresDb(config *Config) (*sqlx.DB, error) {
	db, err := sqlx.Open(DBDriverName, fmt.Sprintf("host=%s port=%s user=%s password=%s dbname=%s search_path=%s sslmode=%s",
		config.Host, config.Port, config.Username, config.Password, config.DBName, "mydb", config.SSLMode))

	if err != nil {
		return nil, err
	}

	if err = db.Ping(); err != nil {
		return nil, err
	}

	return db, nil
}
