import { PagingRequest } from './base';

export enum JobSrcType {
  API = 'API',
  KAFKA = 'KAFKA',
  FILE = 'FILE',
}
export enum ApiAuthType {
  NONE = 'NONE',
  BASIC = 'BASIC',
  BEARER = 'BEARER',
  JWT = 'JWT',
}
export enum CleanupPolicy {
  DELETE = 'delete',
  COMPACT = 'compact',
}
export enum IngestionJobState {
  CREATED = 'CREATED', // Job mới được tạo
  RUNNING = 'RUNNING', // Job đang chạy
  PAUSED = 'PAUSED', // Job bị tạm dừng
  COMPLETED = 'COMPLETED', // Job hoàn thành
  FAILED = 'FAILED', // Job gặp lỗi
}

export class IngestionJobReq {
  // Thông tin chung
  jobName!: string;
  description?: string;
  jobSrcType!: JobSrcType;
  startNow: boolean; // dạng tougle

  // Cấu hình nguồn dữ liệu
  dataPath?: string; // thông tin đường dẫn để lấy dữ liệu
  avroSchemaJson: string; // source data schema, là ô cho người dùng tải file

  // Source API config cấu hình tương tự postman
  apiHttpMethod?: string
  apiUrl?: string;
  apiHeaders?: string;
  apiParams?: string;
  apiBody?: string;
  apiAuthType?: ApiAuthType;
  apiAuthDetails?: string;

  // Kafka advanced config: thông tin này có thể bỏ trống hệ thống sẽ tự cài đặt mặc định
  numberOfPartitions?: number; // Number of Partitions *
  cleanupPolicy?: CleanupPolicy; // Cleanup Policy (e.g., DELETE, COMPACT)
  minInSyncReplicas?: number; // Min In Sync Replicas
  replicationFactor?: number; // Replication Factor *
  retentionTimeMs?: number; // Time to retain data (in ms)
  maxSizeOnDiskGB?: number; // Max size on disk in GB
  maxMessageSizeBytes?: number; // Maximum message size in bytes
  customParameters?: string; // Additional custom parameters in JSON format

  // Source file config
  fileHasHeader?: boolean;
  fileDelimiter?: string;

  // Cấu hình đích lưu dữ liêu
  userDatabaseId?: number; // select
  userTableId?: number; // select
  databaseName: string; // Nếu không chọn userDatabaseId thì điền text để tạo mới
  tableName: string; // Nếu không chọn userTableId thì điền text để tạo mới
}

export class UpdateIngestionJobReq {
  // Thông tin chung
  jobName!: string;
  description?: string;
  startNow: boolean; // dạng tougle

  // Cấu hình nguồn dữ liệu
  dataPath?: string; // thông tin đường dẫn để lấy dữ liệu
  avroSchemaJson: string; // source data schema, là ô cho người dùng tải file

  // Source API config cấu hình tương tự postman
  apiHttpMethod?: string
  apiUrl?: string;
  apiHeaders?: string;
  apiParams?: string;
  apiBody?: string;
  apiAuthType?: ApiAuthType;
  apiAuthDetails?: string;

  // Kafka advanced config: thông tin này có thể bỏ trống hệ thống sẽ tự cài đặt mặc định
  numberOfPartitions?: number; // Number of Partitions *
  cleanupPolicy?: CleanupPolicy; // Cleanup Policy (e.g., DELETE, COMPACT)
  minInSyncReplicas?: number; // Min In Sync Replicas
  replicationFactor?: number; // Replication Factor *
  retentionTimeMs?: number; // Time to retain data (in ms)
  maxSizeOnDiskGB?: number; // Max size on disk in GB
  maxMessageSizeBytes?: number; // Maximum message size in bytes
  customParameters?: string; // Additional custom parameters in JSON format

  // Source file config
  fileHasHeader?: boolean;
  fileDelimiter?: string;

  // Cấu hình đích lưu dữ liêu
  userDatabaseId?: number; // select
  userTableId?: number; // select
  databaseName: string; // Nếu không chọn userDatabaseId thì điền text để tạo mới
  tableName: string; // Nếu không chọn userTableId thì điền text để tạo mới
}

export class IngestionJobDTO {
  id!: number;
  userId!: number;
  jobName!: string;
  description?: string;
  jobSrcType!: JobSrcType;

  // Source API config
  apiHttpMethod?: string
  apiUrl?: string;
  apiHeaders?: string;
  apiParams?: string;
  apiBody?: string;
  apiAuthType?: ApiAuthType;
  apiAuthDetails?: string;

  dataPath?: string;
  avroSchemaJson?: string; // source data schema

  // Source Kafka config
  topicName?: string;
  consumerGroupId?: string;
  boostrapServers?: string;
  kafkaUserName?: string;
  kafkaPassword?: string;
  schemaId?: number;
  schemaRegistryUrl?: string;
  securityProtocol: string;
  saslMechanism: string;

  // Kafka advanced config
  numberOfPartitions?: number; // Number of partitions
  cleanupPolicy?: CleanupPolicy; // Cleanup policy (e.g., DELETE, COMPACT)
  minInSyncReplicas?: number; // Min In-Sync Replicas
  replicationFactor?: number; // Replication factor
  retentionTimeMs?: number; // Time to retain data (in ms)
  maxSizeOnDiskGB?: number; // Max size on disk in GB
  maxMessageSizeBytes?: number; // Maximum message size in bytes
  customParameters?: string; // Additional custom parameters in JSON format

  // Source FIle Config
  fileName?: string;
  fileType?: string;
  fileSize?: number;
  fileHasHeader?: boolean;
  fileDelimiter?: string;

  // Destination DB config
  userDatabaseId?: number;
  userTableId?: number;
  databaseName?: string;
  tableName?: string;

  // New fields for state and time management
  ingestionJobState: string; // Current job state: "CREATED", "RUNNING", "COMPLETED", "FAILED"
  startTime?: Date; // The time the job was last started
  endTime?: Date; // The time the job was last completed or stopped
  nextFireTime?: Date; // The next scheduled run time (if applicable)
}

export class IngestionJobHistoryDTO {
  id!: number;
  ingestionJobId!: number;
  jobState!: string; // Trạng thái của job trong lịch sử: "CREATED", "RUNNING", "COMPLETED", "FAILED"
  errorMessage?: string; // Mô tả lỗi (nếu có)
  stackTrace?: string; // Stack trace chi tiết lỗi (nếu có)
  startTime?: Date; // Thời điểm bắt đầu job
  endTime?: Date; // Thời điểm kết thúc job
  createdAt?: Date; // Thời điểm lịch sử được ghi nhận
}

export class IngestionJobListDTO {
  id!: number;
  jobName!: string;
  description?: string;
  jobSrcType: JobSrcType;

  // New fields for state and time management
  ingestionJobState: string; // Current job state: "CREATED", "RUNNING", "COMPLETED", "FAILED"
  startTime?: Date; // The time the job was last started
  endTime?: Date; // The time the job was last completed or stopped
  nextFireTime?: Date; // The next scheduled run time (if applicable)
}

export class IngestionJobListReq extends PagingRequest {
  userId?: number;
  jobSrcType?: string;
  ingestionJobState?: string;
}

export interface AvroSchemaMapping {
  fieldName: string;
  columnName: string;
}
