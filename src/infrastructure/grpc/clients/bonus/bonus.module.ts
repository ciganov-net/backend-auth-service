import { PROTO_PATHS } from '@ciganov/contracts'
import { Module } from '@nestjs/common'
import { ConfigService } from '@nestjs/config'
import { ClientsModule, Transport } from '@nestjs/microservices'

import { BonusClientGrpc } from './bonus.grpc'

@Module({
	providers: [BonusClientGrpc],
	imports: [
		ClientsModule.registerAsync([
			{
				name: 'BONUS_PACKAGE',
				useFactory: (configService: ConfigService) => ({
					transport: Transport.GRPC,
					options: {
						package: 'bonus.v1',
						protoPath: PROTO_PATHS.BONUS,
						url: configService.getOrThrow<string>('BONUS_GRPC_URL')
					}
				}),
				inject: [ConfigService]
			}
		])
	],
	exports: [BonusClientGrpc]
})
export class BonusGrpcModule {}
