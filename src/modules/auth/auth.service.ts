import {
	SendOtpRequest,
	SendOtpResponse,
	VerifyOtpRequest,
	VerifyOtpResponse
} from '@ciganov/contracts/gen/auth'
import { Injectable } from '@nestjs/common'
import { PinoLogger } from 'nestjs-pino'

import { NotificationService } from '@/infrastructure/notification/notification.service'
import { UserRepository } from '@/shared/repositories'

import { User } from '../../../prisma/generated/client'
import { OtpService } from '../otp/otp.service'
import { TokensService } from '../tokens/tokens.service'

@Injectable()
export class AuthService {
	constructor(
		private readonly otpService: OtpService,
		private readonly userRepo: UserRepository,
		private readonly notificationService: NotificationService,
		private readonly tokenService: TokensService,
		private readonly logger: PinoLogger
	) {
		this.logger.setContext(AuthService.name)
	}

	public async sendOtp(data: SendOtpRequest): Promise<SendOtpResponse> {
		const { identifier } = data

		const { code } = await this.otpService.send(identifier)
		await this.notificationService.otpRequested({
			identifier,
			code
		})

		return {
			ok: true
		}
	}

	public async verifyOtp(data: VerifyOtpRequest): Promise<VerifyOtpResponse> {
		const { code, identifier } = data

		await this.otpService.verify(identifier, code)

		let account: User | null

		account = await this.userRepo.findByEmail(identifier)
		if (!account) {
			this.logger.info(`User with ${identifier} not found, creating...`)
			account = await this.userRepo.create({
				email: identifier
			})
		}

		return await this.tokenService.create(account)
	}
}
