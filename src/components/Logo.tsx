import Image from "next/image";

export function Logo() {
  return (
    <>
      <img
        src={"/LogoLight.svg"}
        alt="Geonode Logo"
        className="h-6 dark:hidden"
      />
      <img
        src={"/LogoDark.svg"}
        alt="Geonode Logo Dark"
        className="hidden h-6 dark:block"
      />
    </>
  );
}
