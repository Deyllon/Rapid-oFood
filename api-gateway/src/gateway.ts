import { InjectConnection } from '@nestjs/mongoose';
import {
  OnGatewayConnection,
  SubscribeMessage,
  WebSocketGateway,
  WebSocketServer,
} from '@nestjs/websockets';
import mongoose, { Connection } from 'mongoose';
import { Server, Socket } from 'socket.io';

@WebSocketGateway({ namespace: '/order' })
export class OrderGateway implements OnGatewayConnection {
  constructor(@InjectConnection() private connection: Connection) {}

  @WebSocketServer() server: Server;

  async handleConnection(client: Socket) {
    const userId = client.handshake.query.userId;
    const storeId = client.handshake.query.storeId;
    const purchaseCollection = this.connection.collection('purchases');

    const order = await purchaseCollection.findOne({
      store: storeId,
      user: userId,
      date: new Date().toLocaleString('pt').split(',')[0],
    });

    if (!order) {
      client.disconnect();
    }
    client.join(`${storeId}-${userId}`);
  }

  @SubscribeMessage(`Pedido aceito`)
  handleAcceptOrder(client: Socket, payload: any): void {
    const userId = new mongoose.Types.ObjectId(
      client.handshake.query.userId as string,
    );
    const storeId = new mongoose.Types.ObjectId(
      client.handshake.query.storeId as string,
    );

    this.server
      .to(`${storeId}-${userId}`)
      .emit('loja aceitou o pedido', payload);
  }

  @SubscribeMessage('Preparando')
  handlePreparing(client: Socket, payload: any): void {
    const userId = new mongoose.Types.ObjectId(
      client.handshake.query.userId as string,
    );
    const storeId = new mongoose.Types.ObjectId(
      client.handshake.query.storeId as string,
    );

    this.server
      .to(`${storeId}-${userId}`)
      .emit('loja esta preparando o pedido', payload);
  }

  @SubscribeMessage('Enviando')
  handleSending(client: Socket, payload: any): void {
    const userId = new mongoose.Types.ObjectId(
      client.handshake.query.userId as string,
    );
    const storeId = new mongoose.Types.ObjectId(
      client.handshake.query.storeId as string,
    );

    this.server.to(`${storeId}-${userId}`).emit('pedido enviado', payload);
  }

  @SubscribeMessage('Entregue')
  handleConclude(client: Socket, payload: any): void {
    const userId = new mongoose.Types.ObjectId(
      client.handshake.query.userId as string,
    );
    const storeId = new mongoose.Types.ObjectId(
      client.handshake.query.storeId as string,
    );

    this.server.to(`${storeId}-${userId}`).emit('pedido entregue', payload);
  }

  @SubscribeMessage('Chat')
  handleChat(client: Socket, payload: any): void {
    const userId = new mongoose.Types.ObjectId(
      client.handshake.query.userId as string,
    );
    const storeId = new mongoose.Types.ObjectId(
      client.handshake.query.storeId as string,
    );

    this.server.to(`${storeId}-${userId}`).emit('receive message', payload);
  }
}
