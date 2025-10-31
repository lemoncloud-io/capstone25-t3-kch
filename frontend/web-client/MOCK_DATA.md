# Mock Data System

## Overview

This frontend application includes a comprehensive mock data system that allows development and testing without a backend server. The mock system simulates all API endpoints with realistic data and delays.

## Quick Start

### Mock Mode (Default)

By default, the application runs in **mock mode** - no backend server required!

```bash
npm run dev
```

The application will use local mock data for all API calls.

### Real API Mode

To connect to the real backend API:

1. Create a `.env.local` file:
```env
VITE_USE_MOCK_DATA=false
VITE_API_BASE_URL=http://localhost:8000
```

2. Start the backend server
3. Start the frontend:
```bash
npm run dev
```

## Currently Mocked Features

### 📝 Blog Posts - ✅ FULLY INTEGRATED (NOT MOCKED)

**Status:** Posts functionality uses **real backend API only** - no mock mode available.

- **Backend API**: FastAPI endpoints at `/api/posts`
- **Database**: PostgreSQL `blog_posts` table
- **Admin Interface**: Full CRUD operations at `/admin/posts`
- **Public Interface**: Published posts at `/blog`
- **Features**: Create, edit, delete, publish/unpublish, view count tracking, category filtering

**Note:** Unlike policies and LLM features, posts always connect to the real backend. The `VITE_USE_MOCK_DATA` environment variable does not affect posts functionality.

---

## Mock Data Features

### 📊 55+ Realistic Korean Youth Policies

Located in `src/shared/api/mock/policies.ts`:

- **Categories**: 취업, 창업, 주거, 교육, 복지
- **Regions**: 서울, 경기, 부산, 대구, 인천, 광주, 대전, 울산, 세종, 강원, 충남, 충북, 전남, 전북, 경남, 경북, 제주, 전국
- **Amount Ranges**: 10만원 ~ 2억원
- **Complete** `blog_json` structures with target conditions and apply methods

### 🤖 Simulated LLM Responses

Located in `src/shared/api/mock/llm.ts`:

- **Title Generation** (500-1000ms delay)
- **Summary Generation** (800-1500ms delay)
- **Blog Content Generation** (1500-2500ms delay)
- **Full Blog Generation** (all three combined)
- **Text Rewrite** (1000-2000ms delay)
  - Supports 3 tones: youthful (청년 친화적), formal (공식적), casual (캐주얼)
  - Contextual content based on policy data

### 🏥 Health Check Mocks

Located in `src/shared/api/health.ts`:

- Backend health check always returns "정상"
- OpenAI ping returns successful connection

## File Structure

```
frontend/web-client/src/
├── shared/
│   ├── config/
│   │   └── env.ts                    # Environment configuration
│   └── api/
│       ├── mock/
│       │   ├── policies.ts           # 55+ mock policies
│       │   └── llm.ts                # LLM response simulation
│       ├── policies.ts               # Policy API (supports mock mode)
│       ├── llm.ts                    # LLM API (supports mock mode)
│       └── health.ts                 # Health API (supports mock mode)
```

## How It Works

### Configuration (`src/shared/config/env.ts`)

```typescript
export const config = {
    USE_MOCK_DATA: import.meta.env.VITE_USE_MOCK_DATA === 'true' ||
                   import.meta.env.VITE_USE_MOCK_DATA === undefined,
    API_BASE_URL: import.meta.env.VITE_API_BASE_URL || 'http://localhost:8000',
}

export const isMockMode = () => config.USE_MOCK_DATA
```

### API Functions

Each API function checks `isMockMode()` and routes to either mock or real implementation:

```typescript
export const getPolicies = async (filters?: PolicyFilters): Promise<Policy[]> => {
    if (isMockMode()) {
        // Use local mock data with filtering
        return filterPolicies(mockPolicies, filters)
    }

    // Real API call
    const { data } = await apiClient.get<Policy[]>('/api/policies', { params: filters })
    return data
}
```

## Testing Features

### Policy Search & Filtering

The mock system implements the same filtering logic as the backend:

- **Text Search**: Searches title and summary (case-insensitive)
- **Region Filter**: Prefix matching (e.g., "서울" matches "서울특별시", "서울특별시 강남구")
- **Category Filter**: Exact match on category or category_auto
- **Pagination**: Supports limit and offset

### LLM Content Generation

Mock LLM functions generate contextual content based on policy data:

```typescript
// Input
{
    region: "서울특별시",
    category: "취업",
    title: "청년 일자리 도전 지원사업"
}

// Output (example)
{
    title: "서울특별시 청년이라면 꼭 알아야 할 취업 정책!",
    summary: "청년 일자리 도전 지원사업은 서울특별시 지역 청년들을 위한 취업 프로그램입니다...",
    blog_content: "## 청년 일자리 도전 지원사업\n\n안녕하세요! 오늘은 서울특별시 청년 여러분께..."
}
```

### Realistic Delays

All mock API calls include realistic network delays:

- Policy list/detail: 200-300ms
- Title generation: 500-1000ms
- Summary generation: 800-1500ms
- Blog content: 1500-2500ms
- Text rewrite: 1000-2000ms

This ensures loading states and spinners work correctly during development.

## Environment Variables

### Available Variables

| Variable | Default | Description |
|----------|---------|-------------|
| `VITE_USE_MOCK_DATA` | `undefined` (=true) | Enable/disable mock mode |
| `VITE_API_BASE_URL` | `http://localhost:8000` | Backend API URL (used when mock mode is off) |

### Configuration Examples

#### Development with Mock Data (Default)
```env
# No .env.local needed - mock mode is default
```

#### Development with Real Backend
```env
# .env.local
VITE_USE_MOCK_DATA=false
VITE_API_BASE_URL=http://localhost:8000
```

#### Production Build
```env
# .env.production
VITE_USE_MOCK_DATA=false
VITE_API_BASE_URL=https://api.yourdomain.com
```

## Adding New Mock Data

### Adding a New Policy

Edit `src/shared/api/mock/policies.ts`:

```typescript
export const mockPolicies: Policy[] = [
    // ... existing policies
    {
        plcy_no: 'R2024999999',
        title: '새로운 청년 지원 정책',
        category: '지원',
        category_auto: '복지',
        region: '서울특별시',
        amount_min: 1000000,
        amount_max: 5000000,
        period_start: '2024-01-01',
        period_end: '2024-12-31',
        provider: '서울시청',
        summary: '청년들을 위한 새로운 지원 정책입니다',
        blog_json: {
            conditions: {
                target: '만 19~34세 서울시 거주 청년',
            },
            summary: '실질적인 지원을 제공합니다',
            apply: {
                method: '온라인 신청',
            },
        },
    },
]
```

### Customizing LLM Responses

Edit `src/shared/api/mock/llm.ts` to modify response templates or add new tone styles.

## Benefits

✅ **No Backend Required** - Frontend developers can work independently
✅ **Fast Development** - No waiting for backend deployment
✅ **Realistic Testing** - Simulated delays and realistic data
✅ **Easy Toggle** - Switch between mock and real API with one environment variable
✅ **Type Safe** - All mock data matches TypeScript interfaces
✅ **Offline Development** - Work without internet connection

## Limitations

⚠️ Mock data is static - changes don't persist between sessions
⚠️ No authentication/authorization in mock mode
⚠️ Limited to 55 pre-defined policies (but easy to add more)

## Troubleshooting

### Mock Mode Not Working

1. Check `.env.local` doesn't have `VITE_USE_MOCK_DATA=false`
2. Clear browser cache
3. Restart dev server

### Want to Force Mock Mode

```bash
# Terminal
VITE_USE_MOCK_DATA=true npm run dev
```

Or create `.env.local`:
```env
VITE_USE_MOCK_DATA=true
```

### TypeScript Errors

If you see type errors after adding mock data, ensure the data matches the `Policy` interface in `src/shared/api/types.ts`.

## Development Workflow

### Recommended Setup

1. **Frontend Development**: Use mock mode (default)
2. **Integration Testing**: Switch to real backend
3. **Production**: Always use real backend

### With Backend Team

1. Frontend team works with mock data
2. Backend team provides API contracts (types)
3. Integration happens when backend is ready
4. Mock data helps catch integration issues early

## Future Enhancements

- [ ] Persist mock data changes in localStorage
- [ ] Mock authentication system
- [ ] More diverse policy categories
- [ ] Dynamic mock data generation
- [ ] Mock API error scenarios for error handling testing

---

**Happy Coding! 🚀**

For questions or issues, check the main README.md or contact the development team.
