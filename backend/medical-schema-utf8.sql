Build started...
Build succeeded.
IF OBJECT_ID(N'[__EFMigrationsHistory]') IS NULL
BEGIN
    CREATE TABLE [__EFMigrationsHistory] (
        [MigrationId] nvarchar(150) NOT NULL,
        [ProductVersion] nvarchar(32) NOT NULL,
        CONSTRAINT [PK___EFMigrationsHistory] PRIMARY KEY ([MigrationId])
    );
END;
GO

BEGIN TRANSACTION;
GO

CREATE TABLE [AspNetRoles] (
    [Id] nvarchar(450) NOT NULL,
    [Name] nvarchar(256) NULL,
    [NormalizedName] nvarchar(256) NULL,
    [ConcurrencyStamp] nvarchar(max) NULL,
    CONSTRAINT [PK_AspNetRoles] PRIMARY KEY ([Id])
);
GO

CREATE TABLE [AspNetUsers] (
    [Id] nvarchar(450) NOT NULL,
    [FullName] nvarchar(max) NOT NULL,
    [AvatarUrl] nvarchar(max) NULL,
    [NotificationsEnabled] bit NOT NULL,
    [Language] nvarchar(max) NOT NULL,
    [SessionsCompleted] int NOT NULL,
    [ExercisesCompleted] int NOT NULL,
    [ActiveDays] int NOT NULL,
    [ResetToken] nvarchar(max) NULL,
    [ResetTokenExpires] datetime2 NULL,
    [UserName] nvarchar(256) NULL,
    [NormalizedUserName] nvarchar(256) NULL,
    [Email] nvarchar(256) NULL,
    [NormalizedEmail] nvarchar(256) NULL,
    [EmailConfirmed] bit NOT NULL,
    [PasswordHash] nvarchar(max) NULL,
    [SecurityStamp] nvarchar(max) NULL,
    [ConcurrencyStamp] nvarchar(max) NULL,
    [PhoneNumber] nvarchar(max) NULL,
    [PhoneNumberConfirmed] bit NOT NULL,
    [TwoFactorEnabled] bit NOT NULL,
    [LockoutEnd] datetimeoffset NULL,
    [LockoutEnabled] bit NOT NULL,
    [AccessFailedCount] int NOT NULL,
    CONSTRAINT [PK_AspNetUsers] PRIMARY KEY ([Id])
);
GO

CREATE TABLE [AssessmentResults] (
    [Id] int NOT NULL IDENTITY,
    [UserId] nvarchar(max) NOT NULL,
    [AssessmentName] nvarchar(max) NOT NULL,
    [Percentage] int NOT NULL,
    [SymptomLevel] nvarchar(max) NOT NULL,
    [AnswersJson] nvarchar(max) NOT NULL,
    [Recommendation] nvarchar(max) NOT NULL,
    [CreatedAt] datetime2 NOT NULL,
    CONSTRAINT [PK_AssessmentResults] PRIMARY KEY ([Id])
);
GO

CREATE TABLE [Faqs] (
    [Id] int NOT NULL IDENTITY,
    [Question] nvarchar(max) NOT NULL,
    [Answer] nvarchar(max) NOT NULL,
    [IsActive] bit NOT NULL,
    CONSTRAINT [PK_Faqs] PRIMARY KEY ([Id])
);
GO

CREATE TABLE [Messages] (
    [Id] int NOT NULL IDENTITY,
    [SenderId] nvarchar(max) NOT NULL,
    [ReceiverId] nvarchar(max) NOT NULL,
    [Content] nvarchar(max) NOT NULL,
    [SentAt] datetime2 NOT NULL,
    [IsRead] bit NOT NULL,
    [ConversationId] nvarchar(max) NOT NULL,
    CONSTRAINT [PK_Messages] PRIMARY KEY ([Id])
);
GO

CREATE TABLE [MoodEntries] (
    [Id] int NOT NULL IDENTITY,
    [UserId] nvarchar(max) NOT NULL,
    [Value] int NOT NULL,
    [Date] datetime2 NOT NULL,
    CONSTRAINT [PK_MoodEntries] PRIMARY KEY ([Id])
);
GO

CREATE TABLE [Notifications] (
    [Id] int NOT NULL IDENTITY,
    [UserId] nvarchar(max) NOT NULL,
    [Title] nvarchar(max) NOT NULL,
    [Body] nvarchar(max) NOT NULL,
    [Type] nvarchar(max) NOT NULL,
    [IsRead] bit NOT NULL,
    [CreatedAt] datetime2 NOT NULL,
    CONSTRAINT [PK_Notifications] PRIMARY KEY ([Id])
);
GO

CREATE TABLE [PodcastEpisodes] (
    [Id] int NOT NULL IDENTITY,
    [Title] nvarchar(max) NOT NULL,
    [Description] nvarchar(max) NOT NULL,
    [AudioUrl] nvarchar(max) NOT NULL,
    [CoverImageUrl] nvarchar(max) NOT NULL,
    [DurationInSeconds] int NOT NULL,
    [PublishDate] datetime2 NOT NULL,
    [IsPublished] bit NOT NULL,
    CONSTRAINT [PK_PodcastEpisodes] PRIMARY KEY ([Id])
);
GO

CREATE TABLE [Reports] (
    [Id] int NOT NULL IDENTITY,
    [DoctorId] nvarchar(max) NOT NULL,
    [PatientId] nvarchar(max) NOT NULL,
    [Type] nvarchar(max) NOT NULL,
    [FileUrl] nvarchar(max) NOT NULL,
    [ReportDate] datetime2 NOT NULL,
    CONSTRAINT [PK_Reports] PRIMARY KEY ([Id])
);
GO

CREATE TABLE [Resources] (
    [Id] int NOT NULL IDENTITY,
    [Title] nvarchar(max) NOT NULL,
    [Description] nvarchar(max) NULL,
    [CoverImageUrl] nvarchar(max) NULL,
    [Type] int NOT NULL,
    [Url] nvarchar(max) NULL,
    [Duration] int NULL,
    [FileSize] float NULL,
    [CreatedDate] datetime2 NOT NULL,
    CONSTRAINT [PK_Resources] PRIMARY KEY ([Id])
);
GO

CREATE TABLE [AspNetRoleClaims] (
    [Id] int NOT NULL IDENTITY,
    [RoleId] nvarchar(450) NOT NULL,
    [ClaimType] nvarchar(max) NULL,
    [ClaimValue] nvarchar(max) NULL,
    CONSTRAINT [PK_AspNetRoleClaims] PRIMARY KEY ([Id]),
    CONSTRAINT [FK_AspNetRoleClaims_AspNetRoles_RoleId] FOREIGN KEY ([RoleId]) REFERENCES [AspNetRoles] ([Id]) ON DELETE CASCADE
);
GO

CREATE TABLE [AspNetUserClaims] (
    [Id] int NOT NULL IDENTITY,
    [UserId] nvarchar(450) NOT NULL,
    [ClaimType] nvarchar(max) NULL,
    [ClaimValue] nvarchar(max) NULL,
    CONSTRAINT [PK_AspNetUserClaims] PRIMARY KEY ([Id]),
    CONSTRAINT [FK_AspNetUserClaims_AspNetUsers_UserId] FOREIGN KEY ([UserId]) REFERENCES [AspNetUsers] ([Id]) ON DELETE CASCADE
);
GO

CREATE TABLE [AspNetUserLogins] (
    [LoginProvider] nvarchar(450) NOT NULL,
    [ProviderKey] nvarchar(450) NOT NULL,
    [ProviderDisplayName] nvarchar(max) NULL,
    [UserId] nvarchar(450) NOT NULL,
    CONSTRAINT [PK_AspNetUserLogins] PRIMARY KEY ([LoginProvider], [ProviderKey]),
    CONSTRAINT [FK_AspNetUserLogins_AspNetUsers_UserId] FOREIGN KEY ([UserId]) REFERENCES [AspNetUsers] ([Id]) ON DELETE CASCADE
);
GO

CREATE TABLE [AspNetUserRoles] (
    [UserId] nvarchar(450) NOT NULL,
    [RoleId] nvarchar(450) NOT NULL,
    CONSTRAINT [PK_AspNetUserRoles] PRIMARY KEY ([UserId], [RoleId]),
    CONSTRAINT [FK_AspNetUserRoles_AspNetRoles_RoleId] FOREIGN KEY ([RoleId]) REFERENCES [AspNetRoles] ([Id]) ON DELETE CASCADE,
    CONSTRAINT [FK_AspNetUserRoles_AspNetUsers_UserId] FOREIGN KEY ([UserId]) REFERENCES [AspNetUsers] ([Id]) ON DELETE CASCADE
);
GO

CREATE TABLE [AspNetUserTokens] (
    [UserId] nvarchar(450) NOT NULL,
    [LoginProvider] nvarchar(450) NOT NULL,
    [Name] nvarchar(450) NOT NULL,
    [Value] nvarchar(max) NULL,
    CONSTRAINT [PK_AspNetUserTokens] PRIMARY KEY ([UserId], [LoginProvider], [Name]),
    CONSTRAINT [FK_AspNetUserTokens_AspNetUsers_UserId] FOREIGN KEY ([UserId]) REFERENCES [AspNetUsers] ([Id]) ON DELETE CASCADE
);
GO

CREATE TABLE [Doctors] (
    [Id] int NOT NULL IDENTITY,
    [UserId] nvarchar(450) NOT NULL,
    [Name] nvarchar(max) NOT NULL,
    [Specialization] nvarchar(max) NOT NULL,
    [ExperienceYears] int NOT NULL,
    [Rating] float NOT NULL,
    [Bio] nvarchar(max) NOT NULL,
    [SessionPrice] decimal(18,2) NOT NULL,
    CONSTRAINT [PK_Doctors] PRIMARY KEY ([Id]),
    CONSTRAINT [FK_Doctors_AspNetUsers_UserId] FOREIGN KEY ([UserId]) REFERENCES [AspNetUsers] ([Id]) ON DELETE CASCADE
);
GO

CREATE TABLE [Patients] (
    [Id] int NOT NULL IDENTITY,
    [UserId] nvarchar(450) NOT NULL,
    [Age] int NOT NULL,
    [Gender] nvarchar(max) NOT NULL,
    [RegisteredAt] datetime2 NOT NULL,
    CONSTRAINT [PK_Patients] PRIMARY KEY ([Id]),
    CONSTRAINT [FK_Patients_AspNetUsers_UserId] FOREIGN KEY ([UserId]) REFERENCES [AspNetUsers] ([Id]) ON DELETE CASCADE
);
GO

CREATE TABLE [Posts] (
    [Id] int NOT NULL IDENTITY,
    [Content] nvarchar(max) NOT NULL,
    [ImageUrl] nvarchar(max) NULL,
    [UserId] nvarchar(450) NOT NULL,
    [CreatedAt] datetime2 NOT NULL,
    [UpdatedAt] datetime2 NULL,
    [CommentsCount] int NOT NULL,
    [SharesCount] int NOT NULL,
    [LikesCount] int NOT NULL,
    CONSTRAINT [PK_Posts] PRIMARY KEY ([Id]),
    CONSTRAINT [FK_Posts_AspNetUsers_UserId] FOREIGN KEY ([UserId]) REFERENCES [AspNetUsers] ([Id]) ON DELETE CASCADE
);
GO

CREATE TABLE [SupportTickets] (
    [Id] int NOT NULL IDENTITY,
    [UserId] nvarchar(450) NOT NULL,
    [Subject] nvarchar(max) NOT NULL,
    [Message] nvarchar(max) NOT NULL,
    [Status] nvarchar(max) NOT NULL,
    [CreatedAt] datetime2 NOT NULL,
    CONSTRAINT [PK_SupportTickets] PRIMARY KEY ([Id]),
    CONSTRAINT [FK_SupportTickets_AspNetUsers_UserId] FOREIGN KEY ([UserId]) REFERENCES [AspNetUsers] ([Id]) ON DELETE CASCADE
);
GO

CREATE TABLE [DoctorSessions] (
    [Id] int NOT NULL IDENTITY,
    [DoctorId] nvarchar(450) NOT NULL,
    [PatientId] nvarchar(450) NOT NULL,
    [PatientName] nvarchar(max) NOT NULL,
    [SessionType] nvarchar(max) NOT NULL,
    [ScheduledAt] datetime2 NOT NULL,
    [IsStarted] bit NOT NULL,
    [CreatedAt] datetime2 NOT NULL,
    [Price] decimal(18,2) NULL,
    [VideoUrl] nvarchar(max) NULL,
    [AudioUrl] nvarchar(max) NULL,
    [PdfUrl] nvarchar(max) NULL,
    [ImageUrl] nvarchar(max) NULL,
    [PatientId1] int NULL,
    CONSTRAINT [PK_DoctorSessions] PRIMARY KEY ([Id]),
    CONSTRAINT [FK_DoctorSessions_AspNetUsers_DoctorId] FOREIGN KEY ([DoctorId]) REFERENCES [AspNetUsers] ([Id]),
    CONSTRAINT [FK_DoctorSessions_AspNetUsers_PatientId] FOREIGN KEY ([PatientId]) REFERENCES [AspNetUsers] ([Id]),
    CONSTRAINT [FK_DoctorSessions_Patients_PatientId1] FOREIGN KEY ([PatientId1]) REFERENCES [Patients] ([Id])
);
GO

CREATE TABLE [PatientRecords] (
    [Id] int NOT NULL IDENTITY,
    [PatientId] int NOT NULL,
    [DoctorId] nvarchar(max) NOT NULL,
    [Diagnosis] nvarchar(max) NOT NULL,
    [Treatment] nvarchar(max) NOT NULL,
    [Notes] nvarchar(max) NULL,
    [TreatmentPlan] nvarchar(max) NULL,
    [CreatedAt] datetime2 NOT NULL,
    CONSTRAINT [PK_PatientRecords] PRIMARY KEY ([Id]),
    CONSTRAINT [FK_PatientRecords_Patients_PatientId] FOREIGN KEY ([PatientId]) REFERENCES [Patients] ([Id]) ON DELETE CASCADE
);
GO

CREATE TABLE [Comments] (
    [Id] int NOT NULL IDENTITY,
    [Content] nvarchar(max) NOT NULL,
    [UserId] nvarchar(450) NOT NULL,
    [PostId] int NOT NULL,
    [CreatedAt] datetime2 NOT NULL,
    [UpdatedAt] datetime2 NULL,
    CONSTRAINT [PK_Comments] PRIMARY KEY ([Id]),
    CONSTRAINT [FK_Comments_AspNetUsers_UserId] FOREIGN KEY ([UserId]) REFERENCES [AspNetUsers] ([Id]) ON DELETE CASCADE,
    CONSTRAINT [FK_Comments_Posts_PostId] FOREIGN KEY ([PostId]) REFERENCES [Posts] ([Id])
);
GO

CREATE TABLE [Likes] (
    [Id] int NOT NULL IDENTITY,
    [UserId] nvarchar(450) NOT NULL,
    [PostId] int NOT NULL,
    CONSTRAINT [PK_Likes] PRIMARY KEY ([Id]),
    CONSTRAINT [FK_Likes_AspNetUsers_UserId] FOREIGN KEY ([UserId]) REFERENCES [AspNetUsers] ([Id]) ON DELETE CASCADE,
    CONSTRAINT [FK_Likes_Posts_PostId] FOREIGN KEY ([PostId]) REFERENCES [Posts] ([Id])
);
GO

CREATE INDEX [IX_AspNetRoleClaims_RoleId] ON [AspNetRoleClaims] ([RoleId]);
GO

CREATE UNIQUE INDEX [RoleNameIndex] ON [AspNetRoles] ([NormalizedName]) WHERE [NormalizedName] IS NOT NULL;
GO

CREATE INDEX [IX_AspNetUserClaims_UserId] ON [AspNetUserClaims] ([UserId]);
GO

CREATE INDEX [IX_AspNetUserLogins_UserId] ON [AspNetUserLogins] ([UserId]);
GO

CREATE INDEX [IX_AspNetUserRoles_RoleId] ON [AspNetUserRoles] ([RoleId]);
GO

CREATE INDEX [EmailIndex] ON [AspNetUsers] ([NormalizedEmail]);
GO

CREATE UNIQUE INDEX [UserNameIndex] ON [AspNetUsers] ([NormalizedUserName]) WHERE [NormalizedUserName] IS NOT NULL;
GO

CREATE INDEX [IX_Comments_PostId] ON [Comments] ([PostId]);
GO

CREATE INDEX [IX_Comments_UserId] ON [Comments] ([UserId]);
GO

CREATE INDEX [IX_Doctors_UserId] ON [Doctors] ([UserId]);
GO

CREATE INDEX [IX_DoctorSessions_DoctorId] ON [DoctorSessions] ([DoctorId]);
GO

CREATE INDEX [IX_DoctorSessions_PatientId] ON [DoctorSessions] ([PatientId]);
GO

CREATE INDEX [IX_DoctorSessions_PatientId1] ON [DoctorSessions] ([PatientId1]);
GO

CREATE INDEX [IX_Likes_PostId] ON [Likes] ([PostId]);
GO

CREATE INDEX [IX_Likes_UserId] ON [Likes] ([UserId]);
GO

CREATE INDEX [IX_PatientRecords_PatientId] ON [PatientRecords] ([PatientId]);
GO

CREATE INDEX [IX_Patients_UserId] ON [Patients] ([UserId]);
GO

CREATE INDEX [IX_Posts_UserId] ON [Posts] ([UserId]);
GO

CREATE INDEX [IX_SupportTickets_UserId] ON [SupportTickets] ([UserId]);
GO

INSERT INTO [__EFMigrationsHistory] ([MigrationId], [ProductVersion])
VALUES (N'20260414222359_InitialFinalSchema', N'8.0.0');
GO

COMMIT;
GO

BEGIN TRANSACTION;
GO

ALTER TABLE [DoctorSessions] DROP CONSTRAINT [FK_DoctorSessions_AspNetUsers_DoctorId];
GO

ALTER TABLE [DoctorSessions] DROP CONSTRAINT [FK_DoctorSessions_AspNetUsers_PatientId];
GO

ALTER TABLE [DoctorSessions] DROP CONSTRAINT [FK_DoctorSessions_Patients_PatientId1];
GO

ALTER TABLE [PatientRecords] DROP CONSTRAINT [FK_PatientRecords_Patients_PatientId];
GO

DROP INDEX [IX_Patients_UserId] ON [Patients];
GO

DROP INDEX [IX_DoctorSessions_DoctorId] ON [DoctorSessions];
GO

DROP INDEX [IX_DoctorSessions_PatientId1] ON [DoctorSessions];
GO

DECLARE @var0 sysname;
SELECT @var0 = [d].[name]
FROM [sys].[default_constraints] [d]
INNER JOIN [sys].[columns] [c] ON [d].[parent_column_id] = [c].[column_id] AND [d].[parent_object_id] = [c].[object_id]
WHERE ([d].[parent_object_id] = OBJECT_ID(N'[DoctorSessions]') AND [c].[name] = N'CreatedAt');
IF @var0 IS NOT NULL EXEC(N'ALTER TABLE [DoctorSessions] DROP CONSTRAINT [' + @var0 + '];');
ALTER TABLE [DoctorSessions] DROP COLUMN [CreatedAt];
GO

DECLARE @var1 sysname;
SELECT @var1 = [d].[name]
FROM [sys].[default_constraints] [d]
INNER JOIN [sys].[columns] [c] ON [d].[parent_column_id] = [c].[column_id] AND [d].[parent_object_id] = [c].[object_id]
WHERE ([d].[parent_object_id] = OBJECT_ID(N'[DoctorSessions]') AND [c].[name] = N'PatientId1');
IF @var1 IS NOT NULL EXEC(N'ALTER TABLE [DoctorSessions] DROP CONSTRAINT [' + @var1 + '];');
ALTER TABLE [DoctorSessions] DROP COLUMN [PatientId1];
GO

DROP INDEX [IX_PatientRecords_PatientId] ON [PatientRecords];
DECLARE @var2 sysname;
SELECT @var2 = [d].[name]
FROM [sys].[default_constraints] [d]
INNER JOIN [sys].[columns] [c] ON [d].[parent_column_id] = [c].[column_id] AND [d].[parent_object_id] = [c].[object_id]
WHERE ([d].[parent_object_id] = OBJECT_ID(N'[PatientRecords]') AND [c].[name] = N'PatientId');
IF @var2 IS NOT NULL EXEC(N'ALTER TABLE [PatientRecords] DROP CONSTRAINT [' + @var2 + '];');
ALTER TABLE [PatientRecords] ALTER COLUMN [PatientId] nvarchar(450) NOT NULL;
CREATE INDEX [IX_PatientRecords_PatientId] ON [PatientRecords] ([PatientId]);
GO

DECLARE @var3 sysname;
SELECT @var3 = [d].[name]
FROM [sys].[default_constraints] [d]
INNER JOIN [sys].[columns] [c] ON [d].[parent_column_id] = [c].[column_id] AND [d].[parent_object_id] = [c].[object_id]
WHERE ([d].[parent_object_id] = OBJECT_ID(N'[DoctorSessions]') AND [c].[name] = N'Price');
IF @var3 IS NOT NULL EXEC(N'ALTER TABLE [DoctorSessions] DROP CONSTRAINT [' + @var3 + '];');
UPDATE [DoctorSessions] SET [Price] = 0.0 WHERE [Price] IS NULL;
ALTER TABLE [DoctorSessions] ALTER COLUMN [Price] decimal(18,2) NOT NULL;
ALTER TABLE [DoctorSessions] ADD DEFAULT 0.0 FOR [Price];
GO

DECLARE @var4 sysname;
SELECT @var4 = [d].[name]
FROM [sys].[default_constraints] [d]
INNER JOIN [sys].[columns] [c] ON [d].[parent_column_id] = [c].[column_id] AND [d].[parent_object_id] = [c].[object_id]
WHERE ([d].[parent_object_id] = OBJECT_ID(N'[DoctorSessions]') AND [c].[name] = N'DoctorId');
IF @var4 IS NOT NULL EXEC(N'ALTER TABLE [DoctorSessions] DROP CONSTRAINT [' + @var4 + '];');
ALTER TABLE [DoctorSessions] ALTER COLUMN [DoctorId] nvarchar(max) NOT NULL;
GO

ALTER TABLE [Patients] ADD CONSTRAINT [AK_Patients_UserId] UNIQUE ([UserId]);
GO

ALTER TABLE [DoctorSessions] ADD CONSTRAINT [FK_DoctorSessions_Patients_PatientId] FOREIGN KEY ([PatientId]) REFERENCES [Patients] ([UserId]);
GO

ALTER TABLE [PatientRecords] ADD CONSTRAINT [FK_PatientRecords_Patients_PatientId] FOREIGN KEY ([PatientId]) REFERENCES [Patients] ([UserId]) ON DELETE CASCADE;
GO

INSERT INTO [__EFMigrationsHistory] ([MigrationId], [ProductVersion])
VALUES (N'20260414225459_FinalFixes', N'8.0.0');
GO

COMMIT;
GO


