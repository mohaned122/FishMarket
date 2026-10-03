import { ApplicationConfig, provideBrowserGlobalErrorListeners } from '@angular/core';
import { provideRouter } from '@angular/router';

import { routes } from './app.routes';
import { provideClientHydration, withEventReplay } from '@angular/platform-browser';
import { initializeApp, provideFirebaseApp } from '@angular/fire/app';
import { getAuth, provideAuth } from '@angular/fire/auth';
import { getAnalytics, provideAnalytics, ScreenTrackingService, UserTrackingService } from '@angular/fire/analytics';
import { getFirestore, provideFirestore } from '@angular/fire/firestore';
import { getDatabase, provideDatabase } from '@angular/fire/database';
import { getDataConnect, provideDataConnect } from '@angular/fire/data-connect';
import { getMessaging, provideMessaging } from '@angular/fire/messaging';
import { getStorage, provideStorage } from '@angular/fire/storage';
import { getAI, provideAI } from '@angular/fire/ai';

export const appConfig: ApplicationConfig = {
  providers: [
    provideBrowserGlobalErrorListeners(),
    provideRouter(routes), provideClientHydration(withEventReplay()), provideFirebaseApp(() => initializeApp({ apiKey: "AIzaSyCwxaML5LhCi5R7jRD7fx4VCRiB6FVeix0", authDomain: "ayoubbahar.firebaseapp.com", projectId: "ayoubbahar", storageBucket: "ayoubbahar.firebasestorage.app", messagingSenderId: "51121128094", appId: "1:51121128094:web:30b5119713798f5d28318f", measurementId: "G-7N7L5PVKR7" })), provideAuth(() => getAuth()), provideAnalytics(() => getAnalytics()), ScreenTrackingService, UserTrackingService, provideFirestore(() => getFirestore()), provideDatabase(() => getDatabase()), provideDataConnect(() => getDataConnect({connector: "example",location: "us-east4",service: "9sharti"})), provideMessaging(() => getMessaging()), provideStorage(() => getStorage()), provideAI(() => getAI()), provideFirebaseApp(() => initializeApp({ apiKey: "AIzaSyCwxaML5LhCi5R7jRD7fx4VCRiB6FVeix0", authDomain: "ayoubbahar.firebaseapp.com", projectId: "ayoubbahar", storageBucket: "ayoubbahar.firebasestorage.app", messagingSenderId: "51121128094", appId: "1:51121128094:web:30b5119713798f5d28318f", measurementId: "G-7N7L5PVKR7" })), provideAuth(() => getAuth()), provideFirestore(() => getFirestore()), provideDatabase(() => getDatabase())
  ]
};
