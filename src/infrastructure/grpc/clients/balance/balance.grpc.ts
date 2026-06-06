import {
	BalanceServiceClient,
	CreateWalletRequest,
	CreateWalletResponse
} from '@ciganov/contracts/dist/gen/balance'
import { Inject, Injectable, OnModuleInit } from '@nestjs/common'
import type { ClientGrpc } from '@nestjs/microservices'

@Injectable()
export class BalanceClientGrpc implements OnModuleInit {
	private balanceService: BalanceServiceClient
	public constructor(
		@Inject('BALANCE_PACKAGE') private readonly client: ClientGrpc
	) {}

	public onModuleInit() {
		this.balanceService =
			this.client.getService<BalanceServiceClient>('BalanceService')
	}

	public createWallet(data: CreateWalletRequest) {
		return this.balanceService.createWallet(data)
	}
}
