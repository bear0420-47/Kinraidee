import { ArrowRight, Sparkle } from '@phosphor-icons/react'
import { Link } from 'react-router'

import { buttonClassName } from '@/components/Button'
import khaoSoi from '../../../../../assets/food/khao-soi.jpg'
import khaoManGai from '../../../../../assets/food/khao-man-gai.jpg'
import boatNoodles from '../../../../../assets/food/boat-noodles.jpg'
import friedChicken from '../../../../../assets/food/korean-fried-chicken.jpg'

const boardNotes = [
  { image: khaoManGai, label: 'ไม่เกิน ฿100' },
  { image: boatNoodles, label: 'ใกล้ มฟล.' },
  { image: friedChicken, label: 'กรอบ + อิ่มใจ' },
]

// Landing hero (copy approved from the prototype). The flow starts without signing in.
export function HomePage() {
  return (
    <section className="mx-auto grid max-w-shell items-center gap-8 py-4 sm:gap-12 sm:py-10 lg:min-h-[calc(100svh-12rem)] lg:grid-cols-[1.15fr_.85fr]">
      <div className="flex min-w-0 flex-col items-start gap-5">
        <p className="rounded-tl-xs rounded-tr-sm rounded-bl-sm rounded-br-xs border-2 border-paper bg-peach-deep px-3 py-1.5 text-small font-extrabold">
          คิดไม่ออกใช่ไหม? มาลองเลือกไปด้วยกัน
        </p>
        {/* Leave room for Thai tone marks; the underline is decorative. */}
        <h1 className="pt-2 font-display text-hero-mobile leading-snug sm:text-hero">
          วันนี้กินอะไรดี?
          <span
            aria-hidden
            className="mt-2 block w-2/3 rounded-pill border-t-4 border-peach"
          />
        </h1>
        <p className="max-w-xl text-muted">
          ตอบแค่ 4 ข้อ เดี๋ยวช่วยหาเมนูให้เลือกไม่เกิน 3 อย่าง ไม่ต้องสมัคร
          ก็เริ่มได้เลย
        </p>
        <p className="flex items-start gap-2 text-small text-muted">
          <Sparkle
            aria-hidden
            size={18}
            weight="bold"
            className="shrink-0 text-blue"
          />
          หาเมนูแถว มฟล. ไว้เป็นไอเดียสำหรับมื้อนี้
        </p>
        <Link
          to="/meal"
          className={`${buttonClassName('primary')} w-full sm:w-auto`}
        >
          ไปหาอะไรกินกัน
          <ArrowRight aria-hidden weight="bold" />
        </Link>
      </div>

      <aside
        aria-label="ตัวอย่างไอเดียสำหรับเลือกมื้ออาหาร"
        className="relative min-w-0 rounded-md border-2 border-paper bg-surface p-4 shadow-lg sm:p-5"
      >
        <span
          aria-hidden
          className="absolute -top-3 left-1/2 hidden h-6 w-20 -translate-x-1/2 bg-peach/80 sm:block"
        />
        <div className="mb-4 flex flex-wrap items-baseline justify-between gap-2 font-display">
          <p className="font-bold">เผื่อมื้อนี้อยากลอง</p>
          <p className="text-small text-rust">ลองเมนูนี้ไหม?</p>
        </div>
        <figure className="border-2 border-paper bg-canvas-soft p-2 shadow-sm">
          <div className="relative">
            <img
              src={khaoSoi}
              alt="ข้าวซอยแบบภาคเหนือหนึ่งชาม"
              width={408}
              height={408}
              loading="lazy"
              className="aspect-[16/10] w-full object-cover"
            />
            <span className="absolute bottom-2 left-2 rounded-xs bg-paper/80 px-2 py-1 text-eyebrow font-bold text-cream">
              ภาพประกอบ
            </span>
          </div>
          <figcaption className="py-2 text-right font-display text-small">
            อุ่นใจในชามเดียว
          </figcaption>
        </figure>
        <div aria-hidden className="mt-5 grid grid-cols-3 gap-2 sm:gap-3">
          {boardNotes.map(({ image, label }) => (
            <div
              key={label}
              className="relative overflow-hidden rounded-xs border-2 border-paper bg-peach shadow-sm"
            >
              <img
                src={image}
                alt=""
                width={408}
                height={408}
                loading="lazy"
                className="aspect-square w-full object-cover"
              />
              <span className="absolute inset-x-0 bottom-0 bg-paper/80 px-1 py-2 text-center text-eyebrow font-extrabold text-cream sm:text-small">
                {label}
              </span>
            </div>
          ))}
        </div>
      </aside>
    </section>
  )
}
