import { IsNumber, IsOptional, IsString, Min } from 'class-validator';

export class CreateDoctorDto {
  @IsString()
  userId: string;

  @IsString()
  specialty: string;

  @IsString()
  @IsOptional()
  bio?: string;

  @IsNumber()
  @Min(0)
  @IsOptional()
  experience?: number;

  @IsNumber()
  @Min(0)
  @IsOptional()
  sessionPrice?: number;

  @IsString()
  @IsOptional()
  imageUrl?: string;
}

export class UpdateDoctorDto {
  @IsString()
  @IsOptional()
  specialty?: string;

  @IsString()
  @IsOptional()
  bio?: string;

  @IsNumber()
  @Min(0)
  @IsOptional()
  experience?: number;

  @IsNumber()
  @Min(0)
  @IsOptional()
  sessionPrice?: number;

  @IsString()
  @IsOptional()
  imageUrl?: string;
}
