import jwt from "jsonwebtoken";
import { envs } from "./envs";

const jwt_seed = envs.JWT_SEED;

export class JwtAdapter {
  static async generateToken(payload: any, duration: number = 2) {
    return new Promise((resolve) => {
      jwt.sign(payload, jwt_seed, { expiresIn: duration }, (err, token) => {
        if (err) return resolve(null);
        return resolve(token);
      });
    });
  }

  static validateToken(token: string) {
    return null;
  }
}
