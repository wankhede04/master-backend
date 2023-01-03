declare namespace Express {
  export interface Request {
    user: import('../model/Users').Users;
  }
}
