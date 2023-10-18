import { Injectable, UnauthorizedException } from '@nestjs/common';
import { CreateUserDto } from './dto/create-user.dto';
import { UsersRepository } from './users.repository';
import * as bcrypt from 'bcryptjs';
import { GetUserDto } from './dto/get-user.dto';
import { Role, User } from '@app/common';

@Injectable()
export class UsersService {
  constructor(private readonly usersRepository: UsersRepository) {}

  async createUser(createUserDto: CreateUserDto) {
    const userExists = await this.usersRepository.findOne(
      {
        email: createUserDto.email,
      },
      null,
      false,
    );

    if (userExists) {
      throw new UnauthorizedException('User already exists');
    }

    const user = new User({
      ...createUserDto,
      password: await bcrypt.hash(createUserDto.password, 10),
      roles: createUserDto.roles?.map((roleDto) => new Role(roleDto)),
    });

    return await this.usersRepository.create(user);
  }

  async verifyUser(email: string, password: string): Promise<User> {
    const user = await this.usersRepository.findOne({ email });
    const passwordValid = await bcrypt.compare(password, user.password);

    if (!passwordValid) {
      throw new UnauthorizedException('Invalid credentials');
    }

    return user;
  }

  async getUser(getUserDto: GetUserDto) {
    return this.usersRepository.findOne({ id: getUserDto.id }, { roles: true });
  }
}
