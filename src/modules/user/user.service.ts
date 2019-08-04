import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { getMongoManager } from 'typeorm';
import { MongoRepository } from 'typeorm';
import * as jwt from 'jsonwebtoken';
import { ApolloError } from 'apollo-server-core';
import {
  User,
  CreateUserInput,
  LoginResponse,
  LoginUserInput,
  UpdateUserInput,
} from './user.entity';

@Injectable()
export class UserService {
  constructor(
    @InjectRepository(User)
    private readonly userRepository: MongoRepository<User>,
  ) {}

  async findAll(offset: number, limit: number): Promise<User[]> {
    // const message = 'No Content'
    // const code = '204'
    // const additionalProperties = {}

    const users = await this.userRepository.find({
      where: { username: { $ne: 'admin' } },
      order: { createdAt: 'DESC' },
      skip: offset,
      take: limit,
      cache: true,
    });

    return users;
  }

  async findById(_id: string): Promise<User> {
    try {
      const message = 'Not Found: User';
      const code = '404';
      const additionalProperties = {};

      const user = await this.userRepository.findOne({ _id });

      if (!user) {
        throw new ApolloError(message, code, additionalProperties);
      }

      return user;
    } catch (error) {
      throw new ApolloError(error, '500', {});
    }
  }

  async create(input: CreateUserInput): Promise<User> {
    const message = 'Conflict: Username';
    const code = '409';
    const additionalProperties = {};

    const { username, password, fullName } = input;

    const existedUser = await this.userRepository.findOne({ username });

    if (existedUser) {
      throw new ApolloError(message, code, additionalProperties);
    }

    const user = new User();
    user.username = username;
    user.password = password;
    user.fullName = fullName;

    return await this.userRepository.save(user);
  }

  async update(_id: string, input: UpdateUserInput): Promise<boolean> {
    const message = 'Not Found: User';
    const code = '404';
    const additionalProperties = {};

    // const { fullName, siteId, permissions } = input
    const { password, fullName } = input;

    const user = await this.userRepository.findOne({ _id });

    if (!user) {
      throw new ApolloError(message, code, additionalProperties);
    }

    user.password = password;
    user.fullName = fullName;

    return (await this.userRepository.save(user)) ? true : false;
  }

  async delete(_id: string): Promise<boolean> {
    try {
      const message = 'Not Found: User';
      const code = '404';
      const additionalProperties = {};

      const user = await this.userRepository.findOne({ _id });

      if (!user) {
        throw new ApolloError(message, code, additionalProperties);
      }

      user.isActive = false;

      return (await this.userRepository.save(user)) ? true : false;
    } catch (error) {
      throw new ApolloError(error, '500', {});
    }
  }

  async deleteAll(): Promise<boolean> {
    try {
      return (await this.userRepository.deleteMany({
        username: { $ne: 'admin' },
      }))
        ? true
        : false;
    } catch (error) {
      throw new ApolloError(error, '500', {});
    }
  }

  async login(input: LoginUserInput): Promise<LoginResponse> {
    const message = 'Unauthorized';
    const code = '401';
    const additionalProperties = {};

    const { username, password } = input;

    const user = await this.userRepository.findOne({ username });

    if (!user || !(await user.matchesPassword(password))) {
      throw new ApolloError(message, code, additionalProperties);
    }

    const activeMessage = 'Gone';
    const activeCode = '404';
    const activeAdditionalProperties = {};

    if (!user.isActive) {
      throw new ApolloError(
        activeMessage,
        activeCode,
        activeAdditionalProperties,
      );
    }

    const lockedMessage = 'Locked';
    const lockedCode = '423';
    const lockedAdditionalProperties = {};

    if (user.isLocked) {
      throw new ApolloError(
        lockedMessage,
        lockedCode,
        lockedAdditionalProperties,
      );
    }

    const token = jwt.sign(
      {
        issuer: 'http://lunchapp2.dev.io',
        subject: user._id,
        audience: user.username,
      },
      process.env.SECRET_KEY,
      {
        expiresIn: '30d',
      },
    );

    return { token };
  }

  async findOneByToken(token: string) {
    try {
      const message = 'Invalid Token';
      const code = '498';
      const additionalProperties = {};

      let currentUser;

      try {
        let decodeToken;

        decodeToken = await jwt.verify(token, process.env.SECRET_KEY);

        currentUser = await this.userRepository.findOne({
          _id: decodeToken.subject,
        });
      } catch (error) {
        throw new ApolloError(message, code, additionalProperties);
      }

      return currentUser;
    } catch (error) {
      throw new ApolloError(error, '500', {});
    }
  }

  async lockAndUnlockUser(_id: string): Promise<boolean> {
    try {
      const message = 'Not Found: User';
      const code = '404';
      const additionalProperties = {};

      const user = await this.userRepository.findOne({ _id });

      if (!user) {
        throw new ApolloError(message, code, additionalProperties);
      }

      user.isLocked = !user.isLocked;

      return (await this.userRepository.save(user)) ? true : false;
    } catch (error) {
      throw new ApolloError(error, '500', {});
    }
  }
}
