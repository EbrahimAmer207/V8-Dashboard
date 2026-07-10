import { Injectable, NotFoundException, BadRequestException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreateUserDto, UpdateUserDto, PaginationDto } from './dto';
import * as crypto from 'crypto';

function hashPassword(password: string): string {
  const salt = crypto.randomBytes(16);
  const iterations = 10000;
  const keyLength = 32;
  const digest = 'sha256';

  const subkey = crypto.pbkdf2Sync(password, salt, iterations, keyLength, digest);

  const buffer = Buffer.alloc(13 + salt.length + subkey.length);
  buffer.writeUInt8(0x01, 0); // Format marker: V3
  buffer.writeUInt32BE(1, 1); // PRF: HMAC-SHA256
  buffer.writeUInt32BE(iterations, 5); // Iterations: 10000
  buffer.writeUInt32BE(salt.length, 9); // Salt length: 16
  salt.copy(buffer, 13);
  subkey.copy(buffer, 13 + salt.length);

  return buffer.toString('base64');
}

@Injectable()
export class UsersService {
  constructor(private readonly prisma: PrismaService) { }

  async findAll(paginationDto: PaginationDto) {
    const { page = 1, limit = 10, search, type, role } = paginationDto;
    const skip = (Number(page) - 1) * Number(limit);
    const take = Number(limit);

    const where: any = {};

    if (search) {
      where.OR = [
        { Email: { contains: search } },
        { UserName: { contains: search } },
        { FullName: { contains: search } },
      ];
    }

    if (type === 'PROVIDER') {
      where.Doctors = { some: {} };
    } else if (type === 'SEEKER') {
      where.Patients = { isNot: null };
    }

    if (role) {
      where.AspNetUserRoles = {
        some: {
          AspNetRoles: {
            Name: role,
          },
        },
      };
    }

    const [users, total] = await Promise.all([
      this.prisma.aspNetUsers.findMany({
        where,
        skip,
        take,
        include: {
          Patients: true,
          Doctors: true,
          AspNetUserRoles: { include: { AspNetRoles: true } }
        },
        orderBy: { Id: 'desc' },
      }),
      this.prisma.aspNetUsers.count({ where }),
    ]);

    return {
      data: users.map(u => ({
        id: u.Id,
        email: u.Email,
        username: u.UserName,
        firstName: u.FullName.split(' ')[0],
        lastName: u.FullName.split(' ').slice(1).join(' ') || '',
        avatar: u.AvatarUrl,
        role: u.AspNetUserRoles[0]?.AspNetRoles?.Name || 'USER',
        type: u.Doctors.length > 0 ? 'PROVIDER' : 'SEEKER',
        status: u.LockoutEnabled && u.LockoutEnd ? 'Banned' : 'Active',
        isActive: !(u.LockoutEnabled && u.LockoutEnd),
        createdAt: null, // AspNetUsers does not store a registration date
      })),
      pagination: {
        total,
        page: Number(page),
        limit: Number(limit),
        pages: Math.ceil(total / take),
      },
    };
  }

  async findOne(id: string) {
    const user = await this.prisma.aspNetUsers.findUnique({
      where: { Id: id },
      include: {
        Patients: true,
        Doctors: true,
        AspNetUserRoles: { include: { AspNetRoles: true } }
      },
    });

    if (!user) throw new NotFoundException('User not found');

    return {
      id: user.Id,
      email: user.Email,
      username: user.UserName,
      firstName: user.FullName.split(' ')[0],
      lastName: user.FullName.split(' ').slice(1).join(' ') || '',
      avatar: user.AvatarUrl,
      role: user.AspNetUserRoles[0]?.AspNetRoles?.Name || 'USER',
      type: user.Doctors.length > 0 ? 'PROVIDER' : 'SEEKER',
    };
  }

  async create(createUserDto: CreateUserDto) {
    const { email, username, password, firstName, lastName, role, type } = createUserDto;
    
    // Check if user exists
    const existingUser = await this.prisma.aspNetUsers.findFirst({
      where: {
        OR: [
          { Email: email },
          { UserName: username }
        ]
      }
    });

    if (existingUser) {
      throw new BadRequestException('User with this email or username already exists');
    }

    const hashedPassword = hashPassword(password);
    const userId = crypto.randomUUID();

    const user = await this.prisma.aspNetUsers.create({
      data: {
        Id: userId,
        Email: email,
        NormalizedEmail: email.toUpperCase(),
        UserName: username,
        NormalizedUserName: username.toUpperCase(),
        FullName: `${firstName} ${lastName}`.trim(),
        PasswordHash: hashedPassword,
        EmailConfirmed: true,
        PhoneNumberConfirmed: false,
        TwoFactorEnabled: false,
        LockoutEnabled: false,
        AccessFailedCount: 0,
        NotificationsEnabled: true,
        Language: 'en',
        SessionsCompleted: 0,
        ExercisesCompleted: 0,
        ActiveDays: 0,
      }
    });

    // If role is provided, attach the role in a case-insensitive manner
    if (role) {
      const normalizedRoleName = role.toUpperCase();
      const dbRole = await this.prisma.aspNetRoles.findFirst({
        where: {
          OR: [
            { Name: role },
            { NormalizedName: normalizedRoleName },
            { Name: normalizedRoleName === 'ADMIN' ? 'Admin' : normalizedRoleName === 'DOCTOR' ? 'Doctor' : normalizedRoleName === 'PATIENT' ? 'Patient' : role }
          ]
        }
      });
      if (dbRole) {
        await this.prisma.aspNetUserRoles.create({
          data: {
            UserId: userId,
            RoleId: dbRole.Id
          }
        });
      }
    }

    // If type is PROVIDER, add to doctors, if SEEKER, add to patients
    if (type === 'PROVIDER') {
      await this.prisma.doctors.create({
        data: {
          UserId: userId,
          Name: `${firstName} ${lastName}`.trim(),
          Specialization: 'General',
          ExperienceYears: 0,
          Bio: '',
          Rating: 0,
          SessionPrice: 0,
          NationalNumber: '0000000000',
        }
      });
    } else if (type === 'SEEKER') {
      await this.prisma.patients.create({
        data: {
          UserId: userId,
          Age: 0,
          Gender: 'Unknown',
          RegisteredAt: new Date()
        }
      });
    }

    return {
      id: user.Id,
      email: user.Email,
      username: user.UserName,
      fullName: user.FullName,
    };
  }

  async update(id: string, updateUserDto: UpdateUserDto) {
    const { email, firstName, lastName, status, isActive, type, role, password } = updateUserDto;

    const updateData: any = {};
    if (email) updateData.Email = email;
    if (password) {
      updateData.PasswordHash = hashPassword(password);
    }
    if (firstName || lastName) {
      const current = await this.prisma.aspNetUsers.findUnique({ where: { Id: id } });
      if (!current) throw new NotFoundException('User not found');
      const fName = firstName || current.FullName.split(' ')[0];
      const lName = lastName || current.FullName.split(' ').slice(1).join(' ');
      updateData.FullName = `${fName} ${lName}`.trim();
    }

    if (status !== undefined || isActive !== undefined) {
      const lock =
        status === 'Banned' || isActive === false;
      const unlock =
        status === 'Active' || isActive === true;
      if (lock) {
        updateData.LockoutEnabled = true;
        updateData.LockoutEnd = new Date('2099-12-31T23:59:59.999Z');
      } else if (unlock) {
        updateData.LockoutEnabled = false;
        updateData.LockoutEnd = null;
      }
    }

    if (type) {
      const current = await this.prisma.aspNetUsers.findUnique({ where: { Id: id } });
      const fullName = current ? current.FullName : 'User';
      if (type === 'PROVIDER' || type === 'Provider') {
        const doc = await this.prisma.doctors.findFirst({ where: { UserId: id } });
        if (!doc) {
          await this.prisma.doctors.create({
            data: {
              UserId: id,
              Name: fullName,
              Specialization: 'General',
              ExperienceYears: 0,
              Bio: '',
              Rating: 0,
              SessionPrice: 0,
              NationalNumber: '0000000000',
            }
          });
        }
      } else if (type === 'SEEKER' || type === 'Seeker') {
        const pat = await this.prisma.patients.findFirst({ where: { UserId: id } });
        if (!pat) {
          await this.prisma.patients.create({
            data: {
              UserId: id,
              Age: 0,
              Gender: 'Unknown',
              RegisteredAt: new Date()
            }
          });
        }
      }
    }

    if (role) {
      const normalizedRoleName = role.toUpperCase();
      const dbRole = await this.prisma.aspNetRoles.findFirst({
        where: {
          OR: [
            { Name: role },
            { NormalizedName: normalizedRoleName },
            { Name: normalizedRoleName === 'ADMIN' ? 'Admin' : normalizedRoleName === 'DOCTOR' ? 'Doctor' : normalizedRoleName === 'PATIENT' ? 'Patient' : role }
          ]
        }
      });
      if (dbRole) {
        await this.prisma.aspNetUserRoles.deleteMany({ where: { UserId: id } });
        await this.prisma.aspNetUserRoles.create({
          data: { UserId: id, RoleId: dbRole.Id }
        });
      }
    }

    const user = await this.prisma.aspNetUsers.update({
      where: { Id: id },
      data: updateData,
    });

    return {
      id: user.Id,
      email: user.Email,
      fullName: user.FullName,
    };
  }

  async delete(id: string) {
    await this.prisma.aspNetUsers.delete({ where: { Id: id } });
    return { message: 'User deleted from real database' };
  }

  async getStats() {
    const [totalUsers, totalDoctors, totalPatients] = await Promise.all([
      this.prisma.aspNetUsers.count(),
      this.prisma.doctors.count(),
      this.prisma.patients.count(),
    ]);

    return {
      totalUsers,
      seekers: totalPatients,
      providers: totalDoctors,
      activeUsers: totalUsers,
    };
  }

  async getActivityLog(userId: string, limit: number = 50) {
    return { data: [] };
  }
}
