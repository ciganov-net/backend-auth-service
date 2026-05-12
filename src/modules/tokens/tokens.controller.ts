import type {
	GetSessionByTokenRequest,
	GetSessionByTokenResponse,
	RefreshTokenRequest
} from '@ciganov/contracts/dist/gen/auth'
import { Controller } from '@nestjs/common'
import { GrpcMethod } from '@nestjs/microservices'

import { TokensService } from './tokens.service'

@Controller()
export class TokensController {
	constructor(private readonly tokensService: TokensService) {}

	@GrpcMethod('AuthService', 'GetSessionByToken')
	async getSessionByToken(
		dto: GetSessionByTokenRequest
	): Promise<GetSessionByTokenResponse> {
		const { token } = dto
		const session = await this.tokensService.get(token)
		return { session }
	}

	@GrpcMethod('AuthService', 'RefreshToken')
	async refreshToken(dto: RefreshTokenRequest) {
		const { token } = dto
		await this.tokensService.refresh(token)
	}
}
