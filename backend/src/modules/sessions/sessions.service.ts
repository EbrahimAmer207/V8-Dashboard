import { BadRequestException, Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import {
  CLINICAL_SESSION_TYPES,
  decodeSessionType,
  encodeSessionType,
  SESSION_STATUSES,
  SessionStatus,
  statusToFlags,
} from './session-meta';

function splitFullName(full: string | null | undefined): {
  firstName: string;
  lastName: string;
} {
  const parts = (full ?? '').trim().split(/\s+/).filter(Boolean);
  if (parts.length === 0) return { firstName: 'Unknown', lastName: '' };
  if (parts.length === 1) return { firstName: parts[0], lastName: '' };
  return { firstName: parts[0], lastName: parts.slice(1).join(' ') };
}

@Injectable()
export class SessionsService {
  constructor(private prisma: PrismaService) {}

  private async loadDoctorMaps(doctorUserIds: string[]) {
    const doctors = await this.prisma.doctors.findMany({
      where: { UserId: { in: doctorUserIds } },
      include: {
        AspNetUsers: { select: { FullName: true, AvatarUrl: true } },
      },
    });
    const doctorByUserId = new Map(doctors.map((d) => [d.UserId, d]));

    const missingDoctorIds = doctorUserIds.filter((id) => !doctorByUserId.has(id));
    const doctorUsers =
      missingDoctorIds.length > 0
        ? await this.prisma.aspNetUsers.findMany({
            where: { Id: { in: missingDoctorIds } },
            select: { Id: true, FullName: true, AvatarUrl: true },
          })
        : [];
    const aspUserById = new Map(doctorUsers.map((u) => [u.Id, u]));

    return { doctorByUserId, aspUserById };
  }

  private mapSession(
    s: any,
    doctorByUserId: Map<string, any>,
    aspUserById: Map<string, any>,
  ) {
    const { clinicalType, status } = decodeSessionType(s.SessionType, s.IsStarted);
    const docRow = doctorByUserId.get(s.DoctorId);
    const fallbackUser = aspUserById.get(s.DoctorId);

    const doctorFull =
      docRow?.AspNetUsers?.FullName || docRow?.Name || fallbackUser?.FullName || '';
    const doctorParts = splitFullName(doctorFull || 'Unknown doctor');

    const patientFull =
      s.PatientName ||
      s.Patients?.AspNetUsers?.FullName ||
      '';
    const patientParts = splitFullName(patientFull || 'Unknown patient');

    return {
      id: String(s.Id),
      doctorId: s.DoctorId,
      patientId: s.PatientId,
      patientName: patientFull || `${patientParts.firstName} ${patientParts.lastName}`.trim(),
      doctor: {
        id: docRow ? String(docRow.Id) : null,
        specialty: docRow?.Specialization ?? '',
        name: doctorFull,
        user: {
          id: s.DoctorId,
          firstName: doctorParts.firstName,
          lastName: doctorParts.lastName,
          avatar:
            docRow?.ImageUrl ||
            docRow?.AspNetUsers?.AvatarUrl ||
            fallbackUser?.AvatarUrl ||
            null,
        },
      },
      patient: {
        id: s.PatientId,
        firstName: patientParts.firstName,
        lastName: patientParts.lastName,
        avatar: s.Patients?.AspNetUsers?.AvatarUrl ?? null,
      },
      sessionType: clinicalType,
      status,
      startTime: s.ScheduledAt,
      price: Number(s.Price ?? 0),
      videoUrl: s.VideoUrl ?? null,
      audioUrl: s.AudioUrl ?? null,
      pdfUrl: s.PdfUrl ?? null,
      imageUrl: s.ImageUrl ?? null,
      isStarted: s.IsStarted,
    };
  }

  async findAll(filters?: { status?: string; doctorId?: string; patientId?: string }) {
    const where: any = {};
    if (filters?.doctorId) where.DoctorId = filters.doctorId;
    if (filters?.patientId) where.PatientId = filters.patientId;

    const sessions = await this.prisma.doctorSessions.findMany({
      where,
      include: {
        Patients: {
          include: {
            AspNetUsers: { select: { FullName: true, AvatarUrl: true } },
          },
        },
      },
      orderBy: { ScheduledAt: 'desc' },
    });

    const doctorUserIds = [...new Set(sessions.map((s) => s.DoctorId).filter(Boolean))];
    const { doctorByUserId, aspUserById } = await this.loadDoctorMaps(doctorUserIds);

    let mapped = sessions.map((s) => this.mapSession(s, doctorByUserId, aspUserById));

    if (filters?.status && filters.status !== 'all') {
      mapped = mapped.filter((s) => s.status === filters.status);
    }

    return mapped;
  }

  async findOne(id: string) {
    const session = await this.prisma.doctorSessions.findUnique({
      where: { Id: parseInt(id, 10) },
      include: {
        Patients: {
          include: {
            AspNetUsers: { select: { FullName: true, AvatarUrl: true } },
          },
        },
      },
    });

    if (!session) {
      throw new NotFoundException(`Session with ID ${id} not found`);
    }

    const { doctorByUserId, aspUserById } = await this.loadDoctorMaps([session.DoctorId]);
    return this.mapSession(session, doctorByUserId, aspUserById);
  }

  async create(data: {
    doctorId: string;
    patientId: string;
    startTime: string | Date;
    sessionType?: string;
    status?: SessionStatus;
    price?: number;
    patientName?: string;
    videoUrl?: string;
    audioUrl?: string;
    notes?: string;
  }) {
    if (!data.doctorId?.trim()) {
      throw new BadRequestException('Doctor is required');
    }
    if (!data.patientId?.trim()) {
      throw new BadRequestException('Patient is required');
    }

    const patient = await this.prisma.patients.findUnique({
      where: { UserId: data.patientId },
      include: { AspNetUsers: true },
    });

    if (!patient) {
      throw new BadRequestException('Patient record not found for the selected user');
    }

    const status = (data.status as SessionStatus) || 'Scheduled';
    if (!SESSION_STATUSES.includes(status)) {
      throw new BadRequestException(`Invalid status. Use: ${SESSION_STATUSES.join(', ')}`);
    }

    const clinicalType = data.sessionType?.trim() || 'Individual';
    const flags = statusToFlags(status);
    const encodedType = encodeSessionType(clinicalType, status);

    const patientLabel =
      data.patientName?.trim() ||
      patient.AspNetUsers?.FullName ||
      'Unknown patient';

    return this.findOne(
      String(
        (
          await this.prisma.doctorSessions.create({
            data: {
              DoctorId: data.doctorId.trim(),
              PatientId: data.patientId.trim(),
              PatientName: patientLabel,
              SessionType: encodedType,
              ScheduledAt: new Date(data.startTime),
              IsStarted: flags.isStarted,
              Price: data.price ?? 0,
              VideoUrl: data.videoUrl?.trim() || null,
              AudioUrl: data.audioUrl?.trim() || null,
            },
          })
        ).Id,
      ),
    );
  }

  async updateSession(
    id: string,
    data: {
      doctorId?: string;
      patientId?: string;
      startTime?: string | Date;
      sessionType?: string;
      status?: SessionStatus;
      price?: number;
      patientName?: string;
      videoUrl?: string | null;
      audioUrl?: string | null;
    },
  ) {
    const existing = await this.prisma.doctorSessions.findUnique({
      where: { Id: parseInt(id, 10) },
    });
    if (!existing) {
      throw new NotFoundException(`Session with ID ${id} not found`);
    }

    const current = decodeSessionType(existing.SessionType, existing.IsStarted);
    const clinicalType = data.sessionType?.trim() || current.clinicalType;
    const status = (data.status as SessionStatus) || current.status;

    if (data.status && !SESSION_STATUSES.includes(data.status as SessionStatus)) {
      throw new BadRequestException(`Invalid status. Use: ${SESSION_STATUSES.join(', ')}`);
    }

    const flags = statusToFlags(status);
    const encodedType = encodeSessionType(clinicalType, status);

    const updateData: any = {
      SessionType: encodedType,
      IsStarted: flags.isStarted,
    };

    if (data.doctorId !== undefined) updateData.DoctorId = data.doctorId.trim();
    if (data.patientId !== undefined) updateData.PatientId = data.patientId.trim();
    if (data.startTime !== undefined) updateData.ScheduledAt = new Date(data.startTime);
    if (data.price !== undefined) updateData.Price = data.price;
    if (data.patientName !== undefined) updateData.PatientName = data.patientName.trim();
    if (data.videoUrl !== undefined) updateData.VideoUrl = data.videoUrl?.trim() || null;
    if (data.audioUrl !== undefined) updateData.AudioUrl = data.audioUrl?.trim() || null;

    if (data.patientId !== undefined) {
      const patient = await this.prisma.patients.findUnique({
        where: { UserId: data.patientId },
        include: { AspNetUsers: true },
      });
      if (!patient) {
        throw new BadRequestException('Patient record not found for the selected user');
      }
      if (!data.patientName) {
        updateData.PatientName = patient.AspNetUsers?.FullName || existing.PatientName;
      }
    }

    await this.prisma.doctorSessions.update({
      where: { Id: parseInt(id, 10) },
      data: updateData,
    });

    return this.findOne(id);
  }

  async delete(id: string) {
    const sessionId = parseInt(id, 10);
    const existing = await this.prisma.doctorSessions.findUnique({
      where: { Id: sessionId },
    });
    if (!existing) {
      throw new NotFoundException(`Session with ID ${id} not found`);
    }

    await this.prisma.doctorSessions.delete({ where: { Id: sessionId } });
    return { deleted: true, id: sessionId };
  }

  async findAllByPatient(patientId: string) {
    const sessions = await this.prisma.doctorSessions.findMany({
      where: { PatientId: patientId },
      include: {
        Patients: {
          include: {
            AspNetUsers: { select: { FullName: true, AvatarUrl: true } },
          },
        },
      },
      orderBy: { ScheduledAt: 'desc' },
    });
    const doctorUserIds = [...new Set(sessions.map((s) => s.DoctorId).filter(Boolean))];
    const { doctorByUserId, aspUserById } = await this.loadDoctorMaps(doctorUserIds);
    return sessions.map((s) => this.mapSession(s, doctorByUserId, aspUserById));
  }

  async findAllByDoctor(doctorId: string) {
    return this.findAll({ doctorId });
  }

  async updateStatus(id: string, status: string) {
    if (!SESSION_STATUSES.includes(status as SessionStatus)) {
      throw new BadRequestException(`Invalid status. Use: ${SESSION_STATUSES.join(', ')}`);
    }
    const existing = await this.prisma.doctorSessions.findUnique({
      where: { Id: parseInt(id, 10) },
    });
    if (!existing) {
      throw new NotFoundException(`Session with ID ${id} not found`);
    }

    const { clinicalType } = decodeSessionType(existing.SessionType, existing.IsStarted);
    return this.updateSession(id, {
      sessionType: clinicalType,
      status: status as SessionStatus,
    });
  }
}
