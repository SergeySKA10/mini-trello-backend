import { prisma } from '../config/db';
import { beforeEach, afterAll } from '@jest/globals';

beforeEach(async () => {
    // Очистка базы перед каждым тестом
    await prisma.card.deleteMany();
    await prisma.column.deleteMany();
    await prisma.board.deleteMany();
    await prisma.user.deleteMany();
});

afterAll(async () => {
    await prisma.$disconnect();
});
