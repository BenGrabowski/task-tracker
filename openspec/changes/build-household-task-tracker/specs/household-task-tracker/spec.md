## ADDED Requirements

### Requirement: Create and manage tasks
The system SHALL allow household members to create, edit, delete, and complete tasks.

#### Scenario: Create a task
- **WHEN** a user creates a new task
- **THEN** the system stores the task with title, description, priority, due date, and category

#### Scenario: Edit a task
- **WHEN** a user edits an existing task
- **THEN** the system updates the task information
- **AND** preserves the completion timestamp if present

#### Scenario: Delete a task
- **WHEN** a user deletes a task
- **THEN** the system removes the task
- **AND** removes any dependencies referencing it

#### Scenario: Mark a task done
- **WHEN** a task is marked as done
- **THEN** the system records a completion timestamp

#### Scenario: Validate status transitions
- **WHEN** a task status changes
- **THEN** the system validates the status transition is allowed

### Requirement: Assign tasks to household members
The system SHALL allow tasks to be assigned to household members.

#### Scenario: Assign a task
- **WHEN** a user assigns a task to a household member
- **THEN** the system associates the task with that user

#### Scenario: Create an unassigned task
- **WHEN** a user creates a task without assignment
- **THEN** the task remains unassigned

#### Scenario: Display assignment
- **WHEN** a user views tasks
- **THEN** the system displays assignment information for each task

#### Scenario: Enforce household-only assignment
- **WHEN** a task is assigned
- **THEN** the system only allows assignment to users within the same household

### Requirement: Organize tasks using categories
The system SHALL allow household members to create categories and associate a category to tasks.

#### Scenario: Create a category
- **WHEN** a user creates a category
- **THEN** the system makes it available to all household members

#### Scenario: Associate a category to a task
- **WHEN** a user assigns a category to a task
- **THEN** the system associates exactly one category with that task

#### Scenario: Filter by category
- **WHEN** a user filters by category
- **THEN** the system displays only tasks belonging to that category

#### Scenario: Delete a category
- **WHEN** a category is deleted
- **THEN** the system removes the category association from all tasks

### Requirement: Set task dependencies
The system SHALL allow household members to create dependencies such that one task blocks another.

#### Scenario: Block completion when dependency exists
- **WHEN** a user creates a dependency between tasks
- **THEN** the system prevents the dependent task from being marked as done

#### Scenario: Unblock after blocker completion
- **WHEN** a blocking task is completed
- **THEN** the system allows the dependent task to be marked as done

#### Scenario: Indicate blocked tasks
- **WHEN** a user views a blocked task
- **THEN** the system visually indicates the task is blocked

#### Scenario: Prevent circular dependencies
- **WHEN** a user attempts to create circular dependencies
- **THEN** the system prevents the creation

### Requirement: View tasks in different ways
The system SHALL allow household members to view and find tasks via list views, search, and filters.

#### Scenario: Default list view
- **WHEN** a user accesses the default view
- **THEN** the system displays all household tasks in a list format

#### Scenario: Today/overdue view
- **WHEN** a user accesses the today view
- **THEN** the system displays only tasks due today or overdue

#### Scenario: Search
- **WHEN** a user searches for text
- **THEN** the system returns tasks containing that text in title or description

#### Scenario: Filters
- **WHEN** a user applies filters
- **THEN** the system displays only tasks matching the selected criteria

### Requirement: Provide due task notifications
The system SHALL display in-app notifications for due and overdue tasks.

#### Scenario: Notify on due date
- **GIVEN** a task has an assignee
- **WHEN** a task reaches its due date
- **THEN** the system displays an in-app notification to the assigned user

#### Scenario: Persist overdue notifications
- **GIVEN** a task has an assignee
- **WHEN** a task becomes overdue
- **THEN** the system continues showing the notification until the task is completed

#### Scenario: No notifications for unassigned tasks
- **GIVEN** a task has no assignee
- **WHEN** it reaches its due date
- **THEN** the system does not generate notifications for that task

### Requirement: Authenticate and join a household
The system SHALL allow users to authenticate and join or create a household.

#### Scenario: Register
- **WHEN** a user registers with email and password
- **THEN** the system creates an authenticated user account

#### Scenario: Login
- **WHEN** a user logs in successfully
- **THEN** the system grants access to their household’s tasks

#### Scenario: First login onboarding
- **WHEN** a user first logs in
- **THEN** the system prompts them to join or create a household

#### Scenario: Household membership permissions
- **WHEN** a user joins a household
- **THEN** the system grants them equal permissions to all household tasks

### Requirement: Persist and validate data reliably
The system SHALL persist task data reliably and prevent invalid data from being stored.

#### Scenario: Persist changes
- **WHEN** task data is created or modified
- **THEN** the system stores it in the PostgreSQL database immediately

#### Scenario: Restore after restart
- **WHEN** the application restarts
- **THEN** the system restores all task data from persistent storage

#### Scenario: Database failure feedback
- **WHEN** database operations fail
- **THEN** the system provides appropriate error feedback to users

#### Scenario: Validation failure
- **WHEN** data validation fails
- **THEN** the system prevents invalid data from being stored
