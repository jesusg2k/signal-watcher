# Signal Watcher Runbook

## 🚨 Emergency Procedures

### System Down
1. Check health endpoints: `/health`
2. Verify database connectivity
3. Check Redis connection
4. Review error logs for correlation IDs
5. Restart services if needed

### High Error Rate
1. Check application logs for error patterns
2. Verify external service status (OpenAI API)
3. Check database connection pool
4. Monitor Redis memory usage
5. Scale services if needed

## 📊 Monitoring & Alerts

### Key Metrics to Monitor
- **API Response Time**: < 2s for 95th percentile
- **Error Rate**: < 1% of requests
- **Database Connections**: < 80% of pool
- **Redis Memory**: < 80% of available
- **AI Processing Time**: < 30s for 95th percentile

### Health Check Endpoints
```bash
# Backend health
curl http://localhost:3001/health

# Expected response
{
  "status": "ok",
  "timestamp": "2024-01-15T10:00:00.000Z",
  "correlationId": "abc123..."
}
```

### Log Analysis
```bash
# Find errors by correlation ID
grep "correlationId.*abc123" logs/combined.log

# Monitor error patterns
tail -f logs/error.log | jq '.message'

# Check AI processing failures
grep "AI processing failed" logs/combined.log
```

## 🔧 Common Operations

### Database Operations

#### Check Database Status
```bash
# Connect to database
psql $DATABASE_URL

# Check active connections
SELECT count(*) FROM pg_stat_activity;

# Check table sizes
SELECT schemaname,tablename,pg_size_pretty(size) as size
FROM (
  SELECT schemaname,tablename,pg_total_relation_size(schemaname||'.'||tablename) as size
  FROM pg_tables WHERE schemaname NOT IN ('information_schema','pg_catalog')
) t ORDER BY size DESC;
```

#### Database Migrations
```bash
cd backend

# Check migration status
npx prisma migrate status

# Apply pending migrations
npx prisma migrate deploy

# Reset database (development only)
npx prisma migrate reset
```

### Cache Operations

#### Redis Management
```bash
# Connect to Redis
redis-cli -u $REDIS_URL

# Check memory usage
INFO memory

# Check key patterns
KEYS ai_analysis:*
KEYS watch_list:*

# Clear cache (if needed)
FLUSHDB
```

#### Cache Monitoring
```bash
# Monitor cache hit rates
redis-cli -u $REDIS_URL --latency-history

# Check cache size
redis-cli -u $REDIS_URL INFO keyspace
```

### Application Scaling

#### Horizontal Scaling
```bash
# Scale backend instances (Railway example)
railway scale --replicas 3

# Scale with Docker
docker-compose up --scale backend=3
```

#### Vertical Scaling
```bash
# Update resource limits
railway variables set RAILWAY_MEMORY_LIMIT=2048

# Update Docker resources
docker update --memory=2g --cpus=2 container_name
```

## 🐛 Troubleshooting

### Common Issues

#### "Database connection failed"
1. Check `DATABASE_URL` environment variable
2. Verify database server is running
3. Check network connectivity
4. Verify credentials and permissions

```bash
# Test database connection
psql $DATABASE_URL -c "SELECT 1;"
```

#### "Redis connection failed"
1. Check `REDIS_URL` environment variable
2. Verify Redis server is running
3. Check network connectivity
4. Monitor Redis memory usage

```bash
# Test Redis connection
redis-cli -u $REDIS_URL ping
```

#### "AI processing timeout"
1. Check OpenAI API status
2. Verify `OPENAI_API_KEY` is valid
3. Monitor API rate limits
4. Check network connectivity to OpenAI

```bash
# Test OpenAI API
curl -H "Authorization: Bearer $OPENAI_API_KEY" \
     https://api.openai.com/v1/models
```

#### "High memory usage"
1. Check for memory leaks in logs
2. Monitor Redis memory usage
3. Review database connection pooling
4. Check for large JSON payloads

### Performance Issues

#### Slow API Responses
1. Check database query performance
2. Monitor Redis cache hit rates
3. Review AI processing times
4. Check network latency

```bash
# Monitor API response times
curl -w "@curl-format.txt" -o /dev/null -s http://localhost:3001/api/watch-lists

# curl-format.txt content:
#     time_namelookup:  %{time_namelookup}\n
#     time_connect:     %{time_connect}\n
#     time_appconnect:  %{time_appconnect}\n
#     time_pretransfer: %{time_pretransfer}\n
#     time_redirect:    %{time_redirect}\n
#     time_starttransfer: %{time_starttransfer}\n
#     ----------\n
#     time_total:       %{time_total}\n
```

#### High CPU Usage
1. Check for inefficient database queries
2. Monitor AI processing load
3. Review application logs for errors
4. Check for infinite loops or memory leaks

## 🔄 Deployment Procedures

### Frontend Deployment (Vercel)
```bash
# Manual deployment
vercel --prod

# Check deployment status
vercel ls

# View deployment logs
vercel logs <deployment-url>
```

### Backend Deployment (Railway)
```bash
# Deploy from CLI
railway up

# Check deployment status
railway status

# View logs
railway logs
```

### Database Migrations in Production
```bash
# 1. Backup database
pg_dump $DATABASE_URL > backup_$(date +%Y%m%d_%H%M%S).sql

# 2. Apply migrations
cd backend
npx prisma migrate deploy

# 3. Verify migration
npx prisma migrate status
```

## 📈 Capacity Planning

### Database Growth
- **Events**: ~1KB per event
- **Watch Lists**: ~500B per list
- **Expected Growth**: 1000 events/day = ~365MB/year

### Redis Memory
- **AI Cache**: ~2KB per cached result
- **Expected Usage**: ~100MB for 50K cached results

### API Rate Limits
- **OpenAI**: 3 RPM (requests per minute) on free tier
- **Internal APIs**: 100 requests per 15 minutes per IP

## 🔐 Security Operations

### API Key Rotation
```bash
# 1. Generate new OpenAI API key
# 2. Update environment variable
railway variables set OPENAI_API_KEY=new_key

# 3. Restart application
railway restart

# 4. Verify functionality
curl http://your-api/health
```

### Security Monitoring
```bash
# Monitor failed authentication attempts
grep "401\|403" logs/combined.log

# Check for suspicious patterns
grep -i "injection\|xss\|script" logs/combined.log

# Monitor rate limiting
grep "rate limit" logs/combined.log
```

## 📞 Escalation Procedures

### Level 1: Application Issues
- Check logs and metrics
- Restart services
- Clear cache if needed
- Contact: Development Team

### Level 2: Infrastructure Issues
- Database connectivity problems
- Redis cluster issues
- Network connectivity
- Contact: DevOps Team

### Level 3: Critical System Failure
- Complete system outage
- Data corruption
- Security incidents
- Contact: Engineering Manager + Security Team

## 📋 Maintenance Tasks

### Daily
- [ ] Check error logs
- [ ] Monitor system metrics
- [ ] Verify backup completion

### Weekly
- [ ] Review performance trends
- [ ] Check disk space usage
- [ ] Update dependencies (security patches)

### Monthly
- [ ] Database maintenance (VACUUM, ANALYZE)
- [ ] Log rotation and cleanup
- [ ] Security audit
- [ ] Capacity planning review

## 📚 Useful Commands

### Log Analysis
```bash
# Real-time error monitoring
tail -f logs/error.log | jq '.'

# Find specific correlation ID
grep -r "correlation-id-here" logs/

# Count errors by type
grep "error" logs/combined.log | jq -r '.message' | sort | uniq -c
```

### Performance Testing
```bash
# Load test API endpoints
ab -n 1000 -c 10 http://localhost:3001/api/watch-lists

# Monitor during load test
watch -n 1 'ps aux | grep node'
```

### Database Queries
```sql
-- Find slow queries
SELECT query, mean_time, calls 
FROM pg_stat_statements 
ORDER BY mean_time DESC 
LIMIT 10;

-- Check table bloat
SELECT schemaname, tablename, 
       pg_size_pretty(pg_total_relation_size(schemaname||'.'||tablename)) as size
FROM pg_tables 
WHERE schemaname = 'public' 
ORDER BY pg_total_relation_size(schemaname||'.'||tablename) DESC;
```