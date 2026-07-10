import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class RecordsService {
  constructor(private prisma: PrismaService) {}

  async findAllRecords() {
    const records = await this.prisma.patientRecords.findMany({
      include: {
        Patients: {
          include: { AspNetUsers: { select: { FullName: true, Email: true } } }
        },
      },
      orderBy: { CreatedAt: 'desc' },
    });
    
    return records.map(r => ({
      id: r.Id,
      diagnosis: r.Diagnosis,
      treatment: r.Treatment,
      date: r.CreatedAt,
      patient: {
        firstName: r.Patients.AspNetUsers.FullName.split(' ')[0],
        lastName: r.Patients.AspNetUsers.FullName.split(' ').slice(1).join(' '),
        email: r.Patients.AspNetUsers.Email
      }
    }));
  }

  async findAllReports() {
    const reports = await this.prisma.reports.findMany({
      orderBy: { ReportDate: 'desc' },
    });
    
    return reports.map(r => ({
      id: r.Id,
      title: r.Type,
      type: r.Type,
      date: r.ReportDate,
    }));
  }
  async createRecord(data: any) {
    return this.prisma.patientRecords.create({
      data: {
        PatientId: data.patientId,
        DoctorId: data.doctorId || 'Unknown',
        Diagnosis: data.diagnosis,
        Treatment: data.treatment,
        Notes: data.notes || '',
        TreatmentPlan: data.treatmentPlan || '',
        CreatedAt: new Date(),
      }
    });
  }

  async updateRecord(id: string, data: any) {
    const updateData: any = {};
    if (data.diagnosis) updateData.Diagnosis = data.diagnosis;
    if (data.treatment) updateData.Treatment = data.treatment;
    if (data.notes !== undefined) updateData.Notes = data.notes;
    if (data.treatmentPlan !== undefined) updateData.TreatmentPlan = data.treatmentPlan;

    return this.prisma.patientRecords.update({
      where: { Id: parseInt(id) },
      data: updateData
    });
  }
  async deleteRecord(id: string) {
    return this.prisma.patientRecords.delete({ where: { Id: parseInt(id) } });
  }

  async deleteReport(id: string) {
    return this.prisma.reports.delete({ where: { Id: parseInt(id) } });
  }
}
