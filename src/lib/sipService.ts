import JsSIP from 'jssip';

export interface SIPConfig {
  server: string;
  username: string;
  password: string;
  displayName?: string;
}

export class SIPService {
  private ua: JsSIP.UA | null = null;
  private currentSession: any = null;
  private remoteAudio: HTMLAudioElement | null = null;

  constructor() {
    // Enable JsSIP debug
    JsSIP.debug.enable('JsSIP:*');
    
    // Create remote audio element
    this.remoteAudio = document.createElement('audio');
    this.remoteAudio.autoplay = true;
    document.body.appendChild(this.remoteAudio);
  }

  async connect(config: SIPConfig): Promise<boolean> {
    return new Promise((resolve, reject) => {
      // Set a timeout for the connection attempt
      const timeout = setTimeout(() => {
        if (this.ua) {
          this.ua.stop();
          this.ua = null;
        }
        reject(new Error('Connection timeout - unable to reach SIP server'));
      }, 15000); // 15 second timeout

      try {
        // Try multiple transports - WebSocket with different ports
        const sockets = [
          new JsSIP.WebSocketInterface(`wss://${config.server}:7443`),
          new JsSIP.WebSocketInterface(`wss://${config.server}:443`),
          new JsSIP.WebSocketInterface(`ws://${config.server}:5060`)
        ];
        
        const configuration = {
          sockets: sockets,
          uri: `sip:${config.username}@${config.server}`,
          password: config.password,
          display_name: config.displayName || config.username,
          register: true,
          session_timers: false,
          register_expires: 600,
          connection_recovery_min_interval: 2,
          connection_recovery_max_interval: 30,
        };

        console.log('Creating UA with config:', configuration);
        
        this.ua = new JsSIP.UA(configuration);

        this.ua.on('connected', () => {
          console.log('SIP WebSocket connected');
        });

        this.ua.on('disconnected', (e: any) => {
          console.log('SIP disconnected:', e);
          if (!this.ua?.isRegistered()) {
            clearTimeout(timeout);
            reject(new Error('Failed to connect to SIP server'));
          }
        });

        this.ua.on('registered', () => {
          console.log('SIP registered successfully');
          clearTimeout(timeout);
          resolve(true);
        });

        this.ua.on('registrationFailed', (e: any) => {
          console.error('SIP registration failed:', e);
          clearTimeout(timeout);
          const errorMsg = e.cause || e.response?.reason_phrase || 'Unknown error';
          reject(new Error(`Registration failed: ${errorMsg}`));
        });

        this.ua.on('newRTCSession', (data: any) => {
          console.log('New RTC Session');
          if (data.originator === 'remote') {
            // Incoming call
            this.currentSession = data.session;
            this.setupSessionListeners(this.currentSession);
          }
        });

        this.ua.start();
      } catch (error) {
        clearTimeout(timeout);
        console.error('Error connecting to SIP:', error);
        reject(error);
      }
    });
  }

  makeCall(
    phoneNumber: string,
    onProgress: () => void,
    onConnected: () => void,
    onEnded: () => void,
    onFailed: (error: string) => void
  ) {
    if (!this.ua) {
      onFailed('Not connected to SIP server');
      return;
    }

    console.log('Making call to:', phoneNumber);

    const eventHandlers = {
      progress: () => {
        console.log('Call in progress');
        onProgress();
      },
      failed: (e: any) => {
        console.error('Call failed:', e);
        onFailed(e.cause || 'Call failed');
        this.currentSession = null;
      },
      ended: () => {
        console.log('Call ended');
        onEnded();
        this.currentSession = null;
      },
      confirmed: () => {
        console.log('Call confirmed');
        onConnected();
      },
    };

    const options = {
      eventHandlers,
      mediaConstraints: { audio: true, video: false },
      pcConfig: {
        iceServers: [
          { urls: ['stun:stun.l.google.com:19302'] }
        ]
      }
    };

    try {
      this.currentSession = this.ua.call(phoneNumber, options);
      this.setupSessionListeners(this.currentSession);
    } catch (error) {
      console.error('Error making call:', error);
      onFailed('Failed to initiate call');
    }
  }

  private setupSessionListeners(session: any) {
    session.on('peerconnection', (data: any) => {
      console.log('Peer connection created');
      
      data.peerconnection.ontrack = (e: RTCTrackEvent) => {
        console.log('Remote track received');
        if (this.remoteAudio && e.streams[0]) {
          this.remoteAudio.srcObject = e.streams[0];
          this.remoteAudio.play().catch(err => console.error('Error playing audio:', err));
        }
      };
    });

    session.on('icecandidate', (candidate: any) => {
      console.log('ICE candidate:', candidate);
    });
  }

  hangup() {
    if (this.currentSession) {
      console.log('Hanging up call');
      this.currentSession.terminate();
      this.currentSession = null;
    }
  }

  toggleMute(): boolean {
    if (this.currentSession) {
      if (this.currentSession.isMuted().audio) {
        this.currentSession.unmute({ audio: true });
        return false;
      } else {
        this.currentSession.mute({ audio: true });
        return true;
      }
    }
    return false;
  }

  disconnect() {
    if (this.ua) {
      this.ua.stop();
      this.ua = null;
    }
    if (this.remoteAudio) {
      this.remoteAudio.remove();
      this.remoteAudio = null;
    }
  }

  isConnected(): boolean {
    return this.ua !== null && this.ua.isRegistered();
  }

  isInCall(): boolean {
    return this.currentSession !== null;
  }
}

export const sipService = new SIPService();
