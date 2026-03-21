import { PrismaClient, Status, SystemRole } from "@prisma/client";
import * as bcrypt from 'bcrypt';
import * as dotenv from 'dotenv';
import { BadRequestException } from "@nestjs/common";
dotenv.config();
const prisma = new PrismaClient();
async function main() {
    try {
        const e = process.env.ADMIN_EMAIL;
        const p = process.env.ADMIN_PASSWORD;
        const u = process.env.ADMIN_USERNAME;
        const a = process.env.ADMIN_AVATAR;
        const b = process.env.ADMIN_BIO;
        if (!e || !p || !u || !a || !b) {
            throw new BadRequestException('Giá trị chưa được định nghĩa');
        }
        const hashedPassword = await bcrypt.hash(p, 12);
        const admin = await prisma.user.upsert({
            where: { email: e },
            update: {},
            create: {
                email: e,
                password: hashedPassword,
                username: u,
                role: SystemRole.SUPER_ADMIN,
                avatar: a,
                status: Status.ONLINE,
                bio: b
            }
        });
        console.log({ admin });
    } catch (er) {
        console.log(er);
    } finally {
        await prisma.$disconnect();
    }
}
main();