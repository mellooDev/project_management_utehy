export class AuthModel {
  authToken: string;
  refreshToken: string;
  expiresIn: Date;

  setAuth(auth: AuthModel) {
    this.authToken = auth.authToken;
    this.refreshToken = auth.refreshToken;
    this.expiresIn = auth.expiresIn;
  }
}

export class AuthenModel {
  // code: string;
  // desc: string;
  token: Token;
  // id:number;
  // token: string;

}
export class Token{
  token: string;
  email: string;
  refreshToken: string;
  emailExist: boolean;
  sid: string;
  jwt_token: string;
}
