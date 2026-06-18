import {
	RevokeAllSessionsRequest,
	RevokeSessionRequest,
	SendOtpRequest,
	SendOtpResponse,
	VerifyOtpRequest,
	VerifyOtpResponse
} from '@ciganov/contracts/dist/gen/auth'
import { Injectable } from '@nestjs/common'
import { PinoLogger } from 'nestjs-pino'

import { BalanceClientGrpc } from '@/infrastructure/grpc/clients/balance/balance.grpc'
import { BonusClientGrpc } from '@/infrastructure/grpc/clients/bonus/bonus.grpc'
import { UsersClientGrpc } from '@/infrastructure/grpc/clients/users/users.grpc'
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
		private readonly usersClient: UsersClientGrpc,
		private readonly balanceClient: BalanceClientGrpc,
		private readonly bonusClient: BonusClientGrpc,
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
			await this.usersClient.create({ id: account.id }).subscribe()
			await this.balanceClient.createWallet({ userId: account.id }).subscribe()
			await this.bonusClient
				.activatePromo({
					userId: account.id,
					code: 'freebet'
				})
				.subscribe()
		}

		return await this.tokenService.create(account)
	}

	public async revoke(data: RevokeSessionRequest) {
		const { token } = data
		await this.tokenService.revoke(token)
	}

	public async revokeAll(data: RevokeAllSessionsRequest) {
		const { userId } = data
		await this.tokenService.revokeAll(userId)
	}
}
