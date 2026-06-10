import Link from "next/link";

const steps = [
  { href: "/register/photo",      label: "Photo" },
  { href: "/register/personal",   label: "Personal" },
  { href: "/register/education",  label: "Education" },
  { href: "/register/occupation", label: "Occupation" },
  { href: "/register/address",    label: "Address" },
];

export default function RegisterLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="mx-auto max-w-2xl p-6">
      <nav className="flex flex-wrap gap-2 text-xs mb-6">
        {steps.map((s, i) => (
          <Link key={s.href} href={s.href} className="px-3 py-1 border rounded-full hover:bg-gray-100">
            {i+1}. {s.label}
          </Link>
        ))}
      </nav>
      {children}
    </div>
  );
}
