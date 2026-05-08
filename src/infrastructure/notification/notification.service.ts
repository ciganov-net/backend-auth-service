import { EmailChangedEvent, OtpRequestedEvent } from '@ciganov/contracts'
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

	public async emailChanged(data: EmailChangedEvent) {
		return this.client.emit('account.email.change', data)
	}
}
