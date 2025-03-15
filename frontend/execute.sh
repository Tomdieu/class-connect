# npm install --force && npm run build && pm2 restart all
docker compose up --build --no-cache && docker compose up -d --remove-orphans