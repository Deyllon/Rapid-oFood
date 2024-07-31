import { Injectable } from '@nestjs/common';

@Injectable()
export class AppService {
  getHello(): string {
    return 'Hello World!';
  }

  registerLog(data) {
    console.log(data);
    return data;
  }
}
