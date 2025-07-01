import { Server, Socket } from 'socket.io';
import Bus from '../models/Bus';

interface BusLocationUpdate {
  busId: string;
  lat: number;
  lng: number;
}

interface ClientToServerEvents {
  joinBus: (payload: { busId: string; role: 'driver' | 'viewer' }) => void;
  leaveBus: (payload: { busId: string }) => void;
  locationUpdate: (data: BusLocationUpdate) => void;
}

interface ServerToClientEvents {
  busLocationUpdate: (data: BusLocationUpdate) => void;
  error?: (msg: string) => void;
}

const liveLocations = new Map<string, { lat: number; lng: number }>();

export const handleSocketConnection = (
  io: Server<ClientToServerEvents, ServerToClientEvents>
) => {
  io.on('connection', (socket: Socket<ClientToServerEvents, ServerToClientEvents>) => {
    console.log(`🔌 Client connected: ${socket.id}`);

    let currentBusId: string | null = null;
    let isDriver = false;

    socket.on('joinBus', ({ busId, role }) => {
      currentBusId = busId;
      isDriver = role === 'driver';
      socket.join(busId);

      console.log(`🚌 ${socket.id} joined bus ${busId} as ${role}`);

      const lastLoc = liveLocations.get(busId);
      if (lastLoc) {
        socket.emit('busLocationUpdate', { busId, lat: lastLoc.lat, lng: lastLoc.lng });
      }
    });

    socket.on('leaveBus', ({ busId }) => {
      socket.leave(busId);
      if (busId === currentBusId) {
        currentBusId = null;
        isDriver = false;
      }
      console.log(`🚪 ${socket.id} left bus ${busId}`);
    });

    socket.on('locationUpdate', ({ busId, lat, lng }) => {
      liveLocations.set(busId, { lat, lng });
      currentBusId = busId;

      console.log(`📍 Bus ${busId} location → ${lat}, ${lng}`);
      io.to(busId).emit('busLocationUpdate', { busId, lat, lng });
    });

    socket.on('disconnect', async () => {
      console.log(`❌ Client disconnected: ${socket.id}`);

      if (isDriver && currentBusId) {
        const lastLoc = liveLocations.get(currentBusId);
        if (lastLoc) {
          try {
            await Bus.findOneAndUpdate(
              { busId: currentBusId },
              {
                location: {
                  latitude: lastLoc.lat,
                  longitude: lastLoc.lng,
                  timestamp: new Date(),
                },
              },
              { new: true, upsert: true }
            );
            console.log(`💾 Saved last known location for Bus ${currentBusId}`);
          } catch (err) {
            console.error(`❌ Error saving bus ${currentBusId} location`, err);
          }
        }
      }
    });
  });
};
