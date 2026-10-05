import { ArrowRight } from '@phosphor-icons/react'
import { Link } from 'react-router'

import { buttonClassName } from '@/components/Button'

// Landing hero (copy approved from the prototype). The flow starts without signing in.
export function HomePage() {
  return (
    <section className="mx-auto flex max-w-3xl flex-col items-start gap-5 rounded-lg border-2 border-paper bg-surface p-6 shadow-lg sm:p-10">
      <p className="text-small font-extrabold text-muted">
        คิดไม่ออกใช่ไหม? มาลองเลือกไปด้วยกัน
      </p>
      <h1 className="font-display text-hero-mobile leading-tight sm:text-hero">
        วันนี้กินอะไรดี?
      </h1>
      <p className="max-w-xl">
        ตอบสั้น ๆ 4 ข้อ แล้วรับเมนูที่เข้ากันสูงสุด 3 ตัวเลือก
        ไม่ต้องสมัครสมาชิก
      </p>
      <Link to="/meal" className={buttonClassName('primary')}>
        ช่วยเลือกมื้อให้ฉัน
        <ArrowRight aria-hidden weight="bold" />
      </Link>
      <p className="text-small text-muted">
        คัดสรรสำหรับมื้อประจำวันรอบมหาวิทยาลัยแม่ฟ้าหลวง
      </p>
    </section>
  )
}
