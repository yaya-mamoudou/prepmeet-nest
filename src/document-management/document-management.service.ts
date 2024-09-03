import { Injectable } from '@nestjs/common';
import { S3 } from 'aws-sdk';

@Injectable()
export class DocumentManagementService {
  private client: AWS.S3;

  constructor() {
    this.client = new S3({
      region: process.env.S3_REGION,
      credentials: {
        accessKeyId: process.env.S3_ACCESS_KEY,
        secretAccessKey: process.env.S3_SECRET_ACCESS_KEY,
      },
    });
  }

  async uploadFile(file: any, key: string, originalname: string) {
    const params = {
      Bucket: process.env.S3_BUCKET_NAME,
      Key: key,
      Body: file,
    };

    const uploadResponse = await this.client.upload(params).promise();

    const url = await this.getPresignedUrl(key, originalname);
    return { ...uploadResponse, url };
  }

  async getFile(bucket: string, key: string) {
    const params = {
      Bucket: bucket,
      Key: key,
    };
    return await this.client.getObject(params).promise();
  }

  async getPresignedUrl(key: string, originalname: string) {
    const params = {
      Bucket: process.env.S3_BUCKET_NAME,
      Key: key,
      Expires: 60 * 60 * 24 * 7,
      ResponseContentDisposition: 'attachment; filename="' + originalname + '"',
    };
    return await this.client.getSignedUrlPromise('getObject', params);
  }
}
