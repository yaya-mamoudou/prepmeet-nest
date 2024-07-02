import { Injectable, Logger } from '@nestjs/common';
import * as Pusher from 'pusher';

@Injectable()
export class PusherService {
  private pusher: Pusher = null;

  constructor() {
    this.pusher = new Pusher({
      appId: '1820223',
      key: 'c9594aa5d105f2d219e0',
      secret: '546bbd69359492883b6b',
      cluster: 'eu',
      useTLS: true,
    });
  }
  async trigger(channel: string, event: string, data: any): Promise<void> {
    try {
      await this.pusher.trigger(channel, event, data);
    } catch (err) {
      console.log(err, 'pusher error');
    }
  }
}
