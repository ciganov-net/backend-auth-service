import { ms, RpcStatus } from '@ciganov/core'
import { Injectable } from '@nestjs/common'
import { RpcException } from '@nestjs/microservices'
import { createHash } from 'crypto'
import { generateCode } from 'patcode'

import { RedisService } from '@/infrastructure/redis/redis.service'

@Injectable()
export class OtpService {
	constructor(private readonly redisService: RedisService) {}

	public async send(identifier: string) {
		const { code, hash } = this.generateCode()
		await this.redisService.set(`otp:${identifier}`, hash, 'EX', ms('5m'))
		return { code, hash }
	}

	public async verify(identifier: string, code: string) {
		const storedHash = await this.redisService.get(`otp:${identifier}`)

		if (!storedHash)
			throw new RpcException({
				code: RpcStatus.NOT_FOUND,
				details: 'OTP code not found'
			})

		const incomingHash = createHash('sha256').update(code).digest('hex')

		if (incomingHash !== storedHash)
			throw new RpcException({
				code: RpcStatus.INVALID_ARGUMENT,
				details: 'OTP code expired'
			})

		await this.redisService.del(`otp:${identifier}`)
	}

	private generateCode() {
		const code = generateCode()
		const hash = createHash('sha256').update(code.toString()).digest('hex')
		return { code, hash }
	}
}
