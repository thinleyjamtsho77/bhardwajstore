import "dotenv/config";
import Stripe from "stripe";


if (!process.env.STRIPE_SECRET_KEY) {
  throw new Error("STRIPE_SECRET_KEY is not set. Add it to server/.env");
}

export default new Stripe(process.env.STRIPE_SECRET_KEY);