import { v4 as uuidv4 } from 'uuid'
import { ApiError } from '../middleware/error'

export interface PlannerBucketTodo {
  id: string
  title: string
  notes: string
  required: boolean
  deadlineDate: string | null
  repeatEvery: string
  disabled: boolean
  deleted: boolean
  createdAt: string
  updatedAt: string
}

interface PlannerHistoryEntry {
  date: string
  todoId: string
  title: string
  completed: boolean
  skipped: boolean
}

interface CreateBucketTodoPayload {
  title: string
  notes?: string
  required?: boolean
  deadlineDate?: string | null
  repeatEvery?: string
}

interface UpdateBucketTodoPayload {
  title?: string
  notes?: string
  required?: boolean
  deadlineDate?: string | null
  repeatEvery?: string
}

const seededTodos: PlannerBucketTodo[] = [
  {
    id: uuidv4(),
    title: 'Clean the kitchen',
    notes: 'Weekly household task',
    required: true,
    deadlineDate: null,
    repeatEvery: 'weekly',
    disabled: false,
    deleted: false,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  },
  {
    id: uuidv4(),
    title: 'Exercise',
    notes: 'At least 30 minutes',
    required: false,
    deadlineDate: null,
    repeatEvery: 'daily',
    disabled: false,
    deleted: false,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  },
  {
    id: uuidv4(),
    title: 'Pay electricity bill',
    notes: 'Payment before due date',
    required: true,
    deadlineDate: new Date().toISOString().slice(0, 10),
    repeatEvery: 'monthly',
    disabled: false,
    deleted: false,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  },
]

export class PlannerStore {
  private bucket = new Map<string, PlannerBucketTodo>()
  private planDate: string | null = null
  private planTodoIds = new Set<string>()
  private planCompletedTodoIds = new Set<string>()
  private isPlanSetupLocked = false
  private historyByDate = new Map<string, PlannerHistoryEntry[]>()

  constructor() {
    for (const todo of seededTodos) {
      this.bucket.set(todo.id, { ...todo })
    }
  }

  listBucket() {
    return this.getActiveTodos()
  }

  listRequiredBucket() {
    return this.getActiveTodos().filter((todo) => this.isTodoRequiredToday(todo))
  }

  listOptionalBucket() {
    return this.getActiveTodos().filter((todo) => !this.isTodoRequiredToday(todo))
  }

  getBucketTodo(id: string) {
    return this.requireBucketTodo(id)
  }

  createBucketTodo(payload: CreateBucketTodoPayload) {
    const now = new Date().toISOString()
    const todo: PlannerBucketTodo = {
      id: uuidv4(),
      title: payload.title,
      notes: payload.notes ?? '',
      required: payload.required ?? false,
      deadlineDate: payload.deadlineDate ?? null,
      repeatEvery: payload.repeatEvery ?? 'custom',
      disabled: false,
      deleted: false,
      createdAt: now,
      updatedAt: now,
    }

    this.bucket.set(todo.id, todo)
    return todo
  }

  updateBucketTodo(id: string, payload: UpdateBucketTodoPayload) {
    const todo = this.requireBucketTodo(id)
    const updated: PlannerBucketTodo = {
      ...todo,
      ...(payload.title !== undefined ? { title: payload.title } : {}),
      ...(payload.notes !== undefined ? { notes: payload.notes } : {}),
      ...(payload.required !== undefined ? { required: payload.required } : {}),
      ...(payload.deadlineDate !== undefined ? { deadlineDate: payload.deadlineDate } : {}),
      ...(payload.repeatEvery !== undefined ? { repeatEvery: payload.repeatEvery } : {}),
      updatedAt: new Date().toISOString(),
    }

    this.bucket.set(id, updated)
    return updated
  }

  softDeleteBucketTodo(id: string) {
    const todo = this.requireBucketTodo(id)
    todo.deleted = true
    todo.updatedAt = new Date().toISOString()
    this.bucket.set(id, todo)
    this.planTodoIds.delete(id)
    this.planCompletedTodoIds.delete(id)

    return {
      id,
      deleted: true,
    }
  }

  disableBucketTodo(id: string) {
    const todo = this.requireBucketTodo(id)
    todo.disabled = true
    todo.updatedAt = new Date().toISOString()
    this.bucket.set(id, todo)
    this.planTodoIds.delete(id)
    this.planCompletedTodoIds.delete(id)

    return {
      id,
      disabled: true,
    }
  }

  enableBucketTodo(id: string) {
    const todo = this.requireBucketTodo(id)
    todo.disabled = false
    todo.updatedAt = new Date().toISOString()
    this.bucket.set(id, todo)

    return {
      id,
      disabled: false,
    }
  }

  listRequiredPlanTodos() {
    const today = this.getTodayDate()
    return this.getActiveTodos().filter((todo) => this.isTodoRequiredOnDate(todo, today))
  }

  setupPlan(todoIds: string[]) {
    this.resetPlanIfDayChanged()

    if (this.isPlanSetupLocked) {
      throw new ApiError(409, 'PLAN_ALREADY_SETUP', 'Plan setup can only be submitted once per day')
    }

    const today = this.getTodayDate()
    const uniqueTodoIds = Array.from(new Set(todoIds))

    for (const id of uniqueTodoIds) {
      this.assertTodoCanBePlanned(id)
    }

    const requiredIds = this.listRequiredPlanTodos().map((todo) => todo.id)

    for (const requiredId of requiredIds) {
      if (!uniqueTodoIds.includes(requiredId)) {
        throw new ApiError(
          400,
          'REQUIRED_TODO_MISSING',
          `Required TODO '${requiredId}' must be included in plan/setup`,
        )
      }
    }

    this.planDate = today
    this.planTodoIds = new Set(uniqueTodoIds)
    this.planCompletedTodoIds = new Set<string>()
    this.isPlanSetupLocked = true
    this.writeHistoryForToday()

    return this.getPlan()
  }

  addTodoToPlan(todoId: string) {
    this.resetPlanIfDayChanged()
    this.assertTodoCanBePlanned(todoId)

    if (this.planDate === null) {
      this.planDate = this.getTodayDate()
    }

    this.planTodoIds.add(todoId)
    this.writeHistoryForToday()

    return this.getPlan()
  }

  removeTodoFromPlan(todoId: string) {
    this.resetPlanIfDayChanged()

    if (!this.planTodoIds.has(todoId)) {
      throw new ApiError(404, 'PLAN_TODO_NOT_FOUND', `TODO '${todoId}' is not in today's plan`)
    }

    if (this.planCompletedTodoIds.has(todoId)) {
      throw new ApiError(400, 'TODO_ALREADY_COMPLETED', 'Completed TODO cannot be skipped')
    }

    const todo = this.requireBucketTodo(todoId)

    if (this.isTodoRequiredToday(todo)) {
      throw new ApiError(400, 'TODO_REQUIRED_TODAY', 'TODO with today deadline cannot be skipped')
    }

    this.planTodoIds.delete(todoId)
    this.planCompletedTodoIds.delete(todoId)
    this.writeHistoryForToday(todoId)

    return this.getPlan()
  }

  getPlan() {
    this.resetPlanIfDayChanged()

    const date = this.planDate ?? this.getTodayDate()
    const todos = Array.from(this.planTodoIds)
      .map((id) => this.requireBucketTodo(id))
      .map((todo) => ({
        ...todo,
        completed: this.planCompletedTodoIds.has(todo.id),
      }))

    return {
      date,
      setupLocked: this.isPlanSetupLocked,
      todos,
    }
  }

  completePlanTodo(todoId: string) {
    this.resetPlanIfDayChanged()

    if (!this.planTodoIds.has(todoId)) {
      throw new ApiError(404, 'PLAN_TODO_NOT_FOUND', `TODO '${todoId}' is not in today's plan`)
    }

    this.planCompletedTodoIds.add(todoId)
    this.writeHistoryForToday()

    return {
      id: todoId,
      completed: true,
      date: this.getTodayDate(),
    }
  }

  listHistory() {
    return Array.from(this.historyByDate.entries())
      .map(([date, entries]) => ({
        date,
        total: entries.length,
        completed: entries.filter((entry) => entry.completed).length,
        skipped: entries.filter((entry) => entry.skipped).length,
      }))
      .sort((left, right) => right.date.localeCompare(left.date))
  }

  getHistoryByDate(date: string) {
    return this.historyByDate.get(date) ?? []
  }

  getTodoHistory(todoId: string) {
    const entries: PlannerHistoryEntry[] = []

    for (const dateEntries of this.historyByDate.values()) {
      for (const entry of dateEntries) {
        if (entry.todoId === todoId) {
          entries.push(entry)
        }
      }
    }

    return entries.sort((left, right) => right.date.localeCompare(left.date))
  }

  private getActiveTodos() {
    return Array.from(this.bucket.values()).filter((todo) => !todo.deleted)
  }

  private requireBucketTodo(id: string) {
    const todo = this.bucket.get(id)

    if (!todo || todo.deleted) {
      throw new ApiError(404, 'TODO_NOT_FOUND', `TODO '${id}' was not found`)
    }

    return todo
  }

  private getTodayDate() {
    return new Date().toISOString().slice(0, 10)
  }

  private isTodoRequiredToday(todo: PlannerBucketTodo) {
    return this.isTodoRequiredOnDate(todo, this.getTodayDate())
  }

  private isTodoRequiredOnDate(todo: PlannerBucketTodo, date: string) {
    return !todo.disabled && (todo.required || todo.deadlineDate === date)
  }

  private assertTodoCanBePlanned(id: string) {
    const todo = this.requireBucketTodo(id)

    if (todo.disabled) {
      throw new ApiError(400, 'TODO_DISABLED', `TODO '${id}' is disabled and cannot be added to plan`)
    }
  }

  private resetPlanIfDayChanged() {
    const today = this.getTodayDate()

    if (this.planDate === null) {
      return
    }

    if (this.planDate === today) {
      return
    }

    this.planDate = null
    this.planTodoIds = new Set<string>()
    this.planCompletedTodoIds = new Set<string>()
    this.isPlanSetupLocked = false
  }

  private writeHistoryForToday(skippedTodoId?: string) {
    const date = this.planDate ?? this.getTodayDate()
    const entries = Array.from(this.planTodoIds).map((todoId) => {
      const todo = this.requireBucketTodo(todoId)

      return {
        date,
        todoId,
        title: todo.title,
        completed: this.planCompletedTodoIds.has(todoId),
        skipped: false,
      }
    })

    if (skippedTodoId) {
      entries.push({
        date,
        todoId: skippedTodoId,
        title: this.requireBucketTodo(skippedTodoId).title,
        completed: false,
        skipped: true,
      })
    }

    this.historyByDate.set(date, entries)
  }
}
