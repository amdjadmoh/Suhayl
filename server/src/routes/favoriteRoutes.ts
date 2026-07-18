import { Router } from "express"
import { authenticate } from "../middleware/auth"
import { validate } from "../middleware/validate"
import { createFavoriteSchema } from "../validators/favoriteValidator"
import { getFavorites, addFavorite, removeFavorite } from "../controllers/favoriteController"

const favoriteRouter = Router()
favoriteRouter.get("/", authenticate, getFavorites)
favoriteRouter.post("/", authenticate, validate(createFavoriteSchema, "body"), addFavorite)
favoriteRouter.delete("/:type/:itemId", authenticate, removeFavorite)

export default favoriteRouter
