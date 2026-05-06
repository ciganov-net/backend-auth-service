import { ms, StringValue } from '@ciganov/core'
import { Injectable } from '@nestjs/common'
import { ConfigService } from '@nestjs/config'
import { createHash, randomBytes } from 'crypto'
import { PinoLogger } from 'nestjs-pino'
import { v4 as uuidv4 } from 'uuid'

import { RedisService } from '@/infrastructure/redis/redis.service'
import { Session } from '@/shared/interfaces'

import { User } from '../../../prisma/generated/client'

@Injectable()
export class TokensService {
	private TOKEN_TTL: number
	constructor(
		private readonly redis: RedisService,
		private readonly configService: ConfigService,
		private readonly logger: PinoLogger
	) {
		this.TOKEN_TTL = Math.ceil(
			ms(this.configService.getOrThrow<StringValue>('SESSION_TTL')) / 1000
		)
		this.logger.setContext(TokensService.name)
	}

	async create(user: User) {
		const token = randomBytes(40).toString('hex')
		const sessionId = uuidv4()
		const tokenHash = this.hashToken(token)

		const sessionKey = `sessions:${tokenHash}`
		const userIndexKey = `user:${user.id}:sessions`

		const sessionData: Session = {
			id: sessionId,
			token: tokenHash,
			userId: user.id
		}

		await this.redis
			.multi()
			.hset(sessionKey, sessionData)
			.expire(sessionKey, this.TOKEN_TTL)
			.sadd(userIndexKey, tokenHash)
			.expire(userIndexKey, this.TOKEN_TTL)
			.exec()

		return { token, sessionId }
	}

	async get(token: string): Promise<Session | null> {
		const tokenHash = this.hashToken(token)
		const data = await this.redis.hgetall(`sessions:${tokenHash}`)

		if (!data || !data.userId) {
			this.logger.info(`Token ${token} not found`)
			return null
		}

		return data as unknown as Session
	}

	async revoke(token: string) {
		const tokenHash = this.hashToken(token)
		const session = await this.get(token)

		if (session) {
			await this.redis
				.multi()
				.del(`sessions:${tokenHash}`)
				.srem(`user:${session.userId}:sessions`, tokenHash)
				.exec()
		}
	}

	async revokeAll(userId: string) {
		const userIndexKey = `user:${userId}:sessions`
		const tokenHashes = await this.redis.smembers(userIndexKey)

		if (tokenHashes.length === 0) return

		const sessionKeys = tokenHashes.map(hash => `sessions:${hash}`)

		await this.redis.del(...sessionKeys, userIndexKey)

		this.logger.info(`Revoked all sessions for user ${userId}`)
	}

	async refresh(token: string) {
		const tokenHash = this.hashToken(token)
		const sessionKey = `sessions:${tokenHash}`
		const session = await this.get(token)

		if (session) {
			const userIndexKey = `user:${session.userId}:sessions`
			await this.redis
				.multi()
				.expire(sessionKey, this.TOKEN_TTL)
				.expire(userIndexKey, this.TOKEN_TTL)
				.exec()
		}
	}

	async getActiveSessions(userId: string): Promise<Session[]> {
		const tokenHashes = await this.redis.smembers(`user:${userId}:sessions`)
		if (tokenHashes.length === 0) return []

		const pipeline = this.redis.pipeline()
		tokenHashes.forEach(hash => pipeline.hgetall(`sessions:${hash}`))

		const results = await pipeline.exec()
		return results
			.map(([err, data]) => data as Session)
			.filter(session => session && session.userId)
	}

	private hashToken(token: string): string {
		return createHash('sha256').update(token).digest('hex')
	}
}
