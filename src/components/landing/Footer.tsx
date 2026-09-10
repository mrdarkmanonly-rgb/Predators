import Image from "next/image";

const COLUMNS = [
  {
    title: "Platform",
    links: ["Home", "How It Works", "What We Check", "Legal Metrology"],
  },
  {
    title: "For Citizens",
    links: ["Scan Product", "Report Issue", "Track Report"],
  },
  {
    title: "About",
    links: ["About Us", "Contact", "Privacy Policy", "Terms of Use"],
  },
];

export default function Footer() {
  return (
    <footer id="about" className="mt-auto bg-navy py-12 text-white/70">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 gap-10 sm:grid-cols-2 lg:grid-cols-4">
          <div>
            <div className="flex items-center gap-2">
              <span className="relative h-8 w-8 shrink-0 rounded-full bg-white/10 p-1.5">
                <Image
                  src="/images/logo.png"
                  alt="CheckItRight logo"
                  fill
                  sizes="32px"
                  className="object-contain"
                />
              </span>
              <span className="text-lg font-bold text-white">CheckItRight</span>
            </div>
            <p className="mt-3 max-w-xs text-sm leading-relaxed">
              AI-assisted packaged commodity compliance platform.
            </p>
          </div>

          {COLUMNS.map((col) => (
            <div key={col.title}>
              <h3 className="text-sm font-semibold text-white">{col.title}</h3>
              <ul className="mt-4 space-y-2.5">
                {col.links.map((link) => (
                  <li key={link}>
                    <a href="#" className="text-sm hover:text-white">
                      {link}
                    </a>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>

        <div className="mt-10 border-t border-white/10 pt-6 text-xs">
          <p>© 2026 CheckItRight. Built for Smart India Hackathon — PS34.</p>
          <p className="mt-1">
            CheckItRight is not an official government website.
          </p>
        </div>
      </div>
    </footer>
  );
}