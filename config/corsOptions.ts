import allowedOrigins from "./allowedOrigins";

const corsOptions = {
	origin: (origin: string | undefined, callback: Function): void => {
		if (!origin || allowedOrigins.indexOf(origin) !== -1) {
			callback(null, true);
		} else {
			callback(new Error("Not alloed by CORS"));
		}
	},
	credentials: true,
	optionsSuccessStatus: 200,
};

export default corsOptions;
