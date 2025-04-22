import { Storage } from '@google-cloud/storage';
import { Writable } from 'node:stream';


export function getDestination(bucketName: string, id: string) {
  const storage = new Storage();
  const bucket = storage.bucket(bucketName);
  const filename = `${id}.pdf`;
  const file = bucket.file(filename);
  const writeStream = file.createWriteStream({
    metadata: {
      contentType: 'application/pdf',
    },
  });
  return [Writable.toWeb(writeStream), file.publicUrl()] as const;
}