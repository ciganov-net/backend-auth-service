import { PROTO_PATHS } from '@ciganov/contracts'
import { Module } from '@nestjs/common'
import { ConfigService } from '@nestjs/config'
import { ClientsModule, Transport } from '@nestjs/microservices'

import { UsersClientGrpc } from './users.grpc'

@Module({
	providers: [UsersClientGrpc],
	imports: [
		ClientsModule.registerAsync([
			{
				name: 'USER_PACKAGE',
				useFactory: (configService: ConfigService) => ({
					transport: Transport.GRPC,
					options: {
						package: 'user.v1',
						protoPath: PROTO_PATHS.USER,
						url: configService.getOrThrow<string>('USER_GRPC_URL')
					}
				}),
				inject: [ConfigService]
			}
		])
	],
	exports: [UsersClientGrpc]
})
export class UsersModule {}
