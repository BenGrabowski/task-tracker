# Design Document

## Overview

The Household Task Tracker is a Next.js 16 web application built with the App Router architecture, utilizing Server Components for optimal performance and Client Components only when necessary for interactive features. The system provides collaborative task management within household workspaces, featuring PostgreSQL with Drizzle ORM for type-safe database operations, Better Auth for authentication, and shadcn/ui components for a consistent user interface.

## Architecture

### Application Structure
- **Frontend**: Next.js 16 App Router with React Server Components
- **Database**: PostgreSQL (Neon) with Drizzle ORM
- **Authentication**: Better Auth with email/password
- **UI Framework**: shadcn/ui with Tailwind CSS
- **Forms**: React Hook Form with Zod validation
- **Communication**: Next.js Server Actions (no REST/GraphQL APIs)

### Component Architecture
```
app/
├── (auth)/
│   ├── login/
│   │   ├── layout.tsx
│   │   └── page.tsx
│   └── register/
│       ├── layout.tsx
│       └── page.tsx
├── dashboard/
│   ├── layout.tsx
│   ├── page.tsx (Server Component - Task List)
│   └── today/
│       └── page.tsx (Server Component - Today/Overdue)
├── globals.css
└── layout.tsx (Root Layout)

features/
├── auth/
│   ├── components/
│   │   ├── login-form.tsx
│   │   └── register-form.tsx
│   ├── actions/
│   │   └── auth-actions.ts
│   ├── schemas/
│   │   └── auth-schemas.ts
│   └── lib/
│       └── auth-config.ts
├── tasks/
│   ├── components/
│   │   ├── task-form.tsx (Client Component)
│   │   ├── task-list.tsx (Server Component)
│   │   ├── task-item.tsx
│   │   └── task-filters.tsx (Client Component)
│   ├── actions/
│   │   └── task-actions.ts
│   ├── schemas/
│   │   └── task-schemas.ts
│   └── lib/
│       └── task-utils.ts
├── categories/
│   ├── components/
│   │   ├── category-form.tsx
│   │   └── category-list.tsx
│   ├── actions/
│   │   └── category-actions.ts
│   └── schemas/
│       └── category-schemas.ts
├── households/
│   ├── components/
│   │   ├── household-form.tsx
│   │   └── household-selector.tsx
│   ├── actions/
│   │   └── household-actions.ts
│   └── schemas/
│       └── household-schemas.ts
└── notifications/
    ├── components/
    │   └── notification-center.tsx
    ├── actions/
    │   └── notification-actions.ts
    └── lib/
        └── notification-utils.ts

lib/
├── db/
│   ├── schema.ts (All database schemas)
│   ├── migrations/
│   └── connection.ts
└── utils/
    ├── validation.ts
    └── date-utils.ts

components/ui/ (shadcn/ui components)
```

## Components and Interfaces

### Core Data Models

#### User Model
```typescript
interface User {
  id: string;
  email: string;
  name: string;
  householdId: string;
  createdAt: Date;
}
```

#### Household Model
```typescript
interface Household {
  id: string;
  name: string;
  createdAt: Date;
}
```

#### Task Model
```typescript
interface Task {
  id: string;
  title: string;
  description: string | null;
  status: 'todo' | 'in_progress' | 'done';
  priority: 'low' | 'medium' | 'high';
  dueDate: Date | null;
  completedAt: Date | null;
  assigneeId: string | null;
  categoryId: string | null;
  blockedByTaskId: string | null;
  householdId: string;
  createdAt: Date;
  updatedAt: Date;
}
```

#### Category Model
```typescript
interface Category {
  id: string;
  name: string;
  color: string;
  householdId: string;
  createdAt: Date;
}
```

### Database Schema (Drizzle ORM)

```typescript
// lib/db/schema.ts
export const households = pgTable('households', {
  id: uuid('id').defaultRandom().primaryKey(),
  name: text('name').notNull(),
  createdAt: timestamp('created_at').notNull().defaultNow(),
});

export const users = pgTable('users', {
  id: uuid('id').defaultRandom().primaryKey(),
  email: text('email').notNull().unique(),
  name: text('name').notNull(),
  householdId: uuid('household_id').references(() => households.id),
  createdAt: timestamp('created_at').notNull().defaultNow(),
});

export const categories = pgTable('categories', {
  id: uuid('id').defaultRandom().primaryKey(),
  name: text('name').notNull(),
  color: text('color').notNull().default('#6b7280'),
  householdId: uuid('household_id').notNull().references(() => households.id),
  createdAt: timestamp('created_at').notNull().defaultNow(),
});

export const tasks = pgTable('tasks', {
  id: uuid('id').defaultRandom().primaryKey(),
  title: text('title').notNull(),
  description: text('description'),
  status: text('status', { enum: ['todo', 'in_progress', 'done'] }).notNull().default('todo'),
  priority: text('priority', { enum: ['low', 'medium', 'high'] }).notNull().default('medium'),
  dueDate: timestamp('due_date'),
  completedAt: timestamp('completed_at'),
  assigneeId: uuid('assignee_id').references(() => users.id),
  categoryId: uuid('category_id').references(() => categories.id),
  blockedByTaskId: uuid('blocked_by_task_id').references(() => tasks.id),
  householdId: uuid('household_id').notNull().references(() => households.id),
  createdAt: timestamp('created_at').notNull().defaultNow(),
  updatedAt: timestamp('updated_at').notNull().defaultNow(),
});
```

### Server Actions Interface

```typescript
// features/tasks/actions/task-actions.ts
export async function createTask(data: CreateTaskInput): Promise<ActionResult<Task>>;
export async function updateTask(id: string, data: UpdateTaskInput): Promise<ActionResult<Task>>;
export async function deleteTask(id: string): Promise<ActionResult<void>>;
export async function getHouseholdTasks(householdId: string): Promise<Task[]>;
export async function getTodayTasks(householdId: string): Promise<Task[]>;
export async function searchTasks(householdId: string, query: string): Promise<Task[]>;

// features/categories/actions/category-actions.ts
export async function createCategory(data: CreateCategoryInput): Promise<ActionResult<Category>>;
export async function getHouseholdCategories(householdId: string): Promise<Category[]>;

// features/auth/actions/auth-actions.ts
export async function signIn(credentials: SignInInput): Promise<ActionResult<User>>;
export async function signUp(data: SignUpInput): Promise<ActionResult<User>>;
export async function signOut(): Promise<ActionResult<void>>;

// features/households/actions/household-actions.ts
export async function createHousehold(data: CreateHouseholdInput): Promise<ActionResult<Household>>;
export async function joinHousehold(inviteCode: string): Promise<ActionResult<void>>;
```

## Data Models

### Validation Schemas (Zod)

```typescript
// features/tasks/schemas/task-schemas.ts
export const createTaskSchema = z.object({
  title: z.string().min(1, 'Title is required').max(200),
  description: z.string().max(1000).optional(),
  priority: z.enum(['low', 'medium', 'high']),
  dueDate: z.date().optional(),
  assigneeId: z.string().uuid().optional(),
  categoryId: z.string().uuid().optional(),
  blockedByTaskId: z.string().uuid().optional(),
});

export const updateTaskSchema = createTaskSchema.partial().extend({
  status: z.enum(['todo', 'in_progress', 'done']).optional(),
});

export const taskFilterSchema = z.object({
  status: z.enum(['todo', 'in_progress', 'done']).optional(),
  assigneeId: z.string().uuid().optional(),
  categoryId: z.string().uuid().optional(),
  search: z.string().optional(),
});

// features/auth/schemas/auth-schemas.ts
export const signInSchema = z.object({
  email: z.string().email('Invalid email address'),
  password: z.string().min(8, 'Password must be at least 8 characters'),
});

export const signUpSchema = signInSchema.extend({
  name: z.string().min(2, 'Name must be at least 2 characters'),
  confirmPassword: z.string(),
}).refine((data) => data.password === data.confirmPassword, {
  message: "Passwords don't match",
  path: ["confirmPassword"],
});

// features/categories/schemas/category-schemas.ts
export const createCategorySchema = z.object({
  name: z.string().min(1, 'Category name is required').max(50),
  color: z.string().regex(/^#[0-9A-F]{6}$/i, 'Invalid color format'),
});
```

### Database Relations

```typescript
export const householdsRelations = relations(households, ({ many }) => ({
  users: many(users),
  tasks: many(tasks),
  categories: many(categories),
}));

export const usersRelations = relations(users, ({ one, many }) => ({
  household: one(households, {
    fields: [users.householdId],
    references: [households.id],
  }),
  assignedTasks: many(tasks),
}));

export const tasksRelations = relations(tasks, ({ one }) => ({
  household: one(households, {
    fields: [tasks.householdId],
    references: [households.id],
  }),
  assignee: one(users, {
    fields: [tasks.assigneeId],
    references: [users.id],
  }),
  category: one(categories, {
    fields: [tasks.categoryId],
    references: [categories.id],
  }),
  blockedBy: one(tasks, {
    fields: [tasks.blockedByTaskId],
    references: [tasks.id],
  }),
}));
```

## Correctness Properties

*A property is a characteristic or behavior that should hold true across all valid executions of a system-essentially, a formal statement about what the system should do. Properties serve as the bridge between human-readable specifications and machine-verifiable correctness guarantees.*

### Property Reflection

After analyzing all acceptance criteria, several properties can be consolidated to eliminate redundancy:

- Properties 5.3 and 5.4 (search and filtering) can be combined into a comprehensive query property
- Properties 6.1, 6.2, and 6.3 (notifications) can be unified into a single notification generation property
- Properties 2.1 and 2.3 (assignment and display) can be combined since display verification includes assignment verification

### Core Properties

**Property 1: Task creation persistence**
*For any* valid task data, creating a task should result in all provided fields being stored and retrievable from the database
**Validates: Requirements 1.1**

**Property 2: Task update preservation**
*For any* existing task with a completion timestamp, updating the task should preserve the completion timestamp while updating other specified fields
**Validates: Requirements 1.2**

**Property 3: Task deletion cascade**
*For any* task that blocks other tasks, deleting the blocking task should clear the dependency reference from all dependent tasks
**Validates: Requirements 1.3**

**Property 4: Completion timestamp recording**
*For any* task marked as done, the system should record a completion timestamp at the time of status change
**Validates: Requirements 1.4**

**Property 5: Status transition validation**
*For any* task status change, only valid transitions should be allowed (todo→in_progress→done, with ability to move backwards)
**Validates: Requirements 1.5**

**Property 6: Assignment within household**
*For any* task assignment, the assignee must belong to the same household as the task, and unassigned tasks should remain valid
**Validates: Requirements 2.1, 2.2, 2.4**

**Property 7: Assignment display completeness**
*For any* task list view, all tasks should display their assignment information (assignee name or unassigned status)
**Validates: Requirements 2.3**

**Property 8: Category household scoping**
*For any* category created in a household, it should be accessible to all users in that household and only that household
**Validates: Requirements 3.1**

**Property 9: Single category association**
*For any* task, it should be associated with at most one category at any time
**Validates: Requirements 3.2**

**Property 10: Category filtering accuracy**
*For any* category filter applied, only tasks belonging to that category should be returned
**Validates: Requirements 3.3**

**Property 11: Category deletion cleanup**
*For any* deleted category, all tasks previously associated with that category should have their category association cleared
**Validates: Requirements 3.4**

**Property 12: Dependency blocking enforcement**
*For any* task that is blocked by another task, it cannot be marked as done until the blocking task is completed
**Validates: Requirements 4.1**

**Property 13: Dependency release on completion**
*For any* blocking task that is completed, all tasks that were blocked by it should become eligible for completion
**Validates: Requirements 4.2**

**Property 14: Blocked task visual indication**
*For any* task that is blocked, the display should include visual indicators of the blocked status
**Validates: Requirements 4.3**

**Property 15: Circular dependency prevention**
*For any* attempted dependency creation, the system should reject it if it would create a circular dependency chain
**Validates: Requirements 4.4**

**Property 16: Today view date filtering**
*For any* date, the today view should return only tasks that are due today or overdue (due date <= current date)
**Validates: Requirements 5.2**

**Property 17: Search and filter accuracy**
*For any* search query or filter combination, only tasks matching all specified criteria should be returned
**Validates: Requirements 5.3, 5.4**

**Property 18: Notification generation rules**
*For any* task with a due date, notifications should be generated only for assigned users, persist while overdue, and not be generated for unassigned tasks
**Validates: Requirements 6.1, 6.2, 6.3**

**Property 19: User registration completeness**
*For any* valid registration data, a new authenticated user account should be created with all provided information
**Validates: Requirements 7.1**

**Property 20: Authentication access control**
*For any* successfully authenticated user, they should have access only to their household's tasks and data
**Validates: Requirements 7.2**

**Property 21: Household permission equality**
*For any* user joining a household, they should receive equal permissions to view and modify all household tasks
**Validates: Requirements 7.4**

**Property 22: Data persistence immediacy**
*For any* data modification operation, the changes should be immediately available in subsequent database queries
**Validates: Requirements 8.1**

**Property 23: Error handling appropriateness**
*For any* database operation failure or validation error, appropriate error messages should be returned to users
**Validates: Requirements 8.3, 8.4**

## Error Handling

### Database Error Handling
- Connection failures: Retry logic with exponential backoff
- Constraint violations: User-friendly error messages
- Transaction failures: Automatic rollback with error reporting
- Migration failures: Detailed logging and rollback procedures

### Validation Error Handling
- Client-side validation: Real-time feedback using React Hook Form
- Server-side validation: Zod schema validation with detailed error messages
- Type safety: TypeScript compilation errors prevent runtime type issues
- Input sanitization: Automatic escaping and validation of user inputs

### Authentication Error Handling
- Invalid credentials: Clear error messages without revealing user existence
- Session expiration: Automatic redirect to login with return URL
- Authorization failures: 403 responses with appropriate messaging
- Rate limiting: Temporary lockouts for repeated failed attempts

### Application Error Handling
- Unhandled exceptions: Error boundaries with fallback UI
- Network failures: Retry mechanisms and offline indicators
- Server Action failures: Toast notifications with retry options
- Form submission errors: Field-level error display

## Testing Strategy

### Dual Testing Approach
The application will use both unit testing and property-based testing for comprehensive coverage:

- **Unit tests** verify specific examples, edge cases, and error conditions
- **Property tests** verify universal properties that should hold across all inputs
- Together they provide comprehensive coverage: unit tests catch concrete bugs, property tests verify general correctness

### Property-Based Testing
- **Framework**: fast-check for TypeScript/JavaScript property-based testing
- **Configuration**: Minimum 100 iterations per property test to ensure thorough random testing
- **Tagging**: Each property-based test tagged with format: `**Feature: household-task-tracker, Property {number}: {property_text}**`
- **Implementation**: Each correctness property implemented by a single property-based test
- **Coverage**: All 23 correctness properties will have corresponding property-based tests

### Unit Testing
- **Framework**: Vitest for fast unit testing with TypeScript support
- **Coverage**: Specific examples, integration points, and edge cases
- **Focus**: Concrete scenarios that demonstrate correct behavior
- **Complementary**: Works alongside property tests to catch different types of bugs

### Testing Requirements
- Property-based tests run with minimum 100 iterations for statistical confidence
- Each property test explicitly references its corresponding design document property
- Unit tests focus on specific scenarios and integration points
- Both test types are required for comprehensive validation
- Tests validate real functionality without mocks where possible

### Test Organization
```
__tests__/
├── unit/
│   ├── features/
│   │   ├── tasks/
│   │   ├── auth/
│   │   ├── categories/
│   │   └── households/
│   └── lib/
└── properties/
    ├── task-properties.test.ts
    ├── user-properties.test.ts
    ├── category-properties.test.ts
    └── dependency-properties.test.ts
```