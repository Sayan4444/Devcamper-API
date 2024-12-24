type ReturnType = 'string' | 'number';

export default function getEnv(token: string, returnType: ReturnType = 'string'): string | number | null {
    try {
        const decoded = process.env[token];
        if (!decoded) {
            return null;
        }

        if (returnType === 'number' && !isNaN(Number(decoded))) {
            return Number(decoded);
        } else if (returnType === 'string') {
            return decoded;
        } else {
            return null;
        }
    } catch (error) {
        return null;
    }
}
