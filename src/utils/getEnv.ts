class EnvHelper {
    public getEnv<T = string>(token: string): T {
        const value = process.env[token];
        if (!value) {
            console.log(`${token} not found in environment variables`.red);
            process.exit(1);
        }
        return value as T;
    }
}

const envHelper = new EnvHelper();
export default envHelper;
