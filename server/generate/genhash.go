package main

import (
	"flag"
	"fmt"
	"log"
	"os"

	"golang.org/x/crypto/bcrypt"
)

func main() {
	password := flag.String("password", "", "Пароль для хэширования")
	flag.Parse()

	if *password == "" {
		fmt.Println("Использование: go run generate_hash.go -password <ваш_пароль>")
		os.Exit(1)
	}

	hash, err := bcrypt.GenerateFromPassword([]byte(*password), bcrypt.DefaultCost)
	if err != nil {
		log.Fatal("Failed to hash password:", err)
	}

	fmt.Println("Хэш для вставки в БД:")
	fmt.Println(string(hash))
}
