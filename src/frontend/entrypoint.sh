#!/bin/sh

# Substituir variáveis de ambiente no build
if [ ! -z "$REACT_APP_API_URL" ]; then
    echo "Configurando API URL: $REACT_APP_API_URL"
    find /usr/share/nginx/html -name "*.js" -exec sed -i "s|REACT_APP_API_URL_PLACEHOLDER|$REACT_APP_API_URL|g" {} \;
fi

# Executar comando original
exec "$@"