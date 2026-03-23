import Head from 'next/head';
import Game from '../components/Game';

export default function Home() {
  return (
    <>
      <Head>
        <title>SAB3 — The Bluffing Game</title>
        <meta name="description" content="Write fake answers, fool your friends, win big." />
        <meta name="viewport" content="width=device-width, initial-scale=1" />
        <link rel="icon" href="/favicon.ico" />
      </Head>
      <Game />
    </>
  );
}
