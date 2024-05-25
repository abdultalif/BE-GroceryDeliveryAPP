import { prisma } from '../utils/database.js'
import logger from '../utils/logging.js'
import { createCartValidation } from '../validation/cart-validation.js';
import { validate } from '../validation/validation.js';

const createCart = async (req, res, next) => {
    try {

        const { productId, quantity: newQuantity, total } = validate(createCartValidation, req.body);

        let existingCart = await prisma.cart.findFirst({
            where: {
                productId: productId,
                userId: req.user.id
            },
            include: {
                Product: {
                    select: {
                        id: true,
                        price: true
                    }
                }
            }
        })

        if (existingCart) {
            const updatedTotal = existingCart.total + (newQuantity * existingCart.Product.price)
            const updatedquantity = existingCart.quantity + newQuantity;

            existingCart = await prisma.cart.update({
                where: { id: existingCart.id },
                data: {
                    quantity: updatedquantity,
                    total: updatedTotal
                }
            })
        } else {
            existingCart = await prisma.cart.create({
                data: {
                    productId,
                    total,
                    quantity: newQuantity,
                    userId: req.user.id
                }
            });
        }

        res.status(201).json({
            message: "Created Cart successfuly",
            data: "berhasil"
        })


    } catch (error) {
        logger.error(`Error in create cart function: ${error.message}`)
        logger.error(error.stack)
        next(error)
    }
}

const getCarts = async (req, res, next) => {
    try {
        const carts = await prisma.cart.findMany({
            where: { userId: req.user.id },
            select: {
                id: true,
                quantity: true,
                total: true,
                Product: {
                    select: {
                        id: true,
                        name: true,
                        image: true,
                        stok: true,
                        price: true,
                        category: true,
                        description: true
                    }
                },
                user: {
                    select: {
                        id: true,
                        email: true,
                        name: true,
                        image: true,
                        no_telp: true
                    }
                },
                createdAt: true,
                updatedAt: true,
            },

        })
        res.status(200).json({
            message: "Get Carts Successfuly",
            data: carts
        });
        logger.info("Get Carts Successfuly")
    } catch (error) {
        logger.error(`Erro in get carts function: ${error.message}`)
        logger.error(error.stack)
        next(error)
    }
}



export default {
    createCart,
    getCarts
}
