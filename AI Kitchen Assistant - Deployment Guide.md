# AI Kitchen Assistant - Deployment Guide

This guide provides instructions for deploying the AI Kitchen Assistant application to production environments.

## 🚀 Deployment Options

### Option 1: Local Development/Testing
Perfect for development, testing, and demonstration purposes.

#### Requirements
- Node.js 20.x+
- Python 3.11+
- 2GB RAM minimum
- 1GB disk space

#### Steps
1. Follow the installation instructions in README.md
2. Run both frontend and backend locally
3. Access via `http://localhost:5173`

### Option 2: Production Deployment

#### Frontend Deployment (Static Hosting)
The React frontend can be deployed to any static hosting service:

**Build the frontend:**
```bash
cd kitchen-frontend
npm run build
# or pnpm run build
```

**Deploy to popular services:**
- **Vercel**: `vercel --prod`
- **Netlify**: Upload `dist/` folder or connect GitHub repo
- **AWS S3**: Upload `dist/` contents to S3 bucket with static hosting
- **GitHub Pages**: Use GitHub Actions to deploy `dist/` folder

#### Backend Deployment (Server Hosting)

**Option A: Traditional Server (VPS/Dedicated)**
```bash
# Install dependencies
sudo apt update
sudo apt install python3.11 python3.11-venv nginx

# Set up application
cd kitchen-backend
python3.11 -m venv venv
source venv/bin/activate
pip install -r requirements.txt
pip install gunicorn

# Run with Gunicorn
gunicorn -w 4 -b 0.0.0.0:5001 src.main:app
```

**Option B: Docker Deployment**
```dockerfile
# Dockerfile for backend
FROM python:3.11-slim

WORKDIR /app
COPY requirements.txt .
RUN pip install -r requirements.txt

COPY src/ ./src/
EXPOSE 5001

CMD ["gunicorn", "-w", "4", "-b", "0.0.0.0:5001", "src.main:app"]
```

**Option C: Cloud Platforms**
- **Heroku**: Use `Procfile` with `web: gunicorn src.main:app`
- **Railway**: Connect GitHub repo, auto-deploys
- **DigitalOcean App Platform**: Deploy directly from GitHub
- **AWS Elastic Beanstalk**: Upload application zip

## 🔧 Production Configuration

### Environment Variables
Create a `.env` file in the backend directory:

```env
# Production settings
FLASK_ENV=production
SECRET_KEY=your-super-secret-key-here
JWT_SECRET_KEY=your-jwt-secret-key-here

# Database (for production use PostgreSQL)
DATABASE_URL=postgresql://user:password@localhost/kitchen_assistant

# External APIs (when ready)
GOOGLE_VISION_API_KEY=your-google-vision-key
SPOONACULAR_API_KEY=your-spoonacular-key
```

### Database Migration (PostgreSQL)
```bash
# Install PostgreSQL adapter
pip install psycopg2-binary

# Update database URI in main.py
app.config['SQLALCHEMY_DATABASE_URI'] = os.environ.get('DATABASE_URL')
```

### Frontend Configuration
Update `vite.config.js` for production API URL:

```javascript
export default defineConfig({
  // ... existing config
  define: {
    __API_URL__: JSON.stringify(process.env.VITE_API_URL || 'https://your-api-domain.com')
  }
})
```

## 🔒 Security Considerations

### Backend Security
1. **Use strong secret keys** in production
2. **Enable HTTPS** for all API endpoints
3. **Configure CORS** properly for your domain
4. **Use environment variables** for sensitive data
5. **Enable rate limiting** to prevent abuse
6. **Validate all inputs** and sanitize data
7. **Use production WSGI server** (Gunicorn, uWSGI)

### Frontend Security
1. **Use HTTPS** for the frontend domain
2. **Configure CSP headers** to prevent XSS
3. **Validate API responses** before using data
4. **Don't expose sensitive data** in client-side code

## 📊 Monitoring & Maintenance

### Logging
Add logging to the Flask application:

```python
import logging
from logging.handlers import RotatingFileHandler

if not app.debug:
    file_handler = RotatingFileHandler('logs/kitchen_assistant.log', maxBytes=10240, backupCount=10)
    file_handler.setFormatter(logging.Formatter(
        '%(asctime)s %(levelname)s: %(message)s [in %(pathname)s:%(lineno)d]'
    ))
    file_handler.setLevel(logging.INFO)
    app.logger.addHandler(file_handler)
```

### Health Checks
Add a health check endpoint:

```python
@app.route('/health')
def health_check():
    return {'status': 'healthy', 'timestamp': datetime.utcnow().isoformat()}
```

### Performance Monitoring
- Use tools like New Relic, DataDog, or Sentry
- Monitor API response times
- Track database query performance
- Monitor memory and CPU usage

## 🔄 CI/CD Pipeline

### GitHub Actions Example
```yaml
name: Deploy AI Kitchen Assistant

on:
  push:
    branches: [main]

jobs:
  deploy-frontend:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v2
      - uses: actions/setup-node@v2
        with:
          node-version: '20'
      - run: cd kitchen-frontend && npm install && npm run build
      - uses: peaceiris/actions-gh-pages@v3
        with:
          github_token: ${{ secrets.GITHUB_TOKEN }}
          publish_dir: ./kitchen-frontend/dist

  deploy-backend:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v2
      - # Add your backend deployment steps here
```

## 🌐 Domain & SSL

### Domain Setup
1. Purchase a domain name
2. Configure DNS records:
   - A record: `api.yourdomain.com` → Backend server IP
   - CNAME: `www.yourdomain.com` → Frontend hosting
3. Set up SSL certificates (Let's Encrypt recommended)

### Nginx Configuration
```nginx
server {
    listen 80;
    server_name api.yourdomain.com;
    return 301 https://$server_name$request_uri;
}

server {
    listen 443 ssl;
    server_name api.yourdomain.com;
    
    ssl_certificate /path/to/certificate.crt;
    ssl_certificate_key /path/to/private.key;
    
    location / {
        proxy_pass http://localhost:5001;
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
    }
}
```

## 📱 Mobile Considerations

### Progressive Web App (PWA)
Add PWA capabilities to the React frontend:

1. Install PWA dependencies:
   ```bash
   npm install vite-plugin-pwa
   ```

2. Configure in `vite.config.js`:
   ```javascript
   import { VitePWA } from 'vite-plugin-pwa'
   
   export default defineConfig({
     plugins: [
       react(),
       VitePWA({
         registerType: 'autoUpdate',
         workbox: {
           globPatterns: ['**/*.{js,css,html,ico,png,svg}']
         }
       })
     ]
   })
   ```

## 🔧 Troubleshooting

### Common Issues

1. **CORS Errors**
   - Ensure backend CORS is configured for your frontend domain
   - Check that API URLs are correct

2. **Camera Not Working**
   - Requires HTTPS in production
   - Check browser permissions

3. **Database Connection Issues**
   - Verify database credentials
   - Check network connectivity
   - Ensure database server is running

4. **Build Failures**
   - Clear node_modules and reinstall
   - Check Node.js version compatibility
   - Verify all dependencies are installed

### Performance Optimization

1. **Frontend**
   - Enable gzip compression
   - Use CDN for static assets
   - Implement code splitting
   - Optimize images

2. **Backend**
   - Use database connection pooling
   - Implement caching (Redis)
   - Optimize database queries
   - Use background tasks for heavy operations

## 📞 Support

For deployment issues or questions:
1. Check the troubleshooting section above
2. Review application logs
3. Verify all configuration settings
4. Test API endpoints individually

---

**Note**: This deployment guide covers the essential steps for getting the AI Kitchen Assistant running in production. Adjust configurations based on your specific hosting environment and requirements.

