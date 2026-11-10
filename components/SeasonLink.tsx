'use client'
import Link from 'next/link'
import { useSearchParams } from 'next/navigation'
import type { ComponentProps } from 'react'
import { SEASON_PARAM, withSeason } from '@/lib/season'

/** Come Link, ma si porta dietro la stagione scelta (?stagione=). Da usare nelle pagine con il selettore. */
export default function SeasonLink({ href, ...rest }: Omit<ComponentProps<typeof Link>, 'href'> & { href: string }) {
  const season = useSearchParams().get(SEASON_PARAM)
  return <Link href={withSeason(href, season)} {...rest} />
}
