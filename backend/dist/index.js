"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.sessionStore = void 0;
const express = require("express");
const data_source_1 = require("./data.source");
const cookieParser = require("cookie-parser");
const auth_routes_1 = __importDefault(require("./routes/auth.routes"));
const product_routes_1 = __importDefault(require("./routes/product.routes"));
const cors = require("cors");
const admin_routes_1 = __importDefault(require("./routes/admin.routes"));
const cart_routes_1 = __importDefault(require("./routes/cart.routes"));
const admin_service_1 = require("./services/admin.service");
const user_routes_1 = __importDefault(require("./routes/user.routes"));
const path = require("path");
const taxonomy_routes_1 = __importDefault(require("./routes/taxonomy.routes"));
exports.sessionStore = new Map();
const app = express();
// app.use('/ProductImages', express.static(path.join(__dirname, '../ProductImages')));
app.use("/ProductImages", express.static(path.join(process.cwd(), "ProductImages")));
app.use(cors({
    origin: "http://localhost:4200",
    credentials: true,
}));
app.use(express.json());
app.use(cookieParser());
app.use("/api/auth", auth_routes_1.default);
app.use("/api/products", product_routes_1.default);
app.use("/api/admin", admin_routes_1.default);
app.use("/api/cart", cart_routes_1.default);
app.use("/api/user", user_routes_1.default);
app.use('/api/taxonomy', taxonomy_routes_1.default);
// app.use("/auth", authRoutes);
// app.use("/events", eventRoutes);
// app.use(errorHandler);
const startServer = async () => {
    try {
        await data_source_1.AppDataSource.initialize();
        console.log("Data Source initialized!");
        await (0, admin_service_1.ensureAdminExists)();
        // await seedTaxonomy();
        app.listen(4000, () => console.log("Server running on http://localhost:4000"));
    }
    catch (err) {
        console.error("Error during Data Source initialization", err);
        // process.exit(1);
    }
};
startServer();
