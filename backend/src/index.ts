import express = require("express");

import { AppDataSource } from "./data.source";
import cookieParser = require("cookie-parser");
import authRoutes from "./routes/auth.routes";
import productRoutes from "./routes/product.routes";
import cors = require("cors");

import adminRoutes from "./routes/admin.routes";
import cartRoutes from "./routes/cart.routes";
import { ensureAdminExists } from "./services/admin.service";
import userRoutes from "./routes/user.routes";
import path = require("path");
import taxonomyRoutes from "./routes/taxonomy.routes";

export const sessionStore = new Map<string, any>();
const app = express();

// app.use('/ProductImages', express.static(path.join(__dirname, '../ProductImages')));

app.use(
  "/ProductImages",
  express.static(path.join(process.cwd(), "ProductImages")),
);
app.use(
  cors({
    origin: "http://localhost:4200",
    credentials: true,
  }),
);

app.use(express.json());
app.use(cookieParser());

app.use("/api/auth", authRoutes);
app.use("/api/products", productRoutes);
app.use("/api/admin", adminRoutes);

app.use("/api/cart", cartRoutes);
app.use("/api/user", userRoutes);
app.use('/api/taxonomy', taxonomyRoutes);

// app.use("/auth", authRoutes);
// app.use("/events", eventRoutes);
// app.use(errorHandler);

const startServer = async () => {
  try {
    await AppDataSource.initialize();
    console.log("Data Source initialized!");

    await ensureAdminExists();
    // await seedTaxonomy();

    app.listen(4000, () =>
      console.log("Server running on http://localhost:4000"),
    );
  } catch (err) {
    console.error("Error during Data Source initialization", err);
    // process.exit(1);
  }
};

startServer();
