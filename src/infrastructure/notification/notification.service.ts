import { OtpRequestedEvent } from '@ciganov/contracts'
import { Inject, Injectable } from '@nestjs/common'
import { ClientProxy } from '@nestjs/microservices'

@Injectable()
export class NotificationService {
	public constructor(
		@Inject('NOTIFICATIONS_CLIENT') private readonly client: ClientProxy
	) {}

	public async otpRequested(data: OtpRequestedEvent) {
		return this.client.emit('auth.otp.requested', data)
	}
}
