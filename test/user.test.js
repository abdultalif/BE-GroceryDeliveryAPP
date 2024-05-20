import supertest from "supertest";
import { prisma } from "../src/utils/database.js";
import { app } from "../src/utils/web.js";
import { encript } from "../src/utils/bcrypt.js";
import { sendMail, sendMailForgotPassword } from "../src/utils/sendMail.js";

jest.mock('../src/utils/sendMail.js', () => ({
    sendMailForgotPassword: jest.fn(),
    sendMail: jest.fn(),
}));

describe('POST /api-public/register', () => {

    afterEach(async () => {
        await prisma.user.deleteMany({
            where: { email: "abdultalif75@gmail.com" }
        });
    })

    it('should can register new user', async () => {

        sendMail.mockResolvedValue(true);
        const result = await supertest(app)
            .post('/api-public/register')
            .send({
                name: "Abdul Talif",
                email: "abdultalif75@gmail.com",
                no_telp: "081234567890",
                password: "12345678",
                confirmPassword: "12345678"
            });

        expect(result.status).toBe(201);
        expect(result.body.message).toBe("User created, please check your email");
        expect(result.body.data.name).toBe("Abdul Talif");
        expect(result.body.data.email).toBe("abdultalif75@gmail.com");
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


    it('should return 422 if email is already registered and inactive but not expired', async () => {
        await prisma.user.create({
            data: {
                name: "Abdul Talif",
                email: "abdultalif75@gmail.com",
                no_telp: "081234567890",
                password: await encript("12345678"),
                image: "default.jpg",
                isActive: false,
                expireTime: new Date(Date.now() + (60000 * 60))
            }
        });

        const result = await supertest(app)
            .post('/api-public/register')
            .send({
                name: "Abdul Talif",
                email: "abdultalif75@gmail.com",
                no_telp: "081234567890",
                password: "12345678",
                confirmPassword: "12345678"
            });

        expect(result.status).toBe(422);
        expect(result.body.errors).toBe("Email has been registered and please check your email");
    });


    it('should return 409 if email is already registered and active', async () => {
        await prisma.user.create({
            data: {
                name: "Abdul Talif",
                email: "abdultalif75@gmail.com",
                no_telp: "081234567890",
                password: await encript("12345678"),
                image: "default.jpg",
                isActive: true,
                expireTime: new Date(Date.now() + 3600000)
            }
        });

        const result = await supertest(app)
            .post('/api-public/register')
            .send({
                name: "Abdul Talif",
                email: "abdultalif75@gmail.com",
                no_telp: "081234567890",
                password: "12345678",
                confirmPassword: "12345678"
            })

        expect(result.status).toBe(409);
        expect(result.body.errors).toBe("Email has been registered and is active")
    });


    it('should return 500 if sendMails Fails', async () => {

        sendMail.mockResolvedValue(false);

        const result = await supertest(app)
            .post('/api-public/register')
            .send({
                name: "Abdul Talif",
                email: "abdultalif75@gmail.com",
                no_telp: "081234567890",
                password: "12345678",
                confirmPassword: "12345678"
            });

        expect(result.status).toBe(500);
        expect(result.body.errors).toBe("Failed to send email");
    });
});


describe('GET /api-public/set-activate/:email/:userId', () => {

    beforeAll(async () => {
        await prisma.user.create({
            data: {
                id: "18b799c8-05b3-4655-b7b3-1f52f4d5763d",
                name: "Abdul Talif",
                email: "abdultalif75@gmail.com",
                password: await encript("12345678"),
                no_telp: "081234567890",
                image: "default.jpg",
                isActive: false,
                expireTime: new Date(Date.now() + (60000 * 60))
            }
        });
    });

    afterAll(async () => {
        await prisma.user.deleteMany({
            where: { email: "abdultalif75@gmail.com" }
        });
    });


    it('should activate the user if valid userId and email are provided', async () => {
        const result = await supertest(app)
            .get('/api-public/set-activate/abdultalif75@gmail.com/18b799c8-05b3-4655-b7b3-1f52f4d5763d');

        expect(result.status).toBe(200);
        expect(result.body.message).toBe("User abdultalif75@gmail.com Activated");

        const user = await prisma.user.findFirst({
            where: { email: "abdultalif75@gmail.com" }
        });
        expect(user.isActive).toBe(true);
        expect(user.expireTime).toBeNull();
    });

    it('should return 404 if the user is not found or already active', async () => {
        const result = await supertest(app)
            .get('/api-public/set-activate/wrong@gmail.com/userId-not-found');

        expect(result.status).toBe(404);
        expect(result.body.errors).toBe("User not found");
    });

});




describe('POST /api-public/login', () => {
    beforeEach(async () => {
        await prisma.user.create({
            data: {
                name: "Abdul Talif",
                email: "abdultalif75@gmail.com",
                no_telp: "081234567890",
                password: await encript("12345678"),
                image: "default.jpg",
                isActive: true,
            }
        })
    })

    afterEach(async () => {
        await prisma.user.delete({
            where: {
                email: "abdultalif75@gmail.com"
            }
        })
    })


    it('should login successfully with valid credentials', async () => {
        const result = await supertest(app)
            .post('/api-public/login')
            .send({
                email: "abdultalif75@gmail.com",
                password: "12345678"
            });

        expect(result.status).toBe(200);
        expect(result.body.message).toBe("User logged in successfully: abdultalif75@gmail.com");
        expect(result.body.data.email).toBe("abdultalif75@gmail.com");
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
                email: "abdultalif75@gmail.com",
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

    it('should return 403 if user is not active', async () => {

        await prisma.user.update({
            where: { email: "abdultalif75@gmail.com" },
            data: { isActive: false }
        });

        const result = await supertest(app)
            .post('/api-public/login')
            .send({
                email: "abdultalif75@gmail.com",
                password: "12345678"
            })

        expect(result.status).toBe(403);
        expect(result.body.errors).toBe("User not active")

    });

});



describe('POST api/logout', () => {

    beforeEach(async () => {
        await prisma.user.create({
            data: {
                name: "Abdul Talif",
                email: "abdultalif75@gmail.com",
                no_telp: "081234567890",
                password: await encript("12345678"),
                image: "default.jpg",
                isActive: true,
                expireTime: new Date(Date.now() + 3600000),
                token: "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpZCI6ImU0NGVkZDA5LWI3OWEtNDMxYS1iZGI0LTQwMjc4YmMwYThlZiIsImVtYWlsIjoiYWJkdWx0YWxpZjc1QGdtYWlsLmNvbSIsIm5hbWUiOiJBYmR1bCBUYWxpZiIsIm5vX3RlbHAiOiIwODEyMzQ1Njc4OTAiLCJpbWFnZSI6ImRlZmF1bHQucG5nIiwiaWF0IjoxNzE2MDMwMDIyfQ.F-hWnbLoeDByT5Cgd7-YzErYQZ_y5JupASpg266s-a8"
            }
        })
    })

    afterEach(async () => {
        await prisma.user.delete({
            where: {
                email: "abdultalif75@gmail.com"
            }
        })
    });


    it('should logout successfully', async () => {
        const result = await supertest(app)
            .post('/api/logout')
            .set('Authorization', 'Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpZCI6ImU0NGVkZDA5LWI3OWEtNDMxYS1iZGI0LTQwMjc4YmMwYThlZiIsImVtYWlsIjoiYWJkdWx0YWxpZjc1QGdtYWlsLmNvbSIsIm5hbWUiOiJBYmR1bCBUYWxpZiIsIm5vX3RlbHAiOiIwODEyMzQ1Njc4OTAiLCJpbWFnZSI6ImRlZmF1bHQucG5nIiwiaWF0IjoxNzE2MDMwMDIyfQ.F-hWnbLoeDByT5Cgd7-YzErYQZ_y5JupASpg266s-a8')

        expect(result.status).toBe(200);
        expect(result.body.message).toBe("User logged out successfully: abdultalif75@gmail.com");
        expect(result.body.data).toBeNull();

        const updateUser = await prisma.user.findFirst({
            where: { email: "abdultalif75@gmail.com" }
        });

        expect(updateUser.token).toBeNull();
    });


    it('should reject logout if token is invalid', async () => {
        const result = await supertest(app)
            .post('/api/logout')
            .set('Authorization', 'token-invalid')

        expect(result.status).toBe(401);
        expect(result.body.errors).toBe("Unauthorized");
    });

});


describe('POST /api-public/forgot-password', () => {

    beforeAll(async () => {
        await prisma.user.create({
            data: {
                name: "Abdul Talif",
                email: "abdultalif75@gmail.com",
                no_telp: "081234567890",
                password: await encript("12345678"),
                image: "default.jpg",
                isActive: true,
            }
        });
    });

    afterAll(async () => {
        await prisma.user.deleteMany({
            where: { email: "abdultalif75@gmail.com" }
        });
    });


    it('should return 404 if email is not exist', async () => {
        const result = await supertest(app)
            .post('/api-public/forgot-password')
            .send({
                email: "salah@gmail.com"
            })

        expect(result.status).toBe(404);
        expect(result.body.errors).toBe("Email not found");
    });


    it('should return 500 if sending email fails', async () => {

        // jika tidak menggunakan function tiruan dari mock ini digunakan 
        // jest.spyOn(sendMailForgotPassword, 'sendMailForgotPassword').mockImplementation(() => Promise.resolve(false))

        sendMailForgotPassword.mockResolvedValue(false);
        const result = await supertest(app)
            .post('/api-public/forgot-password')
            .send({ email: "abdultalif75@gmail.com" })

        expect(result.status).toBe(500);
        expect(result.body.errors).toBe("Failed to send email");

        // sendMailForgotPassword.sendMailForgotPassword.mockRestore();
    });


    it('should return 400 if request is invalid', async () => {
        const result = await supertest(app)
            .post('/api-public/forgot-password')
            .send({
                email: ""
            });

        expect(result.status).toBe(400);
        expect(result.body.errors).toBeDefined();
    });

    it('should return 200 if request is valid', async () => {

        sendMailForgotPassword.mockResolvedValue(true);

        const result = await supertest(app)
            .post('/api-public/forgot-password')
            .send({
                email: "abdultalif75@gmail.com"
            });

        expect(result.status).toBe(200);
        expect(result.body.message).toBe("Please check your email: abdultalif75@gmail.com");
        expect(result.body.data).toBeNull();

        const user = await prisma.user.findFirst({
            where: { email: "abdultalif75@gmail.com" },
            select: { tokenReset: true }
        });

        expect(user.tokenReset).toBeTruthy()
    });

});



describe('GET api-public/valid-token/:token', () => {

    beforeEach(async () => {
        await prisma.user.create({
            data: {
                name: "Abdul Talif",
                email: "abdultalif75@gmail.com",
                no_telp: "081234567890",
                password: await encript("12345678"),
                image: "default.jpg",
                isActive: true,
                tokenReset: "token-valid123"
            }
        });
    });

    afterEach(async () => {
        await prisma.user.delete({
            where: {
                email: "abdultalif75@gmail.com"
            }
        })
    });


    it('should return 200 if token is valid', async () => {
        const result = await supertest(app)
            .get('/api-public/valid-token/token-valid123')

        expect(result.status).toBe(200);
        expect(result.body.data).toBeNull();
    });


    it('should return 404 if token is invalid', async () => {
        const result = await supertest(app)
            .get('/api-public/valid-token/token-invalid')

        expect(result.status).toBe(404);
        expect(result.body.errors).toBe("Invalid Token Reset Password");
    });


    it('should return 401 if token is expired', async () => {
        const expiredDate = new Date(Date.now() - (60000 * 30));
        await prisma.user.update({
            data: { updatedAt: expiredDate },
            where: { email: "abdultalif75@gmail.com" }
        })

        const result = await supertest(app)
            .get('/api-public/valid-token/token-valid123')

        expect(result.status).toBe(401);
        expect(result.body.errors).toBe("Expired Token Reset Password");
    });

});




describe('POST api-public/reset-password/:token', () => {
    beforeEach(async () => {
        await prisma.user.create({
            data: {
                name: "Abdul Talif",
                email: "abdultalif75@gmail.com",
                no_telp: "081234567890",
                password: await encript("12345678"),
                image: "default.jpg",
                isActive: true,
                tokenReset: "token-valid123"
            }
        });
    });

    afterEach(async () => {
        await prisma.user.delete({
            where: {
                email: "abdultalif75@gmail.com"
            }
        })
    });


    it('should return 400 if request is invalid', async () => {
        const result = await supertest(app)
            .patch('/api-public/reset-password/token-valid123')
            .send({
                newPassword: "",
                confirmPassword: ""
            });

        expect(result.status).toBe(400);
        expect(result.body.errors).toBeDefined();
    });

    it('should return 404 if token is invalid or expired', async () => {
        const result = await supertest(app)
            .patch('/api-public/reset-password/token-invalid')
            .send({
                newPassword: "12345678",
                confirmPassword: "12345678"
            });

        expect(result.status).toBe(404);
        expect(result.body.errors).toBe("Token invalid or token expired");
    });

    it('should return 200 if token is valid and password is changed', async () => {
        const result = await supertest(app)
            .patch('/api-public/reset-password/token-valid123')
            .send({
                newPassword: "12345678",
                confirmPassword: "12345678"
            });

        expect(result.status).toBe(200);
        expect(result.body.message).toBe("Thank you for resetting your password!");
        expect(result.body.data).toBeNull();
    });

});