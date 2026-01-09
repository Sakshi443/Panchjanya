import { CapacitorConfig } from '@capacitor/cli';

const config: CapacitorConfig = {
    appId: 'com.dharmadisha.templewanderguide',
    appName: 'Temple Wander Guide',
    webDir: 'dist',
    server: {
        androidScheme: 'https'
    }
};

export default config;
