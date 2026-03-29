import app from "./app";
import { envVars } from "./app/config";

const PORT = Number(envVars.PORT) || 5000;

// Start the server
const bootstrap = () => {
    try {
        app.listen(PORT, () => {
            console.log(`Server is running on port  http://localhost:${PORT}`);
        });
    } catch (error) {
        console.error("Error starting the server: ", error);
    }
}
bootstrap();