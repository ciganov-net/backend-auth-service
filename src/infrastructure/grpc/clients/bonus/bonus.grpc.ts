import {
	ActivatePromoCodeRequest,
	BonusServiceClient
} from '@ciganov/contracts/dist/gen/bonus'
import { Inject, Injectable, OnModuleInit } from '@nestjs/common'
import type { ClientGrpc } from '@nestjs/microservices'

@Injectable()
export class BonusClientGrpc implements OnModuleInit {
	private bonusService: BonusServiceClient
	public constructor(
		@Inject('BONUS_PACKAGE') private readonly client: ClientGrpc
	) {}

	public onModuleInit() {
		this.bonusService =
			this.client.getService<BonusServiceClient>('BonusService')
	}

	public activatePromo(data: ActivatePromoCodeRequest) {
		return this.bonusService.activatePromoCode(data)
	}
}
