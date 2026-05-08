import {
	ConfirmEmailChangeRequest,
	ConfirmEmailChangeResponse,
	type GetAccountRequest,
	type GetAccountResponse,
	InitEmailChangeRequest,
	InitEmailChangeResponse,
	Role
} from '@ciganov/contracts/gen/account'
import { convertEnum, RpcStatus } from '@ciganov/core'
import { Injectable } from '@nestjs/common'
import { RpcException } from '@nestjs/microservices'
import { PinoLogger } from 'nestjs-pino'
import { lastValueFrom } from 'rxjs'

import { NotificationService } from '@/infrastructure/notification/notification.service'
import { PrismaService } from '@/infrastructure/prisma/prisma.service'
import { UserRepository } from '@/shared/repositories'

import { OtpService } from '../otp/otp.service'

import { AccountRepository } from './account.repository'

@Injectable()
export class AccountService {
	constructor(
		private readonly prismaService: PrismaService,
		private readonly userRepo: UserRepository,
		private readonly otpService: OtpService,
		private readonly notificationService: NotificationService,
		private readonly accountRepo: AccountRepository,
		private readonly logger: PinoLogger
	) {
		this.logger.setContext(AccountService.name)
	}

	public async getAccountById(
		data: GetAccountRequest
	): Promise<GetAccountResponse> {
		const { id } = data
		const user = await this.userRepo.findById(id)
		if (!user) {
			throw new RpcException({
				code: RpcStatus.NOT_FOUND,
				details: `The user with id ${id} not found`
			})
		}
		return {
			id: user.id,
			email: user.email,
			role: convertEnum(Role, user.role)
		}
	}

	public async initEmailChange(
		data: InitEmailChangeRequest
	): Promise<InitEmailChangeResponse> {
		const { email, userId } = data
		const isExists = this.userRepo.findByEmail(email)

		if (isExists) {
			throw new RpcException({
				code: RpcStatus.ALREADY_EXISTS,
				details: 'Email already in use'
			})
		}

		const { code, hash } = await this.otpService.send(email)

		await this.notificationService.emailChanged({
			email,
			code
		})

		await this.accountRepo.upsertPendingChange({
			userId: userId,
			value: email,
			codeHash: hash,
			expiresAt: new Date(Date.now() + 5 * 60 * 1000)
		})

		return { ok: true }
	}

	public async confirmEmailChange(
		data: ConfirmEmailChangeRequest
	): Promise<ConfirmEmailChangeResponse> {
		const { code, email, userId } = data

		const pending = await this.accountRepo.findPendingChange(userId)

		if (!pending)
			throw new RpcException({
				code: RpcStatus.NOT_FOUND,
				details: 'No pending request'
			})

		if (pending.value !== email)
			throw new RpcException({
				code: RpcStatus.INVALID_ARGUMENT,
				details: 'Email mismatch'
			})

		if (pending.expiresAt < new Date())
			throw new RpcException({
				code: RpcStatus.NOT_FOUND,
				details: 'Code expired'
			})

		await this.otpService.verify(pending.value, code)

		await this.userRepo.update(userId, {
			email
		})

		await this.accountRepo.deletePendingChange(userId)

		return { ok: true }
	}
}
