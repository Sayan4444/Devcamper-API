class EnvHelper {
    private throwError(message: string): void {
        console.log(message.red);
        process.exit(1);
    }

    public getEnvStr(token: string): string {
        const decoded = process.env[token];
        if (!decoded) {
            this.throwError(`${token} not found in environment variables`);
        }
        return decoded!;
    }

    public getEnvNum(token: string): number {
        const decoded = process.env[token];
        if (!decoded) {
            this.throwError(`${token} not found in environment variables`);
        }
        const num = Number(decoded);
        if (isNaN(num)) {
            throw new Error(`Environment variable ${token} is not a valid number`);
        }
        return num;
    }
}

const envHelper = new EnvHelper();
export default envHelper;