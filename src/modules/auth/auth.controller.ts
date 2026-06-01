import type {
	RevokeAllSessionsRequest,
	RevokeSessionRequest,
	SendOtpRequest,
	SendOtpResponse,
	VerifyOtpRequest,
	VerifyOtpResponse
} from '@ciganov/contracts/dist/gen/auth'
import { Controller } from '@nestjs/common'
import { GrpcMethod } from '@nestjs/microservices'

import { AuthService } from './auth.service'

@Controller()
export class AuthController {
	constructor(private readonly authService: AuthService) {}

	@GrpcMethod('AuthService', 'SendOtp')
	public async sendOtp(data: SendOtpRequest): Promise<SendOtpResponse> {
		return await this.authService.sendOtp(data)
	}

	@GrpcMethod('AuthService', 'VerifyOtp')
	public async verifyOtp(data: VerifyOtpRequest): Promise<VerifyOtpResponse> {
		return await this.authService.verifyOtp(data)
	}

	@GrpcMethod('AuthService', 'RevokeSession')
	public async revoke(data: RevokeSessionRequest) {
		return await this.authService.revoke(data)
	}

	@GrpcMethod('AuthService', 'RevokeAllSessionsRequest')
	public async revokeAll(data: RevokeAllSessionsRequest) {
		return await this.authService.revokeAll(data)
	}
}
