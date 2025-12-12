import express from "express";
import morgan from "morgan";
const app = express();
import cookieParser from "cookie-parser";
import session from "express-session";
import passport from "../src/config/passport.js";

app.use(express.json());

import authRoutes from "../src/route/auth.route.js";
import companyRoutes from "../src/route/company.route.js";
import userRoutes from "../src/route/user.route.js";
import categoriesRoutes from "../src/route/categories.route.js";
import inquiriesRoutes from "../src/route/inquiries.route.js";
import reviewsRoutes from "../src/route/review.route.js";
import productsRoutes from "../src/route/products.route.js";

app.use(cookieParser());
const NODE_ENV = process.env.NODE_ENV;

app.use(
  session({
    secret: process.env.SESSION_SECRET, // Add this to your .env
    resave: false,
    saveUninitialized: false,
    cookie: {
      secure: process.env.NODE_ENV === "production",
      maxAge: 24 * 60 * 60 * 1000, // 24 hours
    },
  })
);

app.use(passport.initialize());
app.use(passport.session());

const IS_PRODUCTION = NODE_ENV === "production";
console.log("is production", IS_PRODUCTION);

if (!IS_PRODUCTION) {
  app.use(morgan("dev"));
} else {
  // Production logging with more details
  app.use(
    morgan("combined", {
      skip: (req, res) => res.statusCode < 400, // Only log errors in production
    })
  );
}

app.use("/auth", authRoutes);
app.use("/companies", companyRoutes);
app.use("/user", userRoutes);
app.use("/categories", categoriesRoutes);
app.use("/products", productsRoutes);
app.use("/inquiries", inquiriesRoutes);
app.use("/reviews", reviewsRoutes);

export default app;
