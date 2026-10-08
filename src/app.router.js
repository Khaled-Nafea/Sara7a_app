import connectDB from "./DB/connection.js";
import { authRouter,userRouter, messageRouter } from "./Modules/index.js";
import { badRequest, globalErrorHandler } from "./Utils/response/error.response.js";
import successResponse from "./Utils/response/success.response.js";

const bootstrap = async (app, express) => {
    app.use(express.json());
    await connectDB();
    app.get('/', (req, res) => {
        successResponse(res, 200, {}, `Welcome to the API`);
    });

    app.use(`/api/v1/auth`, authRouter);
    app.use(`/api/v1/user`, userRouter);
    app.use(`/api/v1/message`, messageRouter);

    app.all('/*splat', (_req, _res) => {
    throw badRequest("Not Found Route");
    });
    app.use(globalErrorHandler);
};

export default bootstrap;