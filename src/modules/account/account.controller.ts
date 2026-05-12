import type {
	ConfirmEmailChangeRequest,
	ConfirmEmailChangeResponse,
	GetAccountRequest,
	GetAccountResponse,
	InitEmailChangeRequest,
	InitEmailChangeResponse
} from '@ciganov/contracts/dist/gen/account'
import { Controller } from '@nestjs/common'
import { GrpcMethod } from '@nestjs/microservices'

import { AccountService } from './account.service'

@Controller()
export class AccountController {
	constructor(private readonly accountService: AccountService) {}
	@GrpcMethod('AccountService', 'GetAccount')
	public async getAccount(
		data: GetAccountRequest
	): Promise<GetAccountResponse> {
		return await this.accountService.getAccountById(data)
	}

	@GrpcMethod('AccountService', 'InitEmailChange')
	public async initEmailChange(
		data: InitEmailChangeRequest
	): Promise<InitEmailChangeResponse> {
		return await this.accountService.initEmailChange(data)
	}
	@GrpcMethod('AccountService', 'ConfirmEmailChange')
	public async confirmEmailChange(
		data: ConfirmEmailChangeRequest
	): Promise<ConfirmEmailChangeResponse> {
		return await this.accountService.confirmEmailChange(data)
	}
}
