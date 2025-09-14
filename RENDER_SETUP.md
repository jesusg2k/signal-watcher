# 🚀 Configuración Manual de Render

## Configurar Backend en Render

1. **Ve a [render.com](https://render.com) → New → Web Service**

2. **Conecta tu repositorio GitHub**

3. **Configuración del servicio:**
   ```
   Name: signal-watcher-backend
   Root Directory: backend
   Environment: Node
   Build Command: npm install && npx prisma generate && npm run build
   Start Command: npm start
   ```

4. **Variables de entorno:**
   ```
   NODE_ENV=production
   PORT=3001
   DATABASE_URL=[tu_postgres_url_aqui]
   FRONTEND_URL=https://tu-frontend.netlify.app
   ```

5. **Añadir PostgreSQL:**
   - New → PostgreSQL
   - Name: signal-watcher-db
   - Copia la DATABASE_URL al web service

## ✅ Configuración Correcta

- ✅ **Root Directory**: `backend` (IMPORTANTE)
- ✅ **Build Command**: `npm install && npx prisma generate && npm run build`
- ✅ **Start Command**: `npm start`
- ✅ **Health Check Path**: `/health`

## 🔧 Si sigue fallando:

Usa estos comandos alternativos:

**Build Command:**
```bash
cd backend && npm install && npx prisma generate && npm run build
```

**Start Command:**
```bash
cd backend && npm start
```