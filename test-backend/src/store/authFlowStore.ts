import { v4 as uuidv4 } from 'uuid'
import { ApiError } from '../middleware/error'

interface RegisterFlow {
  registerToken: string
  email: string
  verified: boolean
  username?: string
}

interface ForgotPasswordFlow {
  forgetPasswordToken: string
  usernameOrEmail: string
  validated: boolean
}

interface RegistrationSetupPayload {
  token?: string
  nickname: string
  username: string
  password: string
  profileImageUUID: string
}

export class AuthFlowStore {
  private registerFlows = new Map<string, RegisterFlow>()
  private forgotPasswordFlows = new Map<string, ForgotPasswordFlow>()
  private readonly otpCode: string

  constructor(otpCode: string) {
    this.otpCode = otpCode
  }

  startRegisterPreVerification(email: string) {
    const registerToken = uuidv4()

    this.registerFlows.set(registerToken, {
      registerToken,
      email,
      verified: false,
    })

    return {
      registerToken,
    }
  }

  checkUsernameAvailability(token: string, username: string) {
    const flow = this.getRegisterFlow(token)
    const isAvailable = username.trim().toLowerCase() !== 'admin'

    if (isAvailable) {
      flow.username = username
    }

    return {
      available: isAvailable,
    }
  }

  verifyRegisterOtp(token: string, otp: string) {
    const flow = this.getRegisterFlow(token)

    if (otp !== this.otpCode) {
      throw new ApiError(400, 'INVALID_OTP', 'OTP code is invalid')
    }

    flow.verified = true

    return {
      verified: true,
    }
  }

  uploadProfileImage(_base64Image: string) {
    return {
      profileImageUUID: uuidv4(),
    }
  }

  completeRegisterSetup(payload: RegistrationSetupPayload) {
    const flow = payload.token
      ? this.getRegisterFlow(payload.token)
      : this.getLatestVerifiedRegisterFlow(payload.username)

    if (!flow.verified) {
      throw new ApiError(400, 'REGISTER_NOT_VERIFIED', 'Registration OTP is not verified')
    }

    return {
      accountId: uuidv4(),
      email: flow.email,
      nickname: payload.nickname,
      username: payload.username,
      profileImageUUID: payload.profileImageUUID,
      setupCompleted: true,
    }
  }

  invalidateRegisterFlow(token: string) {
    return {
      invalidated: this.registerFlows.delete(token),
    }
  }

  requestForgotPassword(usernameOrEmail: string) {
    const forgetPasswordToken = uuidv4()

    this.forgotPasswordFlows.set(forgetPasswordToken, {
      forgetPasswordToken,
      usernameOrEmail,
      validated: false,
    })

    return {
      forgetPasswordToken,
    }
  }

  validateForgotPassword(token: string, otp: string) {
    const flow = this.getForgotPasswordFlow(token)

    if (otp !== this.otpCode) {
      throw new ApiError(400, 'INVALID_OTP', 'OTP code is invalid')
    }

    flow.validated = true

    return {
      validated: true,
    }
  }

  resetForgotPassword(_newPassword: string, token?: string) {
    const flow = token ? this.getForgotPasswordFlow(token) : this.getLatestValidatedForgotPasswordFlow()

    if (!flow.validated) {
      throw new ApiError(400, 'RESET_NOT_VALIDATED', 'Password reset OTP has not been validated')
    }

    return {
      reset: true,
    }
  }

  invalidateForgotPassword(token: string) {
    return {
      invalidated: this.forgotPasswordFlows.delete(token),
    }
  }

  private getRegisterFlow(token: string): RegisterFlow {
    const flow = this.registerFlows.get(token)

    if (!flow) {
      throw new ApiError(404, 'REGISTER_FLOW_NOT_FOUND', 'Registration token was not found or has expired')
    }

    return flow
  }

  private getForgotPasswordFlow(token: string): ForgotPasswordFlow {
    const flow = this.forgotPasswordFlows.get(token)

    if (!flow) {
      throw new ApiError(404, 'FORGOT_PASSWORD_FLOW_NOT_FOUND', 'Forgot password token was not found or has expired')
    }

    return flow
  }

  private getLatestVerifiedRegisterFlow(username?: string): RegisterFlow {
    const registerFlows = Array.from(this.registerFlows.values()).reverse()
    const flow = registerFlows.find((item) => item.verified && (!username || item.username === username))

    if (!flow) {
      throw new ApiError(404, 'REGISTER_FLOW_NOT_FOUND', 'Verified registration flow was not found or has expired')
    }

    return flow
  }

  private getLatestValidatedForgotPasswordFlow(): ForgotPasswordFlow {
    const forgotPasswordFlows = Array.from(this.forgotPasswordFlows.values()).reverse()
    const flow = forgotPasswordFlows.find((item) => item.validated)

    if (!flow) {
      throw new ApiError(
        404,
        'FORGOT_PASSWORD_FLOW_NOT_FOUND',
        'Validated forgot password flow was not found or has expired',
      )
    }

    return flow
  }
}
