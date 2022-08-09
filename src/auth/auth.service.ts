import { HttpException, HttpStatus, Injectable } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import * as bcrypt from 'bcrypt';
import { PrismaService } from 'src/prisma/prisma.service';
import { RegisterDto } from './dto';
import { EXIST_EMAIL_MESSAGE, WRONG_CREDENTIAL } from 'src/constants';

@Injectable()
export class AuthService {
  constructor(private prisma: PrismaService, private jwtService: JwtService) {}

  sign(password: string) {
    return bcrypt.hashSync(password, 10);
  }

  async signIn(email: string, password: string) {
    const user = await this.prisma.user.findUnique({
      where: {
        email,
      },
    });
    if (!user) {
      throw new HttpException(WRONG_CREDENTIAL, HttpStatus.BAD_REQUEST);
    }

    const isMatchPassword = await bcrypt.compare(password, user.password);

    if (!isMatchPassword) {
      throw new HttpException(WRONG_CREDENTIAL, HttpStatus.BAD_REQUEST);
    }

    return {
      jwt_token: this.jwtService.sign(user),
      user,
    };
  }

  async signUp(signUpDto: RegisterDto) {
    const existedUser = await this.prisma.user.findUnique({
      where: {
        email: signUpDto.email,
      },
    });

    if (existedUser) {
      throw new HttpException(EXIST_EMAIL_MESSAGE, HttpStatus.BAD_REQUEST);
    }

    const user = await this.prisma.user.create({
      data: {
        ...signUpDto,
        password: this.sign(signUpDto.password),
      },
    });

    return {
      jwt_token: this.jwtService.sign(user),
      user,
    };
  }
}
