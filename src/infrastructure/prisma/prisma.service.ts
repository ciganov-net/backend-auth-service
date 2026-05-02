import {
	Injectable,
	Logger,
	OnModuleDestroy,
	OnModuleInit
} from '@nestjs/common'
import { ConfigService } from '@nestjs/config'
import { PrismaPg } from '@prisma/adapter-pg'

import { PrismaClient } from '../../../prisma/generated/client'

@Injectable()
export class PrismaService
	extends PrismaClient
	implements OnModuleInit, OnModuleDestroy
{
	private readonly logger = new Logger(PrismaService.name)

	public constructor(private readonly configService: ConfigService) {
		const adapter = new PrismaPg({
			user: configService.getOrThrow<string>('DATABASE_USER'),
			password: configService.getOrThrow<string>('DATABASE_PASSWORD'),
			host: configService.getOrThrow<string>('DATABASE_HOST'),
			port: configService.getOrThrow<number>('DATABASE_PORT'),
			database: configService.getOrThrow<string>('DATABASE_NAME')
		})
		super({ adapter })
	}

	async onModuleInit() {
		const start = Date.now()
		this.logger.log('🔄Connecting to the database...')

		try {
			await this.$connect()
			const ms = Date.now() - start
			this.logger.log(`🟢Connected to the database in ${ms}ms`)
		} catch (e) {
			this.logger.error('🔴Failed to connect to the database: ', e)
		}
	}

	async onModuleDestroy() {
		this.logger.log('🔄Disconnecting from the database...')
		try {
			await this.$disconnect()
			this.logger.log('🟢Disconnected from the database')
		} catch (e) {
			this.logger.error('🔴Failed to connect to the database: ', e)
		}
	}
}
