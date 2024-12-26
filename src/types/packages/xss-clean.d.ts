declare module 'xss-clean' {
    import { RequestHandler } from 'express';
    export const xssClean: () => RequestHandler;
    export default xssClean;
}
