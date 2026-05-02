import {
	SendOtpRequest,
	SendOtpResponse,
	VerifyOtpRequest,
	VerifyOtpResponse
} from '@ciganov/contracts'
import { Injectable } from '@nestjs/common'

import { NotificationService } from '@/infrastructure/notification/notification.service'
import { UserRepository } from '@/shared/repositories'

import { User } from '../../../prisma/generated/client'
import { OtpService } from '../otp/otp.service'

@Injectable()
export class AuthService {
	constructor(
		private readonly otpService: OtpService,
		private readonly userRepo: UserRepository,
		private readonly notificationService: NotificationService
	) {}

	public async sendOtp(data: SendOtpRequest): Promise<SendOtpResponse> {
		const { identifier } = data

		const { code } = await this.otpService.send(identifier)
		console.log(code)

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
			account = await this.userRepo.create({
				email: identifier
			})
		}

		return {
			token: 'token'
		}
	}
}
