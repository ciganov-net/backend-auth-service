import { Module } from '@nestjs/common'

import { UserRepository } from '@/shared/repositories'

import { OtpService } from '../otp/otp.service'

import { AuthController } from './auth.controller'
import { AuthService } from './auth.service'

@Module({
	controllers: [AuthController],
	providers: [AuthService, OtpService, UserRepository]
})
export class AuthModule {}
