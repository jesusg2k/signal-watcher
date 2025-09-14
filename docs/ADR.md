# Architecture Decision Records (ADR)

## ADR-001: Technology Stack Selection

**Date**: 2024-01-15
**Status**: Accepted

### Context
Need to select appropriate technologies for a full-stack AI-powered signal monitoring system.

### Decision
- **Backend**: Node.js + TypeScript + Express
- **Database**: PostgreSQL + Prisma ORM
- **Cache**: Redis
- **Frontend**: Next.js 14 (App Router) + TypeScript
- **Styling**: Tailwind CSS + Radix UI
- **AI**: OpenAI API with mock fallback
- **Deployment**: Vercel (frontend) + Railway/Render (backend)

### Rationale
- **TypeScript**: Type safety across the stack
- **Prisma**: Type-safe database access with excellent DX
- **Next.js App Router**: Modern React patterns with SSR capabilities
- **Redis**: Fast caching for AI results and session data
- **OpenAI**: Industry-standard AI API with good documentation
- **Vercel**: Excellent Next.js integration and deployment experience

### Consequences
- Consistent TypeScript experience
- Strong type safety reduces runtime errors
- Modern tooling improves developer experience
- Scalable architecture for future growth

---

## ADR-002: AI Integration Strategy

**Date**: 2024-01-15
**Status**: Accepted

### Context
Need to integrate AI for event analysis while ensuring system reliability and cost control.

### Decision
Implement dual-mode AI service:
1. **Production Mode**: OpenAI GPT-3.5-turbo API
2. **Mock Mode**: Deterministic mock responses for development/testing

### Rationale
- **Reliability**: System works without external AI dependency
- **Cost Control**: Avoid API costs during development
- **Testing**: Predictable responses for automated testing
- **Flexibility**: Easy to switch AI providers in the future

### Consequences
- Increased complexity in AI service implementation
- Better testability and development experience
- Reduced external dependencies for core functionality

---

## ADR-003: Database Schema Design

**Date**: 2024-01-15
**Status**: Accepted

### Context
Need to design database schema for watch lists and events with AI analysis results.

### Decision
```sql
WatchList {
  id: String (CUID)
  name: String
  description: String?
  terms: String[] (Array)
  events: Event[]
}

Event {
  id: String (CUID)
  watchListId: String
  rawData: Json
  summary: String? (AI-generated)
  severity: Enum? (AI-classified)
  suggestedAction: String? (AI-suggested)
  processed: Boolean
  correlationId: String (for tracing)
}
```

### Rationale
- **CUID**: Better than UUID for database performance
- **JSON Storage**: Flexible event data structure
- **Separate AI Fields**: Clear separation of raw vs processed data
- **Correlation ID**: Essential for distributed system tracing
- **Array Terms**: Simple storage for watch terms

### Consequences
- Flexible event data structure
- Clear audit trail of AI processing
- Good performance with proper indexing
- Easy to extend with additional AI analysis fields

---

## ADR-004: Caching Strategy

**Date**: 2024-01-15
**Status**: Accepted

### Context
AI API calls are expensive and slow. Need caching strategy to improve performance and reduce costs.

### Decision
Implement Redis caching for:
- AI analysis results (1 hour TTL)
- Frequently accessed watch lists (5 minutes TTL)
- Recent events (10 minutes TTL)

Cache key strategy:
```
ai_analysis:{hash(eventData + terms)}
watch_list:{id}
events:{watchListId}:{page}
```

### Rationale
- **Performance**: Reduce AI API latency from seconds to milliseconds
- **Cost**: Avoid duplicate AI API calls for similar events
- **Reliability**: Reduce dependency on external services
- **Scalability**: Handle higher request volumes

### Consequences
- Additional Redis infrastructure requirement
- Cache invalidation complexity
- Improved user experience
- Reduced operational costs

---

## ADR-005: Error Handling and Observability

**Date**: 2024-01-15
**Status**: Accepted

### Context
Need comprehensive error handling and observability for production operations.

### Decision
Implement structured logging and error handling:
- **Winston** for structured JSON logging
- **Correlation IDs** for request tracing
- **Centralized error handler** middleware
- **Health check endpoints**
- **Graceful degradation** for AI failures

### Rationale
- **Debugging**: Correlation IDs enable tracing across services
- **Monitoring**: Structured logs integrate with log aggregation tools
- **Reliability**: Graceful degradation maintains core functionality
- **Operations**: Health checks enable automated monitoring

### Consequences
- Better production debugging capabilities
- Easier integration with monitoring tools
- Improved system reliability
- Additional logging overhead

---

## ADR-006: Frontend State Management

**Date**: 2024-01-15
**Status**: Accepted

### Context
Need to manage client-side state for watch lists, events, and UI interactions.

### Decision
Use React's built-in state management:
- **useState** for component state
- **Server Actions** for data mutations
- **API client** for data fetching
- **No external state library** (Redux, Zustand, etc.)

### Rationale
- **Simplicity**: Avoid additional complexity for current requirements
- **Next.js Integration**: Server Actions provide excellent UX
- **Performance**: Minimal bundle size impact
- **Maintainability**: Fewer dependencies to manage

### Consequences
- Simpler codebase and fewer dependencies
- May need refactoring if state complexity grows
- Excellent integration with Next.js patterns
- Faster development iteration

---

## ADR-007: Security Implementation

**Date**: 2024-01-15
**Status**: Accepted

### Context
Need to implement security best practices for web application.

### Decision
Implement security layers:
- **Input Validation**: Zod schemas for all API inputs
- **Rate Limiting**: Express rate limiter (100 req/15min per IP)
- **CORS**: Restrict to frontend domain
- **Helmet**: Security headers
- **Environment Variables**: All secrets in env vars
- **SQL Injection Protection**: Prisma ORM parameterized queries

### Rationale
- **Defense in Depth**: Multiple security layers
- **Industry Standards**: Well-established security practices
- **Compliance**: Meets basic security requirements
- **Maintainability**: Security built into architecture

### Consequences
- Improved security posture
- Compliance with security best practices
- Additional development overhead
- Better protection against common attacks