import { BadRequestException, Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreateDoctorDto, UpdateDoctorDto } from './dto';

@Injectable()
export class DoctorsService {
  constructor(private readonly prisma: PrismaService) {}

  private mapDoctor(doctor: any) {
    const fullName = doctor.AspNetUsers?.FullName || doctor.Name || '';
    const [firstName = '', ...rest] = fullName.split(' ');

    return {
      id: String(doctor.Id),
      userId: doctor.UserId,
      specialty: doctor.Specialization,
      bio: doctor.Bio,
      experience: doctor.ExperienceYears,
      rating: Number(doctor.Rating || 0),
      sessionPrice: Number(doctor.SessionPrice || 0),
      imageUrl: doctor.ImageUrl,
      user: {
        id: doctor.AspNetUsers?.Id || doctor.UserId,
        firstName,
        lastName: rest.join(' '),
        email: doctor.AspNetUsers?.Email || '',
        avatar: doctor.AspNetUsers?.AvatarUrl || doctor.ImageUrl,
      },
    };
  }

  async findAll() {
    const doctors = await this.prisma.doctors.findMany({
      orderBy: { Id: 'desc' },
      include: {
        AspNetUsers: true,
      },
    });

    return doctors.map((doctor) => this.mapDoctor(doctor));
  }

  async search(query: string) {
    if (!query) return this.findAll();
    
    const doctors = await this.prisma.doctors.findMany({
      where: {
        OR: [
          { Name: { contains: query } },
          { Specialization: { contains: query } },
          { AspNetUsers: { Email: { contains: query } } }
        ]
      },
      orderBy: { Id: 'desc' },
      include: {
        AspNetUsers: true,
      },
    });

    return doctors.map((doctor) => this.mapDoctor(doctor));
  }

  async findOne(id: string) {
    const doctor = await this.prisma.doctors.findUnique({
      where: { Id: Number(id) },
      include: {
        AspNetUsers: true,
      },
    });

    if (!doctor) throw new NotFoundException('Therapist profile not found');
    return this.mapDoctor(doctor);
  }

  async create(data: CreateDoctorDto) {
    const user = await this.prisma.aspNetUsers.findUnique({
      where: { Id: data.userId },
    });

    if (!user) throw new NotFoundException('User account not found');

    const existingDoctor = await this.prisma.doctors.findFirst({
      where: { UserId: data.userId },
    });

    if (existingDoctor) {
      throw new BadRequestException('This user already has a therapist profile');
    }

    const doctor = await this.prisma.doctors.create({
      data: {
        UserId: data.userId,
        Name: user.FullName,
        Specialization: data.specialty,
        ExperienceYears: data.experience ?? 0,
        Bio: data.bio ?? '',
        Rating: 0,
        SessionPrice: data.sessionPrice ?? 0,
        ImageUrl: data.imageUrl,
        NationalNumber: '0000000000',
      },
      include: {
        AspNetUsers: true,
      },
    });

    return this.mapDoctor(doctor);
  }

  async update(id: string, data: UpdateDoctorDto) {
    await this.findOne(id);

    const updateData: any = {};
    if (data.specialty !== undefined) updateData.Specialization = data.specialty;
    if (data.bio !== undefined) updateData.Bio = data.bio;
    if (data.experience !== undefined) updateData.ExperienceYears = data.experience;
    if (data.sessionPrice !== undefined) updateData.SessionPrice = data.sessionPrice;
    if (data.imageUrl !== undefined) updateData.ImageUrl = data.imageUrl;

    const doctor = await this.prisma.doctors.update({
      where: { Id: Number(id) },
      data: updateData,
      include: {
        AspNetUsers: true,
      },
    });

    return this.mapDoctor(doctor);
  }

  async delete(id: string) {
    await this.findOne(id);
    await this.prisma.doctors.delete({ where: { Id: Number(id) } });
    return { message: 'Therapist profile deleted' };
  }
}
