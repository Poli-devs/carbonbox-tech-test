export interface CreateUploadCommand {
  originalFileName: string;
  fileBuffer: Buffer;
  userId: string;
}
