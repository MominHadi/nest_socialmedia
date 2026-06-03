import { CanActivate, Injectable, ExecutionContext, UnauthorizedException } from "@nestjs/common";
import { JwtService } from "@nestjs/jwt";
// jwt-auth.guard.ts
@Injectable()
export class JwtAuthGuard implements CanActivate {
    constructor(
        private readonly jwtService: JwtService) { }
    canActivate(context: ExecutionContext): boolean {
        const request = context.switchToHttp().getRequest();
        const token = request.headers['x-access-token'];

        if (!token) throw new UnauthorizedException("No token");

        const secret = process.env.JWT_SECRET||"MY_SECRET_HASH";
        if (!secret) throw new Error("JWT_SECRET not configured");

        try {
            const decoded = this.jwtService.verify(token, {secret}); // ✅ now it's string, not string | undefined
            request.user = decoded;
            return true;
        } catch (err) {
            console.log(err)
            throw new UnauthorizedException("Invalid token");
        }
    }
}