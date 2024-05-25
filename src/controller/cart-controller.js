import { ResponseError } from '../error/response-error.js';
import { prisma } from '../utils/database.js'
import logger from '../utils/logging.js'
import { createCartValidation, updateCartValidation } from '../validation/cart-validation.js';
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
                },
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
        } else {
            existingCart = await prisma.cart.create({
                data: {
                    productId,
                    total,
                    quantity: newQuantity,
                    userId: req.user.id
                },
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
            });
        }

        res.status(201).json({
            message: "Created Cart successfuly",
            data: existingCart
        })
        logger.info("Created Cart successfuly")


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
        logger.error(`Error in get carts function: ${error.message}`)
        logger.error(error.stack)
        next(error)
    }
}

const deleteCart = async (req, res, next) => {
    try {
        const { cartId } = req.params;
        const cartExist = await prisma.cart.findUnique({
            where: { id: cartId }
        });

        if (!cartExist) throw new ResponseError(404, "Cart not found");

        await prisma.cart.delete({
            where: { id: cartId }
        });
        res.status(200).json({
            message: "Delete cart successfuly",
            data: null
        })
        logger.info("Delete cart successfuly")

    } catch (error) {
        logger.error(`Error in delete cart function ${error.message}`)
        logger.error(error.stack)
        next(error)
    }
}


const updateCart = async (req, res, next) => {
    try {
        const cartExist = await prisma.cart.findUnique({ where: { id: req.params.cartId } });
        if (!cartExist) throw new ResponseError(404, "Cart not found");

        const update = await validate(updateCartValidation, req.body);
        const result = await prisma.cart.update({
            data: { ...update },
            where: { id: req.params.cartId },
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
        });

        res.status(200).json({
            message: "update cart successfuly",
            data: result
        })
        logger.info("update cart successfuly")
    } catch (error) {
        logger.error(`Error in update cart function: ${error.message}`);
        logger.error(error.stack);
        next(error);
    }
}



export default {
    createCart,
    getCarts,
    deleteCart,
    updateCart
}
