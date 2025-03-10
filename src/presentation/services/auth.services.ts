import { bcriptoAdapter, JwtAdapter } from "../../config";
import { UserModel } from "../../data";
import {
  CustomError,
  LoginUserDto,
  RegisterUserDto,
  UserEntity,
} from "../../domain";

export class AuthService {
  constructor() {}

  public async registerUser(registerUserDto: RegisterUserDto) {
    const existUser = await UserModel.findOne({ email: registerUserDto.email });
    if (existUser) throw CustomError.badRequest("Email already exist");

    try {
      const user = new UserModel(registerUserDto);

      // encriptar la contraseña
      user.password = bcriptoAdapter.hash(registerUserDto.password);

      await user.save();
      // JWT <---- para mantener la autenticacion

      // Email de confirmación
      const { password, ...userEntity } = UserEntity.fromObject(user);

      return { ...userEntity, token: "ABC" };
    } catch (error) {
      throw CustomError.internalServer(`${error}`);
    }
  }

  public async loginUser(loginUserDto: LoginUserDto) {
    const existUser = await UserModel.findOne({ email: loginUserDto.email });

    if (!existUser)
      throw CustomError.badRequest(`Doesn't exist ${loginUserDto.email}`);

    const emailCompared = await bcriptoAdapter.compare(
      loginUserDto.password,
      existUser.password,
    );

    if (!emailCompared) throw CustomError.badRequest("Password is not valid");

    const { password, ...userEntity } = UserEntity.fromObject(existUser);

    const token = await JwtAdapter.generateToken({
      id: existUser.id,
      email: existUser.email,
    });

    if (!token) throw CustomError.internalServer("Error while creating JWT");

    return { user: userEntity, token: token };
  }
}
