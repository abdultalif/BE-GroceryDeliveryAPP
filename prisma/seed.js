import { PrismaClient } from "@prisma/client";
import { encript } from "../src/utils/bcrypt.js"
import { v4 as user_id } from 'uuid';

const prisma = new PrismaClient();

async function main() {
    await prisma.user.create({
        data: {
            id: user_id(),
            email: "abdultalif85@gmail.com",
            password: await encript("12345"),
            name: "Abdul Talif Parinduri",
            no_telp: "089512345678",
            image: "default.png",

        }
    })
}

main()
    .catch((e) => {
        throw e;
    })
    .finally(async () => {
        await prisma.$disconnect();
    });
