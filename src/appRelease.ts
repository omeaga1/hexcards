/** Desktop release info, taken from package.json at build time. */
export const APP_VERSION: string = __APP_VERSION__;
export const DESKTOP_INSTALLER_NAME = `HexCards-Setup-${APP_VERSION}.exe`;
export const DESKTOP_DOWNLOAD_URL = `https://github.com/omeaga1/hexcards/releases/download/v${APP_VERSION}/${DESKTOP_INSTALLER_NAME}`;
