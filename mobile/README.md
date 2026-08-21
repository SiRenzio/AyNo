# AyNo mobile

React Native client for AyNo, built with Expo SDK 57 and Expo Router.

## Run with Expo Go

1. Copy `.env.example` to `.env`.
2. For a physical phone, change `EXPO_PUBLIC_API_URL` to your computer's LAN IP, for example:

   ```env
   EXPO_PUBLIC_API_URL=http://192.168.1.25:8001/api/mobile
   ```

3. Start Laravel from the project root:

   ```powershell
   php artisan serve --host=0.0.0.0 --port=8001
   ```

4. Connect the phone and computer to the same Wi-Fi network, then start Expo:

   ```powershell
   npm run start:go
   ```

5. Scan the new QR code from Expo Go.

If Expo Go reports `failed to download remote update`, the phone cannot reach Metro on the computer. Close Expo Go, stop the old Metro process, and try the tunnel command:

```powershell
npm run start:tunnel
```

Tunnel mode fixes Metro access on networks that block device-to-device traffic, but the phone must still be able to reach the Laravel LAN address configured in `.env`. On Windows, allow Node.js and PHP through the firewall on private networks.

## Android emulator

The default `.env.example` address, `10.0.2.2`, points from the Android emulator to the host computer.
