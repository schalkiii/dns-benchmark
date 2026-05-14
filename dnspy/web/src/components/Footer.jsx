import { useTranslation } from "react-i18next";
import { FaGithub } from "react-icons/fa6";
import { MdDns } from "react-icons/md";

export default function Footer() {
  const { t } = useTranslation();
  const year = new Date().getFullYear();

  return (
    <footer className="mt-auto border-t border-divider bg-background/80 backdrop-blur-sm">
      <div className="max-w-7xl mx-auto px-6 py-8">
        <div className="flex flex-col md:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-2">
            <MdDns className="w-5 h-5 text-primary" />
            <span className="text-sm font-semibold bg-gradient-to-r from-violet-500 to-blue-500 bg-clip-text text-transparent">
              {t("footer.copyright")}
            </span>
            <span className="text-xs text-default-400">© {year}</span>
          </div>
          <p className="text-xs text-default-400 text-center max-w-md">
            {t("footer.description")}
          </p>
          <div className="flex items-center gap-3">
            <span className="text-xs text-default-400">{t("footer.powered_by")}</span>
            <a
              href="https://github.com/xxnuo/dns-benchmark"
              target="_blank"
              rel="noopener noreferrer"
              className="text-default-400 hover:text-primary transition-colors"
            >
              <FaGithub className="w-5 h-5" />
            </a>
          </div>
        </div>
      </div>
    </footer>
  );
}