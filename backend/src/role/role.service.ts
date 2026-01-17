import {
  Injectable,
  NotFoundException,
  BadRequestException,
} from '@nestjs/common';
import { CreateRoleDto } from './dto/create-role.dto';
import { UpdateRoleDto } from './dto/update-role.dto';
import { PrismaService } from '../prisma/prisma.service';
import { Role } from './entities/role.entity';
import { encodeId, decodeId } from '../common/utils/secure.util';

@Injectable()
export class RoleService {
  constructor(private readonly prisma: PrismaService) { }

  private formatRoleResponse(role: Role) {
    return {
      role_id: encodeId(role.role_id),
      name: role.name,
      created_at: role.created_at,
      updated_at: role.updated_at,
    };
  }

  async create(createRoleDto: CreateRoleDto) {
    try {
      const existingRole = await this.prisma.role.findUnique({
        where: { name: createRoleDto.name },
      });

      if (existingRole) {
        throw new BadRequestException(`Role with name ${createRoleDto.name} already exists`);
      }
      const role = await this.prisma.role.create({ data: createRoleDto });
      return this.formatRoleResponse(role);
    } catch (error) {
      throw error;
    }
  }

  async findAll() {
    try {
      const roles = await this.prisma.role.findMany();
      return roles.map((role) => this.formatRoleResponse(role));
    } catch (error) {
      throw error;
    }
  }

  async findOne(role_id: string) {
    try {
      // Decode the ID with proper error handling
      let decodedId: number;
      try {
        decodedId = decodeId(role_id);
      } catch (error) {
        throw new BadRequestException('Invalid role ID format');
      }

      const role = await this.prisma.role.findUnique({
        where: { role_id: decodedId },
      });

      if (!role) {
        throw new NotFoundException(`Role with id ${role_id} not found`);
      }

      return this.formatRoleResponse(role);
    } catch (error) {
      // Re-throw NestJS exceptions as-is
      if (
        error instanceof BadRequestException ||
        error instanceof NotFoundException
      ) {
        throw error;
      }
      // Wrap other errors
      throw error;
    }
  }

  async update(role_id: string, updateRoleDto: UpdateRoleDto) {
    try {
      // Decode the ID with proper error handling
      let decodedId: number;
      try {
        decodedId = decodeId(role_id);
      } catch (error) {
        throw new BadRequestException('Invalid role ID format');
      }

      // Check if role exists first
      const existingRole = await this.prisma.role.findUnique({
        where: { role_id: decodedId },
      });

      if (!existingRole) {
        throw new NotFoundException(`Role with id ${role_id} not found`);
      }

      if (updateRoleDto.name) {
        const existingRole = await this.prisma.role.findUnique({
          where: { name: updateRoleDto.name },
        });

        if (existingRole) {
          throw new BadRequestException(`Role with name ${updateRoleDto.name} already exists`);
        }
      }
      const role = await this.prisma.role.update({
        where: { role_id: decodedId },
        data: updateRoleDto,
      });

      return this.formatRoleResponse(role);
    } catch (error) {
      // Re-throw NestJS exceptions as-is
      if (
        error instanceof BadRequestException ||
        error instanceof NotFoundException
      ) {
        throw error;
      }
      // Wrap other errors
      throw error;
    }
  }

  async remove(role_id: string) {
    try {
      // Decode the ID with proper error handling
      let decodedId: number;
      try {
        decodedId = decodeId(role_id);
      } catch (error) {
        throw new BadRequestException('Invalid role ID format');
      }

      // Check if role exists first
      const existingRole = await this.prisma.role.findUnique({
        where: { role_id: decodedId },
      });

      if (!existingRole) {
        throw new NotFoundException(`Role with id ${role_id} not found`);
      }

      const role = await this.prisma.role.delete({
        where: { role_id: decodedId },
      });

      return {
        message: `Role with id ${role_id} deleted successfully`
      }
    } catch (error) {
      // Re-throw NestJS exceptions as-is
      if (
        error instanceof BadRequestException ||
        error instanceof NotFoundException
      ) {
        throw error;
      }
      // Wrap other errors
      throw error;
    }
  }
}
