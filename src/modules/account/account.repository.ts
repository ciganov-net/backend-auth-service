import { Injectable } from '@nestjs/common'

import { PrismaService } from '@/infrastructure/prisma/prisma.service'

import { PendingContactChange } from '../../../prisma/generated/client'

@Injectable()
export class AccountRepository {
	constructor(private readonly prismaService: PrismaService) {}

	public findPendingChange(userId: string): Promise<PendingContactChange> {
		return this.prismaService.pendingContactChange.findUnique({
			where: {
				userId
			}
		})
	}

	public upsertPendingChange(data: {
		userId: string
		value: string
		codeHash: string
		expiresAt: Date
	}): Promise<PendingContactChange> {
		return this.prismaService.pendingContactChange.upsert({
			where: {
				userId: data.userId
			},
			create: data,
			update: data
		})
	}

	public deletePendingChange(userId: string): Promise<PendingContactChange> {
		return this.prismaService.pendingContactChange.delete({
			where: {
				userId
			}
		})
	}
}
