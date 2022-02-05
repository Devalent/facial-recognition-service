import Image from 'next/image';

export default function Logo() {
  return (
    <a href="https://devalent.com">
      <Image src="/logo.png" alt="Devalent" width={300} height={36} />
    </a>
  )
}
