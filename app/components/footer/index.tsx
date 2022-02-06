import Image from 'next/image';

export default function Footer() {
  return (
    <div className="container">
      <p className="m-0 text-center text-white">
        <a href="https://devalent.com">
          <Image src="/logo.png" alt="Devalent" width={300} height={36} />
        </a>
      </p>
    </div>
  );
}
