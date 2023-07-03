FROM caddy:2.6-alpine
ADD Caddyfile /etc/caddy/
ADD dist /usr/share/caddy
