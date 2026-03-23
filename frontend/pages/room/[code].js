import Head from 'next/head';
import { useRouter } from 'next/router';
import { useEffect } from 'react';
import Game from '../../components/Game';

export default function RoomPage() {
  const router = useRouter();
  const { code } = router.query;

  // The HomeScreen component reads the URL path to pre-fill the room code
  // So we just render the Game component and it handles the rest
  return (
    <>
      <Head>
        <title>SAB3 — Join Room {code}</title>
        <meta name="description" content={`Join room ${code} on SAB3`} />
      </Head>
      <Game />
    </>
  );
}
