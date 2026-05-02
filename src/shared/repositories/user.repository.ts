import { Injectable } from '@nestjs/common'

import { PrismaService } from '@/infrastructure/prisma/prisma.service'

import { User } from '../../../prisma/generated/client'
import {
	UserCreateInput,
	UserUpdateInput
} from '../../../prisma/generated/models'

@Injectable()
export class UserRepository {
	constructor(private readonly prismaService: PrismaService) {}

	public async findByEmail(email: string): Promise<User | null> {
		return await this.prismaService.user.findUnique({
			where: {
				email
			}
		})
	}

	public async update(id: string, data: UserUpdateInput): Promise<User | null> {
		return await this.prismaService.user.update({
			where: {
				id
			},
			data
		})
	}

	public async create(data: UserCreateInput): Promise<User | null> {
		return await this.prismaService.user.create({ data })
	}
}
