import { Controller, Get } from '@nestjs/common';
import { UsersService } from './users.service';

@Controller({ path: 'users', version: 'v1' })
export class UsersController {
  constructor(private readonly usersService: UsersService) {}
  /**
   * Get all users
   * @remarks This operation allows you to create a new user.
   * @throws {500} Internal Server Error - Something went wrong
   * @throws {400} Bad Request - Invalid request parameters
   * @returns {string} List of users
   */
  @Get()
  getUsers() {
    return 'users';
  }
}
