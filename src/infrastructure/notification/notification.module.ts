import { Global, Module } from '@nestjs/common'
import { ConfigService } from '@nestjs/config'
import { ClientsModule, Transport } from '@nestjs/microservices'

import { NotificationService } from './notification.service'

@Global()
@Module({
	providers: [NotificationService],
	exports: [NotificationService],
	imports: [
		ClientsModule.registerAsync([
			{
				name: 'NOTIFICATIONS_CLIENT',
				useFactory: (configService: ConfigService) => ({
					transport: Transport.RMQ,
					options: {
						urls: [configService.getOrThrow<string>('RMQ_URL')],
						queue: 'notifications_queue',
						queueOptions: {
							durable: true
						}
					}
				}),
				inject: [ConfigService]
			}
		])
	]
})
export class NotificationModule {}
