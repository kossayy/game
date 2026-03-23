import Head from 'next/head';
import '../styles/globals.css';
import { SocketProvider } from '../context/SocketContext';
import { GameProvider } from '../context/GameContext';
import { LanguageProvider } from '../context/LanguageContext';
import LanguageSwitcher from '../components/LanguageSwitcher';

export default function App({ Component, pageProps }) {
  return (
    <LanguageProvider>
      <Head>
        <title>SAB3 — The Bluffing Game</title>
        <link rel="icon" href="/logo.png" />
      </Head>
      <SocketProvider>
        <GameProvider>
          <LanguageSwitcher />
          <Component {...pageProps} />
        </GameProvider>
      </SocketProvider>
    </LanguageProvider>
  );
}
