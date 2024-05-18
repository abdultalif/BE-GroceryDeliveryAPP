import supertest from "supertest";
import { prisma } from "../src/app/database.js";
import { app } from "../src/app/web.js";
import { encript } from "../src/utils/bcrypt.js";


describe('POST /api-public/register', () => {

    // beforeEach(async () => {
    //     await prisma.user.delete({
    //         where: { email: "abdultalif85@gmail.com" }
    //     });
    // })
    afterEach(async () => {
        await prisma.user.deleteMany({
            where: { email: "abdultalif85@gmail.com" }
        });
    })

    it('should can register new user', async () => {
        const result = await supertest(app)
            .post('/api-public/register')
            .send({
                name: "Abdul Talif",
                email: "abdultalif85@gmail.com",
                no_telp: "081234567890",
                password: "12345678",
                confirmPassword: "12345678"
            });

        expect(result.status).toBe(201);
        expect(result.body.message).toBe("User created, please check your email");
        expect(result.body.data.name).toBe("Abdul Talif");
        expect(result.body.data.email).toBe("abdultalif85@gmail.com");
        expect(result.body.data.no_telp).toBe("081234567890");
        expect(result.body.data.password).toBeUndefined();
    });


    it('should return 400 if request is invalid', async () => {
        const result = await supertest(app)
            .post('/api-public/register')
            .send({
                name: "",
                email: "",
                no_telp: "",
                password: "",
                confirmPassword: ""
            });

        expect(result.status).toBe(400);
        expect(result.body.errors).toBeDefined();
    });

    it('should return 422 if email registered but not activated and expired', async () => {
        let result = await supertest(app)
            .post('/api-public/register')
            .send({
                name: "Abdul Talif",
                email: "abdultalif85@gmail.com",
                no_telp: "081234567890",
                password: "12345678",
                confirmPassword: "12345678"
            });

        expect(result.status).toBe(201);
        expect(result.body.message).toBe("User created, please check your email");
        expect(result.body.data.name).toBe("Abdul Talif");
        expect(result.body.data.email).toBe("abdultalif85@gmail.com");
        expect(result.body.data.no_telp).toBe("081234567890");
        expect(result.body.data.password).toBeUndefined();

        await prisma.user.update({
            where: { email: "abdultalif85@gmail.com" },
            data: { expireTime: new Date(Date.now() - 10000) }
        })

        result = await supertest(app)
            .post('/api-public/register')
            .send({
                name: "Abdul Talif",
                email: "abdultalif85@gmail.com",
                no_telp: "081234567890",
                password: "12345678",
                confirmPassword: "12345678"
            });

        expect(result.status).toBe(422)
        expect(result.body.errors).toBe("Email has been registered and please check your email");
    });


    it('should return 409 if email is already registered and active', async () => {
        await prisma.user.create({
            data: {
                name: "Abdul Talif",
                email: "abdultalif85@gmail.com",
                no_telp: "081234567890",
                password: await encript("12345678"),
                image: "default.png",
                isActive: true,
                expireTime: new Date(Date.now() + 3600000)
            }
        });

        const result = await supertest(app)
            .post('/api-public/register')
            .send({
                name: "Abdul Talif",
                email: "abdultalif85@gmail.com",
                no_telp: "081234567890",
                password: "12345678",
                confirmPassword: "12345678"
            })

        expect(result.status).toBe(409);
        expect(result.body.errors).toBe("Email has been registered and is active")
    });
});




describe('POST /api-public/login', () => {
    beforeEach(async () => {
        await prisma.user.create({
            data: {
                name: "Abdul Talif",
                email: "abdultalif85@gmail.com",
                no_telp: "081234567890",
                password: await encript("12345678"),
                image: "default.png",
                isActive: true,
                expireTime: new Date(Date.now() + 3600000)
            }
        })
    })

    afterEach(async () => {
        await prisma.user.delete({
            where: {
                email: "abdultalif85@gmail.com"
            }
        })
    })


    it('should login successfully with valid credentials', async () => {
        const result = await supertest(app)
            .post('/api-public/login')
            .send({
                email: "abdultalif85@gmail.com",
                password: "12345678"
            });

        expect(result.status).toBe(200);
        expect(result.body.message).toBe("User logged in successfully: abdultalif85@gmail.com");
        expect(result.body.data.email).toBe("abdultalif85@gmail.com");
        expect(result.body.data.token).toBeDefined();
    });

    it('should return 401 if email is not found', async () => {
        const result = await supertest(app)
            .post('/api-public/login')
            .send({
                email: "salah@gmail.com",
                password: "12345678"
            });

        expect(result.status).toBe(401);
        expect(result.body.errors).toBe("Email or Password Wrong");
    });

    it('should return 401 if password is not found', async () => {
        const result = await supertest(app)
            .post('/api-public/login')
            .send({
                email: "abdultalif85@gmail.com",
                password: "salah"
            });

        expect(result.status).toBe(401);
        expect(result.body.errors).toBe("Email or Password Wrong");
    });

    it('should return 400 if request is invalid', async () => {
        const result = await supertest(app)
            .post('/api-public/login')
            .send({
                email: "",
                password: ""
            });

        expect(result.status).toBe(400);
        expect(result.body.errors).toBeDefined();
    });

});