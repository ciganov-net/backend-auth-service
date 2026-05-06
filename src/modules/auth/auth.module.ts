import { Module } from '@nestjs/common'

import { UserRepository } from '@/shared/repositories'

import { OtpModule } from '../otp/otp.module'
import { TokensModule } from '../tokens/tokens.module'

import { AuthController } from './auth.controller'
import { AuthService } from './auth.service'

@Module({
	controllers: [AuthController],
	providers: [AuthService, UserRepository],
	imports: [TokensModule, OtpModule]
})
export class AuthModule {}
