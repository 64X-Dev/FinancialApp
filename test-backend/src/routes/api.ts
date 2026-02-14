import { Router } from 'express'
import { z } from 'zod'
import { config } from '../config'
import { issueAdminToken, requireAdmin } from '../middleware/auth'
import { ApiError, sendSuccess } from '../middleware/error'
import { AuthFlowStore } from '../store/authFlowStore'
import { PlannerStore } from '../store/plannerStore'
import { AppRepository, CustomerStatus, InboxMessageType } from '../types'

const authFlowStore = new AuthFlowStore(config.authOtpCode)
const plannerStore = new PlannerStore()

const loginBodySchema = z.object({
  email: z.string().email().transform((value) => value.trim().toLowerCase()).optional(),
  username: z.string().trim().min(1).optional(),
  usernameOrEmail: z.string().trim().min(1).optional(),
  password: z.string().min(1),
}).refine((value) => Boolean(value.email || value.username || value.usernameOrEmail), {
  message: 'username, email, or usernameOrEmail is required',
  path: ['email'],
})

const registerPreVerificationBodySchema = z.object({
  email: z.string().email().transform((value) => value.trim().toLowerCase()),
})

const usernameAvailabilityBodySchema = z.object({
  token: z.string().uuid(),
  username: z.string().trim().min(3),
})

const registerOtpBodySchema = z.object({
  token: z.string().uuid(),
  OTP: z.string().trim().regex(/^\d{6}$/),
})

const profileImageBodySchema = z.object({
  base64Image: z.string().trim().min(8),
})

const registerSetupBodySchema = z.object({
  token: z.string().uuid().optional(),
  nickname: z.string().trim().min(2),
  username: z.string().trim().min(3),
  password: z.string().min(1),
  profileImageUUID: z.string().uuid(),
})

const invalidateFlowBodySchema = z.object({
  token: z.string().uuid(),
})

const forgotPasswordBodySchema = z.object({
  usernameOrEmail: z.string().trim().min(1).optional(),
  username: z.string().trim().min(1).optional(),
  email: z.string().trim().min(1).optional(),
}).refine((value) => Boolean(value.usernameOrEmail || value.username || value.email), {
  message: 'usernameOrEmail, username, or email is required',
  path: ['usernameOrEmail'],
})

const forgotValidateBodySchema = z.object({
  token: z.string().uuid(),
  OTP: z.string().trim().regex(/^\d{6}$/),
})

const forgotResetBodySchema = z.object({
  token: z.string().uuid().optional(),
  newPassword: z.string().min(1),
})

const plannerTodoIdParamsSchema = z.object({
  todoId: z.string().trim().min(1),
})

const plannerDateParamsSchema = z.object({
  date: z.string().trim().regex(/^\d{4}-\d{2}-\d{2}$/),
})

const plannerBucketBodySchema = z.object({
  title: z.string().trim().min(1),
  notes: z.string().trim().optional(),
  required: z.boolean().optional(),
  deadlineDate: z.string().trim().regex(/^\d{4}-\d{2}-\d{2}$/).nullable().optional(),
  repeatEvery: z.string().trim().optional(),
})

const plannerBucketUpdateBodySchema = plannerBucketBodySchema.partial().refine(
  (value) => Object.keys(value).length > 0,
  {
    message: 'At least one field is required',
  },
)

const plannerPlanSetupBodySchema = z
  .object({
    todoIds: z.array(z.string().trim().min(1)).optional(),
    list: z.array(z.string().trim().min(1)).optional(),
    ids: z.array(z.string().trim().min(1)).optional(),
  })
  .refine((value) => Boolean(value.todoIds || value.list || value.ids), {
    message: 'todoIds (or list/ids) is required',
    path: ['todoIds'],
  })

const plannerPlanTodoBodySchema = z
  .object({
    todoId: z.string().trim().min(1).optional(),
    id: z.string().trim().min(1).optional(),
  })
  .refine((value) => Boolean(value.todoId || value.id), {
    message: 'todoId (or id) is required',
    path: ['todoId'],
  })

const customerIdParamsSchema = z.object({
  customerId: z
    .string()
    .trim()
    .regex(/^[a-z0-9-]+$/, 'customerId must be lowercase letters, numbers, and dashes'),
})

const listCustomersQuerySchema = z.object({
  search: z.string().trim().min(1).optional(),
  status: z.enum(['New', 'Pending', 'Completed', 'Rejected']).optional(),
})

const listInboxQuerySchema = z.object({
  type: z.enum(['News', 'Notion', 'Promotions']).optional(),
})

function validate<T>(schema: z.ZodSchema<T>, value: unknown): T {
  const parsed = schema.safeParse(value)

  if (!parsed.success) {
    throw new ApiError(400, 'VALIDATION_ERROR', 'Request validation failed', parsed.error.flatten())
  }

  return parsed.data
}

function resolveTodoIds(body: z.infer<typeof plannerPlanSetupBodySchema>) {
  return body.todoIds ?? body.list ?? body.ids ?? []
}

function resolveTodoId(body: z.infer<typeof plannerPlanTodoBodySchema>) {
  return body.todoId ?? body.id ?? ''
}

export function createApiRouter(repository: AppRepository): Router {
  const router = Router()

  router.post('/auth/login', (req, res) => {
    const body = validate(loginBodySchema, req.body)
    const identifier = (body.email ?? body.usernameOrEmail ?? body.username ?? '').trim().toLowerCase()
    const adminUsername = config.adminEmail.split('@')[0]

    if ((identifier !== config.adminEmail && identifier !== adminUsername) || body.password !== config.adminPassword) {
      throw new ApiError(401, 'INVALID_CREDENTIALS', 'Invalid email or password')
    }

    const token = issueAdminToken(config.adminEmail)

    return sendSuccess(res, {
      token,
      user: {
        email: config.adminEmail,
        role: 'admin',
      },
    })
  })

  router.post('/auth/register/preVerification', (req, res) => {
    const body = validate(registerPreVerificationBodySchema, req.body)
    return sendSuccess(res, authFlowStore.startRegisterPreVerification(body.email))
  })

  router.post('/auth/register/flow/usernameAvailability', (req, res) => {
    const body = validate(usernameAvailabilityBodySchema, req.body)
    return sendSuccess(res, authFlowStore.checkUsernameAvailability(body.token, body.username))
  })

  router.post('/auth/register/flow/Verification', (req, res) => {
    const body = validate(registerOtpBodySchema, req.body)
    return sendSuccess(res, authFlowStore.verifyRegisterOtp(body.token, body.OTP))
  })

  router.post('/auth/register/flow/ProfileImage', (req, res) => {
    const body = validate(profileImageBodySchema, req.body)
    return sendSuccess(res, authFlowStore.uploadProfileImage(body.base64Image))
  })

  router.post('/auth/register/flow/Setup', (req, res) => {
    const body = validate(registerSetupBodySchema, req.body)
    return sendSuccess(res, authFlowStore.completeRegisterSetup(body))
  })

  router.post('/auth/register/flow/Invalidate', (req, res) => {
    const body = validate(invalidateFlowBodySchema, req.body)
    return sendSuccess(res, authFlowStore.invalidateRegisterFlow(body.token))
  })

  router.post('/auth/forgetPassword', (req, res) => {
    const body = validate(forgotPasswordBodySchema, req.body)
    const usernameOrEmail = body.usernameOrEmail ?? body.username ?? body.email ?? ''
    return sendSuccess(res, authFlowStore.requestForgotPassword(usernameOrEmail))
  })

  router.post('/auth/forgetPassword/flow/validate', (req, res) => {
    const body = validate(forgotValidateBodySchema, req.body)
    return sendSuccess(res, authFlowStore.validateForgotPassword(body.token, body.OTP))
  })

  router.post('/auth/forgetPassword/flow/reset', (req, res) => {
    const body = validate(forgotResetBodySchema, req.body)
    return sendSuccess(res, authFlowStore.resetForgotPassword(body.newPassword, body.token))
  })

  router.post('/auth/forgetPassword/flow/Invalidate', (req, res) => {
    const body = validate(invalidateFlowBodySchema, req.body)
    return sendSuccess(res, authFlowStore.invalidateForgotPassword(body.token))
  })

  router.use(requireAdmin)

  router.get('/planner/bucket', (_req, res) => {
    return sendSuccess(res, plannerStore.listBucket())
  })

  router.get('/planner/bucket/required', (_req, res) => {
    return sendSuccess(res, plannerStore.listRequiredBucket())
  })

  router.get('/planner/bucket/optional', (_req, res) => {
    return sendSuccess(res, plannerStore.listOptionalBucket())
  })

  router.get('/planner/bucket/:todoId', (req, res) => {
    const { todoId } = validate(plannerTodoIdParamsSchema, req.params)
    return sendSuccess(res, plannerStore.getBucketTodo(todoId))
  })

  router.post('/planner/bucket', (req, res) => {
    const body = validate(plannerBucketBodySchema, req.body)
    return sendSuccess(res, plannerStore.createBucketTodo(body), 201)
  })

  router.put('/planner/bucket/:todoId', (req, res) => {
    const { todoId } = validate(plannerTodoIdParamsSchema, req.params)
    const body = validate(plannerBucketUpdateBodySchema, req.body)
    return sendSuccess(res, plannerStore.updateBucketTodo(todoId, body))
  })

  router.delete('/planner/bucket/:todoId', (req, res) => {
    const { todoId } = validate(plannerTodoIdParamsSchema, req.params)
    return sendSuccess(res, plannerStore.softDeleteBucketTodo(todoId))
  })

  router.put('/planner/bucket/:todoId/disable', (req, res) => {
    const { todoId } = validate(plannerTodoIdParamsSchema, req.params)
    return sendSuccess(res, plannerStore.disableBucketTodo(todoId))
  })

  router.put('/planner/bucket/:todoId/enable', (req, res) => {
    const { todoId } = validate(plannerTodoIdParamsSchema, req.params)
    return sendSuccess(res, plannerStore.enableBucketTodo(todoId))
  })

  router.get('/planner/plan/required', (_req, res) => {
    return sendSuccess(res, plannerStore.listRequiredPlanTodos())
  })

  router.post('/planner/plan/setup', (req, res) => {
    const body = validate(plannerPlanSetupBodySchema, req.body)
    return sendSuccess(res, plannerStore.setupPlan(resolveTodoIds(body)))
  })

  router.put('/planner/plan/setup', (req, res) => {
    const body = validate(plannerPlanTodoBodySchema, req.body)
    return sendSuccess(res, plannerStore.addTodoToPlan(resolveTodoId(body)))
  })

  router.delete('/planner/plan/setup', (req, res) => {
    const body = validate(plannerPlanTodoBodySchema, req.body)
    return sendSuccess(res, plannerStore.removeTodoFromPlan(resolveTodoId(body)))
  })

  router.get('/planner/plan', (_req, res) => {
    return sendSuccess(res, plannerStore.getPlan())
  })

  router.put('/planner/plan/:todoId/complete', (req, res) => {
    const { todoId } = validate(plannerTodoIdParamsSchema, req.params)
    return sendSuccess(res, plannerStore.completePlanTodo(todoId))
  })

  router.get('/planner/history', (_req, res) => {
    return sendSuccess(res, plannerStore.listHistory())
  })

  router.get('/planner/history/TODO/:todoId', (req, res) => {
    const { todoId } = validate(plannerTodoIdParamsSchema, req.params)
    return sendSuccess(res, plannerStore.getTodoHistory(todoId))
  })

  router.get('/planner/history/:date', (req, res) => {
    const { date } = validate(plannerDateParamsSchema, req.params)
    return sendSuccess(res, plannerStore.getHistoryByDate(date))
  })

  router.get('/admin/ping', (_req, res) => {
    return sendSuccess(res, {
      message: 'Admin token is valid',
      role: 'admin',
    })
  })

  router.get('/dashboard', (_req, res) => {
    return sendSuccess(res, repository.getDashboard())
  })

  router.get('/customers', (req, res) => {
    const query = validate(listCustomersQuerySchema, req.query)

    return sendSuccess(
      res,
      repository.listCustomers({
        search: query.search,
        status: query.status as CustomerStatus | undefined,
      }),
    )
  })

  router.get('/customers/:customerId', (req, res) => {
    const { customerId } = validate(customerIdParamsSchema, req.params)
    const customer = repository.getCustomerById(customerId)

    if (!customer) {
      throw new ApiError(404, 'CUSTOMER_NOT_FOUND', `Customer '${customerId}' was not found`)
    }

    return sendSuccess(res, customer)
  })

  router.delete('/customers/:customerId', (req, res) => {
    const { customerId } = validate(customerIdParamsSchema, req.params)
    const isDeleted = repository.deleteCustomerById(customerId)

    if (!isDeleted) {
      throw new ApiError(404, 'CUSTOMER_NOT_FOUND', `Customer '${customerId}' was not found`)
    }

    return sendSuccess(res, {
      customerId,
      deleted: true,
    })
  })

  router.get('/inbox', (req, res) => {
    const query = validate(listInboxQuerySchema, req.query)

    return sendSuccess(
      res,
      repository.listInboxMessages({
        type: query.type as InboxMessageType | undefined,
      }),
    )
  })

  return router
}
