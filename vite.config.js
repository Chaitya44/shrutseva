import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import tailwindcss from '@tailwindcss/vite';

const proxyLoginPlugin = () => ({
  name: 'proxy-login',
  configureServer(server) {
    server.middlewares.use(async (req, res, next) => {
      if (req.url === '/api/proxyLogin' && req.method === 'POST') {
        let body = '';
        req.on('data', chunk => { body += chunk.toString(); });
        req.on('end', async () => {
          try {
            const data = JSON.parse(body);
            const { username, password } = data;

            const loginRes = await fetch('https://www.shrutseva.com/test/login');
            const html = await loginRes.text();
            const tokenMatch = html.match(/<meta name="csrf-token" content="([^"]+)">/);
            const token = tokenMatch ? tokenMatch[1] : '';
            
            const rawCookies = loginRes.headers.get('set-cookie');
            let cookieStr = '';
            if (rawCookies) {
              const parts = rawCookies.split(/, (?=[A-Za-z0-9_-]+=)/);
              const parsed = [];
              for (const part of parts) {
                const match = part.match(/^([^=]+)=([^;]+)/);
                if (match) {
                  parsed.push(match[1] + '=' + match[2]);
                }
              }
              cookieStr = parsed.join('; ');
            }

            const params = new URLSearchParams();
            params.append('_token', token);
            params.append('username', username);
            params.append('password', password);
            params.append('login', 'frontend');

            const postRes = await fetch('https://www.shrutseva.com/test/front_login', {
              method: 'POST',
              headers: {
                'Content-Type': 'application/x-www-form-urlencoded',
                'Cookie': cookieStr,
                'X-Requested-With': 'XMLHttpRequest'
              },
              body: params,
              redirect: 'manual'
            });

            const location = postRes.headers.get('location');
            const newCookies = postRes.headers.get('set-cookie') || rawCookies;

            if (postRes.status === 302 && location && location.includes('/dashboard')) {
              if (newCookies) {
                const parts = newCookies.split(/, (?=[A-Za-z0-9_-]+=)/);
                for (const p of parts) {
                  // Strip secure flag for localhost HTTP
                  res.appendHeader('Set-Cookie', p.replace(/;\s*secure/gi, ''));
                }
              }
              res.setHeader('Content-Type', 'application/json');
              res.end(JSON.stringify({ success: true, redirect: location }));
            } else {
              res.statusCode = 401;
              res.setHeader('Content-Type', 'application/json');
              res.end(JSON.stringify({ success: false, message: 'Invalid credentials' }));
            }
          } catch (err) {
            console.error(err);
            res.statusCode = 500;
            res.end(JSON.stringify({ success: false, message: 'Internal server error' }));
          }
        });
        return;
      }
      next();
    });
  }
});

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [react(), tailwindcss(), proxyLoginPlugin()],
  server: {
    proxy: {
      '/get_bhandars_list': {
        target: 'https://www.shrutseva.com/test',
        changeOrigin: true,
        secure: false,
      },
      '/front': {
        target: 'https://www.shrutseva.com/test',
        changeOrigin: true,
        secure: false,
      },
      '/api': {
        target: 'https://www.shrutseva.com/test',
        changeOrigin: true,
        secure: false,
        rewrite: (path) => path.replace(/^\/api/, ''),
      },
    }
  }
});
