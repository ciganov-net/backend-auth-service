import { PrismaPg } from '@prisma/adapter-pg'
import * as dotenv from 'dotenv'

import { PrismaClient, Role, User } from './generated/client'

dotenv.config({
	path: '.env.production.local'
})

const adapter = new PrismaPg({
	user: process.env.DATABASE_USER!,
	password: process.env.DATABASE_PASSWORD!,
	host: process.env.DATABASE_HOST!,
	port: Number(process.env.DATABASE_PORT!),
	database: process.env.DATABASE_NAME!
})

const prisma = new PrismaClient({ adapter })

const AUTH_CREDENTIALS: User[] = [
	{
		//вадим
		id: 'c7TZMqTRfHd5h7A3M5Fjn',
		email: 'vadimzooru@gmail.com',
		role: Role.ADMIN,
		createdAt: new Date(),
		updatedAt: new Date()
	},
	{
		//кирик
		id: 'xnLWWxD_EJs4x_ppmgfdC',
		email: 'kirill.okunev03@mail.ru',
		role: Role.ADMIN,
		createdAt: new Date(),
		updatedAt: new Date()
	},
	{
		//ярослейв
		id: 'Ks5-83ykyihsvSqkinBF5',
		email: 'yaroslav.vjukoff1@mail.ru',
		role: Role.ADMIN,
		createdAt: new Date(),
		updatedAt: new Date()
	},
	{
		// вадич
		id: 'kxKqrnAfyD7tSQYCpDM32',
		email: 'asteroid.300@yandex.ru',
		role: Role.ADMIN,
		createdAt: new Date(),
		updatedAt: new Date()
	},
	{
		// диман
		id: 'eOM6mazeykaTsZBQdySVs',
		email: 'dima_klaud@mail.ru',
		role: Role.ADMIN,
		createdAt: new Date(),
		updatedAt: new Date()
	},
	{
		// мелстрой
		id: 'xujNktIqrMWy2i2pbc124',
		email: 'mellstroy@babki.ru',
		role: Role.USER,
		createdAt: new Date(),
		updatedAt: new Date()
	},
	{
		// трамп
		id: 'JNdquv_PmkNpgmu8UQTEj',
		email: 'trump@usa.com',
		role: Role.USER,
		createdAt: new Date(),
		updatedAt: new Date()
	},
	{
		// евелон
		id: 'xkes9LGPE4kBytCSe1JBX',
		email: 'evelone@twitch.com',
		role: Role.USER,
		createdAt: new Date(),
		updatedAt: new Date()
	}
]

async function seed() {
	console.log('Seeder started')

	try {
		await prisma.$transaction(async tx => {
			await tx.user.deleteMany()
			await tx.user.createMany({
				data: AUTH_CREDENTIALS
			})
		})
		console.log('Seeder successfully completed')
	} catch (e) {
		console.log('Seeder failed')
		console.log(e)
		process.exit(1)
	}
}

seed()
