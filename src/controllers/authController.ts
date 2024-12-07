import { Controller, Post, Body, Route, Tags, Response } from "tsoa";
import { AuthService } from "../services/authService";
import { AuthCredentials, AuthResponse } from "../types/authInterfaces";

@Route("auth")
@Tags("Auth")
export class AuthController extends Controller {
  private authService: AuthService;

  constructor() {
    super();
    this.authService = new AuthService();
  }

  @Post("/login")
  @Response<AuthResponse>(200, "Success")
  public async login(
    @Body() credentials: AuthCredentials
  ): Promise<AuthResponse> {
    return this.authService.login(credentials);
  }
}
