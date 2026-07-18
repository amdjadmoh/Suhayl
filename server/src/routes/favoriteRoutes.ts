import { Router } from "express"
import { authenticate } from "../middleware/auth"
import { getFavorites, addFavorite, removeFavorite } from "../controllers/favoriteController"

const favoriteRouter = Router()
favoriteRouter.get("/", authenticate, getFavorites)
favoriteRouter.post("/", authenticate, addFavorite)
favoriteRouter.delete("/:type/:itemId", authenticate, removeFavorite)

export default favoriteRouter
