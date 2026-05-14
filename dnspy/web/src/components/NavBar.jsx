import { Navbar, NavbarBrand, NavbarContent, NavbarItem, Button, Link, Tooltip } from "@nextui-org/react";
import { FaGithub as GithubIcon } from "react-icons/fa6";
import { MdDns as DnsIcon } from "react-icons/md";
import { useTranslation } from "react-i18next";
import { useLocation, useNavigate } from "react-router-dom";
import { motion } from "framer-motion";

import ThemeSwitcher from "./ThemeSwitcher";
import LangSwitcher from "./LangSwitcher";
import Upload from "./Upload";

export default function NavBar() {
  const { t } = useTranslation();
  const location = useLocation();
  const navigate = useNavigate();

  const navItems = [
    { path: "/", label: t("nav.overview") },
    { path: "/analyze", label: t("nav.analyze") },
    { path: "/sources", label: t("nav.sources") },
  ];

  return (
    <div id="navbar">
      <Navbar isBordered isBlurred shouldHideOnScroll maxWidth="full">
        <NavbarBrand>
          <Link href="/" color="foreground">
            <DnsIcon className="w-6 h-6 mr-2" />
            <p className="font-bold text-inherit bg-gradient-to-r from-violet-500 to-blue-500 bg-clip-text text-transparent">
              {t("title")}
            </p>
          </Link>
        </NavbarBrand>

        <NavbarContent className="hidden sm:flex gap-1" justify="center">
          {navItems.map((item) => (
            <NavbarItem key={item.path}>
              <Button
                variant={location.pathname === item.path ? "solid" : "light"}
                color={location.pathname === item.path ? "primary" : "default"}
                size="sm"
                onClick={() => navigate(item.path)}
                className="relative"
              >
                {item.label}
                {location.pathname === item.path && (
                  <motion.div
                    layoutId="nav-indicator"
                    className="absolute bottom-0 left-2 right-2 h-0.5 bg-gradient-to-r from-violet-500 to-blue-500 rounded-full"
                    transition={{ type: "spring", stiffness: 500, damping: 30 }}
                  />
                )}
              </Button>
            </NavbarItem>
          ))}
        </NavbarContent>

        <NavbarContent justify="end">
          <NavbarItem>
            <Tooltip content={t("tip.github")}>
              <Link href="https://github.com/xxnuo/dns-benchmark" target="_blank">
                <Button variant="ghost" aria-label={t("tip.github")}>
                  <GithubIcon />
                  <span className="ml-2 hidden md:inline">{t("tip.github")}</span>
                </Button>
              </Link>
            </Tooltip>
          </NavbarItem>
          <NavbarItem>
            <LangSwitcher />
          </NavbarItem>
          <NavbarItem>
            <ThemeSwitcher />
          </NavbarItem>
          <NavbarItem>
            <Upload />
          </NavbarItem>
        </NavbarContent>
      </Navbar>
    </div>
  );
}