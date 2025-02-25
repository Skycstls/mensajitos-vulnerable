#!/bin/bash

# URL del servidor
BASE_URL="http://172.233.98.22"

# Credenciales de login
USERNAME="datadiego"
PASSWORD="datadiego1234"

# Mensaje a enviar
MESSAGE=$(cat basura.txt)

while true; do
    # Hacer login y guardar la cookie de sesión
    LOGIN_RESPONSE=$(curl -s -c cookies.txt -d "username=$USERNAME&password=$PASSWORD" "$BASE_URL/login")

    # Verificar si el login fue exitoso
    if echo "$LOGIN_RESPONSE" | grep -q "Usuario o contraseña incorrectos"; then
        echo "Error: Usuario o contraseña incorrectos."
        exit 1
    fi

    # Enviar mensaje
    curl -s -b cookies.txt -d "content=$MESSAGE" "$BASE_URL/message"

    echo "Mensaje enviado con éxito."
done