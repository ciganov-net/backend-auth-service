import { Module } from '@nestjs/common'
import { ConfigModule } from '@nestjs/config'

import { NotificationModule } from '@/infrastructure/notification/notification.module'
import { PrismaModule } from '@/infrastructure/prisma/prisma.module'
import { RedisModule } from '@/infrastructure/redis/redis.module'
import { AuthModule } from '@/modules/auth/auth.module'
import { OtpModule } from '@/modules/otp/otp.module'

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
		PrismaModule,
		RedisModule,
		NotificationModule,
		AuthModule,
		OtpModule
	],
	controllers: []
})
export class AppModule {}
