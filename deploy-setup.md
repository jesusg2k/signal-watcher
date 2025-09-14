# 🚀 Guía de Despliegue Automático

## Paso 1: Subir a GitHub

```bash
# Si no tienes repositorio remoto
git remote add origin https://github.com/TU_USUARIO/signal-watcher.git
git branch -M main
git push -u origin main
```

## Paso 2: Configurar Render (Backend)

1. Ve a [render.com](https://render.com) y crea cuenta gratuita
2. Click "New +" → "Web Service"
3. Conecta tu repositorio GitHub
4. Configuración:
   - **Name**: `signal-watcher-backend`
   - **Root Directory**: `backend`
   - **Environment**: `Node`
   - **Build Command**: `npm install && npx prisma generate && npm run build`
   - **Start Command**: `npm start`
   - **Instance Type**: `Free`

5. Variables de entorno en Render:
   ```
   NODE_ENV=production
   PORT=3001
   FRONTEND_URL=https://signal-watcher-frontend.netlify.app
   ```

6. Añadir PostgreSQL:
   - En el dashboard, click "New +" → "PostgreSQL"
   - Name: `signal-watcher-db`
   - Copia la `DATABASE_URL` y añádela a las variables del web service

## Paso 3: Configurar Netlify (Frontend)

1. Ve a [netlify.com](https://netlify.com) y crea cuenta gratuita
2. Click "Add new site" → "Import an existing project"
3. Conecta GitHub y selecciona tu repositorio
4. Configuración:
   - **Base directory**: `frontend`
   - **Build command**: `npm run build`
   - **Publish directory**: `frontend/.next`

5. Variables de entorno en Netlify:
   ```
   BACKEND_URL=https://signal-watcher-backend.onrender.com
   ```

## Paso 4: Configurar Secrets de GitHub

Ve a tu repositorio → Settings → Secrets and variables → Actions

Añade estos secrets:

### Para Netlify:
```
NETLIFY_AUTH_TOKEN=tu_token_de_netlify
NETLIFY_SITE_ID=tu_site_id_de_netlify
```

### Para Render:
```
RENDER_API_KEY=tu_api_key_de_render
RENDER_SERVICE_ID=tu_service_id_de_render
```

## Paso 5: ¡Despliegue Automático!

Cada push a `main` activará:
1. ✅ Tests automáticos
2. ✅ Build y deploy del frontend a Netlify
3. ✅ Build y deploy del backend a Render
4. ✅ Migraciones de base de datos automáticas

## URLs Finales:
- **Frontend**: https://signal-watcher-frontend.netlify.app
- **Backend**: https://signal-watcher-backend.onrender.com
- **API Health**: https://signal-watcher-backend.onrender.com/health

## Comandos Útiles:

```bash
# Trigger deploy manual
git commit --allow-empty -m "trigger deploy"
git push origin main

# Ver logs de deploy
# Ve a los dashboards de Netlify y Render
```

## Costos:
- ✅ **Netlify**: Gratis (100GB bandwidth/mes)
- ✅ **Render**: Gratis (750 horas/mes)
- ✅ **PostgreSQL**: Gratis (1GB storage)
- ✅ **GitHub Actions**: Gratis (2000 minutos/mes)

**Total: $0/mes** 🎉