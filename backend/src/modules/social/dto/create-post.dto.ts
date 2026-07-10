import { IsOptional, IsString, MaxLength, MinLength } from 'class-validator';

export class CreateSocialPostDto {
  @IsString()
  @MinLength(1)
  @MaxLength(8000)
  content: string;

  /** Optional image URL when not uploading a file */
  @IsOptional()
  @IsString()
  @MaxLength(2000)
  imageUrl?: string;

  /** Alias used by some clients */
  @IsOptional()
  @IsString()
  @MaxLength(2000)
  image?: string;
}
