import { Injectable, NotFoundException, BadRequestException } from '@nestjs/common';
import { CreateStatusDto } from './dto/create-status.dto';
import { UpdateStatusDto } from './dto/update-status.dto';
import { PrismaService } from '../prisma/prisma.service';
import { Status } from './entities/status.entity';
import { encodeId, decodeId } from '../common/utils/secure.util';

@Injectable()
export class StatusService {
  constructor(private prisma: PrismaService) { }

  private formatStatusResponse(status: Status) {
    return {
      status_id: encodeId(status.status_id),
      name: status.name,
      created_at: status.created_at,
      updated_at: status.updated_at,
    };
  }

  async create(createStatusDto: CreateStatusDto) {
    try {
      const existingStatus = await this.prisma.status.findUnique({
        where: { name: createStatusDto.name },
      });

      if (existingStatus) {
        throw new BadRequestException(`Status with name ${createStatusDto.name} already exists`);
      }
      const status = await this.prisma.status.create({ data: createStatusDto });
      return this.formatStatusResponse(status);
    } catch (error) {
      throw error;
    }
  }

  async findAll() {
    try {
      const statuses = await this.prisma.status.findMany();
      return statuses.map((status) => this.formatStatusResponse(status));
    } catch (error) {
      throw error;
    }
  }

  async findOne(id: string) {
    try {
      // Decode the ID with proper error handling
      let decodedId: number;
      try {
        decodedId = decodeId(id);
      } catch (error) {
        throw new BadRequestException('Invalid status ID format');
      }

      const status = await this.prisma.status.findUnique({
        where: { status_id: decodedId },
      });

      if (!status) {
        throw new NotFoundException(`Status with id ${id} not found`);
      }

      return this.formatStatusResponse(status);
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

  async update(id: string, updateStatusDto: UpdateStatusDto) {
    try {
      // Decode the ID with proper error handling
      let decodedId: number;
      try {
        decodedId = decodeId(id);
      } catch (error) {
        throw new BadRequestException('Invalid status ID format');
      }

      // Check if status exists first
      const existingStatus = await this.prisma.status.findUnique({
        where: { status_id: decodedId },
      });

      if (!existingStatus) {
        throw new NotFoundException(`Status with id ${id} not found`);
      }

      if (updateStatusDto.name) {
        const existingStatus = await this.prisma.status.findUnique({
          where: { name: updateStatusDto.name },
        });

        if (existingStatus) {
          throw new BadRequestException(`Status with name ${updateStatusDto.name} already exists`);
        }
      }
      const status = await this.prisma.status.update({
        where: { status_id: decodedId },
        data: updateStatusDto,
      });

      return this.formatStatusResponse(status);
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

  async remove(id: string) {
    try {
      // Decode the ID with proper error handling
      let decodedId: number;
      try {
        decodedId = decodeId(id);
      } catch (error) {
        throw new BadRequestException('Invalid status ID format');
      }

      // Check if status exists first
      const existingStatus = await this.prisma.status.findUnique({
        where: { status_id: decodedId },
      });

      if (!existingStatus) {
        throw new NotFoundException(`Status with id ${id} not found`);
      }

      const status = await this.prisma.status.delete({
        where: { status_id: decodedId },
      });

      return {
        message: `Status with id ${id} deleted successfully`
      };
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

