import { Module } from '@nestjs/common'
import { ConfigModule } from '@nestjs/config'
import { LoggerModule } from 'nestjs-pino'

import { NotificationModule } from '@/infrastructure/notification/notification.module'
import { PrismaModule } from '@/infrastructure/prisma/prisma.module'
import { RedisModule } from '@/infrastructure/redis/redis.module'
import { AccountModule } from '@/modules/account/account.module'
import { AuthModule } from '@/modules/auth/auth.module'
import { OtpModule } from '@/modules/otp/otp.module'
import { ObservabilityModule } from '@/observability/observability.module'

@Module({
	imports: [
		ConfigModule.forRoot({
			isGlobal: true,
			envFilePath: [
				`.env.${process.env.NODE_ENV}.local`,
				`.env.${process.env.NODE_ENV}`,
				'.env'
			]
		}),
		LoggerModule.forRoot({
			pinoHttp: {
				level: process.env.LOG_LEVEL,
				transport: {
					target: 'pino/file',
					options: {
						destination: '/var/log/services/auth/auth.log',
						mkdir: true
					}
				},
				messageKey: 'msg',
				customProps: () => ({
					service: 'auth-service'
				})
			}
		}),
		ObservabilityModule,
		PrismaModule,
		RedisModule,
		NotificationModule,
		AuthModule,
		OtpModule,
		AccountModule
	],
	controllers: []
})
export class AppModule {}
