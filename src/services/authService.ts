import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";
import User from "../models/User";
import { AuthCredentials, AuthResponse } from "../types/authInterfaces";

export class AuthService {
  private generateToken(userId: string): string {
    return jwt.sign({ id: userId }, process.env.JWT_SECRET!, {
      expiresIn: "1d",
    });
  }

  public async login(credentials: AuthCredentials): Promise<AuthResponse> {
    const { email, password } = credentials;

    const user = await User.findOne({ email });
    if (!user) {
      throw new Error("Invalid credentials");
    }

    const isValidPassword = await bcrypt.compare(password, user.password);
    if (!isValidPassword) {
      throw new Error("Invalid credentials");
    }

    return {
      success: true,
      data: {
        user: {
          id: user._id.toString(),
          email: user.email,
          name: user.name,
        },
        token: this.generateToken(user._id.toString()),
      },
    };
  }
}
